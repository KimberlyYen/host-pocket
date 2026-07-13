const { handleTourismNearby, isTourismNearbyRequest } = require('../../server/tourism-nearby-handler');

module.exports = async (req, res) => {
    // Mounted here so /api/tourism/nearby can rewrite onto this function
    // without exceeding Vercel Hobby's 12 serverless function limit.
    if (isTourismNearbyRequest(req)) {
        return handleTourismNearby(req, res);
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

    const q = String(req.query.q || 'Tokyo cooking class').trim();
    const num = Math.min(Math.max(parseInt(req.query.num, 10) || 3, 1), 10);

    const url = new URL('https://www.searchapi.io/api/v1/search');
    url.searchParams.set('engine', 'airbnb_experiences');
    url.searchParams.set('q', q);
    url.searchParams.set('num', String(num));
    url.searchParams.set('api_key', apiKey);

    try {
        const upstream = await fetch(url.toString());
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
