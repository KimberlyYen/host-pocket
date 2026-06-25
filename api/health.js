const { isEmailConfigured } = require('../server/booking');
const { isSmtpConfigured } = require('../server/smtp-mail');
const { isDatabaseConfigured } = require('../server/listing-settings');

module.exports = async (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
    const smtpConfigured = isSmtpConfigured();
    res.status(200).json({
        ok: true,
        bookingConfigured: isEmailConfigured(),
        resendConfigured,
        smtpConfigured,
        dbConfigured: isDatabaseConfigured()
    });
};
