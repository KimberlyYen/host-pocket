/**
 * Lightweight Airbnb public room-page scraper (no SearchAPI).
 *
 * Notes:
 * - Relies on public HTML (ld+json + deferred state). Airbnb may change markup or block bots.
 * - Intended for single-listing autofill in host-pocket, not bulk market scraping.
 * - Hosts should prefer their own listing URLs; respect Airbnb Terms of Service.
 */

const DEFAULT_UA =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_IMAGES = 12;

function normalizeDomain(raw) {
    const d = String(raw || 'www.airbnb.com').trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!d) return 'www.airbnb.com';
    return d.startsWith('www.') ? d : `www.${d}`;
}

function roomUrl(propertyId, domain) {
    return `https://${normalizeDomain(domain)}/rooms/${propertyId}`;
}

async function fetchHtml(url, acceptLanguage) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': DEFAULT_UA,
            Accept: 'text/html,application/xhtml+xml',
            'Accept-Language': acceptLanguage,
            'Cache-Control': 'no-cache'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000)
    });
    const html = await response.text();
    if (!response.ok) {
        const err = new Error(`Airbnb page request failed (${response.status})`);
        err.status = response.status;
        throw err;
    }
    if (/access denied|captcha|unusual traffic/i.test(html) && html.length < 50000) {
        const err = new Error('Airbnb blocked the request (bot challenge)');
        err.status = 403;
        throw err;
    }
    return html;
}

function extractLdJson(html) {
    const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    for (const match of matches) {
        try {
            const data = JSON.parse(match[1]);
            const type = String(data?.['@type'] || '');
            if (/VacationRental|LodgingBusiness|Product|Apartment|House/i.test(type) || data?.name) {
                return data;
            }
        } catch {
            // try next block
        }
    }
    return null;
}

function extractDeferredState(html) {
    const match = html.match(/<script[^>]*id="data-deferred-state(?:-\d+)?"[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}

function walkCollect(node, visit, depth = 0) {
    if (!node || typeof node !== 'object' || depth > 40) return;
    if (Array.isArray(node)) {
        node.forEach((child) => walkCollect(child, visit, depth + 1));
        return;
    }
    visit(node);
    Object.values(node).forEach((child) => walkCollect(child, visit, depth + 1));
}

function extractFromDeferred(deferred) {
    const images = [];
    const imageSet = new Set();
    let hostName = '';
    let hostAbout = '';
    let hostAvatar = '';
    let locationSubtitle = '';
    let sharingTitle = '';

    walkCollect(deferred, (obj) => {
        if (!hostName && typeof obj.name === 'string' && obj.__typename === 'PassportCardData') {
            hostName = obj.name.trim();
            if (typeof obj.about === 'string') hostAbout = obj.about.trim();
        }
        if (!hostName && typeof obj.superhostTitleText === 'string') {
            const m = obj.superhostTitleText.match(/^(.+?)是超讚房東/);
            if (m) hostName = m[1].trim();
        }
        if (!hostAvatar && typeof obj.avatarUrl === 'string' && /muscache\.com/.test(obj.avatarUrl)) {
            hostAvatar = obj.avatarUrl.split('?')[0];
        }
        if (!locationSubtitle && typeof obj.subtitle === 'string' && /[、,]/.test(obj.subtitle) && obj.subtitle.length < 80) {
            if (/日本|Japan|Osaka|東京|Tokyo|Taiwan|台灣/i.test(obj.subtitle)) {
                locationSubtitle = obj.subtitle.replace(/、/g, ', ').trim();
            }
        }
        if (!sharingTitle && typeof obj.ogTitle === 'string' && obj.ogTitle.length > 8) {
            sharingTitle = obj.ogTitle.trim();
        }

        const pictureCandidates = [
            obj.baseUrl, obj.uri, obj.url, obj.previewImageUrl, obj.pictureUrl
        ];
        pictureCandidates.forEach((url) => {
            if (typeof url !== 'string') return;
            if (!/muscache\.com\/im\/pictures/i.test(url)) return;
            const clean = url.split('?')[0];
            if (imageSet.has(clean)) return;
            imageSet.add(clean);
            images.push(clean);
        });
    });

    return {
        hostName,
        hostAbout,
        hostAvatar,
        locationSubtitle,
        sharingTitle,
        images: images.slice(0, MAX_IMAGES)
    };
}

function normalizeImages(ldImages, deferredImages) {
    const out = [];
    const seen = new Set();
    const push = (url) => {
        const clean = String(url || '').split('?')[0].trim();
        if (!clean || !/^https?:\/\//i.test(clean) || seen.has(clean)) return;
        seen.add(clean);
        out.push(clean);
    };
    if (Array.isArray(ldImages)) ldImages.forEach(push);
    else if (ldImages) push(ldImages);
    (deferredImages || []).forEach(push);
    return out.slice(0, MAX_IMAGES);
}

function buildLocationName(ld, deferredMeta, locale) {
    if (deferredMeta.locationSubtitle) {
        return deferredMeta.locationSubtitle
            .replace(/、/g, ', ')
            .replace(/\s*,\s*/g, ', ');
    }
    const locality = ld?.address?.addressLocality || ld?.address?.addressRegion || '';
    const country = locale.startsWith('zh') ? '日本' : 'Japan';
    // Airbnb often only exposes city for privacy; append country when useful.
    if (locality) {
        if (/日本|Japan|Taiwan|台灣|美國|United States/i.test(locality)) return locality;
        return `${locality}, ${country}`;
    }
    return '';
}

function buildPropertyPayload({ propertyId, ld, deferredMeta, locale }) {
    const title = String(ld?.name || deferredMeta.sharingTitle || '').trim();
    const description = String(ld?.description || '').trim();
    const images = normalizeImages(ld?.image, deferredMeta.images).map((link) => ({ link }));
    const locationName = buildLocationName(ld, deferredMeta, locale);
    const ratingValue = Number(ld?.aggregateRating?.ratingValue);
    const reviews = Number(ld?.aggregateRating?.ratingCount);

    return {
        id: String(propertyId),
        title,
        description,
        link: `https://www.airbnb.com/rooms/${propertyId}`,
        rating: Number.isFinite(ratingValue) ? ratingValue : null,
        reviews: Number.isFinite(reviews) ? reviews : null,
        location: locationName ? { name: locationName } : null,
        gps_coordinates: {
            latitude: ld?.latitude ?? null,
            longitude: ld?.longitude ?? null
        },
        images,
        source: 'airbnb-html'
    };
}

function buildHostPayload(deferredMeta) {
    if (!deferredMeta.hostName) return null;
    return {
        name: deferredMeta.hostName,
        about: deferredMeta.hostAbout || '',
        avatar: deferredMeta.hostAvatar || '',
        is_superhost: true
    };
}

async function scrapeLocale(propertyId, domain, locale) {
    const acceptLanguage = locale.startsWith('zh')
        ? 'zh-TW,zh;q=0.9,en;q=0.5'
        : 'en-US,en;q=0.9';
    const html = await fetchHtml(roomUrl(propertyId, domain), acceptLanguage);
    const ld = extractLdJson(html);
    if (!ld?.name && !ld?.image) {
        const err = new Error('Could not parse Airbnb listing data from page');
        err.status = 502;
        throw err;
    }
    const deferred = extractDeferredState(html);
    const deferredMeta = extractFromDeferred(deferred);
    return {
        property: buildPropertyPayload({ propertyId, ld, deferredMeta, locale }),
        host: buildHostPayload(deferredMeta)
    };
}

/**
 * Scrape listing details. Fetches English + zh-TW in parallel when possible,
 * then merges bilingual titles/locations.
 */
async function scrapeAirbnbListing(propertyId, options = {}) {
    const id = String(propertyId || '').trim();
    if (!/^\d{5,}$/.test(id)) {
        const err = new Error('property_id is required (numeric Airbnb rooms/ ID)');
        err.status = 400;
        throw err;
    }

    const preferredDomain = normalizeDomain(options.domain || options.airbnb_domain || 'www.airbnb.com');
    const cacheKey = `${preferredDomain}:${id}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.at) < CACHE_TTL_MS) {
        return cached.data;
    }

    // Parallel locale fetches for bilingual titles/locations.
    const [enResult, zhResult] = await Promise.allSettled([
        scrapeLocale(id, 'www.airbnb.com', 'en'),
        scrapeLocale(id, 'www.airbnb.com.tw', 'zh-TW')
    ]);

    const en = enResult.status === 'fulfilled' ? enResult.value : null;
    const zh = zhResult.status === 'fulfilled' ? zhResult.value : null;
    if (!en && !zh) {
        const reason = enResult.reason || zhResult.reason;
        const err = new Error(reason?.message || 'Airbnb scrape failed');
        err.status = reason?.status || 502;
        throw err;
    }

    const primary = en || zh;
    const secondary = en && zh ? zh : null;
    const property = {
        ...primary.property,
        title: en?.property?.title || zh?.property?.title || '',
        titleZh: zh?.property?.title || en?.property?.title || '',
        titleEn: en?.property?.title || zh?.property?.title || '',
        description: zh?.property?.description || en?.property?.description || '',
        descriptionZh: zh?.property?.description || '',
        descriptionEn: en?.property?.description || '',
        location: {
            name: en?.property?.location?.name || zh?.property?.location?.name || '',
            nameZh: zh?.property?.location?.name || en?.property?.location?.name || '',
            nameEn: en?.property?.location?.name || zh?.property?.location?.name || ''
        },
        images: (en?.property?.images?.length ? en.property.images : zh?.property?.images) || []
    };

    const host = primary.host || secondary?.host || null;
    const data = {
        ok: true,
        propertyId: id,
        property,
        host,
        search_metadata: {
            status: 'Success',
            source: 'airbnb-html-scrape',
            scraped_at: new Date().toISOString()
        }
    };

    cache.set(cacheKey, { at: Date.now(), data });
    return data;
}

module.exports = {
    scrapeAirbnbListing,
    roomUrl,
    normalizeDomain
};
