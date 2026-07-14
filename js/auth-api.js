/**
 * Google login / session helpers for 會員專區.
 */
(function (global) {
    const BACKEND_ORIGIN = 'http://localhost:3000';
    const STATIC_DEV_PORTS = new Set(['5500', '5501', '8080', '8000', '5173']);

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

    function loginWithGoogle() {
        const base = getApiBase();
        global.location.assign(`${base}/api/auth/google`);
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

    global.AuthAPI = {
        getApiBase,
        loginWithGoogle,
        getMe,
        logout
    };
})(window);
