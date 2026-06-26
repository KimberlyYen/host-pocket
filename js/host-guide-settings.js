(function (global) {
    const STORAGE_KEY = 'host-pocket-guide-settings';
    const _cache = Object.create(null);
    const _pending = Object.create(null);
    let _dbAvailable = null;

    const EDITABLE_FIELDS = [
        'hostNameZh', 'hostNameEn',
        'roomTitleZh', 'roomTitleEn',
        'locationZh', 'locationEn',
        'listingLabelZh', 'listingLabelEn',
        'wifi', 'lockCode', 'lockZh', 'lockEn', 'hostEmail',
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
        all[id] = pickEditable(data);
        all[id].updatedAt = new Date().toISOString();
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
        if (_dbAvailable !== null) return _dbAvailable;
        if (!global.ListingSettingsAPI) {
            _dbAvailable = false;
            return false;
        }
        try {
            _dbAvailable = await ListingSettingsAPI.isDatabaseConfigured();
        } catch {
            _dbAvailable = false;
        }
        return _dbAvailable;
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
            try {
                if (await isDatabaseAvailable()) {
                    const record = await ListingSettingsAPI.fetchSettings(id);
                    if (record?.data && Object.keys(record.data).length) {
                        overrides = { ...record.data, updatedAt: record.updatedAt };
                    }
                }
            } catch (error) {
                console.warn('[HostGuideSettings] API load failed, using local fallback', error);
            }
            if (!overrides) {
                overrides = loadLocal(id);
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
        const payload = pickEditable(data);
        payload.updatedAt = new Date().toISOString();

        if (await isDatabaseAvailable()) {
            const record = await ListingSettingsAPI.saveSettings(id, payload);
            const saved = { ...(record.data || payload), updatedAt: record.updatedAt || payload.updatedAt };
            setCacheEntry(id, saved);
            removeLocal(id);
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
        const overrides = load(listingId);
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
        if (_dbAvailable === false) return 'localStorage';
        return 'unknown';
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
        pickEditable,
        parseGalleryText,
        galleryToText,
        normalizeListingId,
        isDatabaseAvailable,
        getStorageMode,
        invalidateCache
    };
})(window);
