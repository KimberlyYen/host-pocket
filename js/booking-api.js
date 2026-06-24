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

    function bookingServerHint() {
        return isStaticDevServer()
            ? '請在專案目錄執行 npm start（API 在 http://localhost:3000）'
            : '請確認已執行 npm start 且 Google API 已設定';
    }

    async function checkHealth() {
        const res = await fetch(`${getApiBase()}/api/health`);
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
    }

    async function createBooking(payload) {
        const base = getApiBase();
        let res;
        try {
            res = await fetch(`${base}/api/booking`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error(
                base === BACKEND_ORIGIN
                    ? `無法連線至預定 API（${BACKEND_ORIGIN}）。${bookingServerHint()}`
                    : `無法連線至預定 API。${bookingServerHint()}`
            );
        }

        const data = await res.json().catch(() => ({}));
        if (res.status === 405) {
            throw new Error(`預定 API 不可用（405）。${bookingServerHint()}`);
        }
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `Booking failed (${res.status})`);
        }
        return data;
    }

    global.BookingAPI = {
        getApiBase,
        checkHealth,
        createBooking
    };
})(window);
