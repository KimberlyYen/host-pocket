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
        })();
    }
    await schemaReady;
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
    getUserByGoogleSub
};
