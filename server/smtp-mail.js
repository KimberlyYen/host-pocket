const nodemailer = require('nodemailer');

function normalizeAppPassword(password) {
    return String(password || '').replace(/\s/g, '');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSmtpConfigured() {
    return Boolean(
        process.env.SMTP_USER
        && normalizeAppPassword(process.env.SMTP_APP_PASSWORD)
    );
}

function getSmtpTransporter() {
    const user = String(process.env.SMTP_USER || '').trim();
    const pass = normalizeAppPassword(process.env.SMTP_APP_PASSWORD);
    const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT) || 587;

    if (!user || !pass) {
        throw new Error('SMTP_USER and SMTP_APP_PASSWORD are required');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
}

function buildBookingEmailContent(booking, meetLink, htmlLink) {
    const isZh = booking.locale !== 'en';
    const dateLabel = booking.dateLabel || booking.date;
    const timeLabel = booking.timeLabel || booking.time;
    const subject = isZh
        ? `【Host Pocket】${booking.title} — 預定確認`
        : `[Host Pocket] ${booking.title} — booking confirmed`;

    const meetSection = meetLink ? (isZh ? `
            <a href="${meetLink}" style="display:inline-block;background:#FF5B3E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700">加入 Google Meet</a>
            <p style="margin:16px 0 0;font-size:13px;color:#8C807A">Meet 連結：<a href="${meetLink}">${meetLink}</a></p>
            ${htmlLink ? `<p style="margin:8px 0 0;font-size:13px;color:#8C807A">日曆邀請：<a href="${htmlLink}">在 Google 日曆中查看</a></p>` : ''}
    ` : `
            <a href="${meetLink}" style="display:inline-block;background:#FF5B3E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700">Join Google Meet</a>
            <p style="margin:16px 0 0;font-size:13px;color:#8C807A">Meet link: <a href="${meetLink}">${meetLink}</a></p>
            ${htmlLink ? `<p style="margin:8px 0 0;font-size:13px;color:#8C807A">Calendar invite: <a href="${htmlLink}">View in Google Calendar</a></p>` : ''}
    `) : (isZh
        ? '<p style="margin:16px 0 0;font-size:13px;color:#8C807A">主持人將另行提供視訊連結。</p>'
        : '<p style="margin:16px 0 0;font-size:13px;color:#8C807A">The host will share the video link separately.</p>');

    const html = isZh ? `
        <div style="font-family:Inter,'Noto Sans TC',sans-serif;max-width:520px;margin:0 auto;color:#1F1A18">
            <h2 style="color:#FF5B3E;margin-bottom:8px">您的體驗預定已確認</h2>
            <p style="margin:0 0 16px;line-height:1.6">${booking.title}</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <tr><td style="padding:6px 0;color:#8C807A">主持人</td><td style="padding:6px 0">${booking.hostName}</td></tr>
                <tr><td style="padding:6px 0;color:#8C807A">日期</td><td style="padding:6px 0">${dateLabel}</td></tr>
                <tr><td style="padding:6px 0;color:#8C807A">時間</td><td style="padding:6px 0">${timeLabel} (${booking.timezone})</td></tr>
                <tr><td style="padding:6px 0;color:#8C807A">地點</td><td style="padding:6px 0">${booking.location}</td></tr>
            </table>
            ${meetSection}
        </div>
    ` : `
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;color:#1F1A18">
            <h2 style="color:#FF5B3E;margin-bottom:8px">Your experience booking is confirmed</h2>
            <p style="margin:0 0 16px;line-height:1.6">${booking.title}</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <tr><td style="padding:6px 0;color:#8C807A">Host</td><td style="padding:6px 0">${booking.hostName}</td></tr>
                <tr><td style="padding:6px 0;color:#8C807A">Date</td><td style="padding:6px 0">${dateLabel}</td></tr>
                <tr><td style="padding:6px 0;color:#8C807A">Time</td><td style="padding:6px 0">${timeLabel} (${booking.timezone})</td></tr>
                <tr><td style="padding:6px 0;color:#8C807A">Location</td><td style="padding:6px 0">${booking.location}</td></tr>
            </table>
            ${meetSection}
        </div>
    `;

    const text = isZh
        ? `您的體驗預定已確認\n\n${booking.title}\n主持人：${booking.hostName}\n日期：${dateLabel}\n時間：${timeLabel} (${booking.timezone})\n地點：${booking.location}${meetLink ? `\n\nGoogle Meet：${meetLink}` : ''}`
        : `Your experience booking is confirmed\n\n${booking.title}\nHost: ${booking.hostName}\nDate: ${dateLabel}\nTime: ${timeLabel} (${booking.timezone})\nLocation: ${booking.location}${meetLink ? `\n\nGoogle Meet: ${meetLink}` : ''}`;

    return { subject, html, text };
}

async function sendBookingEmailViaSmtp(booking, meetLink, htmlLink) {
    if (!isSmtpConfigured()) return { sent: false, reason: 'smtp_not_configured' };

    const transporter = getSmtpTransporter();
    const fromUser = String(process.env.SMTP_USER).trim();
    const { subject, html, text } = buildBookingEmailContent(booking, meetLink, htmlLink);

    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `Host Pocket <${fromUser}>`,
        to: booking.guestEmail,
        subject,
        text,
        html
    });

    return { sent: true, messageId: info.messageId };
}

async function sendTestEmail(input) {
    const to = String(input.to || '').trim();
    const from = String(input.from || '').trim();
    const appPassword = normalizeAppPassword(input.appPassword);
    const smtpHost = String(input.smtpHost || 'smtp.gmail.com').trim();
    const smtpPort = Number(input.smtpPort) || 587;

    if (!from || !isValidEmail(from)) {
        throw new Error('Invalid sender email');
    }
    if (!to || !isValidEmail(to)) {
        throw new Error('Invalid recipient email');
    }
    if (!appPassword) {
        throw new Error('Gmail app password is required');
    }

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: from, pass: appPassword }
    });

    const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const info = await transporter.sendMail({
        from: `Host Pocket <${from}>`,
        to,
        subject: '[Host Pocket] 測試通知',
        text: `這是一封 Host Pocket 測試信。\n\n寄件：${from}\n收件：${to}\n時間：${now}`,
        html: `
            <div style="font-family:Inter,'Noto Sans TC',sans-serif;max-width:480px;color:#1F1A18">
                <h2 style="color:#FF5B3E;margin:0 0 12px">Host Pocket 測試通知</h2>
                <p style="line-height:1.6;margin:0 0 8px">若您收到此信，代表 Gmail SMTP 設定正確。</p>
                <ul style="color:#8C807A;font-size:14px;line-height:1.8;padding-left:18px">
                    <li>寄件：${from}</li>
                    <li>收件：${to}</li>
                    <li>時間：${now}</li>
                </ul>
            </div>`
    });

    return { ok: true, messageId: info.messageId };
}

module.exports = {
    sendTestEmail,
    sendBookingEmailViaSmtp,
    isSmtpConfigured,
    buildBookingEmailContent
};
