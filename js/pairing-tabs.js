/**
 * Pairing tabs —「連接房源」/「快速開始」切換容器。
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-pairing-tabs]';
    const DEFAULT_TAB = 'link';
    const TAB_STORAGE_KEY = 'hp-pairing-tab';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function shellTemplate(activeTab = DEFAULT_TAB) {
        const linkActive = activeTab === 'link';
        const quickActive = activeTab === 'quick';

        return `<div class="hp-pairing-tabs space-y-4">
    <div class="hp-pairing-tabs__bar flex p-1 bg-hp-lightDark border border-[#3E3430] rounded-2xl gap-1" role="tablist" aria-label="Pairing mode">
        <button type="button" role="tab" id="hp-pairing-tab-link"
                data-pairing-target="pairingTabBtn" data-pairing-tab="link"
                data-action="click->pairing#showPairingTab" data-pairing-tab-param="link"
                aria-selected="${linkActive ? 'true' : 'false'}" aria-controls="hp-pairing-panel-link"
                class="hp-pairing-tabs__tab flex flex-1 items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${linkActive ? 'hp-pairing-tabs__tab--active bg-hp-coral text-white shadow-md' : 'text-hp-muted hover:text-white'}">
            <i class="fa-solid fa-link text-[10px] shrink-0" aria-hidden="true"></i>
            <span data-global-lang="zh">連接房源</span>
            <span data-global-lang="en" class="hidden">Link Listing</span>
        </button>
        <button type="button" role="tab" id="hp-pairing-tab-quick"
                data-pairing-target="pairingTabBtn" data-pairing-tab="quick"
                data-action="click->pairing#showPairingTab" data-pairing-tab-param="quick"
                aria-selected="${quickActive ? 'true' : 'false'}" aria-controls="hp-pairing-panel-quick"
                class="hp-pairing-tabs__tab flex flex-1 items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${quickActive ? 'hp-pairing-tabs__tab--active bg-hp-coral text-white shadow-md' : 'text-hp-muted hover:text-white'}">
            <i class="fa-solid fa-bolt text-[10px] shrink-0" aria-hidden="true"></i>
            <span data-global-lang="zh">快速開始</span>
            <span data-global-lang="en" class="hidden">Quick Start</span>
        </button>
    </div>
    <div class="hp-pairing-tabs__panels relative">
    <div role="tabpanel" id="hp-pairing-panel-link"
         data-pairing-target="pairingTabPanel" data-pairing-tab="link"
         aria-labelledby="hp-pairing-tab-link"
         class="hp-pairing-tabs__panel ${linkActive ? '' : 'hidden'}" ${linkActive ? '' : 'hidden'}>
        <div data-hp-pairing-link-card></div>
    </div>
    <div role="tabpanel" id="hp-pairing-panel-quick"
         data-pairing-target="pairingTabPanel" data-pairing-tab="quick"
         aria-labelledby="hp-pairing-tab-quick"
         class="hp-pairing-tabs__panel ${quickActive ? '' : 'hidden'}" ${quickActive ? '' : 'hidden'}>
        <div data-hp-pairing-quick-start></div>
    </div>
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

    function syncPanelsMinHeight(root) {
        const wrap = root.querySelector('.hp-pairing-tabs__panels');
        if (!wrap) return;

        const panels = root.querySelectorAll('.hp-pairing-tabs__panel');
        let maxHeight = 0;

        panels.forEach((panel) => {
            const wasHidden = panel.hasAttribute('hidden');
            panel.removeAttribute('hidden');
            panel.classList.remove('hidden');
            maxHeight = Math.max(maxHeight, panel.offsetHeight);
            if (wasHidden) {
                panel.setAttribute('hidden', '');
                panel.classList.add('hidden');
            }
        });

        if (maxHeight > 0) {
            wrap.style.minHeight = `${maxHeight}px`;
        }
    }

    function mountChildComponents(root, options = {}) {
        const linkMount = root.querySelector('[data-hp-pairing-link-card]');
        const quickMount = root.querySelector('[data-hp-pairing-quick-start]');

        if (linkMount && global.HostPocketPairingLinkCard?.mount) {
            global.HostPocketPairingLinkCard.mount(linkMount, options.linkCard || {});
        }
        if (quickMount && global.HostPocketPairingQuickStart?.mount) {
            global.HostPocketPairingQuickStart.mount(quickMount, {
                hideHeading: true,
                ...(options.quickStart || {})
            });
        }
    }

    function getSavedTab() {
        try {
            const tab = sessionStorage.getItem(TAB_STORAGE_KEY);
            return tab === 'quick' ? 'quick' : DEFAULT_TAB;
        } catch (_) {
            return DEFAULT_TAB;
        }
    }

    function saveTab(tab) {
        try {
            sessionStorage.setItem(TAB_STORAGE_KEY, tab === 'quick' ? 'quick' : DEFAULT_TAB);
        } catch (_) { /* ignore */ }
    }

    function isMounted(target) {
        const el = resolveMountEl(target);
        return Boolean(el?.querySelector('.hp-pairing-tabs'));
    }

    function readPairingInputValue() {
        return global.document?.querySelector('[data-pairing-target="input"]')?.value?.trim() || '';
    }

    function refreshPairingController() {
        const app = global.__hpStimulusApp;
        const pairingEl = global.document?.querySelector('[data-controller~="pairing"]');
        if (!app || !pairingEl) return;

        const ctrl = app.getControllerForElementAndIdentifier(pairingEl, 'pairing');
        if (!ctrl) return;

        ctrl.disconnect();
        ctrl.connect();
    }

    function mount(target, options = {}) {
        const el = resolveMountEl(target);
        if (!el) return null;

        const activeTab = options.activeTab || getSavedTab();
        el.innerHTML = shellTemplate(activeTab);
        const root = el.querySelector('.hp-pairing-tabs') || el.firstElementChild;
        if (root) {
            mountChildComponents(root, options);
            syncPanelsMinHeight(root);
        }
        return root;
    }

    /** Remount tabs when mount point is empty (e.g. bfcache). Returns true if DOM was rebuilt. */
    function ensureMounted(options = {}) {
        const el = resolveMountEl(options.target);
        if (!el) return false;

        if (isMounted(el)) return false;

        const savedInput = readPairingInputValue();
        mount(el, { activeTab: options.activeTab || getSavedTab(), ...options });
        if (savedInput) {
            const input = global.document?.querySelector('[data-pairing-target="input"]');
            if (input) input.value = savedInput;
        }
        return true;
    }

    function restoreAfterBackNavigation(options = {}) {
        const mountEl = resolveMountEl();
        if (!mountEl) return;

        const savedInput = readPairingInputValue();
        const activeTab = getSavedTab();
        const needsRemount = options.forceRemount || !isMounted(mountEl);

        if (needsRemount) {
            mount(mountEl, { activeTab });
            if (savedInput) {
                const input = global.document?.querySelector('[data-pairing-target="input"]');
                if (input) input.value = savedInput;
            }
        }

        refreshPairingController();

        const app = global.__hpStimulusApp;
        const pairingEl = global.document?.querySelector('[data-controller~="pairing"]');
        const ctrl = app && pairingEl && app.getControllerForElementAndIdentifier(pairingEl, 'pairing');
        ctrl?.showPairingTab?.({ params: { tab: activeTab } });

        const root = mountEl.querySelector('.hp-pairing-tabs');
        if (root) syncPanelsMinHeight(root);
    }

    function onPageShow(event) {
        if (!resolveMountEl()) return;

        const mountMissing = !isMounted();
        if (event.persisted || mountMissing) {
            restoreAfterBackNavigation({ forceRemount: event.persisted });
        }
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-pairing-tabs-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-pairing-tabs-styles';
        style.textContent = `
            .hp-pairing-tabs__tab:focus-visible {
                outline: 2px solid rgba(255, 91, 62, 0.55);
                outline-offset: 2px;
            }
            .hp-pairing-tabs__tab--active {
                background-color: #FF5B3E;
                color: #fff;
            }
            .hp-pairing-tabs__panels {
                width: 100%;
            }
        `;
        doc.head.appendChild(style);
    }

    injectStyles();

    if (global.addEventListener) {
        global.addEventListener('pageshow', onPageShow);
    }

    global.HostPocketPairingTabs = {
        MOUNT_SELECTOR,
        DEFAULT_TAB,
        TAB_STORAGE_KEY,
        shellTemplate,
        mount,
        isMounted,
        getSavedTab,
        saveTab,
        ensureMounted,
        refreshPairingController,
        restoreAfterBackNavigation
    };
})(window);
