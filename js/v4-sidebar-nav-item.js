/**
 * v4 Desktop sidebar nav item — reusable button row (icon + bilingual label).
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-v4-sidebar-nav]';

    const DEFAULT_ITEMS = [
        {
            nav: 'home',
            icon: 'fa-solid fa-house',
            labelZh: '回到首頁',
            labelEn: 'Home',
            titleZh: '回到首頁',
            titleEn: 'Home'
        },
        {
            nav: 'dashboard',
            icon: 'fa-solid fa-compass',
            labelZh: '指南主頁',
            labelEn: 'Stay guide',
            titleZh: '指南主頁',
            titleEn: 'Stay guide'
        },
        {
            nav: 'contact',
            icon: 'fa-solid fa-circle-question',
            labelZh: '求助房東',
            labelEn: 'Contact host',
            titleZh: '求助房東',
            titleEn: 'Contact host'
        }
    ];

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function resolveTitle(item) {
        return (global.currentLanguage || 'zh') === 'en' ? item.titleEn : item.titleZh;
    }

    /**
     * @param {typeof DEFAULT_ITEMS[number]} item
     * @param {{ active?: boolean }} [options]
     */
    function render(item, options = {}) {
        const active = Boolean(options.active);
        const classes = ['hp-v4-sidebar__item'];
        if (active) classes.push('is-active');

        const attrs = [
            'type="button"',
            `class="${escapeHtml(classes.join(' '))}"`,
            `data-hp-v4-nav="${escapeHtml(item.nav)}"`,
            `title="${escapeHtml(resolveTitle(item))}"`,
            `aria-current="${active ? 'page' : 'false'}"`
        ].join(' ');

        return `<button ${attrs}>
            <span class="hp-v4-sidebar__icon"><i class="${escapeHtml(item.icon)}" aria-hidden="true"></i></span>
            <span class="hp-v4-sidebar__label" data-global-lang="zh">${escapeHtml(item.labelZh)}</span>
            <span class="hp-v4-sidebar__label hidden" data-global-lang="en">${escapeHtml(item.labelEn)}</span>
        </button>`;
    }

    /**
     * @param {typeof DEFAULT_ITEMS} [items]
     * @param {{ activeNav?: string }} [options]
     */
    function renderAll(items = DEFAULT_ITEMS, options = {}) {
        const activeNav = options.activeNav || '';
        return items.map((item) => render(item, { active: item.nav === activeNav })).join('\n');
    }

    /**
     * @param {HTMLElement | null} container
     * @param {{ items?: typeof DEFAULT_ITEMS, activeNav?: string }} [options]
     */
    function mount(container, options = {}) {
        if (!container) return;
        const items = options.items || DEFAULT_ITEMS;
        container.innerHTML = renderAll(items, options);
    }

    function init() {
        global.document.querySelectorAll(MOUNT_SELECTOR).forEach((el) => mount(el));
    }

    global.HostPocketV4SidebarNavItem = {
        MOUNT_SELECTOR,
        DEFAULT_ITEMS,
        render,
        renderAll,
        mount,
        init
    };

    if (global.document?.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})(window);
