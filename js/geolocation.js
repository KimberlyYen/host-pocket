/**
 * Request the visitor's geolocation when the app opens.
 * Stores the latest fix for other modules and never blocks the UI if denied.
 */
(function (global) {
    const STORAGE_KEY = 'hp-geo';
    const DENIED_KEY = 'hp-geo-denied';
    const MAX_AGE_MS = 30 * 60 * 1000;

    let inFlight = null;
    let lastResult = readStored();

    function isSecureEnough() {
        if (global.isSecureContext) return true;
        const host = global.location?.hostname || '';
        return host === 'localhost' || host === '127.0.0.1';
    }

    function readStored() {
        try {
            const raw = global.sessionStorage?.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return null;
            return parsed;
        } catch {
            return null;
        }
    }

    function writeStored(payload) {
        lastResult = payload;
        try {
            global.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
            global.sessionStorage?.removeItem(DENIED_KEY);
        } catch {
            /* ignore quota / private mode */
        }
        try {
            global.dispatchEvent(new CustomEvent('hp:geolocation', { detail: payload }));
        } catch {
            /* ignore */
        }
    }

    function markDenied(reason) {
        try {
            global.sessionStorage?.setItem(DENIED_KEY, reason || '1');
        } catch {
            /* ignore */
        }
        try {
            global.dispatchEvent(new CustomEvent('hp:geolocation-denied', {
                detail: { reason: reason || 'denied' }
            }));
        } catch {
            /* ignore */
        }
    }

    function wasDeniedThisSession() {
        try {
            return Boolean(global.sessionStorage?.getItem(DENIED_KEY));
        } catch {
            return false;
        }
    }

    function isFresh(payload) {
        if (!payload?.at) return false;
        return (Date.now() - Number(payload.at)) < MAX_AGE_MS;
    }

    function getLast() {
        return lastResult || readStored();
    }

    /**
     * @param {{ force?: boolean, timeoutMs?: number, maximumAgeMs?: number, highAccuracy?: boolean }} [options]
     * @returns {Promise<object|null>}
     */
    function request(options = {}) {
        if (!isSecureEnough()) {
            return Promise.resolve(null);
        }
        if (!global.navigator?.geolocation) {
            markDenied('unsupported');
            return Promise.resolve(null);
        }

        const existing = getLast();
        if (!options.force && isFresh(existing)) {
            return Promise.resolve(existing);
        }
        if (!options.force && wasDeniedThisSession()) {
            return Promise.resolve(null);
        }
        if (inFlight) return inFlight;

        inFlight = new Promise((resolve) => {
            global.navigator.geolocation.getCurrentPosition(
                (position) => {
                    const payload = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        at: Date.now()
                    };
                    writeStored(payload);
                    inFlight = null;
                    resolve(payload);
                },
                (error) => {
                    const code = error?.code;
                    const reason = code === 1 ? 'denied'
                        : code === 2 ? 'unavailable'
                            : code === 3 ? 'timeout'
                                : 'error';
                    if (reason === 'denied') {
                        markDenied(reason);
                    }
                    inFlight = null;
                    resolve(null);
                },
                {
                    enableHighAccuracy: Boolean(options.highAccuracy),
                    timeout: Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 12000,
                    maximumAge: Number(options.maximumAgeMs) >= 0 ? Number(options.maximumAgeMs) : 60000
                }
            );
        });

        return inFlight;
    }

    /** Ask once when the page first opens (browser shows the permission prompt). */
    function requestOnOpen() {
        if (!isSecureEnough()) return;
        if (wasDeniedThisSession()) return;
        // Always call request(): returns a fresh cache hit when available,
        // otherwise prompts the browser permission dialog.
        global.setTimeout(() => {
            request({ force: false }).catch(() => {});
        }, 400);
    }

    global.HostPocketGeolocation = {
        request,
        requestOnOpen,
        getLast,
        STORAGE_KEY
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', requestOnOpen, { once: true });
    } else {
        requestOnOpen();
    }
})(window);
