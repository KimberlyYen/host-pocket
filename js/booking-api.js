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
            : '請確認預定服務已啟動';
    }

    async function checkHealth() {
        if (global.HP_MOCK_DATA !== false) {
            return { ok: true, mock: true, bookingConfigured: true, ecpayConfigured: true };
        }
        const res = await fetch(`${getApiBase()}/api/health`);
        if (!res.ok) throw new Error('Health check failed');
        return res.json();
    }

    async function createBooking(payload) {
        if (global.HP_MOCK_DATA !== false) {
            await new Promise((resolve) => setTimeout(resolve, 450));
            return { ok: true, mock: true, payload };
        }
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

    async function isEmailApiConfigured() {
        if (global.HP_MOCK_DATA !== false) return true;
        try {
            const health = await checkHealth();
            return Boolean(health.smtpConfigured || health.bookingConfigured);
        } catch {
            return false;
        }
    }

    async function isEcpayConfigured() {
        if (global.HP_MOCK_DATA !== false) return true;
        try {
            const health = await checkHealth();
            return Boolean(health.ecpayConfigured);
        } catch {
            return false;
        }
    }

    async function createEcpayPayment(payload) {
        if (global.HP_MOCK_DATA !== false) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return {
                ok: true,
                mock: true,
                skipPayment: Number(payload.amountTwd) === 0,
                amountTwd: payload.amountTwd == null ? 100 : Number(payload.amountTwd)
            };
        }

        const base = getApiBase();
        let res;
        try {
            res = await fetch(`${base}/api/payment/ecpay/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error(
                base === BACKEND_ORIGIN
                    ? `無法連線至綠界 API（${BACKEND_ORIGIN}）。${bookingServerHint()}`
                    : `無法連線至綠界 API。${bookingServerHint()}`
            );
        }

        const data = await res.json().catch(() => ({}));
        if (res.status === 503) {
            const err = new Error(data.error || 'ECPay not configured');
            err.code = 'ECPAY_NOT_CONFIGURED';
            throw err;
        }
        if (!res.ok || !data.ok) {
            throw new Error(data.error || `ECPay create failed (${res.status})`);
        }
        return data;
    }

    /**
     * POST to ECPay checkout. Opens in a new window/tab by default so the
     * guest guide stays open while payment completes.
     */
    function submitEcpayForm(actionUrl, params, options = {}) {
        if (!actionUrl || !params) {
            throw new Error('Missing ECPay checkout form');
        }

        const openInNewWindow = options.newWindow !== false;
        const windowName = options.windowName || 'hp_ecpay_checkout';
        let target = '_self';

        if (openInNewWindow) {
            // Open during the user-gesture turn so popup blockers allow it.
            const payWin = global.open('about:blank', windowName);
            target = payWin ? windowName : '_blank';
            try {
                if (payWin?.document) {
                    payWin.document.write('<!DOCTYPE html><title>Host Pocket</title><p style="font-family:sans-serif;padding:1.5rem">Redirecting to payment…</p>');
                    payWin.document.close();
                }
            } catch {
                // cross-origin / restricted — ignore
            }
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = actionUrl;
        form.target = target;
        form.acceptCharset = 'UTF-8';
        form.rel = 'noopener';
        form.style.display = 'none';
        Object.keys(params).forEach((key) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key] == null ? '' : String(params[key]);
            form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        window.setTimeout(() => form.remove(), 0);
        return { ok: true, method: 'ecpay', newWindow: openInNewWindow, target };
    }

    function buildBookingMailtoUrl(booking) {
        const isZh = booking.locale !== 'en';
        const subject = isZh
            ? `【Host Pocket】${booking.title} — 預定確認`
            : `[Host Pocket] ${booking.title} — booking confirmed`;
        const lines = isZh
            ? [
                '以下為體驗預定資訊：',
                '',
                `體驗：${booking.title}`,
                `主持人：${booking.hostName}`,
                `日期：${booking.dateLabel}`,
                `時間：${booking.timeLabel} (${booking.timezone})`,
                `地點：${booking.location}`,
                `旅客 Email：${booking.guestEmail}`,
                '',
                '— 由 host-pocket 送出'
            ]
            : [
                'Experience booking details:',
                '',
                `Experience: ${booking.title}`,
                `Host: ${booking.hostName}`,
                `Date: ${booking.dateLabel}`,
                `Time: ${booking.timeLabel} (${booking.timezone})`,
                `Location: ${booking.location}`,
                `Guest email: ${booking.guestEmail}`,
                '',
                '— Sent via host-pocket'
            ];
        const params = new URLSearchParams();
        params.set('subject', subject);
        params.set('body', lines.join('\n'));
        const to = String(booking.guestEmail || '').trim();
        return to ? `mailto:${to}?${params}` : `mailto:?${params}`;
    }

    function openBookingMailto(booking) {
        global.location.href = buildBookingMailtoUrl(booking);
        return { ok: true, method: 'mailto' };
    }

    global.BookingAPI = {
        getApiBase,
        checkHealth,
        createBooking,
        createEcpayPayment,
        submitEcpayForm,
        isEmailApiConfigured,
        isEcpayConfigured,
        buildBookingMailtoUrl,
        openBookingMailto
    };
})(window);
