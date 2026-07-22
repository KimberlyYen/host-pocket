const crypto = require('crypto');

const STAGE_CHECKOUT = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
const PROD_CHECKOUT = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';

/** Official ECPay stage credentials (public sandbox). */
const STAGE_DEFAULTS = {
    merchantId: '2000132',
    hashKey: '5294y06JbISpM5x9',
    hashIV: 'v77hoKGq4kWxNNIS'
};

function truthyEnv(value) {
    return value === '1' || String(value || '').toLowerCase() === 'true';
}

function falsyEnv(value) {
    return value === '0' || String(value || '').toLowerCase() === 'false';
}

function getEcpayConfig() {
    const mode = String(process.env.ECPAY_MODE || 'stage').toLowerCase();
    const useStage = mode !== 'production';
    const hasCustom = Boolean(
        process.env.ECPAY_MERCHANT_ID
        && process.env.ECPAY_HASH_KEY
        && process.env.ECPAY_HASH_IV
    );
    const stageFlag = process.env.ECPAY_USE_STAGE;
    const stageExplicitlyOff = falsyEnv(stageFlag);
    // Stage (default): use official sandbox unless ECPAY_USE_STAGE=0.
    // Production: require your own MerchantID / HashKey / HashIV.
    const allowStageDefaults = useStage && !stageExplicitlyOff;

    if (!useStage && !hasCustom) {
        return null;
    }
    if (useStage && !hasCustom && !allowStageDefaults) {
        return null;
    }

    const merchantId = process.env.ECPAY_MERCHANT_ID
        || (allowStageDefaults ? STAGE_DEFAULTS.merchantId : '');
    const hashKey = process.env.ECPAY_HASH_KEY
        || (allowStageDefaults ? STAGE_DEFAULTS.hashKey : '');
    const hashIV = process.env.ECPAY_HASH_IV
        || (allowStageDefaults ? STAGE_DEFAULTS.hashIV : '');
    if (!merchantId || !hashKey || !hashIV) return null;

    return {
        merchantId,
        hashKey,
        hashIV,
        useStage: useStage || allowStageDefaults,
        actionUrl: (useStage || allowStageDefaults) ? STAGE_CHECKOUT : PROD_CHECKOUT,
        defaultAmount: Math.max(1, Number(process.env.ECPAY_DEFAULT_AMOUNT) || 100)
    };
}

function isEcpayConfigured() {
    return Boolean(getEcpayConfig());
}

/**
 * ECPay CheckMacValue (.NET UrlEncode + SHA256 when EncryptType=1).
 * @see https://developers.ecpay.com.tw/
 */
function ecpayNetUrlEncode(value) {
    return encodeURIComponent(String(value))
        .toLowerCase()
        .replace(/%2d/g, '-')
        .replace(/%5f/g, '_')
        .replace(/%2e/g, '.')
        .replace(/%21/g, '!')
        .replace(/%2a/g, '*')
        .replace(/%28/g, '(')
        .replace(/%29/g, ')')
        .replace(/%20/g, '+');
}

function normalizeCheckMacParamValue(val) {
    if (val === undefined || val === null) return null;
    // express.urlencoded({ extended: true }) may turn duplicate keys into arrays
    if (Array.isArray(val)) {
        if (!val.length) return '';
        return String(val[val.length - 1]);
    }
    if (typeof val === 'object') return null;
    return String(val);
}

/**
 * ECPay CheckMacValue.
 * AIO checkout rejects CheckMac that includes empty optional fields we POST;
 * ReturnURL / OrderResultURL (esp. NeedExtraPaidInfo) may include blank fields.
 * Use includeEmpty=false when creating; verify tries both.
 */
function generateCheckMacValue(params, hashKey, hashIV, encryptType = 1, options = {}) {
    const includeEmpty = options.includeEmpty === true;
    const filtered = {};
    Object.keys(params || {}).forEach((key) => {
        if (key === 'CheckMacValue') return;
        const normalized = normalizeCheckMacParamValue(params[key]);
        if (normalized === null) return;
        if (!includeEmpty && normalized === '') return;
        filtered[key] = normalized;
    });

    const sortedKeys = Object.keys(filtered).sort((a, b) => (
        a.toLowerCase().localeCompare(b.toLowerCase())
    ));
    let raw = `HashKey=${hashKey}`;
    sortedKeys.forEach((key) => {
        raw += `&${key}=${filtered[key]}`;
    });
    raw += `&HashIV=${hashIV}`;

    const encoded = ecpayNetUrlEncode(raw);
    const algo = Number(encryptType) === 1 ? 'sha256' : 'md5';
    return crypto.createHash(algo).update(encoded).digest('hex').toUpperCase();
}

function verifyCheckMacValue(params, hashKey, hashIV) {
    const received = String(params.CheckMacValue || '').toUpperCase();
    if (!received) return false;
    const encryptType = params.EncryptType != null ? Number(params.EncryptType) : 1;
    const excludeEmpty = generateCheckMacValue(params, hashKey, hashIV, encryptType, {
        includeEmpty: false
    });
    if (excludeEmpty === received) return true;
    const includeEmpty = generateCheckMacValue(params, hashKey, hashIV, encryptType, {
        includeEmpty: true
    });
    return includeEmpty === received;
}

/** Drop empty optional fields so AIO checkout CheckMac matches ECPay. */
function omitEmptyParams(params) {
    const out = {};
    Object.keys(params || {}).forEach((key) => {
        const val = params[key];
        if (val === undefined || val === null || val === '') return;
        out[key] = val;
    });
    return out;
}

function firstHeaderValue(value) {
    return String(value || '').split(',')[0].trim();
}

/**
 * Public site origin for redirects (OAuth callback, ECPay ReturnURL, etc.).
 * Prefer the request Host (production alias / custom domain) over VERCEL_URL,
 * which is an ephemeral per-deployment hostname and breaks post-login redirects.
 */
function getPublicBaseUrl(req) {
    const fromEnv = String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
    if (fromEnv) return fromEnv;

    const host = firstHeaderValue(req?.headers?.['x-forwarded-host'] || req?.headers?.host);
    if (host) {
        const proto = firstHeaderValue(req?.headers?.['x-forwarded-proto'])
            || (String(process.env.VERCEL || '').trim() ? 'https' : 'http');
        return `${proto}://${host}`;
    }

    const productionHost = String(process.env.VERCEL_PROJECT_PRODUCTION_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (productionHost) return `https://${productionHost}`;

    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT || 3000}`;
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function formatMerchantTradeDate(date = new Date()) {
    return `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())} `
        + `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function buildMerchantTradeNo() {
    const now = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return (`HP${now}${rand}`).slice(0, 20);
}

function encodeCustomFields(compact) {
    const encoded = Buffer.from(JSON.stringify(compact), 'utf8').toString('base64url');
    const out = {};
    const slices = [
        ['CustomField1', encoded.slice(0, 50)],
        ['CustomField2', encoded.slice(50, 100)],
        ['CustomField3', encoded.slice(100, 150)],
        ['CustomField4', encoded.slice(150, 200)]
    ];
    slices.forEach(([key, value]) => {
        if (value) out[key] = value;
    });
    return out;
}

function packBookingCustomFields(booking) {
    return encodeCustomFields({
        e: String(booking.guestEmail || '').trim().toLowerCase().slice(0, 64),
        d: String(booking.date || '').slice(0, 10),
        t: String(booking.time || '').slice(0, 5),
        z: String(booking.timezone || 'Asia/Taipei').slice(0, 40),
        l: booking.locale === 'en' ? 'en' : 'zh',
        m: Number(booking.durationMinutes) || 90,
        ti: String(booking.title || '').slice(0, 48),
        h: String(booking.hostName || '').slice(0, 24),
        lo: String(booking.location || '').slice(0, 40),
        dl: String(booking.dateLabel || '').slice(0, 32),
        tl: String(booking.timeLabel || '').slice(0, 24)
    });
}

function packSubscriptionCustomFields(input = {}) {
    return encodeCustomFields({
        k: 'sub',
        l: input.locale === 'en' ? 'en' : 'zh',
        e: String(input.guestEmail || input.email || '').trim().toLowerCase().slice(0, 64)
    });
}

function unpackBookingCustomFields(params) {
    const encoded = [
        params.CustomField1 || '',
        params.CustomField2 || '',
        params.CustomField3 || '',
        params.CustomField4 || ''
    ].join('');
    if (!encoded) return null;
    try {
        const compact = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
        if (compact.k === 'sub') {
            return {
                kind: 'host_subscription',
                locale: compact.l === 'en' ? 'en' : 'zh',
                guestEmail: compact.e || ''
            };
        }
        return {
            kind: 'experience',
            guestEmail: compact.e || '',
            date: compact.d || '',
            time: compact.t || '',
            timezone: compact.z || 'Asia/Taipei',
            locale: compact.l === 'en' ? 'en' : 'zh',
            durationMinutes: Number(compact.m) || 90,
            title: compact.ti || 'Host Pocket Experience',
            hostName: compact.h || 'Host',
            location: compact.lo || '',
            dateLabel: compact.dl || compact.d || '',
            timeLabel: compact.tl || compact.t || ''
        };
    } catch {
        return null;
    }
}

function resolveHostSubscriptionAmount(input) {
    const fromInput = Number(input?.amountTwd);
    if (Number.isFinite(fromInput) && fromInput > 0) {
        return Math.min(Math.round(fromInput), 200000);
    }
    const fromEnv = Number(process.env.HOST_POCKET_MONTHLY_AMOUNT);
    if (Number.isFinite(fromEnv) && fromEnv > 0) {
        return Math.min(Math.round(fromEnv), 200000);
    }
    return 40;
}

function resolveAmountTwd(bookingInput, config) {
    const raw = bookingInput.amountTwd;
    if (raw === 0 || raw === '0') return 0;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.min(Math.round(n), 200000);
    return config.defaultAmount;
}

function sanitizeItemName(title) {
    const cleaned = String(title || 'Host Pocket Experience')
        .replace(/[#&<>'"]/g, '')
        .trim()
        .slice(0, 80);
    return cleaned || 'Host Pocket Experience';
}

/**
 * Build AIO checkout form fields for browser POST redirect.
 * Supports experience booking (default) and host monthly subscription.
 */
function createCheckout(bookingInput, req) {
    const config = getEcpayConfig();
    if (!config) {
        throw new Error('ECPay is not configured');
    }

    const purpose = String(bookingInput.purpose || bookingInput.type || 'experience').trim();
    const isHostSubscription = purpose === 'host_subscription';

    const amount = isHostSubscription
        ? resolveHostSubscriptionAmount(bookingInput)
        : resolveAmountTwd(bookingInput, config);
    if (amount <= 0) {
        return { ok: true, skipPayment: true, amountTwd: 0, purpose };
    }

    if (!isHostSubscription) {
        const guestEmail = String(bookingInput.guestEmail || '').trim().toLowerCase();
        if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
            throw new Error('Invalid guest email');
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(bookingInput.date || ''))) {
            throw new Error('Invalid date format (expected YYYY-MM-DD)');
        }
    }

    const base = getPublicBaseUrl(req);
    const tradeNo = buildMerchantTradeNo();
    const custom = isHostSubscription
        ? packSubscriptionCustomFields(bookingInput)
        : packBookingCustomFields(bookingInput);
    const itemName = sanitizeItemName(
        bookingInput.title || (isHostSubscription ? 'Host Pocket monthly' : 'Host Pocket Experience')
    );
    const tradeDesc = isHostSubscription
        ? 'Host Pocket host subscription'
        : 'Host Pocket experience booking';
    const resultNext = isHostSubscription ? 'settings' : '';
    const clientBack = resultNext
        ? `${base}/payment-result.html?status=cancel&next=${resultNext}`
        : `${base}/payment-result.html?status=cancel`;

    const params = omitEmptyParams({
        MerchantID: config.merchantId,
        MerchantTradeNo: tradeNo,
        MerchantTradeDate: formatMerchantTradeDate(),
        PaymentType: 'aio',
        TotalAmount: String(amount),
        TradeDesc: tradeDesc,
        ItemName: itemName,
        ReturnURL: `${base}/api/payment/ecpay/notify`,
        OrderResultURL: `${base}/api/payment/ecpay/result`,
        ClientBackURL: clientBack,
        ChoosePayment: 'ALL',
        EncryptType: '1',
        NeedExtraPaidInfo: 'Y',
        ...custom
    });

    params.CheckMacValue = generateCheckMacValue(
        params,
        config.hashKey,
        config.hashIV,
        1,
        { includeEmpty: false }
    );

    return {
        ok: true,
        skipPayment: false,
        amountTwd: amount,
        purpose: isHostSubscription ? 'host_subscription' : 'experience',
        merchantTradeNo: tradeNo,
        actionUrl: config.actionUrl,
        params,
        stage: config.useStage
    };
}

function parseNotifyBody(body) {
    if (!body) return {};
    if (typeof body === 'string') {
        const out = {};
        new URLSearchParams(body).forEach((value, key) => {
            out[key] = value;
        });
        return out;
    }
    const out = {};
    Object.keys(body).forEach((key) => {
        const normalized = normalizeCheckMacParamValue(body[key]);
        if (normalized === null) return;
        out[key] = normalized;
    });
    return out;
}

module.exports = {
    isEcpayConfigured,
    getEcpayConfig,
    generateCheckMacValue,
    verifyCheckMacValue,
    createCheckout,
    unpackBookingCustomFields,
    parseNotifyBody,
    getPublicBaseUrl,
    STAGE_DEFAULTS
};
