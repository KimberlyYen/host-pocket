require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { createBooking, isEmailConfigured } = require('./booking');
const { sendTestEmail, isSmtpConfigured } = require('./smtp-mail');
const { getPublicSmtpConfig, writeSmtpConfigFile, isReadOnlyConfigStorage } = require('./smtp-config');
const { handleListingSettings } = require('./listing-settings-handler');
const { isDatabaseConfigured } = require('./listing-settings');
const searchExperiences = require('../api/search/experiences');

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

app.get('/api/health', (_req, res) => {
    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
    const smtpConfigured = isSmtpConfigured();
    res.json({
        ok: true,
        bookingConfigured: isEmailConfigured(),
        resendConfigured,
        smtpConfigured,
        dbConfigured: isDatabaseConfigured()
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

app.use(express.static(ROOT));

app.use((_req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`host-pocket running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
