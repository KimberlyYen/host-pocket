const postgres = require('postgres');

const EDITABLE_FIELDS = [
    'hostNameZh', 'hostNameEn',
    'roomTitleZh', 'roomTitleEn',
    'locationZh', 'locationEn',
    'listingLabelZh', 'listingLabelEn',
    'wifi', 'lockZh', 'lockEn', 'hostEmail',
    'roomImg',
    'recExperienceId1', 'recTitle1Zh', 'recTitle1En', 'recImg1',
    'recBadge1Zh', 'recBadge1En', 'recDist1Zh', 'recDist1En',
    'recPrice1Zh', 'recPrice1En', 'desc1Zh', 'desc1En',
    'recExplorerDist1Zh', 'recExplorerDist1En', 'recExplorerEst1Zh', 'recExplorerEst1En',
    'recExperienceId2', 'recTitle2Zh', 'recTitle2En', 'recImg2',
    'recBadge2Zh', 'recBadge2En', 'recDist2Zh', 'recDist2En',
    'recPrice2Zh', 'recPrice2En', 'desc2Zh', 'desc2En',
    'recExplorerDist2Zh', 'recExplorerDist2En', 'recExplorerEst2Zh', 'recExplorerEst2En',
    'recExperienceId3', 'recTitle3Zh', 'recTitle3En', 'recImg3',
    'recBadge3Zh', 'recBadge3En', 'recDist3Zh', 'recDist3En',
    'recPrice3Zh', 'recPrice3En', 'desc3Zh', 'desc3En',
    'recExplorerDist3Zh', 'recExplorerDist3En', 'recExplorerEst3Zh', 'recExplorerEst3En',
    'recExperienceId4', 'recTitle4Zh', 'recTitle4En', 'recImg4',
    'recBadge4Zh', 'recBadge4En', 'recDist4Zh', 'recDist4En',
    'recPrice4Zh', 'recPrice4En', 'desc4Zh', 'desc4En',
    'recExplorerDist4Zh', 'recExplorerDist4En', 'recExplorerEst4Zh', 'recExplorerEst4En',
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
    const data = pickEditable(source || {});
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

module.exports = {
    EDITABLE_FIELDS,
    getDatabaseUrl,
    isDatabaseConfigured,
    normalizeListingId,
    pickEditable,
    getListingSettings,
    saveListingSettings,
    deleteListingSettings,
    listListingSettingsIds
};
