const {
    getEcpayConfig,
    verifyCheckMacValue,
    parseNotifyBody
} = require('../../../server/ecpay');
const { fulfillPaidExperienceBooking } = require('../../../server/ecpay-fulfill');
const { readRequestBody } = require('../../../server/read-request-body');

/**
 * ECPay server-to-server ReturnURL.
 * Must respond with plain text "1|OK" on success.
 */
module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send('0|Method not allowed');
        return;
    }

    const config = getEcpayConfig();
    if (!config) {
        res.status(503).send('0|ECPay not configured');
        return;
    }

    try {
        const body = await readRequestBody(req);
        const params = parseNotifyBody(body);
        if (!verifyCheckMacValue(params, config.hashKey, config.hashIV)) {
            console.error('[ecpay/notify] CheckMacValue mismatch', params.MerchantTradeNo);
            res.status(400).send('0|CheckMacValue error');
            return;
        }

        const rtnCode = String(params.RtnCode || '');
        if (rtnCode !== '1') {
            console.warn('[ecpay/notify] unpaid/failed', rtnCode, params.RtnMsg);
            res.status(200).send('1|OK');
            return;
        }

        try {
            const fulfilled = await fulfillPaidExperienceBooking(params);
            if (fulfilled.kind === 'host_subscription') {
                console.log('[ecpay/notify] host subscription paid', params.MerchantTradeNo, params.TradeAmt);
            } else if (fulfilled.emailSent) {
                console.log(
                    '[ecpay/notify] booking email',
                    fulfilled.duplicate ? 'duplicate-skip' : 'sent',
                    params.MerchantTradeNo
                );
            } else if (fulfilled.reason) {
                console.warn('[ecpay/notify] fulfill skipped', fulfilled.reason, params.MerchantTradeNo);
            }
        } catch (error) {
            // Still ACK ECPay so it does not retry forever; log for host follow-up.
            console.error('[ecpay/notify] booking email failed', error);
        }

        res.status(200).send('1|OK');
    } catch (error) {
        console.error('[ecpay/notify]', error);
        res.status(500).send('0|Server error');
    }
};
