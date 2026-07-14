const crypto = require('crypto');
const postgres = require('postgres');

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
        prepare: !isSupabasePooler,
        max: 5,
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
        schemaReady = (async () => {
            await getSql()`
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY,
                    google_sub TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL,
                    name TEXT,
                    avatar_url TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `;
            await getSql()`
                CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)
            `;
            await getSql()`
                CREATE TABLE IF NOT EXISTS user_listings (
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    listing_id TEXT NOT NULL,
                    title TEXT,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    PRIMARY KEY (user_id, listing_id)
                )
            `;
            await getSql()`
                CREATE INDEX IF NOT EXISTS user_listings_user_id_idx
                ON user_listings (user_id, updated_at DESC)
            `;
        })();
    }
    await schemaReady;
}

function normalizeLinkedListingId(listingId) {
    const raw = String(listingId || '').trim();
    if (!raw || /\[object\s+/i.test(raw)) return '';
    if (/^\d{5,}$/.test(raw)) return raw;
    return raw.toUpperCase();
}

function publicListing(row) {
    if (!row) return null;
    return {
        listingId: String(row.listing_id || ''),
        title: row.title || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

async function linkUserListing(userId, listingId, title = '') {
    await ensureSchema();
    const uid = String(userId || '').trim();
    const lid = normalizeLinkedListingId(listingId);
    if (!uid || !lid) throw new Error('user_id and listing_id are required');
    const label = String(title || '').trim().slice(0, 160) || null;

    const rows = await getSql()`
        INSERT INTO user_listings (user_id, listing_id, title)
        VALUES (${uid}, ${lid}, ${label})
        ON CONFLICT (user_id, listing_id) DO UPDATE SET
            title = COALESCE(EXCLUDED.title, user_listings.title),
            updated_at = NOW()
        RETURNING user_id, listing_id, title, created_at, updated_at
    `;
    return publicListing(rows[0]);
}

async function listUserListings(userId) {
    await ensureSchema();
    const uid = String(userId || '').trim();
    if (!uid) return [];
    const rows = await getSql()`
        SELECT user_id, listing_id, title, created_at, updated_at
        FROM user_listings
        WHERE user_id = ${uid}
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 50
    `;
    return rows.map(publicListing).filter((row) => row?.listingId);
}

async function unlinkUserListing(userId, listingId) {
    await ensureSchema();
    const uid = String(userId || '').trim();
    const lid = normalizeLinkedListingId(listingId);
    if (!uid || !lid) return false;
    const rows = await getSql()`
        DELETE FROM user_listings
        WHERE user_id = ${uid} AND listing_id = ${lid}
        RETURNING listing_id
    `;
    return rows.length > 0;
}

function publicUser(row) {
    if (!row) return null;
    return {
        id: String(row.id),
        email: row.email || '',
        name: row.name || '',
        avatarUrl: row.avatar_url || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

async function upsertGoogleUser({ googleSub, email, name, avatarUrl }) {
    await ensureSchema();
    const sub = String(googleSub || '').trim();
    const mail = String(email || '').trim().toLowerCase();
    if (!sub) throw new Error('google_sub is required');
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        throw new Error('Valid email is required');
    }

    const displayName = String(name || '').trim().slice(0, 120) || null;
    const avatar = String(avatarUrl || '').trim().slice(0, 500) || null;
    const id = crypto.randomUUID();

    const rows = await getSql()`
        INSERT INTO users (id, google_sub, email, name, avatar_url)
        VALUES (${id}, ${sub}, ${mail}, ${displayName}, ${avatar})
        ON CONFLICT (google_sub) DO UPDATE SET
            email = EXCLUDED.email,
            name = COALESCE(EXCLUDED.name, users.name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
            updated_at = NOW()
        RETURNING id, google_sub, email, name, avatar_url, created_at, updated_at
    `;
    return publicUser(rows[0]);
}

async function getUserById(userId) {
    await ensureSchema();
    const id = String(userId || '').trim();
    if (!id) return null;
    const rows = await getSql()`
        SELECT id, google_sub, email, name, avatar_url, created_at, updated_at
        FROM users
        WHERE id = ${id}
        LIMIT 1
    `;
    return rows.length ? publicUser(rows[0]) : null;
}

async function getUserByGoogleSub(googleSub) {
    await ensureSchema();
    const sub = String(googleSub || '').trim();
    if (!sub) return null;
    const rows = await getSql()`
        SELECT id, google_sub, email, name, avatar_url, created_at, updated_at
        FROM users
        WHERE google_sub = ${sub}
        LIMIT 1
    `;
    return rows.length ? publicUser(rows[0]) : null;
}

module.exports = {
    isDatabaseConfigured,
    ensureSchema,
    upsertGoogleUser,
    getUserById,
    getUserByGoogleSub,
    normalizeLinkedListingId,
    linkUserListing,
    listUserListings,
    unlinkUserListing
};
