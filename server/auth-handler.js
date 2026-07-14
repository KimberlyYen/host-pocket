const {
    COOKIE_NAME,
    STATE_COOKIE,
    NEXT_COOKIE,
    SESSION_TTL_SEC,
    isGoogleAuthConfigured,
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
} = require('./auth');
const {
    upsertGoogleUser,
    getUserById,
    isDatabaseConfigured,
    linkUserListing,
    listUserListings,
    unlinkUserListing
} = require('./users');
const { readRequestBody } = require('./read-request-body');

function resolveAuthPath(req) {
    const fromQuery = String(req.query?.authPath || req.query?.path || '').trim();
    if (fromQuery) {
        return fromQuery.replace(/^\/+/, '').split('?')[0];
    }
    const url = String(req.url || '');
    const match = url.match(/\/api\/auth\/([^?#]+)/i);
    if (match?.[1]) return match[1];
    return '';
}

function isAuthRequest(req) {
    if (req.query?.__auth === '1' || req.query?.source === 'auth') return true;
    const url = String(req.url || '');
    return /\/api\/auth(?:\/|\?|$)/i.test(url);
}

function sendJson(res, status, body) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(body));
}

function redirect(res, location) {
    res.statusCode = 302;
    res.setHeader('Location', location);
    res.end();
}

async function handleGoogleStart(req, res) {
    if (!isGoogleAuthConfigured()) {
        sendJson(res, 503, {
            ok: false,
            error: 'Google login is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and SESSION_SECRET.'
        });
        return;
    }
    if (!isDatabaseConfigured()) {
        sendJson(res, 503, {
            ok: false,
            error: 'Database is not configured. Set DATABASE_URL or POSTGRES_URL.'
        });
        return;
    }

    const state = createOAuthState();
    setCookie(res, STATE_COOKIE, state, { maxAgeSec: 600 });

    const next = sanitizeNextPath(req.query?.next);
    if (next) {
        setCookie(res, NEXT_COOKIE, next, { maxAgeSec: 600 });
    } else {
        clearCookie(res, NEXT_COOKIE);
    }

    redirect(res, buildGoogleAuthorizeUrl(req, state));
}

async function handleGoogleCallback(req, res) {
    const base = getPublicBaseUrl(req);
    const fail = (reason) => redirect(res, `${base}/?auth=error&reason=${encodeURIComponent(reason)}`);

    try {
        if (!isGoogleAuthConfigured()) {
            fail('not_configured');
            return;
        }
        if (!isDatabaseConfigured()) {
            fail('db_not_configured');
            return;
        }

        const query = req.query || {};
        if (query.error) {
            fail(String(query.error));
            return;
        }

        const code = String(query.code || '').trim();
        const state = String(query.state || '').trim();
        const cookies = parseCookies(req);
        const expectedState = cookies[STATE_COOKIE] || '';
        const nextPath = sanitizeNextPath(cookies[NEXT_COOKIE] || '');
        clearCookie(res, STATE_COOKIE);
        clearCookie(res, NEXT_COOKIE);

        if (!code || !state || !expectedState || state !== expectedState) {
            fail('invalid_state');
            return;
        }

        const profile = await exchangeGoogleCode(code, req);
        const user = await upsertGoogleUser(profile);
        const token = createSessionToken(user.id);
        setCookie(res, COOKIE_NAME, token, { maxAgeSec: SESSION_TTL_SEC });
        if (nextPath) {
            const sep = nextPath.includes('?') ? '&' : '?';
            redirect(res, `${base}${nextPath}${sep}auth=ok`);
            return;
        }
        redirect(res, `${base}/?auth=ok`);
    } catch (error) {
        console.error('[auth/callback]', error);
        fail(error?.message || 'callback_failed');
    }
}

async function requireUser(req, res) {
    const cookies = parseCookies(req);
    const payload = verifySessionToken(cookies[COOKIE_NAME]);
    if (!payload?.sub) {
        sendJson(res, 401, { ok: false, error: 'Not signed in' });
        return null;
    }
    if (!isDatabaseConfigured()) {
        sendJson(res, 503, { ok: false, error: 'Database is not configured' });
        return null;
    }
    try {
        const user = await getUserById(payload.sub);
        if (!user) {
            clearCookie(res, COOKIE_NAME);
            sendJson(res, 401, { ok: false, error: 'User not found' });
            return null;
        }
        return user;
    } catch (error) {
        console.error('[auth] requireUser', error);
        sendJson(res, 500, { ok: false, error: error?.message || 'Failed to load user' });
        return null;
    }
}

async function handleMe(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;
    sendJson(res, 200, { ok: true, user });
}

async function handleListings(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;

    try {
        if (req.method === 'GET') {
            const listings = await listUserListings(user.id);
            sendJson(res, 200, { ok: true, listings });
            return;
        }

        if (req.method === 'POST') {
            const body = await readRequestBody(req);
            const listingId = body.listingId || body.listing_id || body.id;
            const title = body.title || body.label || '';
            const listing = await linkUserListing(user.id, listingId, title);
            sendJson(res, 200, { ok: true, listing });
            return;
        }

        if (req.method === 'DELETE') {
            const body = await readRequestBody(req);
            const listingId = body.listingId || body.listing_id || req.query?.listingId || req.query?.id;
            const removed = await unlinkUserListing(user.id, listingId);
            sendJson(res, 200, { ok: true, removed });
            return;
        }

        sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    } catch (error) {
        console.error('[auth/listings]', error);
        const message = error?.message || 'Failed to manage listings';
        const status = /required|invalid/i.test(message) ? 400 : 500;
        sendJson(res, status, { ok: false, error: message });
    }
}

async function handleLogout(req, res) {
    clearCookie(res, COOKIE_NAME);
    clearCookie(res, STATE_COOKIE);
    sendJson(res, 200, { ok: true });
}

async function handleAuth(req, res) {
    // Auth uses cookies; avoid wildcard CORS on credentialed responses.
    const origin = req.headers?.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    const path = resolveAuthPath(req).toLowerCase();

    if (path === 'google' || path === 'login') {
        if (req.method !== 'GET') {
            sendJson(res, 405, { ok: false, error: 'Method not allowed' });
            return;
        }
        await handleGoogleStart(req, res);
        return;
    }

    if (path === 'callback') {
        if (req.method !== 'GET') {
            sendJson(res, 405, { ok: false, error: 'Method not allowed' });
            return;
        }
        await handleGoogleCallback(req, res);
        return;
    }

    if (path === 'me') {
        if (req.method !== 'GET') {
            sendJson(res, 405, { ok: false, error: 'Method not allowed' });
            return;
        }
        await handleMe(req, res);
        return;
    }

    if (path === 'listings') {
        await handleListings(req, res);
        return;
    }

    if (path === 'logout') {
        if (req.method !== 'POST' && req.method !== 'GET') {
            sendJson(res, 405, { ok: false, error: 'Method not allowed' });
            return;
        }
        await handleLogout(req, res);
        return;
    }

    sendJson(res, 404, { ok: false, error: 'Unknown auth route' });
}

module.exports = {
    handleAuth,
    isAuthRequest,
    resolveAuthPath
};
