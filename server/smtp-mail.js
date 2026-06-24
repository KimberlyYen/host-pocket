const nodemailer = require('nodemailer');

function normalizeAppPassword(password) {
    return String(password || '').replace(/\s/g, '');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

module.exports = { sendTestEmail };
