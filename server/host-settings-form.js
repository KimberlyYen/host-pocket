const fs = require('fs');
const path = require('path');
const {
    getListingSettings,
    saveListingSettings,
    deleteListingSettings,
    isDatabaseConfigured,
    pickEditable,
    normalizeListingId,
    EDITABLE_FIELDS
} = require('./listing-settings');
const { renderPartial } = require('./partials');

const ROOT = path.join(__dirname, '..');
const LOADING_PARTIAL = path.join(ROOT, 'partials/host_settings/_form_loading.html');
const FRAME_ID = 'host_settings_form';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
}

function galleryToText(gallery) {
    if (!Array.isArray(gallery)) return '';
    return gallery.filter(Boolean).join('\n');
}

function parseGalleryText(text) {
    return String(text || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

async function loadPresetDefaults(listingId) {
    const presetPath = path.join(ROOT, 'js/presets', `${listingId}.json`);
    if (!fs.existsSync(presetPath)) return {};

    try {
        const preset = JSON.parse(fs.readFileSync(presetPath, 'utf8'));
        const data = { ...preset };
        delete data.listingId;
        delete data.label;
        return data;
    } catch (error) {
        console.warn('[host-settings-form] preset read failed', error);
        return {};
    }
}

async function getMergedListingData(listingId) {
    const id = normalizeListingId(listingId);
    let merged = await loadPresetDefaults(id);

    if (isDatabaseConfigured()) {
        try {
            const record = await getListingSettings(id);
            if (record?.data) merged = { ...merged, ...record.data };
        } catch (error) {
            console.warn('[host-settings-form] db read failed', error);
        }
    }

    return merged;
}

function findHtmlTagEnd(html, tagStart) {
    let inQuote = null;
    for (let i = tagStart; i < html.length; i++) {
        const ch = html[i];
        if (inQuote) {
            if (ch === inQuote) inQuote = null;
        } else if (ch === '"' || ch === "'") {
            inQuote = ch;
        } else if (ch === '>') {
            return i;
        }
    }
    return -1;
}

function findInputTagBounds(html, name) {
    const needle = `name="${name}"`;
    let searchFrom = 0;

    while (searchFrom < html.length) {
        const nameIdx = html.indexOf(needle, searchFrom);
        if (nameIdx === -1) return null;

        const tagStart = html.lastIndexOf('<input', nameIdx);
        if (tagStart === -1 || tagStart < searchFrom) {
            searchFrom = nameIdx + 1;
            continue;
        }

        const tagEnd = findHtmlTagEnd(html, tagStart);
        if (tagEnd === -1 || tagEnd < nameIdx) {
            searchFrom = nameIdx + 1;
            continue;
        }

        return { start: tagStart, end: tagEnd };
    }

    return null;
}

function setFieldValue(html, name, value) {
    const bounds = findInputTagBounds(html, name);
    if (bounds) {
        const tag = html.slice(bounds.start, bounds.end + 1);
        const withoutValue = tag.replace(/\svalue="[^"]*"/i, '');
        const selfClosing = /\/>\s*$/.test(withoutValue);
        const insertAt = selfClosing ? withoutValue.length - 2 : withoutValue.length - 1;
        const newTag = `${withoutValue.slice(0, insertAt)} value="${escapeAttr(value)}"${withoutValue.slice(insertAt)}`;
        return html.slice(0, bounds.start) + newTag + html.slice(bounds.end + 1);
    }

    const textareaRe = new RegExp(`(<textarea\\b[^>]*\\bname="${name}"[^>]*>)([\\s\\S]*?)(<\\/textarea>)`, 'i');
    return html.replace(textareaRe, `$1${escapeHtml(value)}$3`);
}

function hydrateFieldValues(html, data) {
    let out = html;
    const fieldNames = [...EDITABLE_FIELDS, 'roomGalleryText'];

    fieldNames.forEach((name) => {
        out = setFieldValue(out, name, data[name] ?? '');
    });

    return out;
}

function renderFormPartial(listingId, data, flash = {}) {
    const id = normalizeListingId(listingId);
    const template = renderPartial('host_settings/form', {
        listingId: id,
        statusMsg: flash.status || '',
        errorMsg: flash.error || '',
        statusMsgHidden: flash.status ? '' : 'hidden',
        errorMsgHidden: flash.error ? '' : 'hidden'
    });

    return hydrateFieldValues(template, {
        ...data,
        roomGalleryText: galleryToText(data.roomGallery)
    });
}

function renderTurboFrame(listingId, data, flash = {}) {
    const inner = renderFormPartial(listingId, data, flash);
    return `<turbo-frame id="${FRAME_ID}">\n${inner}\n</turbo-frame>`;
}

function renderLoadingFrame() {
    const inner = fs.readFileSync(LOADING_PARTIAL, 'utf8');
    return `<turbo-frame id="${FRAME_ID}">\n${inner}\n</turbo-frame>`;
}

function parseFormPayload(body) {
    const data = pickEditable(body || {});

    const gallery = parseGalleryText(body?.roomGalleryText);
    if (gallery.length) {
        data.roomGallery = gallery;
        data.roomImg = gallery[0];
    }

    if (data.desc2Zh) {
        data.targetTitleZh = data.recTitle2Zh;
        data.targetTitleEn = data.recTitle2En;
        data.descZh = data.desc2Zh;
        data.descEn = data.desc2En;
        data.explorerDistZh = data.recExplorerDist2Zh || data.recDist2Zh;
        data.explorerDistEn = data.recExplorerDist2En || data.recDist2En;
    }

    return data;
}

async function handleFormGet(req, res) {
    const listingId = normalizeListingId(req.params.listingId);
    if (!listingId) {
        res.status(400).type('text/html').send(renderTurboFrame('', {}, { error: '請輸入房源代碼' }));
        return;
    }

    const data = await getMergedListingData(listingId);
    res.status(200).type('text/html; charset=utf-8').send(renderTurboFrame(listingId, data));
}

async function handleFormPost(req, res) {
    const listingId = normalizeListingId(req.params.listingId);
    const method = String(req.body?._method || 'patch').toLowerCase();

    if (!listingId) {
        res.status(400).type('text/html').send(renderTurboFrame('', {}, { error: '請輸入房源代碼' }));
        return;
    }

    try {
        if (method === 'delete') {
            if (isDatabaseConfigured()) {
                await deleteListingSettings(listingId);
            }
            const data = await loadPresetDefaults(listingId);
            res.status(200).type('text/html; charset=utf-8').send(
                renderTurboFrame(listingId, data, { status: `已清除 ${listingId} 的自訂設定，恢復預設內容` })
            );
            return;
        }

        const payload = parseFormPayload(req.body);

        if (isDatabaseConfigured()) {
            const saved = await saveListingSettings(listingId, payload);
            res.status(200).type('text/html; charset=utf-8').send(
                renderTurboFrame(listingId, saved.data, { status: '已儲存' })
            );
            return;
        }

        res.status(200).type('text/html; charset=utf-8').send(
            renderTurboFrame(listingId, payload, {
                status: '已儲存',
                error: '資料庫未設定，請在瀏覽器端使用 localStorage 備援'
            })
        );
    } catch (error) {
        console.error('[host-settings-form]', error);
        const data = await getMergedListingData(listingId);
        res.status(422).type('text/html; charset=utf-8').send(
            renderTurboFrame(listingId, data, { error: error?.message || '儲存失敗' })
        );
    }
}

module.exports = {
    FRAME_ID,
    EDITABLE_FIELDS,
    renderTurboFrame,
    renderLoadingFrame,
    handleFormGet,
    handleFormPost,
    getMergedListingData,
    parseFormPayload,
    galleryToText
};
