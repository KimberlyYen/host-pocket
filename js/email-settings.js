(function (global) {
    const STORAGE_KEY = 'host-pocket-email-settings';
    const LEGACY_SESSION_PASSWORD_KEY = 'host-pocket-email-app-password';

    function getApiBase() {
        return global.BookingAPI?.getApiBase?.() ?? '';
    }

    function toBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    function fromBase64(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    async function encryptAppPassword(plaintext) {
        if (!plaintext || !global.crypto?.subtle) return null;
        const key = await global.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const iv = global.crypto.getRandomValues(new Uint8Array(12));
        const ciphertext = await global.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            new TextEncoder().encode(String(plaintext))
        );
        const rawKey = await global.crypto.subtle.exportKey('raw', key);
        return {
            v: 1,
            iv: toBase64(iv),
            data: toBase64(ciphertext),
            key: toBase64(rawKey)
        };
    }

    async function decryptAppPassword(payload) {
        if (!payload?.v || !payload.iv || !payload.data || !payload.key || !global.crypto?.subtle) {
            return '';
        }
        try {
            const key = await global.crypto.subtle.importKey(
                'raw',
                fromBase64(payload.key),
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            const plain = await global.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: fromBase64(payload.iv) },
                key,
                fromBase64(payload.data)
            );
            return new TextDecoder().decode(plain);
        } catch {
            return '';
        }
    }

    function readStorageRecord() {
        try {
            return JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }

    async function load() {
        try {
            const saved = readStorageRecord();
            let appPassword = saved.appPasswordEnc
                ? await decryptAppPassword(saved.appPasswordEnc)
                : '';

            const legacySession = global.sessionStorage.getItem(LEGACY_SESSION_PASSWORD_KEY);
            if (legacySession && !appPassword) {
                appPassword = legacySession;
                await save({
                    smtpUser: saved.smtpUser || saved.fromEmail || '',
                    smtpHost: saved.smtpHost || 'smtp.gmail.com',
                    smtpPort: Number(saved.smtpPort) || 587,
                    appPassword: legacySession
                });
            }

            return {
                smtpUser: saved.smtpUser || saved.fromEmail || '',
                smtpHost: saved.smtpHost || 'smtp.gmail.com',
                smtpPort: Number(saved.smtpPort) || 587,
                appPassword
            };
        } catch {
            return { smtpUser: '', smtpHost: 'smtp.gmail.com', smtpPort: 587, appPassword: '' };
        }
    }

    async function save({ smtpUser, smtpHost, smtpPort, appPassword }) {
        const existing = readStorageRecord();
        const record = {
            smtpUser: String(smtpUser || '').trim(),
            smtpHost: String(smtpHost || 'smtp.gmail.com').trim(),
            smtpPort: Number(smtpPort) || 587
        };

        if (appPassword) {
            const enc = await encryptAppPassword(appPassword);
            if (enc) record.appPasswordEnc = enc;
        } else if (existing.appPasswordEnc) {
            record.appPasswordEnc = existing.appPasswordEnc;
        }

        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        global.sessionStorage.removeItem(LEGACY_SESSION_PASSWORD_KEY);
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
        const local = await load();
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
        await save({ smtpUser, smtpHost, smtpPort, appPassword });
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

    async function getSmtpPayload(overrides) {
        const cleaned = { ...(overrides || {}) };
        if (!String(cleaned.smtpUser || '').trim()) delete cleaned.smtpUser;
        if (!String(cleaned.appPassword || '').trim()) delete cleaned.appPassword;

        const merged = { ...(await load()), ...cleaned };
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

    async function isConfigured(overrides) {
        return Boolean(await getSmtpPayload(overrides));
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
