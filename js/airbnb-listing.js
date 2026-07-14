/**
 * Airbnb rooms/ listing helpers — parse IDs, fetch property details, map to guide settings.
 */
(function (global) {
    const MAX_GALLERY = 8;

    function parseAirbnbListingId(raw) {
        // Guard against Stimulus Event objects accidentally passed as IDs.
        if (raw && typeof raw === 'object') return '';
        const s = String(raw || '').trim();
        if (!s || /\[object\s+/i.test(s)) return '';

        const demoIds = global.GuideDefaults?.DEMO_LISTING_IDS || [];
        const upper = s.toUpperCase();
        if (demoIds.includes(upper)) return upper;

        const fromUrl = s.match(/(?:https?:\/\/)?(?:www\.)?airbnb\.[^/\s]+\/rooms\/(\d+)/i)
            || s.match(/\/rooms\/(\d{5,})/i);
        if (fromUrl?.[1]) return fromUrl[1];

        if (/^\d{5,}$/.test(s)) return s;

        return upper;
    }

    function isAirbnbNumericId(id) {
        return /^\d{5,}$/.test(String(id || '').trim());
    }

    function getApiBase() {
        if (global.ListingSettingsAPI?.getApiBase) {
            return global.ListingSettingsAPI.getApiBase();
        }
        if (global.HOST_POCKET_API_BASE) {
            return String(global.HOST_POCKET_API_BASE).replace(/\/$/, '');
        }
        return '';
    }

    function mapPropertyToSettings(payload) {
        const property = payload?.property || payload || {};
        const host = payload?.host || {};
        const titleZh = String(property.titleZh || property.title || '').trim();
        const titleEn = String(property.titleEn || property.title || '').trim();
        const locationName = String(
            property.location?.nameEn
            || property.location?.name
            || property.location?.nameZh
            || property.city
            || property.address
            || ''
        ).trim();
        const locationNameZh = String(
            property.location?.nameZh || property.location?.name || locationName
        ).trim();
        const locationNameEn = String(
            property.location?.nameEn || property.location?.name || locationName
        ).trim();
        const hostName = String(host.name || '').trim();
        const images = Array.isArray(property.images)
            ? property.images
                .map((img) => String(img?.link || img?.url || img || '').trim())
                .filter(Boolean)
                .slice(0, MAX_GALLERY)
            : [];

        // Badge label must stay short — full Airbnb marketing titles break the guide card layout.
        const city = (locationNameEn || locationNameZh).split(',')[0].trim();
        const shortLabel = (city && city.length <= 20)
            ? city
            : (property.id ? `ID · ${String(property.id).slice(-8)}` : '');

        const out = {};
        if (titleZh || titleEn) {
            out.roomTitleZh = titleZh || titleEn;
            out.roomTitleEn = titleEn || titleZh;
        }
        if (shortLabel) {
            out.listingLabelZh = shortLabel;
            out.listingLabelEn = shortLabel;
        }
        if (locationNameZh || locationNameEn) {
            out.locationZh = locationNameZh || locationNameEn;
            out.locationEn = locationNameEn || locationNameZh;
        }
        if (hostName) {
            out.hostNameZh = hostName;
            out.hostNameEn = hostName;
        }
        if (images.length) {
            out.roomGallery = images;
            out.roomImg = images[0];
        }
        return out;
    }

    function isOversizedListingLabel(label, title) {
        const text = String(label || '').trim();
        if (!text) return false;
        if (text.length > 24) return true;
        const t = String(title || '').trim();
        return Boolean(t && text === t);
    }

    async function fetchProperty(listingId, options = {}) {
        const id = parseAirbnbListingId(listingId);
        if (!isAirbnbNumericId(id)) {
            throw new Error('Not an Airbnb numeric listing ID');
        }

        const base = getApiBase();
        const url = new URL(`${base}/api/search/listing-property`, global.location?.origin || 'http://localhost');
        url.searchParams.set('property_id', id);
        if (options.domain) url.searchParams.set('airbnb_domain', options.domain);

        const response = await fetch(url.toString(), {
            headers: { Accept: 'application/json' },
            signal: options.signal
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) {
            throw new Error(data.error || `Listing fetch failed (${response.status})`);
        }
        return data;
    }

    /**
     * Seed missing host-guide fields from Airbnb property API.
     * Never overwrites fields the host already customized.
     */
    async function seedMissingSettings(listingId, options = {}) {
        const id = parseAirbnbListingId(listingId);
        if (!isAirbnbNumericId(id) || !global.HostGuideSettings) return null;

        const force = options.force === true;
        let existing = {};
        try {
            existing = (await global.HostGuideSettings.loadAsync(id)) || {};
        } catch {
            existing = global.HostGuideSettings.load?.(id) || {};
        }

        const missing = (key) => force || !String(existing[key] || '').trim();
        const missingGallery = force
            || !(Array.isArray(existing.roomGallery) && existing.roomGallery.length)
            || !String(existing.roomImg || '').trim();

        const needsLabelRepair = isOversizedListingLabel(existing.listingLabelZh, existing.roomTitleZh)
            || isOversizedListingLabel(existing.listingLabelEn, existing.roomTitleEn);
        const needsAny = missing('roomTitleZh')
            || missing('roomTitleEn')
            || missing('locationZh')
            || missing('locationEn')
            || missing('hostNameZh')
            || missing('hostNameEn')
            || missingGallery
            || needsLabelRepair;

        if (!needsAny) return existing;

        const payload = await fetchProperty(id, options);
        const mapped = mapPropertyToSettings(payload);
        const patch = {};

        if (missing('roomTitleZh') && mapped.roomTitleZh) patch.roomTitleZh = mapped.roomTitleZh;
        if (missing('roomTitleEn') && mapped.roomTitleEn) patch.roomTitleEn = mapped.roomTitleEn;
        // Repair labels that were previously seeded with the full marketing title.
        if ((missing('listingLabelZh') || isOversizedListingLabel(existing.listingLabelZh, existing.roomTitleZh || mapped.roomTitleZh))
            && mapped.listingLabelZh) {
            patch.listingLabelZh = mapped.listingLabelZh;
        }
        if ((missing('listingLabelEn') || isOversizedListingLabel(existing.listingLabelEn, existing.roomTitleEn || mapped.roomTitleEn))
            && mapped.listingLabelEn) {
            patch.listingLabelEn = mapped.listingLabelEn;
        }
        if (missing('locationZh') && mapped.locationZh) patch.locationZh = mapped.locationZh;
        if (missing('locationEn') && mapped.locationEn) patch.locationEn = mapped.locationEn;
        if (missing('hostNameZh') && mapped.hostNameZh) patch.hostNameZh = mapped.hostNameZh;
        if (missing('hostNameEn') && mapped.hostNameEn) patch.hostNameEn = mapped.hostNameEn;
        if (missingGallery && mapped.roomGallery?.length) {
            patch.roomGallery = mapped.roomGallery;
            patch.roomImg = mapped.roomImg;
        }

        if (!Object.keys(patch).length) return existing;

        const saved = await global.HostGuideSettings.save(id, { ...existing, ...patch });
        return saved;
    }

    function resolveListingBadge(data, listingId, isZh) {
        const label = String(isZh
            ? (data?.listingLabelZh || data?.listingLabelEn || '')
            : (data?.listingLabelEn || data?.listingLabelZh || '')).trim();
        const title = String(isZh
            ? (data?.roomTitleZh || data?.roomTitleEn || '')
            : (data?.roomTitleEn || data?.roomTitleZh || '')).trim();
        if (label && !isOversizedListingLabel(label, title)) return label;

        const loc = String(isZh
            ? (data?.locationZh || data?.locationEn || '')
            : (data?.locationEn || data?.locationZh || '')).trim();
        const city = loc.split(',')[0].trim();
        if (city && city.length <= 20) return city;

        const id = String(listingId || '').trim();
        if (/^\d{8,}$/.test(id)) return `ID · ${id.slice(-8)}`;
        return id;
    }

    global.AirbnbListing = {
        parseAirbnbListingId,
        isAirbnbNumericId,
        fetchProperty,
        mapPropertyToSettings,
        seedMissingSettings,
        resolveListingBadge,
        isOversizedListingLabel,
        MAX_GALLERY
    };
})(typeof window !== 'undefined' ? window : global);
