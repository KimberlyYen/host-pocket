const fs = require('fs');
const path = require('path');
const { pickEditable, saveListingSettings, getListingSettings } = require('./listing-settings');

const PRESET_IDS = Object.freeze([
    'TAIPEI-CITY',
    'UK-LONDON',
    'VILNIUS-OLDTOWN',
    'RIO-COPACABANA'
]);

const PRESET_LABELS = Object.freeze({
    'TAIPEI-CITY': '台北 · 內容範本（Lina 信義區）',
    'UK-LONDON': '倫敦 · 內容範本（James 國王十字）',
    'VILNIUS-OLDTOWN': '維爾紐斯 · 內容範本（Aistė Užupis）',
    'RIO-COPACABANA': '里約 · 內容範本（Marina Ipanema）'
});

const PRESETS_DIR = path.join(__dirname, '..', 'js', 'presets');

function normalizePresetId(listingId) {
    return String(listingId || '').trim().toUpperCase();
}

function isPresetId(listingId) {
    return PRESET_IDS.includes(normalizePresetId(listingId));
}

function presetFilePath(listingId) {
    const id = normalizePresetId(listingId);
    if (!isPresetId(id)) return null;
    return path.join(PRESETS_DIR, `${id}.json`);
}

/** Local/dev can write js/presets/*.json; Vercel filesystem is read-only. */
function isPresetFileWritable() {
    if (process.env.VERCEL) return false;
    if (process.env.PRESETS_WRITABLE === '0' || process.env.PRESETS_WRITABLE === 'false') {
        return false;
    }
    return true;
}

function readPresetFile(listingId) {
    const filePath = presetFilePath(listingId);
    if (!filePath || !fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    if (!json || typeof json !== 'object') return null;
    const id = normalizePresetId(listingId);
    const label = String(json.label || PRESET_LABELS[id] || id);
    const data = { ...json };
    delete data.listingId;
    delete data.label;
    return { id, label, data, storage: 'file' };
}

async function readPreset(listingId) {
    const id = normalizePresetId(listingId);
    if (!isPresetId(id)) {
        throw new Error(`Unknown preset listing: ${id}`);
    }

    const fromFile = readPresetFile(id);
    let fromDb = null;
    try {
        const record = await getListingSettings(id);
        if (record?.data && typeof record.data === 'object' && Object.keys(record.data).length) {
            fromDb = record;
        }
    } catch (_) {
        // DB optional for read
    }

    if (fromFile && fromDb) {
        const fileTs = 0;
        const dbTs = Date.parse(fromDb.updatedAt || '') || 0;
        // Prefer DB overlay when present (production edits land here).
        if (dbTs > fileTs) {
            return {
                id,
                label: fromFile.label,
                data: { ...fromFile.data, ...fromDb.data },
                updatedAt: fromDb.updatedAt,
                storage: 'database+file'
            };
        }
    }

    if (fromFile) {
        return { ...fromFile, updatedAt: null };
    }

    if (fromDb) {
        return {
            id,
            label: PRESET_LABELS[id] || id,
            data: fromDb.data,
            updatedAt: fromDb.updatedAt,
            storage: 'database'
        };
    }

    return {
        id,
        label: PRESET_LABELS[id] || id,
        data: {},
        updatedAt: null,
        storage: 'empty'
    };
}

function writePresetFile(listingId, source = {}) {
    const id = normalizePresetId(listingId);
    const filePath = presetFilePath(id);
    if (!filePath) throw new Error(`Unknown preset listing: ${id}`);

    let previous = {};
    let label = PRESET_LABELS[id] || id;
    try {
        const existing = readPresetFile(id);
        if (existing) {
            previous = existing.data || {};
            label = existing.label || label;
        }
    } catch (_) { /* ignore */ }

    if (source.label) label = String(source.label).trim().slice(0, 160) || label;
    const incoming = pickEditable(source);
    const data = { ...previous, ...incoming };
    const payload = {
        listingId: id,
        label,
        ...data
    };
    fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    return { id, label, data, storage: 'file' };
}

async function writePreset(listingId, source = {}) {
    const id = normalizePresetId(listingId);
    if (!isPresetId(id)) {
        throw new Error(`Unknown preset listing: ${id}`);
    }

    const storages = [];
    let result = null;

    if (isPresetFileWritable()) {
        result = writePresetFile(id, source);
        storages.push('file');
    }

    // Always mirror to listing_settings so production (and multi-instance) keep edits.
    try {
        const record = await saveListingSettings(id, source);
        storages.push('database');
        if (!result) {
            result = {
                id,
                label: PRESET_LABELS[id] || id,
                data: record.data,
                updatedAt: record.updatedAt,
                storage: 'database'
            };
        } else {
            result = {
                ...result,
                data: { ...result.data, ...record.data },
                updatedAt: record.updatedAt,
                storage: storages.join('+')
            };
        }
    } catch (error) {
        if (!result) throw error;
        console.warn('[presets] DB mirror failed', error);
        result.storage = 'file';
    }

    return result;
}

module.exports = {
    PRESET_IDS,
    PRESET_LABELS,
    PRESETS_DIR,
    normalizePresetId,
    isPresetId,
    isPresetFileWritable,
    readPresetFile,
    readPreset,
    writePresetFile,
    writePreset
};
