const { createBooking } = require('../server/google-booking');

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
        const result = await createBooking(req.body || {});
        res.status(200).json(result);
    } catch (error) {
        console.error('[booking]', error);
        const message = error?.message || 'Booking failed';
        const status = /invalid|missing/i.test(message) ? 400 : 500;
        res.status(status).json({ ok: false, error: message });
    }
};
