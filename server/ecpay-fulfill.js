const { unpackBookingCustomFields } = require('./ecpay');
const { createBooking, isEmailConfigured } = require('./booking');

/**
 * After a successful ECPay charge, send the experience booking confirmation email.
 * Safe to call from both notify (server) and OrderResultURL (browser return).
 */
async function fulfillPaidExperienceBooking(params = {}) {
    const payload = unpackBookingCustomFields(params);
    if (!payload) {
        return { ok: false, reason: 'missing_payload' };
    }
    if (payload.kind === 'host_subscription') {
        return { ok: true, kind: 'host_subscription', emailSent: false };
    }
    if (payload.kind !== 'experience') {
        return { ok: false, reason: 'unknown_kind' };
    }
    if (!payload.guestEmail) {
        return { ok: false, reason: 'missing_guest_email' };
    }
    if (!isEmailConfigured()) {
        return { ok: false, reason: 'email_not_configured' };
    }

    const tradeNo = String(params.MerchantTradeNo || params.TradeNo || '').trim();
    const result = await createBooking({
        ...payload,
        tradeNo
    });
    return {
        ok: true,
        kind: 'experience',
        emailSent: Boolean(result?.emailSent),
        duplicate: Boolean(result?.duplicate)
    };
}

module.exports = {
    fulfillPaidExperienceBooking
};
