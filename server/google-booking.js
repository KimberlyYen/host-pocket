const { Resend } = require('resend');
const { sendBookingEmailViaSmtp, isSmtpConfigured, buildBookingEmailContent } = require('./smtp-mail');

function parseDurationMinutes(raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return 90;
}

function isEmailConfigured() {
    return Boolean(
        (process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
        || isSmtpConfigured()
    );
}

function guestEmailUnavailable(locale) {
    return locale === 'en'
        ? 'Confirmation email is temporarily unavailable. Please try again later or contact your host.'
        : '確認信暫時無法寄出，請稍後再試或聯絡房東';
}

function guestEmailSendFailed(locale) {
    return locale === 'en'
        ? 'We could not send the confirmation email. Please try again later or contact your host.'
        : '確認信寄送失敗，請稍後再試或聯絡房東';
}

async function sendBookingEmailViaResend(booking) {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    if (!apiKey || !fromEmail) return { sent: false, reason: 'resend_not_configured' };

    const resend = new Resend(apiKey);
    const { subject, html } = buildBookingEmailContent(booking);

    await resend.emails.send({
        from: fromEmail,
        to: booking.guestEmail,
        subject,
        html
    });

    return { sent: true };
}

async function createBooking(bookingInput) {
    const booking = {
        guestEmail: String(bookingInput.guestEmail || '').trim().toLowerCase(),
        title: String(bookingInput.title || 'Host Pocket Experience').trim(),
        hostName: String(bookingInput.hostName || 'Host').trim(),
        location: String(bookingInput.location || '').trim(),
        date: String(bookingInput.date || '').trim(),
        time: String(bookingInput.time || '').trim(),
        timezone: String(bookingInput.timezone || 'Asia/Taipei').trim(),
        durationMinutes: parseDurationMinutes(bookingInput.durationMinutes),
        locale: bookingInput.locale === 'en' ? 'en' : 'zh',
        dateLabel: bookingInput.dateLabel || '',
        timeLabel: bookingInput.timeLabel || ''
    };

    if (!booking.guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.guestEmail)) {
        throw new Error('Invalid guest email');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(booking.date)) {
        throw new Error('Invalid date format (expected YYYY-MM-DD)');
    }
    if (!/^\d{1,2}:\d{2}$/.test(booking.time)) {
        throw new Error('Invalid time format (expected HH:MM)');
    }

    if (!isEmailConfigured()) {
        throw new Error(guestEmailUnavailable(booking.locale));
    }

    const resendResult = await sendBookingEmailViaResend(booking);
    let smtpResult = { sent: false };
    try {
        smtpResult = resendResult.sent
            ? { sent: false }
            : await sendBookingEmailViaSmtp(booking);
    } catch (error) {
        console.error('[booking] email send failed', error);
        if (error?.code === 'EAUTH' || /badcredentials|username and password not accepted/i.test(error?.message || '')) {
            throw new Error(guestEmailSendFailed(booking.locale));
        }
        throw new Error(guestEmailSendFailed(booking.locale));
    }

    if (!resendResult.sent && !smtpResult.sent) {
        throw new Error(guestEmailSendFailed(booking.locale));
    }

    return {
        ok: true,
        emailSent: true,
        customEmailSent: true
    };
}

module.exports = { createBooking, isEmailConfigured };
