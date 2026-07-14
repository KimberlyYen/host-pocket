/**
 * Google login / session helpers for 會員專區.
 */
(function (global) {
    const BACKEND_ORIGIN = 'http://localhost:3000';
    const STATIC_DEV_PORTS = new Set(['5500', '5501', '8080', '8000', '5173']);
    const NEXT_STORAGE_KEY = 'hp:auth:next';

    function isStaticDevServer() {
        const { protocol, port, hostname } = global.location || {};
        if (protocol === 'file:') return true;
        if (hostname === '127.0.0.1' || hostname === 'localhost') {
            const p = port || (protocol === 'https:' ? '443' : '80');
            if (STATIC_DEV_PORTS.has(p)) return true;
            if (p !== '3000' && p !== '443' && p !== '80') return true;
        }
        return false;
    }

    function getApiBase() {
        if (global.HOST_POCKET_API_BASE) {
            return String(global.HOST_POCKET_API_BASE).replace(/\/$/, '');
        }
        if (global.ListingSettingsAPI?.getApiBase) {
            return global.ListingSettingsAPI.getApiBase();
        }
        if (global.BookingAPI?.getApiBase) {
            return global.BookingAPI.getApiBase();
        }
        if (isStaticDevServer()) return BACKEND_ORIGIN;
        return '';
    }

    function sanitizeNextPath(raw) {
        const s = String(raw || '').trim();
        if (!s.startsWith('/')) return '';
        if (s.startsWith('//') || s.includes('://')) return '';
        if (s.length > 512) return '';
        return s;
    }

    function rememberNext(next) {
        const path = sanitizeNextPath(next);
        try {
            if (path) global.sessionStorage?.setItem(NEXT_STORAGE_KEY, path);
            else global.sessionStorage?.removeItem(NEXT_STORAGE_KEY);
        } catch {
            // ignore
        }
        return path;
    }

    function consumeNext() {
        try {
            const path = sanitizeNextPath(global.sessionStorage?.getItem(NEXT_STORAGE_KEY) || '');
            global.sessionStorage?.removeItem(NEXT_STORAGE_KEY);
            return path;
        } catch {
            return '';
        }
    }

    function loginWithGoogle(options = {}) {
        const base = getApiBase();
        const next = rememberNext(options.next || '');
        const url = new URL(`${base}/api/auth/google`, global.location.origin);
        if (next) url.searchParams.set('next', next);
        global.location.assign(url.toString());
    }

    async function getMe() {
        const base = getApiBase();
        const res = await fetch(`${base}/api/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
            return { ok: false, user: null };
        }
        if (!res.ok || !data.ok) {
            const err = new Error(data.error || `Auth me failed (${res.status})`);
            err.status = res.status;
            throw err;
        }
        return { ok: true, user: data.user || null };
    }

    async function requireLogin(options = {}) {
        const next = sanitizeNextPath(options.next || `${global.location.pathname}${global.location.search || ''}`)
            || '/host-settings.html';
        try {
            const me = await getMe();
            if (me?.ok && me.user) return { ok: true, user: me.user };
        } catch (error) {
            console.warn('[AuthAPI] requireLogin getMe failed', error);
        }
        loginWithGoogle({ next });
        return { ok: false, redirecting: true };
    }

    function isHostSettingsHref(href) {
        if (!href) return false;
        try {
            const url = new URL(href, global.location.origin);
            return /\/host-settings(?:\.html)?$/i.test(url.pathname);
        } catch {
            return /host-settings\.html/i.test(String(href));
        }
    }

    async function logout() {
        const base = getApiBase();
        const res = await fetch(`${base}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Logout failed (${res.status})`);
        }
        return { ok: true };
    }

    async function listListings() {
        const base = getApiBase();
        const res = await fetch(`${base}/api/auth/listings`, {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' }
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
            return { ok: false, listings: [] };
        }
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `List listings failed (${res.status})`);
        }
        return { ok: true, listings: Array.isArray(data.listings) ? data.listings : [] };
    }

    async function saveListing(listingId, title = '') {
        const base = getApiBase();
        const res = await fetch(`${base}/api/auth/listings`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                listingId,
                title: title || ''
            })
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
            return { ok: false, skipped: true, reason: 'not_signed_in' };
        }
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Save listing failed (${res.status})`);
        }
        return { ok: true, listing: data.listing || null };
    }

    global.AuthAPI = {
        getApiBase,
        loginWithGoogle,
        requireLogin,
        isHostSettingsHref,
        consumeNext,
        getMe,
        logout,
        listListings,
        saveListing
    };
})(window);
