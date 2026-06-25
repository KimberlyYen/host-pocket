/**
 * Reusable content preset picker — region template buttons for host settings.
 */
(function (global) {
    const ROOT_ATTR = 'data-hp-content-preset-picker';
    const BTN_ATTR = 'data-hp-preset-id';

    const DEFAULT_SECTION_LABEL = '內容範本（一鍵帶入，與上方示範主題不同）：';
    const BTN_CLASS = 'hp-preset-btn px-2.5 py-1 rounded-lg border border-hp-coral/30 bg-hp-coral/5 text-[10px] font-bold text-hp-coral hover:bg-hp-coral/10 transition disabled:opacity-50 aria-pressed:bg-hp-coral/15 aria-pressed:border-hp-coral/50';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function getPresetIds(options = {}) {
        return options.ids || global.HostSettingsPresets?.PRESET_IDS || [];
    }

    function getButtonLabel(id, options = {}) {
        const map = options.buttonLabels || global.HostSettingsPresets?.PRESET_BUTTON_LABELS || {};
        return map[id] || id;
    }

    function render(options = {}) {
        const ids = getPresetIds(options);
        const sectionLabel = options.sectionLabel ?? DEFAULT_SECTION_LABEL;
        const selectedId = options.selectedId ? String(options.selectedId).trim().toUpperCase() : '';
        const rootClass = options.rootClass || 'flex flex-wrap gap-2 mt-3 pt-3 border-t border-hp-border/70';
        const labelClass = options.labelClass || 'text-[10px] text-hp-muted w-full';

        const buttons = ids.map((id) => {
            const pressed = selectedId === id;
            return `<button type="button" ${BTN_ATTR}="${escapeHtml(id)}" class="${BTN_CLASS}" aria-pressed="${pressed ? 'true' : 'false'}">${escapeHtml(getButtonLabel(id, options))}</button>`;
        }).join('');

        return `<div ${ROOT_ATTR} class="${escapeHtml(rootClass)}">
            <span class="${escapeHtml(labelClass)}">${escapeHtml(sectionLabel)}</span>
            ${buttons}
        </div>`;
    }

    function setSelected(root, listingId) {
        if (!root) return;
        const id = String(listingId || '').trim().toUpperCase();
        root.querySelectorAll(`[${BTN_ATTR}]`).forEach((btn) => {
            const active = btn.getAttribute(BTN_ATTR) === id;
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    async function importPreset(listingId) {
        if (!global.HostSettingsPresets?.fetchPreset) {
            throw new Error('範本模組未載入');
        }
        return global.HostSettingsPresets.fetchPreset(listingId);
    }

    function bind(root, hooks = {}) {
        if (!root || root.dataset.hpPresetBound === 'true') return root;
        root.dataset.hpPresetBound = 'true';

        root.addEventListener('click', async (event) => {
            const btn = event.target.closest(`[${BTN_ATTR}]`);
            if (!btn || btn.disabled) return;

            const id = btn.getAttribute(BTN_ATTR);
            if (!id) return;

            const previous = root.querySelector(`[${BTN_ATTR}][aria-pressed="true"]`);
            root.querySelectorAll(`[${BTN_ATTR}]`).forEach((el) => el.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            btn.disabled = true;

            try {
                const preset = await importPreset(id);
                await hooks.onImport?.(preset, { root, button: btn });
                root.dispatchEvent(new CustomEvent('hp:content-preset-imported', {
                    bubbles: true,
                    detail: { preset, listingId: id }
                }));
            } catch (error) {
                if (previous) previous.setAttribute('aria-pressed', 'true');
                else btn.setAttribute('aria-pressed', 'false');
                hooks.onError?.(error, { root, button: btn, listingId: id });
                root.dispatchEvent(new CustomEvent('hp:content-preset-error', {
                    bubbles: true,
                    detail: { error, listingId: id }
                }));
            } finally {
                btn.disabled = false;
            }
        });

        return root;
    }

    function mount(target, hooks = {}) {
        const container = typeof target === 'string'
            ? global.document.querySelector(target)
            : target;
        if (!container) return null;

        container.innerHTML = render(hooks.renderOptions || {});
        const root = container.querySelector(`[${ROOT_ATTR}]`) || container;
        return bind(root, hooks);
    }

    function init() {
        if (global.__hpContentPresetPickerBound) return;
        global.__hpContentPresetPickerBound = true;
    }

    global.HostContentPresetPicker = {
        ROOT_ATTR,
        BTN_ATTR,
        DEFAULT_SECTION_LABEL,
        render,
        mount,
        bind,
        importPreset,
        setSelected
    };

    if (global.document?.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})(window);
