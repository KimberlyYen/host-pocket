(function (global) {
    const STORAGE_KEY = 'host-pocket-guide-settings';
    const _cache = Object.create(null);
    const _pending = Object.create(null);
    let _dbAvailable = null;

    const MAX_REC_SLOTS = global.HostPocketRecSlots?.MAX_REC_SLOTS || 10;
    function fallbackRecFields(max) {
        const fields = [];
        for (let i = 1; i <= max; i += 1) {
            fields.push(
                `recExperienceId${i}`, `recTitle${i}Zh`, `recTitle${i}En`, `recImg${i}`,
                `recBadge${i}Zh`, `recBadge${i}En`, `recDist${i}Zh`, `recDist${i}En`,
                `recPrice${i}Zh`, `recPrice${i}En`, `recRating${i}`, `recReviews${i}`,
                `recCategory${i}Zh`, `recCategory${i}En`, `desc${i}Zh`, `desc${i}En`,
                `recExplorerDist${i}Zh`, `recExplorerDist${i}En`, `recExplorerEst${i}Zh`, `recExplorerEst${i}En`
            );
        }
        return fields;
    }
    const EDITABLE_FIELDS = [
        'hostNameZh', 'hostNameEn',
        'roomTitleZh', 'roomTitleEn',
        'locationZh', 'locationEn',
        'listingLabelZh', 'listingLabelEn',
        'wifi', 'lockCode', 'lockZh', 'lockEn', 'hostEmail',
        'roomImg',
        ...(global.HostPocketRecSlots?.buildAllRecFields?.(MAX_REC_SLOTS) || fallbackRecFields(MAX_REC_SLOTS)),
        'targetTitleZh', 'targetTitleEn', 'descZh', 'descEn',
        'explorerDistZh', 'explorerDistEn', 'explorerEstZh', 'explorerEstEn'
    ];

    function normalizeListingId(id) {
        if (global.GuideDefaults?.normalizeListingId) {
            return global.GuideDefaults.normalizeListingId(id);
        }
        return String(id || '').trim().toUpperCase() || 'TAIPEI-CITY';
    }

    function readAllLocal() {
        try {
            return JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }

    function writeAllLocal(all) {
        try {
            global.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
            return true;
        } catch (error) {
            console.warn('[HostGuideSettings] localStorage write failed', error);
            return false;
        }
    }

    function loadLocal(listingId) {
        const id = normalizeListingId(listingId);
        return readAllLocal()[id] || null;
    }

    function saveLocal(listingId, data) {
        const id = normalizeListingId(listingId);
        const all = readAllLocal();
        const prev = all[id] || {};
        all[id] = {
            ...prev,
            ...pickEditable(data),
            updatedAt: new Date().toISOString()
        };
        writeAllLocal(all);
        return all[id];
    }

    function removeLocal(listingId) {
        const id = normalizeListingId(listingId);
        const all = readAllLocal();
        if (!all[id]) return false;
        delete all[id];
        return writeAllLocal(all);
    }

    function listSavedIdsLocal() {
        return Object.keys(readAllLocal()).sort();
    }

    function pickEditable(source, options = {}) {
        const allowEmpty = new Set(options.allowEmpty || []);
        const out = {};
        EDITABLE_FIELDS.forEach((key) => {
            if (source[key] === undefined || source[key] === null) return;
            const asString = String(source[key]);
            if (asString.trim() === '') {
                if (allowEmpty.has(key)) out[key] = '';
                return;
            }
            out[key] = source[key];
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

    function setCacheEntry(listingId, overrides) {
        const id = normalizeListingId(listingId);
        _cache[id] = overrides || null;
    }

    function getCacheEntry(listingId) {
        const id = normalizeListingId(listingId);
        return Object.prototype.hasOwnProperty.call(_cache, id) ? _cache[id] : undefined;
    }

    async function isDatabaseAvailable() {
        if (global.HP_MOCK_DATA !== false) {
            _dbAvailable = false;
            return false;
        }
        if (_dbAvailable === true) return true;
        if (_dbAvailable === false) return false;
        if (!global.ListingSettingsAPI) {
            _dbAvailable = false;
            return false;
        }
        try {
            const ok = await ListingSettingsAPI.isDatabaseConfigured();
            _dbAvailable = ok;
            return ok;
        } catch {
            _dbAvailable = false;
            return false;
        }
    }

    function invalidateCache(listingId) {
        const id = normalizeListingId(listingId);
        delete _cache[id];
        delete _pending[id];
    }

    async function ensureLoaded(listingId) {
        const id = normalizeListingId(listingId);
        if (getCacheEntry(id) !== undefined) {
            return getCacheEntry(id);
        }
        if (_pending[id]) return _pending[id];

        _pending[id] = (async () => {
            let overrides = null;
            if (global.HP_MOCK_DATA === false && global.ListingSettingsAPI) {
                try {
                    const record = await ListingSettingsAPI.fetchSettings(id);
                    _dbAvailable = true;
                    if (record?.data && Object.keys(record.data).length) {
                        overrides = { ...record.data, updatedAt: record.updatedAt };
                    }
                } catch (error) {
                    console.warn('[HostGuideSettings] API load failed, using local fallback', error);
                    if (_dbAvailable !== true) _dbAvailable = false;
                }
            }
            const local = loadLocal(id);
            if (!overrides) {
                overrides = local;
            } else if (local && typeof local === 'object') {
                // Prefer local mirror when it is newer (e.g. just-saved slots the DB omitted).
                const localTs = Date.parse(local.updatedAt || '') || 0;
                const remoteTs = Date.parse(overrides.updatedAt || '') || 0;
                if (localTs >= remoteTs) {
                    overrides = { ...overrides, ...local };
                }
            }
            setCacheEntry(id, overrides);
            delete _pending[id];
            return overrides;
        })();

        return _pending[id];
    }

    function load(listingId) {
        const cached = getCacheEntry(listingId);
        if (cached !== undefined) return cached;
        return loadLocal(listingId);
    }

    async function loadAsync(listingId) {
        await ensureLoaded(listingId);
        return load(listingId);
    }

    function listSavedIds() {
        return listSavedIdsLocal();
    }

    async function save(listingId, data) {
        const id = normalizeListingId(listingId);
        try {
            await ensureLoaded(id);
        } catch {
            // continue with local/preset merge
        }
        const existing = load(id) || {};
        const formData = data || {};
        const experienceClearKeys = Array.from({ length: MAX_REC_SLOTS }, (_, i) => `recExperienceId${i + 1}`);
        const payload = pickEditable(
            { ...existing, ...formData },
            { allowEmpty: experienceClearKeys }
        );
        // Empty experience IDs mean "clear legacy demo id" so merges don't keep Mia/Emma IDs.
        experienceClearKeys.forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(formData, key)) return;
            if (String(formData[key] || '').trim() === '') {
                payload[key] = '';
            }
        });
        payload.updatedAt = new Date().toISOString();

        if (await isDatabaseAvailable()) {
            const record = await ListingSettingsAPI.saveSettings(id, payload);
            const fromDb = record?.data && typeof record.data === 'object' ? record.data : {};
            // Payload wins so client-submitted slots (e.g. 5–10) are not lost if the
            // server process is still running an older EDITABLE_FIELDS list.
            const saved = {
                ...fromDb,
                ...payload,
                updatedAt: record.updatedAt || payload.updatedAt
            };
            setCacheEntry(id, saved);
            removeLocal(id);
            // Keep a local mirror so preview/guest can still read the latest save
            // even before the next DB fetch.
            try {
                saveLocal(id, saved);
            } catch {
                // ignore quota / private mode
            }
            return saved;
        }

        const saved = saveLocal(id, payload);
        setCacheEntry(id, saved);
        return saved;
    }

    async function remove(listingId) {
        const id = normalizeListingId(listingId);
        let removed = false;

        if (await isDatabaseAvailable()) {
            try {
                removed = await ListingSettingsAPI.deleteSettings(id);
            } catch (error) {
                if (!/not found/i.test(error?.message || '')) throw error;
            }
        }

        removed = removeLocal(id) || removed;
        setCacheEntry(id, null);
        return removed;
    }

    function getBase(listingId) {
        if (global.GuideDefaults?.getBase) {
            return global.GuideDefaults.getBase(listingId);
        }
        return global.GuideDefaults?.generateFallbackListing?.(listingId) || {};
    }

    /** Pre-Lina/James/Aistė/Marina demo experience IDs — DB rows still using these should not override rec blocks. */
    const LEGACY_DEMO_REC_IDS = {
        'TAIPEI-CITY': new Set(['3310245', '3310246', '3310247', '3310248']),
        'UK-LONDON': new Set(['5829101', '5829102', '5829103', '5829104']),
        'VILNIUS-OLDTOWN': new Set(['4410201', '4410202', '4410203', '4410204']),
        'RIO-COPACABANA': new Set(['5510301', '5510302', '5510303', '5510304'])
    };

    const REC_BLOCK_FIELDS = EDITABLE_FIELDS.filter((key) =>
        /^rec(ExperienceId|[A-Za-z]+\d)/.test(key)
        || /^desc([1-9]|10)/.test(key)
        || /^recExplorer/.test(key)
        || key.startsWith('targetTitle')
        || key === 'descZh'
        || key === 'descEn'
        || key.startsWith('explorerDist')
        || key.startsWith('explorerEst')
    );

    function usesLegacyDemoRecs(listingId, data) {
        const legacy = LEGACY_DEMO_REC_IDS[normalizeListingId(listingId)];
        if (!legacy || !data) return false;
        return [1, 2, 3, 4].some((i) => legacy.has(String(data[`recExperienceId${i}`] || '').trim()));
    }

    /**
     * Old DB rows may still store Mia/Emma demo experience IDs.
     * Clear only those IDs so host-edited / TDX titles are not wiped on load.
     */
    function stripLegacyDemoRecOverrides(listingId, overrides) {
        if (!overrides) return overrides;
        const legacy = LEGACY_DEMO_REC_IDS[normalizeListingId(listingId)];
        if (!legacy) return overrides;

        const out = { ...overrides };
        let stripped = false;
        for (let i = 1; i <= 4; i += 1) {
            const key = `recExperienceId${i}`;
            const expId = String(out[key] || '').trim();
            if (!legacy.has(expId)) continue;
            delete out[key];
            stripped = true;
        }
        return stripped ? out : overrides;
    }

    function merge(base, overrides) {
        if (!overrides) return { ...base };
        const merged = { ...base };
        Object.keys(overrides).forEach((key) => {
            const val = overrides[key];
            if (val === undefined || val === null) return;
            if (typeof val === 'string' && val.trim() === '') return;
            if (Array.isArray(val) && val.length === 0) return;
            merged[key] = val;
        });
        if (overrides.roomGallery?.length) {
            merged.roomGallery = [...overrides.roomGallery];
        }
        return merged;
    }

    function seedDemoListing(listingId, options = {}) {
        const id = normalizeListingId(listingId);
        if (global.HP_MOCK_DATA === false) {
            return getMerged(id);
        }

        const demoIds = global.GuideDefaults?.DEMO_LISTING_IDS || [];
        if (!demoIds.includes(id)) return getMerged(id);

        const base = getBase(id);
        const force = options.force === true;
        const existing = loadLocal(id);
        if (!force && existing?.recTitle1Zh && existing?.wifi) {
            setCacheEntry(id, existing);
            return merge(base, existing);
        }

        const saved = saveLocal(id, base);
        setCacheEntry(id, saved);
        return merge(base, saved);
    }

    function seedAllDemoListings(options = {}) {
        if (global.HP_MOCK_DATA === false) {
            const demoIds = global.GuideDefaults?.DEMO_LISTING_IDS || [];
            return demoIds.map((id) => getMerged(id));
        }

        const demoIds = global.GuideDefaults?.DEMO_LISTING_IDS || [];
        return demoIds.map((id) => seedDemoListing(id, options));
    }

    function getMerged(listingId) {
        const base = getBase(listingId);
        const overrides = stripLegacyDemoRecOverrides(listingId, load(listingId));
        return merge(base, overrides);
    }

    async function getMergedAsync(listingId) {
        await ensureLoaded(listingId);
        return getMerged(listingId);
    }

    function parseGalleryText(text) {
        return String(text || '')
            .split(/\n|,/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    function galleryToText(gallery) {
        if (!Array.isArray(gallery) || !gallery.length) return '';
        return gallery.join('\n');
    }

    function getStorageMode() {
        if (_dbAvailable === true) return 'database';
        return 'localStorage';
    }

    global.HostGuideSettings = {
        STORAGE_KEY,
        EDITABLE_FIELDS,
        load,
        loadAsync,
        save,
        remove,
        listSavedIds,
        ensureLoaded,
        getMerged,
        getMergedAsync,
        seedDemoListing,
        seedAllDemoListings,
        getBase,
        merge,
        LEGACY_DEMO_REC_IDS,
        usesLegacyDemoRecs,
        stripLegacyDemoRecOverrides,
        pickEditable,
        parseGalleryText,
        galleryToText,
        normalizeListingId,
        isDatabaseAvailable,
        getStorageMode,
        invalidateCache
    };
})(window);
