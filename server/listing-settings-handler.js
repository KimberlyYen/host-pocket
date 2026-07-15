const {
    getListingSettings,
    saveListingSettings,
    ensureBlankListingSettings,
    deleteListingSettings,
    isDatabaseConfigured
} = require('../server/listing-settings');

function setCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function wantsEnsureBlank(req) {
    return req.query?.__ensureBlank === '1'
        || req.query?.ensureBlank === '1'
        || /\/ensure-blank(?:\?|$)/i.test(String(req.url || ''));
}

async function handleListingSettings(req, res, listingId) {
    setCors(res);

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (!isDatabaseConfigured()) {
        res.status(503).json({ ok: false, error: 'Database not configured' });
        return;
    }

    const id = decodeURIComponent(String(listingId || '').trim());
    if (!id) {
        res.status(400).json({ ok: false, error: 'Missing listing ID' });
        return;
    }

    try {
        if (req.method === 'POST' && wantsEnsureBlank(req)) {
            const result = await ensureBlankListingSettings(id);
            res.status(200).json({ ok: true, ...result });
            return;
        }

        if (req.method === 'GET') {
            const record = await getListingSettings(id);
            if (!record) {
                res.status(404).json({ ok: false, error: 'Not found' });
                return;
            }
            res.status(200).json({ ok: true, ...record });
            return;
        }

        if (req.method === 'PUT') {
            const body = req.body || {};
            const record = await saveListingSettings(id, body.data || body);
            res.status(200).json({ ok: true, ...record });
            return;
        }

        if (req.method === 'DELETE') {
            const deleted = await deleteListingSettings(id);
            if (!deleted) {
                res.status(404).json({ ok: false, error: 'Not found' });
                return;
            }
            res.status(200).json({ ok: true, listingId: id });
            return;
        }

        res.status(405).json({ ok: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('[listing-settings]', error);
        res.status(500).json({ ok: false, error: error?.message || 'Server error' });
    }
}

module.exports = { handleListingSettings, setCors };
