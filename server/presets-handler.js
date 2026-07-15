const {
    isPresetId,
    normalizePresetId,
    readPreset,
    writePreset,
    PRESET_IDS
} = require('./presets');
const { readRequestBody } = require('./read-request-body');

function isPresetsRequest(req) {
    if (req.query?.__presets === '1' || req.query?.source === 'presets') return true;
    const url = String(req.url || '');
    return /\/api\/presets(?:\/|\?|$)/i.test(url);
}

async function handlePresets(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    const listingId = normalizePresetId(
        req.query?.listingId || req.query?.id || req.params?.listingId || ''
    );

    if (!listingId || !isPresetId(listingId)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
            ok: false,
            error: 'Unknown preset listing',
            presetIds: PRESET_IDS
        }));
        return;
    }

    try {
        if (req.method === 'GET') {
            const preset = await readPreset(listingId);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, ...preset }));
            return;
        }

        if (req.method === 'PUT') {
            const body = await readRequestBody(req);
            const source = body?.data && typeof body.data === 'object' ? body.data : (body || {});
            const saved = await writePreset(listingId, source);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, ...saved }));
            return;
        }

        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
    } catch (error) {
        console.error('[presets]', listingId, error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: error?.message || 'Preset failed' }));
    }
}

module.exports = {
    isPresetsRequest,
    handlePresets
};
