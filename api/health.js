const { isEmailConfigured } = require('../server/booking');
const { isSmtpConfigured } = require('../server/smtp-mail');
const { isDatabaseConfigured, checkDatabaseConnection } = require('../server/listing-settings');
const { isEcpayConfigured } = require('../server/ecpay');
const { isTdxConfigured } = require('../server/tdx');

module.exports = async (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
    const smtpConfigured = isSmtpConfigured();
    const dbUrlSet = isDatabaseConfigured();
    const dbCheck = dbUrlSet ? await checkDatabaseConnection() : { ok: false, error: 'Database URL not set' };
    res.status(200).json({
        ok: true,
        bookingConfigured: isEmailConfigured(),
        ecpayConfigured: isEcpayConfigured(),
        tdxConfigured: isTdxConfigured(),
        resendConfigured,
        smtpConfigured,
        dbConfigured: dbUrlSet,
        dbConnected: dbCheck.ok,
        dbError: dbCheck.ok ? undefined : dbCheck.error
    });
};
