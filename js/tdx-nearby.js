/**
 * After geolocation succeeds, call TDX Nearby via our backend proxy
 * using the visitor's coordinates (X=lng, Y=lat).
 */
(function (global) {
    const DEFAULT_DISTANCE = 500;
    const STORAGE_KEY = 'hp-tdx-nearby';
    let lastPayload = null;
    let inFlightKey = '';

    function readStored() {
        try {
            const raw = global.sessionStorage?.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function writeStored(payload) {
        lastPayload = payload;
        try {
            global.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch {
            /* ignore */
        }
        try {
            global.dispatchEvent(new CustomEvent('hp:tourism-nearby', { detail: payload }));
        } catch {
            /* ignore */
        }
    }

    function getLast() {
        return lastPayload || readStored();
    }

    /**
     * @param {{ lat: number, lng: number, distance?: number }} coords
     */
    async function fetchNearby(coords, options = {}) {
        const lat = Number(coords?.lat);
        const lng = Number(coords?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
        }

        const distance = Number(options.distance) > 0 ? Number(options.distance) : DEFAULT_DISTANCE;
        const key = `${lng.toFixed(5)},${lat.toFixed(5)},${distance}`;
        if (inFlightKey === key) return getLast();
        inFlightKey = key;

        const url = new URL('/api/tourism/nearby', global.location.origin);
        // TDX Nearby: X = longitude, Y = latitude
        url.searchParams.set('X', String(lng));
        url.searchParams.set('Y', String(lat));
        url.searchParams.set('Distance', String(distance));

        try {
            const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.ok === false) {
                console.warn('[tdx-nearby]', data.error || `HTTP ${response.status}`);
                inFlightKey = '';
                return null;
            }
            const payload = {
                ...data,
                fetchedAt: Date.now(),
                source: 'user-geolocation'
            };
            writeStored(payload);
            inFlightKey = '';
            return payload;
        } catch (error) {
            console.warn('[tdx-nearby]', error);
            inFlightKey = '';
            return null;
        }
    }

    async function syncFromGeolocation(detail) {
        const geo = detail || global.HostPocketGeolocation?.getLast?.();
        if (!geo?.lat || !geo?.lng) return null;
        return fetchNearby(geo);
    }

    function boot() {
        global.addEventListener('hp:geolocation', (event) => {
            void syncFromGeolocation(event.detail);
        });

        const run = () => {
            void syncFromGeolocation();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', run, { once: true });
        } else {
            run();
        }
    }

    global.HostPocketTourismNearby = {
        fetchNearby,
        syncFromGeolocation,
        getLast,
        DEFAULT_DISTANCE
    };

    boot();
})(window);
