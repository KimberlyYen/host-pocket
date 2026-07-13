require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { createBooking, isEmailConfigured } = require('./booking');
const { sendTestEmail, isSmtpConfigured } = require('./smtp-mail');
const { getPublicSmtpConfig, writeSmtpConfigFile, isReadOnlyConfigStorage } = require('./smtp-config');
const { handleListingSettings } = require('./listing-settings-handler');
const { handleFormGet, handleFormPost } = require('./host-settings-form');
const { isDatabaseConfigured, checkDatabaseConnection } = require('./listing-settings');
const { createCheckout, isEcpayConfigured } = require('./ecpay');
const searchExperiences = require('../api/search/experiences');
const searchExperienceDetails = require('../api/search/experience-details');
const ecpayNotify = require('../api/payment/ecpay/notify');
const ecpayResult = require('../api/payment/ecpay/result');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..');
const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8080,http://localhost:8080')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || CORS_ORIGINS.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(null, true);
    }
}));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

app.get('/api/health', async (_req, res) => {
    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
    const smtpConfigured = isSmtpConfigured();
    const dbUrlSet = isDatabaseConfigured();
    const dbCheck = dbUrlSet ? await checkDatabaseConnection() : { ok: false, error: 'Database URL not set' };
    res.json({
        ok: true,
        bookingConfigured: isEmailConfigured(),
        ecpayConfigured: isEcpayConfigured(),
        resendConfigured,
        smtpConfigured,
        dbConfigured: dbUrlSet,
        dbConnected: dbCheck.ok,
        dbError: dbCheck.ok ? undefined : dbCheck.error
    });
});

app.get('/api/listings/:listingId/settings', (req, res) => {
    handleListingSettings(req, res, req.params.listingId);
});

app.put('/api/listings/:listingId/settings', (req, res) => {
    handleListingSettings(req, res, req.params.listingId);
});

app.delete('/api/listings/:listingId/settings', (req, res) => {
    handleListingSettings(req, res, req.params.listingId);
});

app.get('/api/search/experiences', (req, res) => searchExperiences(req, res));
app.get('/api/search/experience-details', (req, res) => searchExperienceDetails(req, res));

app.post('/api/booking', async (req, res) => {
    try {
        const result = await createBooking(req.body || {});
        res.json(result);
    } catch (error) {
        console.error('[booking]', error);
        const message = error?.message || 'Booking failed';
        const status = /invalid|missing/i.test(message) ? 400 : 500;
        res.status(status).json({ ok: false, error: message });
    }
});

app.post('/api/payment/ecpay/create', (req, res) => {
    try {
        if (!isEcpayConfigured()) {
            res.status(503).json({
                ok: false,
                error: 'ECPay is not configured. Set ECPAY_USE_STAGE=1 or provide MerchantID / HashKey / HashIV.'
            });
            return;
        }
        const result = createCheckout(req.body || {}, req);
        res.json(result);
    } catch (error) {
        console.error('[ecpay/create]', error);
        const message = error?.message || 'Failed to create ECPay checkout';
        const status = /invalid|missing|not configured/i.test(message) ? 400 : 500;
        res.status(status).json({ ok: false, error: message });
    }
});

app.post('/api/payment/ecpay/notify', (req, res) => ecpayNotify(req, res));
app.post('/api/payment/ecpay/result', (req, res) => ecpayResult(req, res));
app.get('/api/payment/ecpay/result', (req, res) => ecpayResult(req, res));

app.post('/api/test-email', async (req, res) => {
    try {
        const result = await sendTestEmail(req.body || {});
        res.json(result);
    } catch (error) {
        console.error('[test-email]', error);
        res.status(400).json({ ok: false, error: error?.message || 'Failed to send test email' });
    }
});

app.get('/api/smtp-config', (_req, res) => {
    res.json({ ok: true, ...getPublicSmtpConfig() });
});

app.post('/api/smtp-config', (req, res) => {
    try {
        writeSmtpConfigFile(req.body || {});
        res.json({ ok: true, ...getPublicSmtpConfig() });
    } catch (error) {
        console.error('[smtp-config]', error);
        const readOnlyStorage = isReadOnlyConfigStorage();
        res.status(readOnlyStorage ? 503 : 400).json({
            ok: false,
            readOnlyStorage,
            error: error?.message || 'Failed to save SMTP config'
        });
    }
});

app.get('/host/settings/:listingId/form', (req, res) => {
    void handleFormGet(req, res);
});

app.post('/host/settings/:listingId', (req, res) => {
    void handleFormPost(req, res);
});

app.get('/guide/:listing/experience/:experience', (_req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.get('/guide/:listing', (_req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.use(express.static(ROOT));

app.use((_req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`host-pocket running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
