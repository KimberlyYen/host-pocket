const { isTdxConfigured, fetchNearbyTourism } = require('./tdx');

/**
 * GET /api/tourism/nearby?lng=&lat=  (preferred)
 * or  /api/tourism/nearby?X=&Y=&Distance=
 * X = longitude, Y = latitude (TDX convention)
 *
 * Shared handler for Express + Vercel (mounted via api/search/experiences.js
 * to stay within the Hobby plan's 12 serverless function limit).
 */
async function handleTourismNearby(req, res) {
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

    if (!isTdxConfigured()) {
        res.status(503).json({
            ok: false,
            error: 'TDX is not configured. Set TDX_CLIENT_ID and TDX_CLIENT_SECRET.'
        });
        return;
    }

    const query = req.query || {};
    const longitude = query.lng ?? query.X ?? query.x;
    const latitude = query.lat ?? query.Y ?? query.y;
    const distance = query.Distance ?? query.distance ?? 500;

    try {
        const result = await fetchNearbyTourism({
            longitude,
            latitude,
            distance
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('[tourism/nearby]', error);
        const status = error.status && Number.isFinite(error.status) ? error.status : 502;
        const message = error?.message || 'TDX Nearby request failed';
        const clientStatus = /invalid|out of range|not configured/i.test(message) ? 400 : status;
        res.status(clientStatus >= 400 && clientStatus < 600 ? clientStatus : 502).json({
            ok: false,
            error: message
        });
    }
}

function isTourismNearbyRequest(req) {
    if (req.query?.__tdxNearby === '1' || req.query?.source === 'tdx-nearby') return true;
    const url = String(req.url || '');
    return /\/api\/tourism\/nearby(?:\?|$)/.test(url) || /tourism\/nearby/.test(url);
}

module.exports = {
    handleTourismNearby,
    isTourismNearbyRequest
};
