/**
 * host-pocket v4 — Desktop shell (≥1024px)
 * Sidebar navigation delegates to the same Stimulus actions as mobile.
 */
(function () {
    const DESKTOP_MQ = window.matchMedia('(min-width: 1024px)');
    const SIDEBAR_SEL = '#hp-v4-sidebar';

    function isDesktop() {
        return DESKTOP_MQ.matches;
    }

    function getGlobalController() {
        const app = window.__hpStimulusApp;
        const body = document.body;
        if (!app || !body) return null;
        return app.getControllerForElementAndIdentifier(body, 'global');
    }

    function getDashboardController() {
        const app = window.__hpStimulusApp;
        const el = document.querySelector('[data-controller="dashboard"]');
        if (!app || !el) return null;
        return app.getControllerForElementAndIdentifier(el, 'dashboard');
    }

    function getActiveScreen() {
        const active = document.querySelector('.app-screen.is-active');
        return active?.dataset?.screen || 'pairing';
    }

    function syncDesktopClass() {
        document.documentElement.classList.toggle('hp-v4-desktop', isDesktop());
    }

    function resolveSidebarActiveNav(screen, navOverride) {
        if (navOverride) return navOverride;
        // Pairing entry screen is the app home — highlight home, not link.
        if (screen === 'pairing') return 'home';
        return screen;
    }

    function syncSidebarActive(screen, navOverride) {
        const sidebar = document.querySelector(SIDEBAR_SEL);
        if (!sidebar || !isDesktop()) return;

        const activeNav = resolveSidebarActiveNav(screen, navOverride);

        sidebar.querySelectorAll('[data-hp-v4-nav]').forEach((btn) => {
            const nav = btn.dataset.hpV4Nav;
            const isActive = nav === activeNav;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
    }

    function syncSidebarLang() {
        const sidebar = document.querySelector(SIDEBAR_SEL);
        if (!sidebar) return;
        const lang = window.currentLanguage || 'zh';
        sidebar.querySelectorAll('[data-hp-v4-lang]').forEach((btn) => {
            const active = btn.dataset.hpV4Lang === lang;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function syncGuestChrome() {
        const isGuest = document.documentElement.classList.contains('hp-boot-dashboard');
        document.documentElement.classList.toggle('hp-v4-guest', isGuest && isDesktop());
        relocateShareButton();
    }

    let shareButtonHome = null;

    function isBackBtnHidden() {
        const backBtn = document.querySelector('[data-dashboard-target="backBtn"]');
        if (!backBtn) return true;
        return backBtn.hidden || backBtn.classList.contains('hidden');
    }

    function syncHeaderBarDesktop() {
        const headerBar = document.querySelector('[data-dashboard-target="headerBar"]');
        if (!headerBar) return;

        if (!isDesktop()) {
            headerBar.classList.remove('hp-v4-header-hidden');
            return;
        }

        const shareInHeader = headerBar.contains(document.querySelector('[data-dashboard-target="shareLink"]'));
        headerBar.classList.toggle('hp-v4-header-hidden', isBackBtnHidden() && !shareInHeader);
    }

    function relocateShareButton() {
        const share = document.querySelector('[data-dashboard-target="shareLink"]');
        const headerBar = document.querySelector('[data-dashboard-target="headerBar"]');
        const slot = document.querySelector('[data-hp-v4-share-slot]');
        if (!share || !headerBar || !slot) return;

        if (!shareButtonHome) {
            shareButtonHome = { parent: headerBar, next: share.nextElementSibling };
        }

        if (isDesktop()) {
            slot.setAttribute('aria-hidden', 'false');
            if (share.parentElement !== slot) {
                slot.appendChild(share);
            }
        } else {
            slot.setAttribute('aria-hidden', 'true');
            if (share.parentElement !== headerBar) {
                if (shareButtonHome.next) {
                    headerBar.insertBefore(share, shareButtonHome.next);
                } else {
                    headerBar.appendChild(share);
                }
            }
        }

        syncHeaderBarDesktop();
    }

    function observeSharePlacement() {
        const headerBar = document.querySelector('[data-dashboard-target="headerBar"]');
        const backBtn = document.querySelector('[data-dashboard-target="backBtn"]');
        if (!headerBar) return;

        const observer = new MutationObserver(() => {
            relocateShareButton();
        });

        if (backBtn) {
            observer.observe(backBtn, { attributes: true, attributeFilter: ['class', 'hidden'] });
        }
        observer.observe(headerBar, { childList: true });
    }

    let dashboardColumnObserver = null;

    function syncDashboardColumnHeights() {
        const left = document.querySelector('.hp-v4-dashboard-left');
        const localRecs = document.querySelector('#localRecs');
        if (!left) return;

        if (!isDesktop()) {
            left.style.removeProperty('min-height');
            return;
        }

        if (!localRecs) return;
        left.style.minHeight = `${localRecs.offsetHeight}px`;
    }

    function observeDashboardColumnHeights() {
        const localRecs = document.querySelector('#localRecs');
        if (!localRecs || dashboardColumnObserver) return;

        dashboardColumnObserver = new ResizeObserver(() => {
            syncDashboardColumnHeights();
        });
        dashboardColumnObserver.observe(localRecs);

        if (document.fonts?.ready) {
            document.fonts.ready.then(() => syncDashboardColumnHeights());
        }
    }

    function isSidebarCollapsed() {
        return document.querySelector(SIDEBAR_SEL)?.classList.contains('hp-v4-sidebar--collapsed') ?? true;
    }

    function toggleSidebar() {
        setSidebarCollapsed(!isSidebarCollapsed());
    }

    function setSidebarCollapsed(collapsed) {
        const layout = document.getElementById('hp-v4-layout');
        const sidebar = document.querySelector(SIDEBAR_SEL);
        const toggle = document.getElementById('hp-v4-sidebar-toggle');
        const brandToggle = document.getElementById('hp-v4-sidebar-brand-toggle');
        if (!layout || !sidebar) return;

        layout.classList.toggle('hp-v4-sidebar-collapsed', collapsed);
        sidebar.classList.toggle('hp-v4-sidebar--collapsed', collapsed);

        const isZh = (window.currentLanguage || 'zh') === 'zh';
        const expandLabel = isZh ? '展開側邊欄' : 'Expand sidebar';
        const collapseLabel = isZh ? '收合側邊欄' : 'Collapse sidebar';
        const label = collapsed ? expandLabel : collapseLabel;

        if (toggle) {
            toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            toggle.setAttribute('aria-label', label);
        }

        if (brandToggle) {
            brandToggle.setAttribute('aria-label', label);
        }
    }

    function initSidebarCollapse() {
        setSidebarCollapsed(true);

        document.getElementById('hp-v4-sidebar-brand-toggle')?.addEventListener('click', (event) => {
            event.preventDefault();
            if (!isDesktop()) return;
            toggleSidebar();
        });
    }

    /** Mirror mobile: dashboard#goBackToPairing → global#navigateToPairing */
    function navigatePairing() {
        const dash = getDashboardController();
        if (dash?.goBackToPairing) {
            dash.goBackToPairing();
            return;
        }
        getGlobalController()?.navigateToPairing?.('switch');
    }

    /** Mirror mobile: bottomNav goHome / activateGuideHome / explorer→dashboard */
    function navigateDashboard() {
        const dash = getDashboardController();
        const global = getGlobalController();
        const screen = getActiveScreen();

        if (dash?.isExperienceDetailOpen?.()) {
            if (window.HostPocketGuestRouter?.isDetailHistoryActive?.()) {
                dash.closeExperienceDetail();
                return;
            }
            dash.finishCloseExperienceDetail({ skipHistory: true });
        }

        dash?.closeHelpOverlay?.();
        dash?.closeLockGuide?.();
        dash?.closeRoomOverlay?.();

        if (screen === 'dashboard') {
            const homeBtn = document.querySelector('[data-dashboard-target="bottomNavBtn"]');
            dash?.goHome({ currentTarget: homeBtn || dash.element });
            syncSidebarActive('dashboard');
            return;
        }

        const listingId = dash?.currentListingId || dash?.parseListingIdFromLocation?.();
        if (listingId && dash?.activateGuideHome) {
            dash.activateGuideHome(listingId);
            dash.pushGuideBrowserUrl?.();
            syncSidebarActive('dashboard');
            return;
        }

        global?.navigateToDashboard?.();
        syncSidebarActive('dashboard');
    }

    /** Mirror mobile: dashboard#contactHost via bottom nav button */
    function navigateContact() {
        const dash = getDashboardController();

        if (getActiveScreen() !== 'dashboard') {
            const listingId = dash?.currentListingId || dash?.parseListingIdFromLocation?.();
            if (listingId && dash?.activateGuideHome) {
                dash.activateGuideHome(listingId);
                dash.pushGuideBrowserUrl?.();
            } else {
                window.appNavigate?.('dashboard');
            }
        }

        requestAnimationFrame(() => {
            const contactBtn = document.querySelector('[data-dashboard-target="contactHostNav"]');
            if (contactBtn && !contactBtn.hidden) {
                contactBtn.click();
            } else {
                dash?.contactHost?.();
            }
            syncSidebarActive('dashboard', 'contact');
        });
    }

    function resolveIndexHtmlUrl() {
        try {
            const url = new URL(window.location.href);
            const dir = url.pathname.endsWith('/')
                ? url.pathname
                : url.pathname.replace(/[^/]+$/, '');
            url.pathname = `${dir}index.html`.replace(/\/{2,}/g, '/');
            url.search = '';
            url.hash = '';
            return url.href;
        } catch {
            return 'index.html';
        }
    }

    /** Always return to pairing entry (clean index.html, no deep-link params). */
    function navigateHome() {
        const dash = getDashboardController();

        if (dash?.isExperienceDetailOpen?.()) {
            dash.finishCloseExperienceDetail?.({ skipHistory: true });
        }
        dash?.closeHelpOverlay?.();
        dash?.closeLockGuide?.();
        dash?.closeRoomOverlay?.();

        window.location.assign(resolveIndexHtmlUrl());
    }

    function navigate(nav) {
        if (nav === 'home') {
            navigateHome();
            return;
        }
        if (nav === 'pairing') {
            navigatePairing();
            return;
        }
        if (nav === 'dashboard') {
            navigateDashboard();
            return;
        }
        if (nav === 'contact') {
            navigateContact();
        }
    }

    function bindSidebar() {
        const sidebar = document.querySelector(SIDEBAR_SEL);
        if (!sidebar || sidebar.dataset.hpV4Bound === 'true') return;
        sidebar.dataset.hpV4Bound = 'true';

        sidebar.addEventListener('click', (event) => {
            if (!isDesktop()) return;

            const navBtn = event.target.closest('[data-hp-v4-nav]');
            if (navBtn) {
                event.preventDefault();
                navigate(navBtn.dataset.hpV4Nav);
                return;
            }

            const langBtn = event.target.closest('[data-hp-v4-lang]');
            if (langBtn) {
                event.preventDefault();
                getGlobalController()?.setLanguage?.(langBtn.dataset.hpV4Lang, { silent: true });
            }
        });
    }

    function hookAppNavigate() {
        const original = window.appNavigate;
        if (typeof original !== 'function' || original.__hpV4Wrapped) return;

        function wrapped(name) {
            original(name);
            syncSidebarActive(name);
        }
        wrapped.__hpV4Wrapped = true;
        window.appNavigate = wrapped;
    }

    function observeGuestBoot() {
        const observer = new MutationObserver(() => {
            syncGuestChrome();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    function init() {
        syncDesktopClass();
        bindSidebar();
        initSidebarCollapse();
        hookAppNavigate();
        observeGuestBoot();
        observeSharePlacement();
        observeDashboardColumnHeights();
        syncGuestChrome();
        syncDashboardColumnHeights();
        syncSidebarActive(getActiveScreen());
        syncSidebarLang();

        window.addEventListener('hp:v4-screen', (event) => {
            syncSidebarActive(event.detail?.screen || getActiveScreen());
        });

        window.addEventListener('hp:v4-lang', syncSidebarLang);

        window.addEventListener('hp:v4-experience-detail', (event) => {
            if (!isDesktop()) return;
            const open = Boolean(event.detail?.open);
            const sidebar = document.querySelector(SIDEBAR_SEL);
            if (!sidebar) return;
            sidebar.querySelectorAll('[data-hp-v4-nav="dashboard"], [data-hp-v4-nav="contact"]').forEach((btn) => {
                btn.hidden = false;
                btn.style.removeProperty('display');
            });
            if (open) syncSidebarActive('dashboard');
        });

        window.addEventListener('popstate', () => {
            requestAnimationFrame(() => syncSidebarActive(getActiveScreen()));
        });

        window.addEventListener('load', () => {
            hookAppNavigate();
            syncSidebarActive(getActiveScreen());
            syncDashboardColumnHeights();
        });
    }

    DESKTOP_MQ.addEventListener('change', () => {
        syncDesktopClass();
        relocateShareButton();
        syncGuestChrome();
        syncDashboardColumnHeights();
        syncSidebarActive(getActiveScreen());
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
