const { Resend } = require('resend');
const { sendBookingEmailViaSmtp, isSmtpConfigured, buildBookingEmailContent, resolveSmtpConfig } = require('./smtp-mail');

function parseDurationMinutes(raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.round(n);
    return 90;
}

function hasClientSmtp(input) {
    return Boolean(resolveSmtpConfig({
        user: input.smtpUser,
        pass: input.smtpAppPassword,
        host: input.smtpHost,
        port: input.smtpPort
    }));
}

function isEmailConfigured(input) {
    return Boolean(
        (process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
        || isSmtpConfigured()
        || hasClientSmtp(input || {})
    );
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

    if (!isEmailConfigured(bookingInput)) {
        throw new Error('請在網頁「寄件設定」填寫 Gmail 帳號與應用程式密碼，或在 .env 設定 SMTP_USER + SMTP_APP_PASSWORD');
    }

    const smtpOverride = hasClientSmtp(bookingInput) ? {
        user: bookingInput.smtpUser,
        pass: bookingInput.smtpAppPassword,
        host: bookingInput.smtpHost,
        port: bookingInput.smtpPort
    } : null;

    const resendResult = await sendBookingEmailViaResend(booking);
    let smtpResult = { sent: false };
    try {
        smtpResult = resendResult.sent
            ? { sent: false }
            : await sendBookingEmailViaSmtp(booking, smtpOverride);
    } catch (error) {
        if (error?.code === 'EAUTH' || /badcredentials|username and password not accepted/i.test(error?.message || '')) {
            throw new Error('Gmail 應用程式密碼錯誤，請確認已開啟兩步驟驗證並重新產生應用程式密碼');
        }
        throw error;
    }

    if (!resendResult.sent && !smtpResult.sent) {
        throw new Error('確認信寄送失敗，請檢查 Gmail 應用程式密碼是否正確');
    }

    return {
        ok: true,
        emailSent: true,
        customEmailSent: true
    };
}

module.exports = { createBooking, isEmailConfigured };
