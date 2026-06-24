const {
    getPublicSmtpConfig,
    writeSmtpConfigFile,
    isReadOnlyConfigStorage
} = require('../server/smtp-config');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method === 'GET') {
        res.status(200).json({ ok: true, ...getPublicSmtpConfig() });
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    try {
        writeSmtpConfigFile(req.body || {});
        res.status(200).json({ ok: true, ...getPublicSmtpConfig() });
    } catch (error) {
        console.error('[smtp-config]', error);
        const readOnlyStorage = isReadOnlyConfigStorage();
        res.status(readOnlyStorage ? 503 : 400).json({
            ok: false,
            readOnlyStorage,
            error: error?.message || 'Failed to save SMTP config'
        });
    }
};
