/**
 * v4 Desktop sidebar nav item — reusable button row (icon + bilingual label).
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-v4-sidebar-nav]';
    const CONTACT_MOUNT_SELECTOR = '[data-hp-v4-sidebar-contact]';
    const PRICING_MOUNT_SELECTOR = '[data-hp-v4-sidebar-pricing]';

    /** Host Pocket SaaS plan — keep in sync with pricing panel copy. */
    const PRICING = {
        amount: 40,
        currency: 'NT$',
        intervalZh: '月',
        intervalEn: 'mo',
        get badge() {
            return `${this.currency}${this.amount}`;
        },
        get priceZh() {
            return `${this.currency}${this.amount}/${this.intervalZh}`;
        },
        get priceEn() {
            return `${this.currency}${this.amount}/${this.intervalEn}`;
        }
    };

    const MAIN_NAV_ITEMS = [
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
        }
    ];

    const CONTACT_NAV_ITEM = {
        nav: 'contact',
        icon: 'fa-solid fa-circle-question',
        labelZh: '求助房東',
        labelEn: 'Contact host',
        titleZh: '求助房東',
        titleEn: 'Contact host'
    };

    const PRICING_NAV_ITEM = {
        nav: 'pricing',
        icon: 'fa-solid fa-tags',
        labelZh: '定價方案',
        labelEn: 'Pricing',
        titleZh: `定價方案 · ${PRICING.priceZh}`,
        titleEn: `Pricing · ${PRICING.priceEn}`,
        priceZh: PRICING.priceZh,
        priceEn: PRICING.priceEn,
        badge: PRICING.badge
    };

    /** @deprecated use MAIN_NAV_ITEMS */
    const DEFAULT_ITEMS = [...MAIN_NAV_ITEMS, CONTACT_NAV_ITEM];

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
     * @param {typeof MAIN_NAV_ITEMS[number] | typeof CONTACT_NAV_ITEM | typeof PRICING_NAV_ITEM} item
     * @param {{ active?: boolean }} [options]
     */
    function render(item, options = {}) {
        const active = Boolean(options.active);
        const classes = ['hp-v4-sidebar__item'];
        if (active) classes.push('is-active');
        if (item.nav === 'pricing') classes.push('hp-v4-sidebar__item--pricing');

        const attrs = [
            'type="button"',
            `class="${escapeHtml(classes.join(' '))}"`,
            `data-hp-v4-nav="${escapeHtml(item.nav)}"`,
            `title="${escapeHtml(resolveTitle(item))}"`,
            `aria-current="${active ? 'page' : 'false'}"`
        ].join(' ');

        const priceMeta = item.priceZh
            ? `<span class="hp-v4-sidebar__item-copy">
                    <span class="hp-v4-sidebar__label" data-global-lang="zh">${escapeHtml(item.labelZh)}</span>
                    <span class="hp-v4-sidebar__label hidden" data-global-lang="en">${escapeHtml(item.labelEn)}</span>
                    <span class="hp-v4-sidebar__price" aria-hidden="true">
                        <span data-global-lang="zh">${escapeHtml(item.priceZh)}</span>
                        <span class="hidden" data-global-lang="en">${escapeHtml(item.priceEn || item.priceZh)}</span>
                    </span>
               </span>
               <span class="hp-v4-sidebar__price-badge">${escapeHtml(item.badge || PRICING.badge)}</span>`
            : `<span class="hp-v4-sidebar__label" data-global-lang="zh">${escapeHtml(item.labelZh)}</span>
               <span class="hp-v4-sidebar__label hidden" data-global-lang="en">${escapeHtml(item.labelEn)}</span>`;

        return `<button ${attrs}>
            <span class="hp-v4-sidebar__icon"><i class="${escapeHtml(item.icon)}" aria-hidden="true"></i></span>
            ${priceMeta}
        </button>`;
    }

    /**
     * @param {typeof MAIN_NAV_ITEMS} [items]
     * @param {{ activeNav?: string }} [options]
     */
    function renderAll(items = MAIN_NAV_ITEMS, options = {}) {
        const activeNav = options.activeNav || '';
        return items.map((item) => render(item, { active: item.nav === activeNav })).join('\n');
    }

    /**
     * @param {HTMLElement | null} container
     * @param {{ items?: typeof MAIN_NAV_ITEMS, activeNav?: string }} [options]
     */
    function mount(container, options = {}) {
        if (!container) return;
        const items = options.items || MAIN_NAV_ITEMS;
        container.innerHTML = renderAll(items, options);
    }

    /**
     * @param {HTMLElement | null} container
     * @param {{ activeNav?: string }} [options]
     */
    function mountContact(container, options = {}) {
        if (!container) return;
        const activeNav = options.activeNav || '';
        container.innerHTML = render(CONTACT_NAV_ITEM, { active: CONTACT_NAV_ITEM.nav === activeNav });
    }

    /**
     * @param {HTMLElement | null} container
     * @param {{ activeNav?: string }} [options]
     */
    function mountPricing(container, options = {}) {
        if (!container) return;
        const activeNav = options.activeNav || '';
        container.innerHTML = render(PRICING_NAV_ITEM, { active: PRICING_NAV_ITEM.nav === activeNav });
    }

    function init() {
        global.document.querySelectorAll(MOUNT_SELECTOR).forEach((el) => mount(el));
        global.document.querySelectorAll(PRICING_MOUNT_SELECTOR).forEach((el) => mountPricing(el));
        global.document.querySelectorAll(CONTACT_MOUNT_SELECTOR).forEach((el) => mountContact(el));
    }

    global.HostPocketV4SidebarNavItem = {
        MOUNT_SELECTOR,
        CONTACT_MOUNT_SELECTOR,
        PRICING_MOUNT_SELECTOR,
        MAIN_NAV_ITEMS,
        CONTACT_NAV_ITEM,
        PRICING_NAV_ITEM,
        PRICING,
        DEFAULT_ITEMS,
        render,
        renderAll,
        mount,
        mountContact,
        mountPricing,
        init
    };

    if (global.document?.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})(window);
