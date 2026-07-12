const {
    getEcpayConfig,
    verifyCheckMacValue,
    unpackBookingCustomFields,
    parseNotifyBody
} = require('../../../server/ecpay');
const { createBooking, isEmailConfigured } = require('../../../server/booking');
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

        const booking = unpackBookingCustomFields(params);
        if (booking && isEmailConfigured()) {
            try {
                await createBooking(booking);
            } catch (error) {
                // Still ACK ECPay so it does not retry forever; log for host follow-up.
                console.error('[ecpay/notify] booking email failed', error);
            }
        } else if (!booking) {
            console.warn('[ecpay/notify] could not unpack booking custom fields', params.MerchantTradeNo);
        }

        res.status(200).send('1|OK');
    } catch (error) {
        console.error('[ecpay/notify]', error);
        res.status(500).send('0|Server error');
    }
};
