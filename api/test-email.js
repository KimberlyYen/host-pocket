const { sendTestEmail } = require('../server/smtp-mail');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ ok: false, error: 'Method not allowed' });
        return;
    }

    try {
        const result = await sendTestEmail(req.body || {});
        res.status(200).json(result);
    } catch (error) {
        console.error('[test-email]', error);
        const message = error?.message || 'Failed to send test email';
        res.status(400).json({ ok: false, error: message });
    }
};
