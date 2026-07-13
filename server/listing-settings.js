const postgres = require('postgres');
const RecSlots = require('../js/rec-slots');

const MAX_REC_SLOTS = RecSlots.MAX_REC_SLOTS || 10;

const EDITABLE_FIELDS = [
    'hostNameZh', 'hostNameEn',
    'roomTitleZh', 'roomTitleEn',
    'locationZh', 'locationEn',
    'listingLabelZh', 'listingLabelEn',
    'wifi', 'lockZh', 'lockEn', 'hostEmail',
    'roomImg',
    ...RecSlots.buildAllRecFields(MAX_REC_SLOTS),
    'targetTitleZh', 'targetTitleEn', 'descZh', 'descEn',
    'explorerDistZh', 'explorerDistEn', 'explorerEstZh', 'explorerEstEn'
];

function getDatabaseUrl() {
    return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

function isDatabaseConfigured() {
    return Boolean(getDatabaseUrl());
}

function getPostgresOptions(url) {
    const isSupabasePooler = /pooler\.supabase\.com|:6543/.test(url);
    const needsSsl = /supabase\.com|neon\.tech|sslmode=require/i.test(url);

    return {
        ssl: needsSsl ? 'require' : 'prefer',
        // Supabase transaction pooler (port 6543) does not support prepared statements.
        prepare: !isSupabasePooler,
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10
    };
}

let sql;
function getSql() {
    if (!sql) {
        const url = getDatabaseUrl();
        if (!url) throw new Error('Database not configured (set DATABASE_URL or POSTGRES_URL)');
        sql = postgres(url, getPostgresOptions(url));
    }
    return sql;
}

let schemaReady = null;
async function ensureSchema() {
    if (!isDatabaseConfigured()) {
        throw new Error('Database not configured');
    }
    if (!schemaReady) {
        schemaReady = getSql()`
            CREATE TABLE IF NOT EXISTS listing_settings (
                listing_id TEXT PRIMARY KEY,
                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `;
    }
    await schemaReady;
}

function normalizeListingId(id) {
    return String(id || '').trim().toUpperCase() || 'TAIPEI-CITY';
}

function pickEditable(source) {
    const out = {};
    EDITABLE_FIELDS.forEach((key) => {
        if (source[key] !== undefined && source[key] !== null && String(source[key]).trim() !== '') {
            out[key] = source[key];
        }
    });
    if (Array.isArray(source.roomGallery) && source.roomGallery.length) {
        out.roomGallery = source.roomGallery.filter(Boolean);
    }
    for (let i = 1; i <= MAX_REC_SLOTS; i += 1) {
        const key = `recGallery${i}`;
        if (Array.isArray(source[key]) && source[key].length) {
            out[key] = source[key].filter(Boolean);
        }
    }
    return out;
}

async function getListingSettings(listingId) {
    await ensureSchema();
    const id = normalizeListingId(listingId);
    const rows = await getSql()`
        SELECT data, updated_at
        FROM listing_settings
        WHERE listing_id = ${id}
        LIMIT 1
    `;
    if (!rows.length) return null;
    const row = rows[0];
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    return {
        listingId: id,
        data,
        updatedAt: row.updated_at
    };
}

async function saveListingSettings(listingId, source) {
    await ensureSchema();
    const id = normalizeListingId(listingId);
    const incoming = pickEditable(source || {});
    let existing = {};
    try {
        const record = await getListingSettings(id);
        if (record?.data && typeof record.data === 'object') {
            existing = record.data;
        }
    } catch (error) {
        console.warn('[listing-settings] read before merge failed', error);
    }
    const data = { ...existing, ...incoming };
    const updatedAt = new Date().toISOString();
    await getSql()`
        INSERT INTO listing_settings (listing_id, data, updated_at)
        VALUES (${id}, ${getSql().json(data)}, ${updatedAt})
        ON CONFLICT (listing_id) DO UPDATE
        SET data = EXCLUDED.data,
            updated_at = EXCLUDED.updated_at
    `;
    return { listingId: id, data, updatedAt };
}

async function deleteListingSettings(listingId) {
    await ensureSchema();
    const id = normalizeListingId(listingId);
    const rows = await getSql()`
        DELETE FROM listing_settings
        WHERE listing_id = ${id}
        RETURNING listing_id
    `;
    return rows.length > 0;
}

async function listListingSettingsIds() {
    await ensureSchema();
    const rows = await getSql()`
        SELECT listing_id
        FROM listing_settings
        ORDER BY listing_id ASC
    `;
    return rows.map((row) => row.listing_id);
}

async function checkDatabaseConnection() {
    if (!isDatabaseConfigured()) {
        return { ok: false, error: 'Database URL not set (DATABASE_URL or POSTGRES_URL)' };
    }
    try {
        await getSql()`SELECT 1 AS ok`;
        return { ok: true };
    } catch (error) {
        return { ok: false, error: error?.message || String(error) };
    }
}

module.exports = {
    EDITABLE_FIELDS,
    getDatabaseUrl,
    isDatabaseConfigured,
    checkDatabaseConnection,
    normalizeListingId,
    pickEditable,
    getListingSettings,
    saveListingSettings,
    deleteListingSettings,
    listListingSettingsIds
};
