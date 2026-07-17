/**
 * Host access entitlements.
 *
 * VIP full-access emails live in DB table `vip_emails`.
 * HOST_POCKET_VIP_EMAILS / FULL_ACCESS_EMAILS only seed the table on boot.
 */

const {
    isDatabaseConfigured,
    ensureSchema,
    isVipEmailInDb,
    seedVipEmailsFromEnv,
    listVipEmails,
    upsertVipEmail,
    removeVipEmail
} = require('./users');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function parseEmailList(raw) {
    return String(raw || '')
        .split(/[,;\s]+/)
        .map(normalizeEmail)
        .filter(Boolean);
}

/** Env bootstrap list (not the live source of truth once DB is seeded). */
function getVipEmailsFromEnv() {
    const merged = [
        ...parseEmailList(process.env.HOST_POCKET_VIP_EMAILS),
        ...parseEmailList(process.env.FULL_ACCESS_EMAILS)
    ];
    return new Set(merged);
}

let seedPromise = null;

async function ensureVipSeeded() {
    if (!isDatabaseConfigured()) return;
    if (!seedPromise) {
        seedPromise = (async () => {
            await ensureSchema();
            const fromEnv = [...getVipEmailsFromEnv()];
            if (fromEnv.length) {
                await seedVipEmailsFromEnv(fromEnv);
            }
        })().catch((error) => {
            seedPromise = null;
            console.warn('[entitlements] VIP seed failed', error?.message || error);
        });
    }
    await seedPromise;
}

async function isVipEmail(email) {
    const mail = normalizeEmail(email);
    if (!mail) return false;

    if (isDatabaseConfigured()) {
        try {
            await ensureVipSeeded();
            if (await isVipEmailInDb(mail)) return true;
        } catch (error) {
            console.warn('[entitlements] VIP DB lookup failed, falling back to env', error?.message || error);
        }
    }

    // Fallback when DB is down / not configured
    return getVipEmailsFromEnv().has(mail);
}

/**
 * Resolve plan for a signed-in user.
 * @param {{ email?: string, subscribed?: boolean, subscriptionStatus?: string } | null} user
 */
async function resolveAccess(user) {
    const email = normalizeEmail(user?.email);
    if (email && await isVipEmail(email)) {
        return {
            fullAccess: true,
            plan: 'vip',
            source: 'allowlist',
            labelZh: 'VIP',
            labelEn: 'VIP'
        };
    }

    const subscribed = Boolean(
        user?.subscribed
        || user?.subscriptionStatus === 'active'
        || user?.plan === 'subscribed'
    );
    if (subscribed) {
        return {
            fullAccess: true,
            plan: 'subscribed',
            source: 'subscription',
            labelZh: '已訂閱',
            labelEn: 'Subscribed'
        };
    }

    return {
        fullAccess: false,
        plan: 'free',
        source: null,
        labelZh: '尚未訂閱',
        labelEn: 'Not subscribed'
    };
}

async function hasFullAccess(user) {
    return Boolean((await resolveAccess(user)).fullAccess);
}

module.exports = {
    normalizeEmail,
    parseEmailList,
    getVipEmailsFromEnv,
    getVipEmails: getVipEmailsFromEnv,
    ensureVipSeeded,
    isVipEmail,
    resolveAccess,
    hasFullAccess,
    listVipEmails,
    upsertVipEmail,
    removeVipEmail
};
