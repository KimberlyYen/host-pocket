/**
 * Listing ID field — HTML partial: partials/components/_listing_id_field.html
 * JS mount helper for dynamic pages only (pairing / client render).
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-listing-id-field]';
    const PARTIAL_NAME = 'components/listing_id_field';
    const DEFAULT_CONTROLLER = 'listing-selector';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function targetAttr(controller, name) {
        return `data-${escapeHtml(controller)}-target="${escapeHtml(name)}"`;
    }

    function readMountOptions(el, overrides = {}) {
        const ds = el?.dataset || {};
        const controller = overrides.controller || ds.hpListingIdFieldController || DEFAULT_CONTROLLER;
        return {
            inputId: overrides.inputId || ds.hpListingIdFieldInputId || 'listingIdInput',
            controller,
            loadAction: overrides.loadAction || ds.hpListingIdFieldLoadAction || `click->${controller}#load`,
            enterAction: overrides.enterAction || ds.hpListingIdFieldEnterAction || `keydown.enter->${controller}#load`,
            placeholderZh: overrides.placeholderZh || ds.hpListingIdFieldPlaceholderZh
                || 'TAIPEI-CITY 或 Airbnb rooms/ 後的數字',
            placeholderEn: overrides.placeholderEn || ds.hpListingIdFieldPlaceholderEn
                || 'TAIPEI-CITY or numbers after rooms/ in URL',
            value: overrides.value ?? ds.hpListingIdFieldValue ?? '',
            hideLabel: overrides.hideLabel === true || ds.hpListingIdFieldHideLabel === 'true'
        };
    }

    function template(options = {}) {
        const inputId = escapeHtml(options.inputId);
        const controller = options.controller || DEFAULT_CONTROLLER;
        const inputTarget = targetAttr(controller, 'input');
        const loadAction = escapeHtml(options.loadAction);
        const enterAction = escapeHtml(options.enterAction);
        const value = escapeHtml(options.value);

        const label = options.hideLabel ? '' : `
    <label for="${inputId}" class="hp-listing-id-field__label block text-[10px] font-bold uppercase tracking-wider text-hp-muted mb-1.5">
        <span data-global-lang="zh">房源代碼 / Listing ID</span>
        <span data-global-lang="en" class="hidden">Listing ID</span>
    </label>`;

        return `<div class="hp-listing-id-field">${label}
    <div class="hp-listing-id-field__row flex flex-wrap gap-2">
        <input id="${inputId}" type="text"
               ${inputTarget}
               data-action="${enterAction}"
               placeholder="${escapeHtml(options.placeholderZh)}"
               data-placeholder-en="${escapeHtml(options.placeholderEn)}"
               value="${value}"
               class="hp-listing-id-field__input flex-1 min-w-[200px] px-3 py-2.5 rounded-xl border border-hp-border font-mono uppercase focus:outline-none focus:border-hp-coral">
        <button type="button" data-action="${loadAction}"
                class="hp-listing-id-field__submit px-4 py-2.5 rounded-xl bg-hp-dark text-white text-xs font-bold hover:bg-hp-dark/90 transition active:scale-[0.97]">
            <span data-global-lang="zh">載入</span>
            <span data-global-lang="en" class="hidden">Load</span>
        </button>
    </div>
</div>`;
    }

    function resolveMountEl(target) {
        const doc = global.document;
        if (!doc) return null;
        if (!target) return doc.querySelector(MOUNT_SELECTOR);
        if (typeof target === 'string') return doc.querySelector(target);
        return target;
    }

    function mount(target, overrides = {}) {
        const el = resolveMountEl(target);
        if (!el) return null;

        const options = { ...readMountOptions(el, overrides) };
        el.innerHTML = template(options);
        return el.querySelector('.hp-listing-id-field') || el.firstElementChild;
    }

    async function mountAsync(target, overrides = {}) {
        const el = resolveMountEl(target);
        if (!el) return null;

        if (global.PartialsClient?.renderPartial) {
            try {
                const html = await global.PartialsClient.renderPartial(PARTIAL_NAME);
                el.innerHTML = html.trim();
                return el.querySelector('.hp-listing-id-field') || el.firstElementChild;
            } catch (error) {
                console.warn('[HostPocketListingIdField] partial load failed, using inline template', error);
            }
        }

        return mount(el, overrides);
    }

    function mountAll(root = global.document) {
        if (!root?.querySelectorAll) return;
        root.querySelectorAll(MOUNT_SELECTOR).forEach((el) => {
            if (el.querySelector('.hp-listing-id-field')) return;
            mount(el);
        });
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-listing-id-field-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-listing-id-field-styles';
        style.textContent = `
            .hp-listing-id-field__input:focus-visible {
                outline: none;
            }
            .hp-listing-id-field__submit:focus-visible {
                outline: 2px solid rgba(255, 91, 62, 0.55);
                outline-offset: 2px;
            }
        `;
        doc.head.appendChild(style);
    }

    injectStyles();

    global.HostPocketListingIdField = {
        MOUNT_SELECTOR,
        PARTIAL_NAME,
        DEFAULT_CONTROLLER,
        template,
        mount,
        mountAsync,
        mountAll
    };
})(window);
