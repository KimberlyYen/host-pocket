/**
 * Demo theme picker — HTML partial: partials/components/_demo_theme_picker.html
 * JS mount helper for dynamic pages only.
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-demo-themes]';
    const PARTIAL_NAME = 'components/demo_theme_picker';

    const DEMO_THEMES = [
        { id: 'TAIPEI-CITY', labelZh: '台北', labelEn: 'Taipei' },
        { id: 'UK-LONDON', labelZh: '倫敦', labelEn: 'London' },
        { id: 'VILNIUS-OLDTOWN', labelZh: '維爾紐斯', labelEn: 'Vilnius' },
        { id: 'RIO-COPACABANA', labelZh: '里約', labelEn: 'Rio' }
    ];

    const DEMO_THEME_IDS = DEMO_THEMES.map((theme) => theme.id);

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function readMountOptions(el, overrides = {}) {
        const ds = el?.dataset || {};
        return {
            action: overrides.action || ds.hpDemoThemesAction || 'click->listing-selector#selectDemo',
            hideLabel: overrides.hideLabel === true || ds.hpDemoThemesHideLabel === 'true',
            variant: overrides.variant || ds.hpDemoThemesVariant || 'light',
            themes: overrides.themes || DEMO_THEMES
        };
    }

    function renderButton(theme, options) {
        const id = escapeHtml(theme.id);
        const action = escapeHtml(options.action);
        const btnClass = options.variant === 'dark'
            ? 'hp-demo-themes__btn px-2.5 py-1 rounded-lg border border-[#3E3430] bg-hp-lightDark text-[10px] font-bold text-white hover:border-hp-coral transition-colors active:scale-[0.97]'
            : 'hp-demo-themes__btn px-2.5 py-1 rounded-lg border border-hp-border bg-hp-bgLight text-[10px] font-bold hover:border-hp-coral transition-colors active:scale-[0.97]';

        return `<button type="button" data-demo-id="${id}" data-action="${action}" class="${btnClass}">
            <span data-global-lang="zh">${escapeHtml(theme.labelZh)}</span>
            <span data-global-lang="en" class="hidden">${escapeHtml(theme.labelEn)}</span>
        </button>`;
    }

    function template(options = {}) {
        const themes = options.themes || DEMO_THEMES;
        const buttons = themes.map((theme) => renderButton(theme, options)).join('\n        ');

        const label = options.hideLabel ? '' : `
        <span class="hp-demo-themes__label text-[10px] text-hp-muted w-full">
            <span data-global-lang="zh">示範主題：</span>
            <span data-global-lang="en" class="hidden">Demo themes:</span>
        </span>`;

        return `<div class="hp-demo-themes flex flex-wrap gap-2" role="group" aria-label="Demo themes">${label}
        ${buttons}
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
        return el.querySelector('.hp-demo-themes') || el.firstElementChild;
    }

    async function mountAsync(target, overrides = {}) {
        const el = resolveMountEl(target);
        if (!el) return null;

        if (global.PartialsClient?.renderPartial) {
            try {
                const html = await global.PartialsClient.renderPartial(PARTIAL_NAME);
                el.innerHTML = html.trim();
                return el.querySelector('.hp-demo-themes') || el.firstElementChild;
            } catch (error) {
                console.warn('[HostPocketDemoThemePicker] partial load failed, using inline template', error);
            }
        }

        return mount(el, overrides);
    }

    function mountAll(root = global.document) {
        if (!root?.querySelectorAll) return;
        root.querySelectorAll(MOUNT_SELECTOR).forEach((el) => {
            if (el.querySelector('.hp-demo-themes')) return;
            mount(el);
        });
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-demo-theme-picker-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-demo-theme-picker-styles';
        style.textContent = `
            .hp-demo-themes__btn:focus-visible {
                outline: 2px solid rgba(255, 91, 62, 0.55);
                outline-offset: 2px;
            }
        `;
        doc.head.appendChild(style);
    }

    injectStyles();

    global.HostPocketDemoThemePicker = {
        MOUNT_SELECTOR,
        PARTIAL_NAME,
        DEMO_THEMES,
        DEMO_THEME_IDS,
        template,
        mount,
        mountAsync,
        mountAll
    };
})(window);
