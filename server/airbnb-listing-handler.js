const { scrapeAirbnbListing } = require('./airbnb-scrape');

/**
 * Airbnb listing (rooms/) property details — scraped from public room pages.
 * Mounted on api/search/experience-details.js to stay within the 12-function Hobby limit.
 */
async function handleAirbnbListingProperty(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'GET') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    const propertyId = String(
        req.query.property_id || req.query.listing_id || req.query.id || ''
    ).trim();
    if (!/^\d{5,}$/.test(propertyId)) {
        res.status(400).json({
            ok: false,
            error: 'property_id is required (numeric Airbnb rooms/ ID)'
        });
        return;
    }

    try {
        const data = await scrapeAirbnbListing(propertyId, {
            domain: req.query.airbnb_domain || req.query.domain || 'www.airbnb.com'
        });
        if (!data?.property?.title && !data?.property?.images?.length) {
            res.status(404).json({ ok: false, error: 'Listing not found' });
            return;
        }
        res.status(200).json(data);
    } catch (error) {
        console.error('[airbnb-listing]', error);
        const status = error?.status && Number.isFinite(error.status) ? error.status : 502;
        res.status(status >= 400 && status < 600 ? status : 502).json({
            ok: false,
            error: error?.message || 'Airbnb scrape failed'
        });
    }
}

function isAirbnbListingPropertyRequest(req) {
    if (req.query?.__listingProperty === '1' || req.query?.source === 'airbnb-property') {
        return true;
    }
    const url = String(req.url || '');
    return /\/api\/search\/listing-property(?:\?|$)/.test(url)
        || /listing-property/.test(url);
}

module.exports = {
    handleAirbnbListingProperty,
    isAirbnbListingPropertyRequest
};
