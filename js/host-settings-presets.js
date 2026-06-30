(function (global) {
    const PRESET_BASE = '/js/presets';
    const PRESET_IDS = global.HostPocketDemoThemePicker?.DEMO_THEME_IDS
        || ['TAIPEI-CITY', 'UK-LONDON', 'VILNIUS-OLDTOWN', 'RIO-COPACABANA'];

    const PRESET_LABELS = {
        'TAIPEI-CITY': '台北 · Lina 信義區',
        'UK-LONDON': '倫敦 · James 國王十字',
        'VILNIUS-OLDTOWN': '維爾紐斯 · Aistė Užupis',
        'RIO-COPACABANA': '里約 · Marina Ipanema'
    };

    const PRESET_BUTTON_LABELS = {
        'TAIPEI-CITY': '台北範本',
        'UK-LONDON': '倫敦範本',
        'VILNIUS-OLDTOWN': '維爾紐斯範本',
        'RIO-COPACABANA': '里約範本'
    };

    const _cache = Object.create(null);

    function normalizeListingId(id) {
        if (global.HostGuideSettings?.normalizeListingId) {
            return global.HostGuideSettings.normalizeListingId(id);
        }
        return String(id || '').trim().toUpperCase() || 'TAIPEI-CITY';
    }

    function presetUrl(listingId) {
        const id = normalizeListingId(listingId);
        return `${PRESET_BASE}/${encodeURIComponent(id)}.json`;
    }

    async function fetchPreset(listingId) {
        const id = normalizeListingId(listingId);
        if (_cache[id]) return _cache[id];

        const res = await fetch(presetUrl(id), { cache: 'no-cache' });
        if (!res.ok) {
            throw new Error(`找不到 ${id} 的內容範本（${res.status}）`);
        }
        const json = await res.json();
        const data = { ...json };
        delete data.listingId;
        delete data.label;
        _cache[id] = { id, label: json.label || PRESET_LABELS[id] || id, data };
        return _cache[id];
    }

    function getPresetLabel(listingId) {
        const id = normalizeListingId(listingId);
        return _cache[id]?.label || PRESET_LABELS[id] || id;
    }

    function getCachedPresetData(listingId) {
        const id = normalizeListingId(listingId);
        return _cache[id]?.data || null;
    }

    global.HostSettingsPresets = {
        PRESET_BASE,
        PRESET_IDS,
        PRESET_LABELS,
        PRESET_BUTTON_LABELS,
        presetUrl,
        fetchPreset,
        getPresetLabel,
        getCachedPresetData
    };
})(window);
