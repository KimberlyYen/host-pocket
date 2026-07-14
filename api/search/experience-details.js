const {
    handleAirbnbListingProperty,
    isAirbnbListingPropertyRequest
} = require('../../server/airbnb-listing-handler');

module.exports = async (req, res) => {
    if (isAirbnbListingPropertyRequest(req)) {
        return handleAirbnbListingProperty(req, res);
    }

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

    const apiKey = process.env.SEARCHAPI_KEY;
    if (!apiKey) {
        res.status(503).json({ ok: false, error: 'SEARCHAPI_KEY not configured' });
        return;
    }

    const experienceId = String(req.query.experience_id || req.query.id || '').trim();
    if (!experienceId) {
        res.status(400).json({ ok: false, error: 'experience_id is required' });
        return;
    }

    const url = new URL('https://www.searchapi.io/api/v1/search');
    url.searchParams.set('engine', 'airbnb_experience_details');
    url.searchParams.set('experience_id', experienceId);
    url.searchParams.set('api_key', apiKey);
    if (req.query.currency) url.searchParams.set('currency', String(req.query.currency));
    if (req.query.airbnb_domain) url.searchParams.set('airbnb_domain', String(req.query.airbnb_domain));

    try {
        const upstream = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        const data = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
            res.status(upstream.status).json({
                ok: false,
                error: data.error || data.message || `SearchAPI request failed (${upstream.status})`
            });
            return;
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(502).json({ ok: false, error: error.message || 'SearchAPI request failed' });
    }
};
