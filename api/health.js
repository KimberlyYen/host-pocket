const { isGoogleConfigured } = require('../server/google-booking');
const { isSmtpConfigured } = require('../server/smtp-mail');

module.exports = async (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const googleConfigured = isGoogleConfigured();
    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
    const smtpConfigured = isSmtpConfigured();
    res.status(200).json({
        ok: true,
        bookingConfigured: googleConfigured || smtpConfigured || resendConfigured,
        googleConfigured,
        resendConfigured,
        smtpConfigured
    });
};
