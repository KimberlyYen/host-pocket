require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { createBooking } = require('./google-booking');

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
    const configured = Boolean(
        process.env.GOOGLE_CLIENT_ID
        && process.env.GOOGLE_CLIENT_SECRET
        && process.env.GOOGLE_REFRESH_TOKEN
    );
    res.json({
        ok: true,
        bookingConfigured: configured,
        resendConfigured: Boolean(process.env.RESEND_API_KEY && process.env.FROM_EMAIL)
    });
});

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

app.get('/oauth2callback', (req, res) => {
    const code = req.query.code;
    if (!code) {
        res.status(400).send('Missing authorization code.');
        return;
    }
    res.type('html').send(`<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>Google 授權</title></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:0 16px">
<h1>授權成功</h1>
<p>請複製下方 authorization code，貼到終端機執行 <code>npm run google:auth</code> 的提示中：</p>
<pre style="background:#f5f5f5;padding:12px;border-radius:8px;word-break:break-all">${code}</pre>
</body></html>`);
});

app.use(express.static(ROOT));

app.use((_req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`host-pocket running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
