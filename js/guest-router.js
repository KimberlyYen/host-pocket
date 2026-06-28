/**
 * Guest app client-side router — pairing / guide / experience history sync.
 *
 * Stack convention:
 *   [ pairing (/) , guide (/guide/:listing) , experience? (.../experience/:id) ]
 * Back from guide always returns to pairing home first.
 */
(function (global) {
    const HOME_PATH = '/';

    function normalizeHref(href) {
        const base = global.location?.origin || 'http://localhost';
        try {
            const url = new URL(String(href || ''), base);
            let path = url.pathname.replace(/\/index\.html$/i, '/');
            if (path.length > 1) path = path.replace(/\/+$/, '');
            return `${url.origin}${path}${url.search}`;
        } catch (_) {
            return String(href || '').split('#')[0];
        }
    }

    function currentHref() {
        return normalizeHref(global.location?.href || '');
    }

    function parseRoute(loc) {
        const locationRef = loc || global.location;
        if (!locationRef) return { screen: 'pairing', listingId: null, experienceId: null };

        const deep = global.ExperienceDetailsAPI?.parseDeepLinkFromLocation?.(locationRef);
        if (deep?.experience) {
            return {
                screen: 'experience',
                listingId: deep.listing,
                experienceId: deep.experience
            };
        }
        if (deep?.listing) {
            return { screen: 'guide', listingId: deep.listing, experienceId: null };
        }

        const path = String(locationRef.pathname || '')
            .replace(/\/index\.html$/i, '/')
            .replace(/\/+$/, '') || '/';
        if (path === '' || path === '/') {
            return { screen: 'pairing', listingId: null, experienceId: null };
        }

        return { screen: 'pairing', listingId: null, experienceId: null };
    }

    function routeFromHistoryEvent(event) {
        const state = event?.state;
        if (state?.hp === 'pairing') {
            return { screen: 'pairing', listingId: null, experienceId: null };
        }
        if (state?.hp === 'guide') {
            return {
                screen: 'guide',
                listingId: state.listingId ? String(state.listingId).trim().toUpperCase() : null,
                experienceId: null
            };
        }
        if (state?.hp === 'experience') {
            return {
                screen: 'experience',
                listingId: state.listingId ? String(state.listingId).trim().toUpperCase() : null,
                experienceId: state.experienceId ? String(state.experienceId).trim() : null
            };
        }
        return parseRoute();
    }

    function buildGuideUrl(listingId, guideOnly = true) {
        const id = String(listingId || '').trim().toUpperCase();
        return normalizeHref(global.ExperienceDetailsAPI.buildGuideBrowserUrl({
            listingId: id,
            guideOnly
        }));
    }

    function buildExperienceUrl(listingId, experienceId) {
        const id = String(listingId || '').trim().toUpperCase();
        const expId = String(experienceId || '').trim();
        return normalizeHref(global.ExperienceDetailsAPI.buildGuideBrowserUrl({
            listingId: id,
            experienceId: expId
        }));
    }

    let detailHistoryActive = false;
    let ignoreNextPopstate = false;

    function replacePairing() {
        if (typeof history === 'undefined') return;
        history.replaceState({ hp: 'pairing' }, '', HOME_PATH);
    }

    function isGuideStackReady(listingId, guideUrl) {
        return (
            currentHref() === guideUrl
            && history.state?.hp === 'guide'
            && history.state?.listingId === listingId
            && history.length > 1
        );
    }

    /** Build [pairing, guide] so browser back from listing returns to home. */
    function seedGuideStack(listingId) {
        if (typeof history === 'undefined') return;
        const id = String(listingId || '').trim().toUpperCase();
        const guideUrl = buildGuideUrl(id, true);

        if (isGuideStackReady(id, guideUrl)) return;

        history.replaceState({ hp: 'pairing' }, '', HOME_PATH);
        history.pushState({ hp: 'guide', listingId: id }, '', guideUrl);
    }

    /**
     * Enter guide dashboard. Default seeds [pairing, guide] unless seedHome: false.
     */
    function enterGuide(listingId, options = {}) {
        if (typeof history === 'undefined') return;
        const useSeed = options.seedHome !== false;

        if (useSeed) {
            seedGuideStack(listingId);
            return;
        }

        const id = String(listingId || '').trim().toUpperCase();
        const guideUrl = buildGuideUrl(id, true);
        history.pushState({ hp: 'guide', listingId: id }, '', guideUrl);
    }

    function replaceGuide(listingId) {
        seedGuideStack(listingId);
    }

    function pushGuide(listingId) {
        seedGuideStack(listingId);
    }

    function pushExperience(listingId, experienceId) {
        if (typeof history === 'undefined') return;
        const id = String(listingId || '').trim().toUpperCase();
        const expId = String(experienceId || '').trim();
        if (!id || !expId) return;

        const guideUrl = buildGuideUrl(id, true);
        const expUrl = buildExperienceUrl(id, expId);
        const current = currentHref();

        if (current === expUrl && detailHistoryActive) return;

        if (!isGuideStackReady(id, guideUrl)) {
            history.replaceState({ hp: 'pairing' }, '', HOME_PATH);
            history.pushState({ hp: 'guide', listingId: id }, '', guideUrl);
        }

        if (current === expUrl) {
            history.pushState({ hp: 'experience', listingId: id, experienceId: expId }, '', expUrl);
            detailHistoryActive = true;
            return;
        }

        history.pushState({ hp: 'experience', listingId: id, experienceId: expId }, '', expUrl);
        detailHistoryActive = true;
    }

    function syncGuideUrl(listingId) {
        if (typeof history === 'undefined' || detailHistoryActive) return;
        const id = String(listingId || '').trim().toUpperCase();
        const url = buildGuideUrl(id, true);

        if (history.length <= 1 || !isGuideStackReady(id, url)) {
            seedGuideStack(id);
            return;
        }

        if (history.state?.hp !== 'guide' || history.state?.listingId !== id) {
            history.replaceState({ hp: 'guide', listingId: id }, '', url);
        }
    }

    function backFromDetail() {
        if (typeof history === 'undefined' || !detailHistoryActive) return false;
        history.back();
        return true;
    }

    function clearDetailHistory() {
        detailHistoryActive = false;
    }

    function isDetailHistoryActive() {
        return detailHistoryActive;
    }

    function navigateToPairingHistory() {
        if (typeof history === 'undefined') return;
        detailHistoryActive = false;
        history.replaceState({ hp: 'pairing' }, '', HOME_PATH);
    }

    function syncAppShellFromRoute(route) {
        if (route.screen === 'pairing') {
            global.appNavigate?.('pairing');
        } else if (route.screen === 'guide' || route.screen === 'experience') {
            global.appNavigate?.('dashboard');
        }
    }

    function install(onRoute) {
        if (!global.addEventListener || global.__hpGuestRouterInstalled) return;
        global.__hpGuestRouterInstalled = true;

        global.addEventListener('popstate', (event) => {
            if (ignoreNextPopstate) {
                ignoreNextPopstate = false;
                return;
            }
            const route = routeFromHistoryEvent(event);
            onRoute?.(event, route);
            syncAppShellFromRoute(route);
        });
    }

    function suppressNextPop() {
        ignoreNextPopstate = true;
    }

    global.HostPocketGuestRouter = {
        HOME_PATH,
        normalizeHref,
        currentHref,
        parseRoute,
        routeFromHistoryEvent,
        buildGuideUrl,
        buildExperienceUrl,
        replacePairing,
        seedGuideStack,
        enterGuide,
        replaceGuide,
        pushGuide,
        pushExperience,
        syncGuideUrl,
        backFromDetail,
        clearDetailHistory,
        isDetailHistoryActive,
        navigateToPairingHistory,
        syncAppShellFromRoute,
        suppressNextPop,
        install
    };
})(window);
