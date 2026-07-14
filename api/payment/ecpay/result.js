const {
    getEcpayConfig,
    verifyCheckMacValue,
    unpackBookingCustomFields,
    parseNotifyBody
} = require('../../../server/ecpay');
const { readRequestBody } = require('../../../server/read-request-body');

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Browser OrderResultURL — show payment outcome then link back to app.
 */
module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const config = getEcpayConfig();
    const body = req.method === 'GET' ? (req.query || {}) : await readRequestBody(req);
    const params = parseNotifyBody(body);
    let status = 'error';
    let titleZh = '付款結果異常';
    let titleEn = 'Payment result error';
    let detailZh = '請回到 App 重新預定，或聯絡房東。';
    let detailEn = 'Please return to the app and try again, or contact your host.';
    let tradeNo = params.MerchantTradeNo || '';
    let amount = params.TradeAmt || params.TotalAmount || '';
    let next = '';
    const earlyPayload = unpackBookingCustomFields(params);
    if (earlyPayload?.kind === 'host_subscription') next = 'settings';

    if (!config) {
        titleZh = '金流尚未設定';
        titleEn = 'Payments not configured';
    } else if (params.CheckMacValue && verifyCheckMacValue(params, config.hashKey, config.hashIV)) {
        if (String(params.RtnCode) === '1') {
            status = 'success';
            titleZh = '付款成功';
            titleEn = 'Payment successful';
            if (earlyPayload?.kind === 'host_subscription') {
                detailZh = 'Host Pocket 月費已付款完成，可以開始設定住宿指南。';
                detailEn = 'Host Pocket monthly fee paid. You can start setting up your stay guide.';
            } else {
                detailZh = '預定已建立。若有設定寄信服務，確認信會寄到你的 Email。';
                detailEn = 'Your booking is confirmed. If email is configured, a confirmation will be sent.';
                if (earlyPayload?.guestEmail) {
                    detailZh += `（${earlyPayload.guestEmail}）`;
                    detailEn += ` (${earlyPayload.guestEmail})`;
                }
            }
        } else {
            status = 'failed';
            titleZh = '付款未完成';
            titleEn = 'Payment not completed';
            detailZh = params.RtnMsg || '交易未成功，請重新嘗試。';
            detailEn = params.RtnMsg || 'The transaction did not succeed. Please try again.';
        }
    } else if (req.method === 'GET' && !params.CheckMacValue) {
        status = 'cancel';
        titleZh = '已取消付款';
        titleEn = 'Payment cancelled';
        detailZh = '尚未完成綠界付款。';
        detailEn = 'ECPay checkout was not completed.';
    }

    const qs = new URLSearchParams({
        status,
        tradeNo,
        amount: String(amount || '')
    });
    if (next) qs.set('next', next);
    const redirectTo = `/payment-result.html?${qs.toString()}`;

    // Prefer a clean HTML page; also support JSON clients.
    const accept = String(req.headers.accept || '');
    if (accept.includes('application/json')) {
        res.status(200).json({
            ok: status === 'success',
            status,
            tradeNo,
            amount,
            titleZh,
            titleEn,
            detailZh,
            detailEn
        });
        return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectTo)}">
  <title>Host Pocket · Payment</title>
</head>
<body>
  <p>${escapeHtml(titleZh)} / ${escapeHtml(titleEn)}</p>
  <p><a href="${escapeHtml(redirectTo)}">Continue</a></p>
</body>
</html>`);
};
