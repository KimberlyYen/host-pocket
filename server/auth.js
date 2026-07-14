const crypto = require('crypto');
const { getPublicBaseUrl } = require('./ecpay');

const COOKIE_NAME = 'hp_session';
const STATE_COOKIE = 'hp_oauth_state';
const NEXT_COOKIE = 'hp_oauth_next';
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

/** Allow only same-site relative paths (prevent open redirects). */
function sanitizeNextPath(raw) {
    const s = String(raw || '').trim();
    if (!s.startsWith('/')) return '';
    if (s.startsWith('//') || s.includes('://')) return '';
    if (s.length > 512) return '';
    if (!/^\/[\w.~:/?#[\]@!$&'()*+,;=%\-]*$/i.test(s)) return '';
    return s;
}

function getGoogleConfig() {
    const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
    const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
    if (!clientId || !clientSecret) return null;
    return { clientId, clientSecret };
}

function isGoogleAuthConfigured() {
    return Boolean(getGoogleConfig() && getSessionSecret());
}

function getSessionSecret() {
    const secret = String(process.env.SESSION_SECRET || '').trim();
    return secret || null;
}

function getRedirectUri(req) {
    const fromEnv = String(process.env.GOOGLE_REDIRECT_URI || '').trim();
    if (fromEnv) return fromEnv;
    const base = getPublicBaseUrl(req);
    return `${base}/api/auth/callback`;
}

function b64url(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function b64urlJson(obj) {
    return b64url(JSON.stringify(obj));
}

function fromB64url(str) {
    const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const b64 = String(str).replace(/-/g, '+').replace(/_/g, '/') + pad;
    return Buffer.from(b64, 'base64').toString('utf8');
}

function sign(payloadB64, secret) {
    return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

function createSessionToken(userId, secret = getSessionSecret()) {
    if (!secret) throw new Error('SESSION_SECRET is not configured');
    const payload = {
        sub: String(userId),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC
    };
    const body = b64urlJson(payload);
    return `${body}.${sign(body, secret)}`;
}

function verifySessionToken(token, secret = getSessionSecret()) {
    if (!token || !secret) return null;
    const parts = String(token).split('.');
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const expected = sign(body, secret);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const payload = JSON.parse(fromB64url(body));
        if (!payload?.sub || !payload?.exp) return null;
        if (Number(payload.exp) < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}

function parseCookies(req) {
    const header = req.headers?.cookie || req.headers?.Cookie || '';
    const out = {};
    String(header).split(';').forEach((part) => {
        const idx = part.indexOf('=');
        if (idx === -1) return;
        const key = part.slice(0, idx).trim();
        const val = part.slice(idx + 1).trim();
        if (!key) return;
        try {
            out[key] = decodeURIComponent(val);
        } catch {
            out[key] = val;
        }
    });
    return out;
}

function cookieOptions({ maxAgeSec, clear = false } = {}) {
    const secure = String(process.env.NODE_ENV || '').toLowerCase() === 'production'
        || Boolean(process.env.VERCEL)
        || String(process.env.PUBLIC_BASE_URL || '').startsWith('https://');
    const parts = [
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        secure ? 'Secure' : ''
    ].filter(Boolean);
    if (clear) {
        parts.push('Max-Age=0');
    } else if (Number.isFinite(maxAgeSec)) {
        parts.push(`Max-Age=${Math.max(0, Math.floor(maxAgeSec))}`);
    }
    return parts.join('; ');
}

function setCookie(res, name, value, options = {}) {
    const existing = res.getHeader?.('Set-Cookie');
    const piece = `${name}=${encodeURIComponent(value)}; ${cookieOptions(options)}`;
    if (!existing) {
        res.setHeader('Set-Cookie', piece);
        return;
    }
    const list = Array.isArray(existing) ? existing : [existing];
    res.setHeader('Set-Cookie', [...list, piece]);
}

function clearCookie(res, name) {
    setCookie(res, name, '', { clear: true });
}

function buildGoogleAuthorizeUrl(req, state) {
    const config = getGoogleConfig();
    if (!config) throw new Error('Google OAuth is not configured');
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('redirect_uri', getRedirectUri(req));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('prompt', 'select_account');
    url.searchParams.set('state', state);
    return url.toString();
}

async function exchangeGoogleCode(code, req) {
    const config = getGoogleConfig();
    if (!config) throw new Error('Google OAuth is not configured');

    const body = new URLSearchParams({
        code: String(code || ''),
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: getRedirectUri(req),
        grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
        const detail = tokenJson.error_description || tokenJson.error || `HTTP ${tokenRes.status}`;
        throw new Error(`Google token exchange failed: ${detail}`);
    }

    const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    const profile = await profileRes.json().catch(() => ({}));
    if (!profileRes.ok || !profile.sub) {
        throw new Error('Failed to load Google user profile');
    }

    return {
        googleSub: String(profile.sub),
        email: String(profile.email || '').trim().toLowerCase(),
        name: String(profile.name || profile.given_name || '').trim(),
        avatarUrl: String(profile.picture || '').trim()
    };
}

function createOAuthState() {
    return crypto.randomBytes(24).toString('hex');
}

module.exports = {
    COOKIE_NAME,
    STATE_COOKIE,
    NEXT_COOKIE,
    SESSION_TTL_SEC,
    isGoogleAuthConfigured,
    getGoogleConfig,
    getRedirectUri,
    createSessionToken,
    verifySessionToken,
    parseCookies,
    setCookie,
    clearCookie,
    buildGoogleAuthorizeUrl,
    exchangeGoogleCode,
    createOAuthState,
    sanitizeNextPath,
    getPublicBaseUrl
};
