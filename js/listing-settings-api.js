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
        if (isStaticDevServer()) return BACKEND_ORIGIN;
        return '';
    }

    function encodeListingId(listingId) {
        return encodeURIComponent(String(listingId || '').trim().toUpperCase());
    }

    async function checkHealth() {
        if (global.HP_MOCK_DATA !== false) {
            return { ok: true, mock: true, dbConfigured: false, bookingConfigured: false };
        }
        const res = await fetch(`${getApiBase()}/api/health`);
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
    }

    async function isDatabaseConfigured() {
        try {
            const health = await checkHealth();
            return Boolean(health.dbConnected ?? health.dbConfigured);
        } catch {
            return false;
        }
    }

    async function fetchSettings(listingId) {
        if (global.HP_MOCK_DATA !== false) return null;
        const base = getApiBase();
        const id = encodeListingId(listingId);
        const res = await fetch(`${base}/api/listings/${id}/settings`);
        if (res.status === 404) return null;
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Failed to load settings (${res.status})`);
        }
        return data;
    }

    async function saveSettings(listingId, payload) {
        if (global.HP_MOCK_DATA !== false) {
            throw new Error('Mock mode: listing settings API disabled');
        }
        const base = getApiBase();
        const id = encodeListingId(listingId);
        const res = await fetch(`${base}/api/listings/${id}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: payload })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Failed to save settings (${res.status})`);
        }
        return data;
    }

    async function deleteSettings(listingId) {
        if (global.HP_MOCK_DATA !== false) return false;
        const base = getApiBase();
        const id = encodeListingId(listingId);
        const res = await fetch(`${base}/api/listings/${id}/settings`, {
            method: 'DELETE'
        });
        if (res.status === 404) return false;
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Failed to delete settings (${res.status})`);
        }
        return true;
    }

    global.ListingSettingsAPI = {
        getApiBase,
        checkHealth,
        isDatabaseConfigured,
        fetchSettings,
        saveSettings,
        deleteSettings
    };
})(window);
