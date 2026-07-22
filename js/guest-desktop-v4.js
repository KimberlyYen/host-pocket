/**
 * host-pocket v4 — Desktop shell (≥768px)
 * Sidebar navigation delegates to the same Stimulus actions as mobile.
 */
(function () {
    const DESKTOP_MIN_WIDTH = 768;
    const DESKTOP_MQ = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
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

    function isListingQueryRoute(loc) {
        const locationRef = loc || window.location;
        if (!locationRef) return false;
        const params = new URLSearchParams(locationRef.search || '');
        const listing = (params.get('listing') || params.get('id') || '').trim();
        if (!listing) return false;
        const path = String(locationRef.pathname || '')
            .replace(/\/index\.html$/i, '/')
            .replace(/\/+$/, '') || '/';
        return path === '/';
    }

    function syncListingQueryNav() {
        document.documentElement.classList.toggle('hp-listing-query-route', isListingQueryRoute());
    }

    function syncDesktopClass() {
        document.documentElement.classList.toggle('hp-v4-desktop', isDesktop());
    }

    function resolveSidebarActiveNav(screen, navOverride) {
        if (navOverride) return navOverride;
        // Pairing entry screen is the app home — highlight home, not link.
        if (screen === 'pairing') return 'home';
        // ?listing= on / — dashboard nav hidden; highlight home instead.
        if (screen === 'dashboard' && isListingQueryRoute()) return 'home';
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
        relocateMobileHomeLogo();
    }

    let shareButtonHome = null;
    let mobileHomeLogoHome = null;

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

    function relocateMobileHomeLogo() {
        const logo = document.querySelector('[data-dashboard-target="mobileHomeLogo"]');
        const headerBar = document.querySelector('[data-dashboard-target="headerBar"]');
        if (!logo || !headerBar) return;

        if (!mobileHomeLogoHome) {
            mobileHomeLogoHome = { parent: headerBar, next: logo.nextElementSibling };
        }

        // Desktop brand lives in the sidebar; keep this logo in the mobile header only.
        if (logo.parentElement !== headerBar) {
            if (mobileHomeLogoHome.next) {
                headerBar.insertBefore(logo, mobileHomeLogoHome.next);
            } else {
                headerBar.insertBefore(logo, headerBar.firstChild);
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
            relocateMobileHomeLogo();
        });

        if (backBtn) {
            observer.observe(backBtn, { attributes: true, attributeFilter: ['class', 'hidden'] });
        }
        observer.observe(headerBar, { childList: true });
    }

    let dashboardColumnObserver = null;

    function syncDashboardColumnHeights() {
        const left = document.querySelector('.hp-v4-dashboard-left');
        if (!left) return;
        // Desktop columns scroll independently; do not force left column
        // to match experiences height (that clipped 5+ attraction cards).
        left.style.removeProperty('min-height');
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
            if (dash?.hasScrollContainerTarget) {
                dash.scrollContainerTarget.scrollTo({ top: 0, behavior: 'instant' });
            }
            if (dash?.hasTabBtnTarget) {
                dash.setActiveTab?.(dash.tabBtnTargets[0]);
            }
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

    /** Return to pairing entry (/) without a full reload on /guide deep links. */
    function navigateHome() {
        const dash = getDashboardController();
        const global = getGlobalController();

        if (dash?.isExperienceDetailOpen?.()) {
            dash.finishCloseExperienceDetail?.({ skipHistory: true });
        }
        dash?.closeHelpOverlay?.();
        dash?.closeLockGuide?.();
        dash?.closeRoomOverlay?.();

        if (dash?.activatePairingHome) {
            dash.activatePairingHome();
            window.HostPocketGuestRouter?.navigateToPairingHistory?.();
        } else if (global?.navigateToPairing) {
            global.navigateToPairing('switch');
        } else {
            window.HostPocketGuestRouter?.navigateToPairingHistory?.();
            window.location.assign(window.HostPocketGuestRouter?.HOME_PATH || '/');
        }

        syncSidebarActive('pairing');
    }

    function closePricingPanel() {
        const panel = document.getElementById('hp-v4-pricing-panel');
        if (panel) {
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
        }
        document.documentElement.classList.remove('hp-v4-pricing-open');
        document.body?.classList.remove('hp-v4-pricing-open');
    }

    function openPricingPanel() {
        closeMemberPanel();
        const panel = document.getElementById('hp-v4-pricing-panel');
        if (!panel) return;
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('hp-v4-pricing-open');
        syncSidebarActive(getActiveScreen(), 'pricing');
        panel.querySelector('.hp-v4-pricing__close')?.focus?.();
    }

    function syncMemberSidebarAvatar(user) {
        const url = String(user?.avatarUrl || '').trim();
        window.HostPocketV4SidebarNavItem?.setMemberAvatar?.(url);
    }

    function closeMemberPanel() {
        window.HostPocketMemberPanel?.close?.();
    }

    async function refreshMemberListings() {
        return window.HostPocketMemberPanel?.refreshListings?.() || [];
    }

    async function refreshMemberPanel() {
        return window.HostPocketMemberPanel?.refresh?.() || null;
    }

    async function syncMemberSession() {
        try {
            const result = await window.AuthAPI?.getMe?.();
            if (result?.ok && result.user) {
                syncMemberSidebarAvatar(result.user);
                return result.user;
            }
        } catch (error) {
            console.warn('[member] session sync failed', error);
        }
        syncMemberSidebarAvatar(null);
        return null;
    }

    function openMemberPanel() {
        closePricingPanel();
        window.HostPocketMemberPanel?.open?.();
    }

    function navigatePricing() {
        openPricingPanel();
    }

    function navigateMember() {
        openMemberPanel();
    }

    function navigate(nav) {
        if (nav === 'home') {
            closePricingPanel();
            closeMemberPanel();
            navigateHome();
            return;
        }
        if (nav === 'dashboard') {
            closePricingPanel();
            closeMemberPanel();
            navigateDashboard();
            return;
        }
        if (nav === 'contact') {
            closePricingPanel();
            closeMemberPanel();
            navigateContact();
            return;
        }
        if (nav === 'pricing') {
            navigatePricing();
            return;
        }
        if (nav === 'member') {
            navigateMember();
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

    function isAppHomePath() {
        const path = (window.location.pathname || '/')
            .replace(/\/index\.html$/i, '/')
            .replace(/\/+$/, '') || '/';
        return path === '/';
    }

    function repairHomeShellAfterReturn(options = {}) {
        closePricingPanel();
        closeMemberPanel();

        if (!isAppHomePath()) {
            syncSidebarActive(getActiveScreen());
            return;
        }

        const dash = getDashboardController();
        if (dash?.activatePairingHome) {
            dash.activatePairingHome();
        } else {
            window.appNavigate?.('pairing');
            document.documentElement.classList.remove('hp-boot-dashboard', 'hp-boot-experience');
        }

        window.HostPocketPairingTabs?.restoreAfterBackNavigation?.({
            forceRemount: Boolean(options.forceRemount)
        });

        syncGuestChrome();
        syncListingQueryNav();
        syncSidebarActive(getActiveScreen());
    }

    const PENDING_HOST_CHECKOUT_KEY = 'hp_pending_host_checkout';
    const HOST_CHECKOUT_NEXT = '/?hostCheckout=1';

    function pricingAmountTwd() {
        const fromNav = Number(window.HostPocketV4SidebarNavItem?.PRICING?.amount);
        if (Number.isFinite(fromNav) && fromNav > 0) return fromNav;
        return 40;
    }

    function setPricingCheckoutBusy(btn, busy) {
        if (!btn) return;
        btn.disabled = Boolean(busy);
        btn.setAttribute('aria-busy', busy ? 'true' : 'false');
        btn.classList.toggle('opacity-70', Boolean(busy));
        btn.classList.toggle('pointer-events-none', Boolean(busy));
    }

    function markPendingHostCheckout() {
        try {
            window.sessionStorage?.setItem(PENDING_HOST_CHECKOUT_KEY, '1');
        } catch (_) { /* ignore */ }
    }

    function clearPendingHostCheckout() {
        try {
            window.sessionStorage?.removeItem(PENDING_HOST_CHECKOUT_KEY);
        } catch (_) { /* ignore */ }
    }

    function hasPendingHostCheckout() {
        try {
            if (window.sessionStorage?.getItem(PENDING_HOST_CHECKOUT_KEY) === '1') return true;
        } catch (_) { /* ignore */ }
        try {
            return new URLSearchParams(window.location.search || '').get('hostCheckout') === '1';
        } catch (_) {
            return false;
        }
    }

    function stripHostCheckoutQuery() {
        try {
            const params = new URLSearchParams(window.location.search || '');
            if (!params.has('hostCheckout')) return;
            params.delete('hostCheckout');
            const qs = params.toString();
            const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`;
            window.history.replaceState({}, '', next);
        } catch (_) { /* ignore */ }
    }

    async function getSignedInUser() {
        try {
            const me = await window.AuthAPI?.getMe?.();
            if (me?.ok && me.user) return me.user;
        } catch (error) {
            console.warn('[pricing] getMe failed', error);
        }
        return null;
    }

    async function startHostSubscriptionCheckout(triggerEl) {
        const isZh = (window.currentLanguage || 'zh') === 'zh';
        const api = window.BookingAPI;
        if (!api?.createEcpayPayment || !api?.submitEcpayForm) {
            window.hpTriggerToast?.(
                isZh ? '無法付款' : 'Payment unavailable',
                isZh ? '付款模組尚未載入，請重新整理後再試' : 'Payment module is not ready. Please refresh and try again.',
                'error'
            );
            return;
        }

        setPricingCheckoutBusy(triggerEl, true);
        try {
            const health = await api.checkHealth?.().catch(() => null);
            const googleReady = Boolean(health?.googleAuthConfigured);
            const ecpayReady = health == null
                ? await api.isEcpayConfigured?.()
                : Boolean(health.ecpayConfigured);
            if (ecpayReady === false) {
                throw Object.assign(new Error('ECPay not configured'), { code: 'ECPAY_NOT_CONFIGURED' });
            }

            // 1) 有 Google 登入時先登入，登入後以 ?hostCheckout=1 回來繼續付款。
            //    未設定 Google 時不要導向 /api/auth/google（會變成 JSON／錯誤頁），直接進綠界。
            const user = await getSignedInUser();
            if (!user && googleReady) {
                if (!window.AuthAPI?.loginWithGoogle) {
                    throw new Error(isZh ? '登入模組尚未載入' : 'Login module is not ready');
                }
                markPendingHostCheckout();
                window.hpTriggerToast?.(
                    isZh ? '請先登入' : 'Sign in required',
                    isZh ? '登入後會繼續前往綠界付款' : 'After sign-in you will continue to ECPay checkout',
                    'info'
                );
                window.AuthAPI.loginWithGoogle({ next: HOST_CHECKOUT_NEXT });
                return;
            }

            // 2) 建立綠界訂單並導向付款介面
            const email = String(user?.email || '').trim().toLowerCase();
            const checkout = await api.createEcpayPayment({
                purpose: 'host_subscription',
                amountTwd: pricingAmountTwd(),
                title: isZh ? 'Host Pocket 月費' : 'Host Pocket monthly',
                locale: isZh ? 'zh' : 'en',
                guestEmail: email,
                email
            });

            clearPendingHostCheckout();
            stripHostCheckoutQuery();

            if (checkout.skipPayment) {
                closePricingPanel();
                void goToHostSettings('/host-settings.html');
                return;
            }

            if (checkout.mock) {
                closePricingPanel();
                window.hpTriggerToast?.(
                    isZh ? '模擬付款成功' : 'Mock payment OK',
                    isZh
                        ? `模擬收款 NT$${checkout.amountTwd}，前往設定`
                        : `Mock charge NT$${checkout.amountTwd}. Opening settings.`,
                    'success'
                );
                window.setTimeout(() => {
                    void goToHostSettings('/host-settings.html');
                }, 400);
                return;
            }

            closePricingPanel();
            api.submitEcpayForm(checkout.actionUrl, checkout.params, { newWindow: false });
        } catch (error) {
            console.error('[pricing] host subscription checkout failed', error);
            const msg = error?.code === 'ECPAY_NOT_CONFIGURED'
                ? (isZh
                    ? '綠界尚未設定。本機請在 .env 設 ECPAY_USE_STAGE=1'
                    : 'ECPay is not configured. Set ECPAY_USE_STAGE=1 in .env for local sandbox.')
                : (error?.message || (isZh ? '無法建立綠界訂單' : 'Could not create ECPay order'));
            window.hpTriggerToast?.(
                isZh ? '無法前往付款' : 'Checkout failed',
                msg,
                'error'
            );
            setPricingCheckoutBusy(triggerEl, false);
        }
    }

    async function resumeHostCheckoutIfNeeded(options = {}) {
        if (document.documentElement.dataset.hpHostCheckoutResumed === 'true') return false;
        if (!hasPendingHostCheckout()) return false;
        // Claim immediately so auth-ok + init resume do not double-fire.
        document.documentElement.dataset.hpHostCheckoutResumed = 'true';

        const user = await getSignedInUser();
        if (!user) {
            document.documentElement.dataset.hpHostCheckoutResumed = '';
            return false;
        }

        clearPendingHostCheckout();
        stripHostCheckoutQuery();
        openPricingPanel();
        if (options.showSignedInToast !== false) {
            window.hpTriggerToast?.(
                (window.currentLanguage || 'zh') === 'zh' ? '登入成功' : 'Signed in',
                (window.currentLanguage || 'zh') === 'zh' ? '正在前往綠界付款…' : 'Opening ECPay checkout…',
                'success'
            );
        }
        const cta = document.querySelector('[data-hp-v4-pricing-checkout]');
        await startHostSubscriptionCheckout(cta);
        return true;
    }

    function bindPricingPanel() {
        const panel = document.getElementById('hp-v4-pricing-panel');
        if (!panel || panel.dataset.hpV4Bound === 'true') return;
        panel.dataset.hpV4Bound = 'true';

        panel.addEventListener('click', (event) => {
            if (event.target.closest('[data-hp-v4-pricing-close]')) {
                event.preventDefault();
                closePricingPanel();
                syncSidebarActive(getActiveScreen());
                return;
            }

            const checkoutBtn = event.target.closest('[data-hp-v4-pricing-checkout], button.hp-v4-pricing__cta');
            if (checkoutBtn) {
                event.preventDefault();
                void startHostSubscriptionCheckout(checkoutBtn);
                return;
            }

            // Legacy continue link (if any) — close overlay before navigating.
            const continueLink = event.target.closest('[data-hp-v4-pricing-continue], a.hp-v4-pricing__cta');
            if (continueLink) {
                event.preventDefault();
                const href = continueLink.getAttribute('href') || '/host-settings.html';
                closePricingPanel();
                syncSidebarActive(getActiveScreen());
                window.setTimeout(() => {
                    void goToHostSettings(href);
                }, 0);
            }
        });

        document.addEventListener('click', (event) => {
            const openBtn = event.target.closest('[data-hp-v4-pricing-open]');
            if (!openBtn) return;
            event.preventDefault();
            openPricingPanel();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            if (!panel.hidden) {
                closePricingPanel();
                syncSidebarActive(getActiveScreen());
            }
            const memberPanel = document.getElementById('hp-v4-member-panel');
            if (memberPanel && !memberPanel.hidden) {
                closeMemberPanel();
                syncSidebarActive(getActiveScreen());
            }
        });

        // Safari/Chrome may restore this page with the pricing sheet still open.
        window.addEventListener('pagehide', () => {
            closePricingPanel();
            closeMemberPanel();
        });
        window.addEventListener('pageshow', (event) => {
            repairHomeShellAfterReturn({ forceRemount: Boolean(event.persisted) });
        });
    }

    function bindMemberPanel() {
        window.HostPocketMemberPanel?.bind?.({
            onOpen() {
                syncSidebarActive(getActiveScreen(), 'member');
            },
            onClose() {
                syncSidebarActive(getActiveScreen());
            },
            onUser(user) {
                syncMemberSidebarAvatar(user);
            },
            onLogout() {
                syncMemberSidebarAvatar(null);
            },
            async onSubscribe(btn) {
                closeMemberPanel();
                openPricingPanel();
                await startHostSubscriptionCheckout(btn);
            }
        });

        // After Google OAuth redirect (?auth=ok|error)
        try {
            const params = new URLSearchParams(window.location.search || '');
            const auth = params.get('auth');
            // Only resume checkout when OAuth returned with ?hostCheckout=1 (or explicit pending
            // set for that return). Do not treat a stale sessionStorage flag alone as intent
            // after a normal member-area login.
            const wantsHostCheckout = params.get('hostCheckout') === '1';
            if (auth === 'ok' || auth === 'error') {
                params.delete('auth');
                params.delete('reason');
                // Keep hostCheckout for resumeHostCheckoutIfNeeded; it strips later.
                const qs = params.toString();
                const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`;
                window.history.replaceState({}, '', next);
                if (auth === 'ok') {
                    const pending = window.AuthAPI?.consumeNext?.() || '';
                    if (pending && window.AuthAPI?.isHostSettingsHref?.(pending)) {
                        window.hpTriggerToast?.(
                            (window.currentLanguage || 'zh') === 'zh' ? '登入成功' : 'Signed in',
                            (window.currentLanguage || 'zh') === 'zh' ? '正在前往住宿指南設定' : 'Opening guest guide settings',
                            'success'
                        );
                        window.location.assign(pending);
                        return;
                    }
                    if (wantsHostCheckout || hasPendingHostCheckout()) {
                        void resumeHostCheckoutIfNeeded({ showSignedInToast: true });
                        return;
                    }
                    openMemberPanel();
                    window.hpTriggerToast?.(
                        (window.currentLanguage || 'zh') === 'zh' ? '登入成功' : 'Signed in',
                        (window.currentLanguage || 'zh') === 'zh' ? '已綁定 Google 帳號' : 'Google account linked',
                        'success'
                    );
                } else {
                    clearPendingHostCheckout();
                    stripHostCheckoutQuery();
                    openMemberPanel();
                    window.hpTriggerToast?.(
                        (window.currentLanguage || 'zh') === 'zh' ? '登入失敗' : 'Sign-in failed',
                        (window.currentLanguage || 'zh') === 'zh' ? '請再試一次 Google 登入' : 'Please try Google sign-in again',
                        'error'
                    );
                }
            }
        } catch (_) { /* ignore */ }
    }

    function resolveHostSettingsHref(href) {
        try {
            const url = new URL(href || '/host-settings.html', window.location.origin);
            return `${url.pathname}${url.search || ''}`;
        } catch {
            return '/host-settings.html';
        }
    }

    async function goToHostSettings(href) {
        const next = resolveHostSettingsHref(href);
        if (!window.AuthAPI?.requireLogin) {
            window.location.assign(next);
            return;
        }
        const result = await window.AuthAPI.requireLogin({ next });
        if (result?.ok) {
            window.location.assign(next);
        }
    }

    function bindHostSettingsLoginGate() {
        if (document.documentElement.dataset.hpHostSettingsLoginGate === 'true') return;
        document.documentElement.dataset.hpHostSettingsLoginGate = 'true';

        document.addEventListener('click', (event) => {
            const link = event.target.closest?.('a[href*="host-settings"]');
            if (!link || event.defaultPrevented) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.target && link.target !== '_self') return;
            const href = link.getAttribute('href') || '';
            if (!window.AuthAPI?.isHostSettingsHref?.(href) && !/host-settings\.html/i.test(href)) return;

            event.preventDefault();
            event.stopPropagation();
            void goToHostSettings(href);
        }, true);
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
            syncListingQueryNav();
            syncSidebarActive(getActiveScreen());
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    function init() {
        syncDesktopClass();
        bindSidebar();
        bindPricingPanel();
        closePricingPanel();
        closeMemberPanel();
        bindMemberPanel(); // may reopen after Google OAuth (?auth=ok|error)
        bindHostSettingsLoginGate();
        void (async () => {
            await syncMemberSession();
            // Already signed-in + ?hostCheckout=1 / pending flag (e.g. refresh after login)
            await resumeHostCheckoutIfNeeded({ showSignedInToast: false });
        })();
        initSidebarCollapse();
        hookAppNavigate();
        observeGuestBoot();
        observeSharePlacement();
        observeDashboardColumnHeights();
        syncGuestChrome();
        syncListingQueryNav();
        syncDashboardColumnHeights();
        syncSidebarActive(getActiveScreen());
        syncSidebarLang();

        // Deep-link from host-settings avatar: /#member
        try {
            if ((window.location.hash || '').replace(/^#/, '') === 'member') {
                openMemberPanel();
            }
        } catch (_) { /* ignore */ }

        // Sales page CTA: /?openPricing=1
        try {
            const params = new URLSearchParams(window.location.search || '');
            if (params.get('openPricing') === '1') {
                params.delete('openPricing');
                const qs = params.toString();
                const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`;
                window.history.replaceState({}, '', next);
                openPricingPanel();
            }
        } catch (_) { /* ignore */ }

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
            syncListingQueryNav();
            requestAnimationFrame(() => syncSidebarActive(getActiveScreen()));
        });

        window.addEventListener('load', () => {
            hookAppNavigate();
            syncListingQueryNav();
            syncSidebarActive(getActiveScreen());
            syncDashboardColumnHeights();
        });
    }

    DESKTOP_MQ.addEventListener('change', () => {
        syncDesktopClass();
        relocateShareButton();
        relocateMobileHomeLogo();
        syncGuestChrome();
        syncListingQueryNav();
        syncDashboardColumnHeights();
        syncSidebarActive(getActiveScreen());
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.HostPocketV4Desktop = {
        minWidth: DESKTOP_MIN_WIDTH,
        isDesktop,
        mq: DESKTOP_MQ,
        isListingQueryRoute,
        syncListingQueryNav,
        openPricingPanel,
        closePricingPanel,
        openMemberPanel,
        closeMemberPanel,
        refreshMemberListings,
        refreshMemberPanel,
        startHostSubscriptionCheckout
    };
})();
