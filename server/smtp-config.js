const fs = require('fs');
const path = require('path');

const CONFIG_DIR = path.join(__dirname, '..', 'config');
const CONFIG_PATH = path.join(CONFIG_DIR, 'smtp.local.json');

function normalizeAppPassword(password) {
    return String(password || '').replace(/\s/g, '');
}

function readSmtpConfigFile() {
    try {
        if (!fs.existsSync(CONFIG_PATH)) return null;
        const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        const user = String(raw.SMTP_USER || raw.smtpUser || '').trim();
        const pass = normalizeAppPassword(raw.SMTP_APP_PASSWORD || raw.smtpAppPassword || '');
        if (!user || !pass) return null;
        return {
            user,
            pass: raw.SMTP_APP_PASSWORD || raw.smtpAppPassword || '',
            host: String(raw.SMTP_HOST || raw.smtpHost || 'smtp.gmail.com').trim(),
            port: Number(raw.SMTP_PORT || raw.smtpPort) || 587,
            from: raw.SMTP_FROM || raw.smtpFrom || null
        };
    } catch {
        return null;
    }
}

function writeSmtpConfigFile(input) {
    const user = String(input.smtpUser || input.SMTP_USER || '').trim();
    const appPassword = String(input.smtpAppPassword || input.SMTP_APP_PASSWORD || '');
    if (!user) {
        throw new Error('Gmail 帳號為必填');
    }
    if (!normalizeAppPassword(appPassword)) {
        throw new Error('Gmail 應用程式密碼為必填');
    }

    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    const payload = {
        SMTP_USER: user,
        SMTP_APP_PASSWORD: appPassword,
        SMTP_HOST: String(input.smtpHost || input.SMTP_HOST || 'smtp.gmail.com').trim(),
        SMTP_PORT: Number(input.smtpPort || input.SMTP_PORT) || 587
    };
    fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    return payload;
}

function getPublicSmtpConfig() {
    const file = readSmtpConfigFile();
    if (!file) {
        return {
            configured: false,
            smtpUser: '',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            hasPassword: false
        };
    }
    return {
        configured: true,
        smtpUser: file.user,
        smtpHost: file.host,
        smtpPort: file.port,
        hasPassword: true
    };
}

function isFileSmtpConfigured() {
    return Boolean(readSmtpConfigFile());
}

module.exports = {
    readSmtpConfigFile,
    writeSmtpConfigFile,
    getPublicSmtpConfig,
    isFileSmtpConfigured,
    CONFIG_PATH
};
