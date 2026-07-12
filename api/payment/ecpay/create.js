const { createCheckout, getEcpayConfig } = require('../../../server/ecpay');
const { readRequestBody } = require('../../../server/read-request-body');

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

    if (!getEcpayConfig()) {
        res.status(503).json({
            ok: false,
            error: 'ECPay is not configured. Set ECPAY_USE_STAGE=1 or provide MerchantID / HashKey / HashIV.'
        });
        return;
    }

    try {
        const body = await readRequestBody(req);
        const result = createCheckout(body || {}, req);
        res.status(200).json(result);
    } catch (error) {
        console.error('[ecpay/create]', error);
        const message = error?.message || 'Failed to create ECPay checkout';
        const status = /invalid|missing|not configured/i.test(message) ? 400 : 500;
        res.status(status).json({ ok: false, error: message });
    }
};
