/**
 * Shared member-area right sheet (#hp-v4-member-panel).
 * Used by guest desktop v4 and host-settings.
 */
(function (global) {
    const PANEL_ID = 'hp-v4-member-panel';
    const OPEN_CLASS = 'hp-v4-member-open';

    let hooks = {
        onOpen: null,
        onClose: null,
        onUser: null,
        onLogout: null,
        loginNext: null
    };

    function getPanel() {
        return document.getElementById(PANEL_ID);
    }

    function isOpen() {
        const panel = getPanel();
        return Boolean(panel && !panel.hidden);
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function setState(state) {
        const panel = getPanel();
        if (!panel) return;
        panel.querySelectorAll('[data-hp-v4-member-state]').forEach((el) => {
            const active = el.getAttribute('data-hp-v4-member-state') === state;
            el.hidden = !active;
            el.classList.toggle('hidden', !active);
        });
    }

    function renderUser(user) {
        const panel = getPanel();
        if (!panel) return;
        const nameEl = panel.querySelector('[data-hp-v4-member-name]');
        const emailEl = panel.querySelector('[data-hp-v4-member-email]');
        const avatar = panel.querySelector('[data-hp-v4-member-avatar]');
        const fallback = panel.querySelector('[data-hp-v4-member-avatar-fallback]');
        const name = String(user?.name || '').trim()
            || String(user?.email || '').split('@')[0]
            || 'Member';
        const email = String(user?.email || '').trim();
        if (nameEl) nameEl.textContent = name;
        if (emailEl) emailEl.textContent = email;
        if (avatar) {
            const url = String(user?.avatarUrl || '').trim();
            if (url) {
                avatar.hidden = false;
                avatar.src = url;
                avatar.alt = name;
                if (fallback) fallback.hidden = true;
            } else {
                avatar.hidden = true;
                avatar.removeAttribute('src');
                if (fallback) fallback.hidden = false;
            }
        }
        try {
            hooks.onUser?.(user || null);
        } catch (_) { /* ignore */ }
    }

    function renderListings(listings) {
        const panel = getPanel();
        if (!panel) return;
        const listEl = panel.querySelector('[data-hp-v4-member-listings]');
        const emptyEl = panel.querySelector('[data-hp-v4-member-listings-empty]');
        if (!listEl) return;

        const rows = Array.isArray(listings) ? listings : [];
        if (!rows.length) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.hidden = false;
            return;
        }

        if (emptyEl) emptyEl.hidden = true;
        listEl.innerHTML = rows.map((item) => {
            const id = String(item.listingId || '').trim();
            if (!id) return '';
            const title = String(item.title || '').trim() || id;
            const href = `/host-settings.html?listing=${encodeURIComponent(id)}`;
            const openHref = `/?listing=${encodeURIComponent(id)}`;
            const source = String(item.source || '').trim();
            const sourceLabel = source === 'quick'
                ? '<span class="hp-v4-member__listing-source" data-global-lang="zh">快速開始</span><span class="hp-v4-member__listing-source hidden" data-global-lang="en">Quick start</span>'
                : source === 'link'
                    ? '<span class="hp-v4-member__listing-source" data-global-lang="zh">連接房源</span><span class="hp-v4-member__listing-source hidden" data-global-lang="en">Linked</span>'
                    : '';
            return `<li class="hp-v4-member__listing">
                <div class="hp-v4-member__listing-copy">
                    <span class="hp-v4-member__listing-title">${escapeHtml(title)}</span>
                    <span class="hp-v4-member__listing-id">${escapeHtml(id)}</span>
                    ${sourceLabel}
                </div>
                <div class="hp-v4-member__listing-actions">
                    <a class="hp-v4-member__listing-link" href="${escapeHtml(openHref)}" data-turbo="false">
                        <span data-global-lang="zh">開啟</span>
                        <span class="hidden" data-global-lang="en">Open</span>
                    </a>
                    <a class="hp-v4-member__listing-link" href="${escapeHtml(href)}" data-turbo="false">
                        <span data-global-lang="zh">編輯</span>
                        <span class="hidden" data-global-lang="en">Edit</span>
                    </a>
                </div>
            </li>`;
        }).join('');
    }

    async function refreshListings() {
        try {
            const result = await global.AuthAPI?.listListings?.();
            if (result?.ok) {
                renderListings(result.listings);
                return result.listings;
            }
        } catch (error) {
            console.warn('[member] list listings failed', error);
        }
        renderListings([]);
        return [];
    }

    async function refresh() {
        setState('loading');
        try {
            const result = await global.AuthAPI?.getMe?.();
            if (result?.ok && result.user) {
                renderUser(result.user);
                setState('signed-in');
                void refreshListings();
                return result.user;
            }
            renderUser(null);
            renderListings([]);
            setState('signed-out');
            return null;
        } catch (error) {
            console.warn('[member] getMe failed', error);
            renderUser(null);
            renderListings([]);
            setState('signed-out');
            return null;
        }
    }

    function open() {
        const panel = getPanel();
        if (!panel) return;
        panel.hidden = false;
        panel.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add(OPEN_CLASS);
        document.body?.classList.add(OPEN_CLASS);
        panel.querySelector('.hp-v4-member__close')?.focus?.();
        try {
            hooks.onOpen?.();
        } catch (_) { /* ignore */ }
        void refresh();
    }

    function close() {
        const panel = getPanel();
        if (panel) {
            panel.hidden = true;
            panel.setAttribute('aria-hidden', 'true');
        }
        document.documentElement.classList.remove(OPEN_CLASS);
        document.body?.classList.remove(OPEN_CLASS);
        try {
            hooks.onClose?.();
        } catch (_) { /* ignore */ }
    }

    function resolveLoginNext() {
        if (typeof hooks.loginNext === 'function') {
            try {
                return String(hooks.loginNext() || '');
            } catch (_) {
                return '';
            }
        }
        return String(hooks.loginNext || '');
    }

    function bind(options = {}) {
        hooks = {
            onOpen: options.onOpen || null,
            onClose: options.onClose || null,
            onUser: options.onUser || null,
            onLogout: options.onLogout || null,
            loginNext: options.loginNext || null
        };

        const panel = getPanel();
        if (!panel || panel.dataset.hpMemberBound === 'true') return;
        panel.dataset.hpMemberBound = 'true';

        panel.addEventListener('click', (event) => {
            if (event.target.closest('[data-hp-v4-member-close]')) {
                event.preventDefault();
                close();
                return;
            }

            if (event.target.closest('[data-hp-v4-member-login]')) {
                event.preventDefault();
                if (!global.AuthAPI?.loginWithGoogle) {
                    global.hpTriggerToast?.(
                        '無法登入',
                        '登入模組尚未載入，請重新整理後再試',
                        'error'
                    );
                    return;
                }
                const next = resolveLoginNext();
                if (next) global.AuthAPI.loginWithGoogle({ next });
                else global.AuthAPI.loginWithGoogle();
                return;
            }

            if (event.target.closest('[data-hp-v4-member-logout]')) {
                event.preventDefault();
                void (async () => {
                    try {
                        await global.AuthAPI?.logout?.();
                        setState('signed-out');
                        renderUser(null);
                        renderListings([]);
                        global.hpTriggerToast?.(
                            (global.currentLanguage || 'zh') === 'zh' ? '已登出' : 'Signed out',
                            (global.currentLanguage || 'zh') === 'zh' ? '會員工作階段已結束' : 'Your session has ended',
                            'success'
                        );
                        try {
                            await hooks.onLogout?.();
                        } catch (_) { /* ignore */ }
                    } catch (error) {
                        global.hpTriggerToast?.(
                            (global.currentLanguage || 'zh') === 'zh' ? '登出失敗' : 'Sign-out failed',
                            error?.message || 'Logout failed',
                            'error'
                        );
                    }
                })();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen()) {
                event.preventDefault();
                close();
            }
        });
    }

    global.HostPocketMemberPanel = {
        open,
        close,
        refresh,
        refreshListings,
        bind,
        isOpen,
        setState,
        renderUser,
        renderListings
    };
})(window);
