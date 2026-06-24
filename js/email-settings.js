(function (global) {
    const STORAGE_KEY = 'host-pocket-email-settings';
    const SESSION_PASSWORD_KEY = 'host-pocket-email-app-password';

    function getApiBase() {
        return global.BookingAPI?.getApiBase?.() ?? '';
    }

    function load() {
        try {
            const saved = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '{}');
            return {
                smtpUser: saved.smtpUser || saved.fromEmail || '',
                smtpHost: saved.smtpHost || 'smtp.gmail.com',
                smtpPort: Number(saved.smtpPort) || 587,
                appPassword: global.sessionStorage.getItem(SESSION_PASSWORD_KEY) || ''
            };
        } catch {
            return { smtpUser: '', smtpHost: 'smtp.gmail.com', smtpPort: 587, appPassword: '' };
        }
    }

    function save({ smtpUser, smtpHost, smtpPort, appPassword }) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            smtpUser: String(smtpUser || '').trim(),
            smtpHost: String(smtpHost || 'smtp.gmail.com').trim(),
            smtpPort: Number(smtpPort) || 587
        }));
        if (appPassword) {
            global.sessionStorage.setItem(SESSION_PASSWORD_KEY, String(appPassword));
        }
    }

    async function parseJsonResponse(res, fallbackMessage) {
        const raw = await res.text();
        try {
            return raw ? JSON.parse(raw) : {};
        } catch {
            throw new Error(
                res.ok
                    ? 'API 回傳非 JSON，請在終端機重新執行 npm start 後再試'
                    : (fallbackMessage || `請求失敗 (${res.status})`)
            );
        }
    }

    async function loadFromConfig() {
        const base = getApiBase();
        const local = load();
        try {
            const res = await fetch(`${base}/api/smtp-config`);
            const data = await parseJsonResponse(res);
            if (!res.ok || !data.ok) return local;
            return {
                smtpUser: data.smtpUser || local.smtpUser,
                smtpHost: data.smtpHost || local.smtpHost,
                smtpPort: Number(data.smtpPort) || local.smtpPort,
                appPassword: local.appPassword,
                configuredOnServer: Boolean(data.configured),
                hasPasswordOnServer: Boolean(data.hasPassword),
                readOnlyStorage: Boolean(data.readOnlyStorage),
                configSource: data.configSource || null
            };
        } catch (error) {
            if (error?.message?.includes('API 回傳非 JSON')) throw error;
            return local;
        }
    }

    async function saveToConfig({ smtpUser, smtpHost, smtpPort, appPassword }) {
        save({ smtpUser, smtpHost, smtpPort, appPassword });
        const base = getApiBase();
        let res;
        try {
            res = await fetch(`${base}/api/smtp-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    smtpUser: String(smtpUser || '').trim(),
                    smtpAppPassword: appPassword,
                    smtpHost: String(smtpHost || 'smtp.gmail.com').trim(),
                    smtpPort: Number(smtpPort) || 587
                })
            });
        } catch {
            throw new Error('無法連線 API，請確認 npm start 已執行');
        }
        const data = await parseJsonResponse(res, `儲存失敗 (${res.status})`);
        if (!res.ok || !data.ok) {
            if (data.readOnlyStorage) {
                return { ok: true, savedLocally: true, readOnlyStorage: true };
            }
            throw new Error(data.error || `儲存失敗 (${res.status})`);
        }
        return data;
    }

    function getSmtpPayload(overrides) {
        const cleaned = { ...(overrides || {}) };
        if (!String(cleaned.smtpUser || '').trim()) delete cleaned.smtpUser;
        if (!String(cleaned.appPassword || '').trim()) delete cleaned.appPassword;

        const merged = { ...load(), ...cleaned };
        const user = String(merged.smtpUser || '').trim();
        const appPassword = String(merged.appPassword || '').replace(/\s/g, '');
        if (!user || !appPassword) return null;
        return {
            smtpUser: user,
            smtpAppPassword: merged.appPassword,
            smtpHost: String(merged.smtpHost || 'smtp.gmail.com').trim(),
            smtpPort: Number(merged.smtpPort) || 587
        };
    }

    function isConfigured(overrides) {
        return Boolean(getSmtpPayload(overrides));
    }

    global.HostPocketEmailSettings = {
        load,
        save,
        loadFromConfig,
        saveToConfig,
        getSmtpPayload,
        isConfigured
    };
})(window);
