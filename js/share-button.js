/**
 * Reusable share button component — copy link + copied hint (+ optional navigate home).
 */
(function (global) {
    const ATTR = 'data-hp-share-button';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function isZh() {
        return (global.currentLanguage || 'zh') !== 'en';
    }

    function copyMessage() {
        return isZh() ? '已複製' : 'Copied';
    }

    const VARIANTS = {
        icon: {
            className: 'hp-share-btn hp-share-btn--icon inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-full bg-white/90 backdrop-blur hover:bg-white text-hp-coral shadow-md border border-hp-border/60 transition active:scale-95',
            iconClass: 'fa-solid fa-arrow-up-from-bracket text-sm',
            showLabel: false
        },
        pill: {
            className: 'hp-share-btn hp-share-btn--pill inline-flex items-center gap-1 text-xs font-bold text-white px-3 py-2 rounded-xl bg-hp-coral hover:bg-hp-coral/90 whitespace-nowrap shrink-0 transition active:scale-[0.98] shadow-sm',
            iconClass: 'fa-solid fa-arrow-up-from-bracket text-sm',
            showLabel: true
        }
    };

    function render(options = {}) {
        const variant = VARIANTS[options.variant] || VARIANTS.icon;
        const shareUrl = options.shareUrl ? String(options.shareUrl) : '';
        const listingId = options.listingId ? String(options.listingId).trim().toUpperCase() : '';
        const stay = Boolean(options.stay);
        const label = isZh() ? '分享' : 'Share';
        const ariaLabel = options.ariaLabel
            || (options.variant === 'pill' ? label : (isZh() ? '分享指南' : 'Share guide'));
        const positionClass = options.positionClass || '';
        const extraClass = options.className || '';
        const stimulusAction = options.stimulusAction !== false
            ? 'click->dashboard#copyGuideShareLink'
            : '';
        const dashboardTarget = options.dashboardTarget || (options.variant === 'icon' ? 'shareLink' : '');

        const attrs = [
            'type="button"',
            ATTR,
            stimulusAction ? `data-action="${stimulusAction}"` : '',
            dashboardTarget ? `data-dashboard-target="${escapeHtml(dashboardTarget)}"` : '',
            shareUrl ? `data-share-url="${escapeHtml(shareUrl)}"` : '',
            stay ? 'data-share-stay="true"' : '',
            listingId ? `data-share-listing-id="${escapeHtml(listingId)}"` : '',
            `aria-label="${escapeHtml(ariaLabel)}"`,
            `class="${escapeHtml([positionClass, variant.className, extraClass].filter(Boolean).join(' '))}"`
        ].filter(Boolean).join(' ');

        const icon = `<i class="${variant.iconClass}"></i>`;
        const content = variant.showLabel
            ? `${icon}<span data-global-lang="zh">分享</span><span data-global-lang="en" class="hidden">Share</span>`
            : icon;

        return `<button ${attrs}>${content}</button>`;
    }

    function setUrl(button, shareUrl) {
        if (!button) return;
        if (shareUrl) {
            button.dataset.shareUrl = String(shareUrl);
        } else {
            delete button.dataset.shareUrl;
        }
    }

    function resolveShareUrl(button, hooks = {}) {
        const listingId = button?.dataset?.shareListingId
            || hooks.listingId
            || global.hpResolveGuestListingId?.()
            || 'TAIPEI-CITY';
        return button?.dataset?.shareUrl
            || hooks.fallbackUrl
            || global.ExperienceDetailsAPI?.getGuideShareHref?.(listingId)
            || '';
    }

    async function handleClick(button, hooks = {}) {
        if (!button) return false;

        const listingId = button.dataset.shareListingId
            || hooks.listingId
            || global.hpResolveGuestListingId?.()
            || 'TAIPEI-CITY';
        const shareUrl = resolveShareUrl(button, { ...hooks, listingId });

        if (!shareUrl) return false;

        try {
            const ok = global.hpCopyTextSync?.(shareUrl) || await global.hpCopyText?.(shareUrl);
            if (ok === false) throw new Error('copy failed');

            global.hpShowCopyHint?.(copyMessage(), button, { durationMs: 2000 });
            global.hpCelebrate?.({ fullScreen: true });

            if (button.dataset.shareStay === 'true') return true;

            if (hooks.onBeforeNavigate) {
                hooks.onBeforeNavigate();
            } else {
                const overlay = document.querySelector('[data-dashboard-target="expDetailOverlay"]');
                if (overlay && !overlay.classList.contains('translate-y-full')) {
                    overlay.classList.add('translate-y-full', 'pointer-events-none');
                    const body = document.querySelector('[data-dashboard-target="expDetailBody"]');
                    if (body) body.innerHTML = '';
                }
            }

            global.hpNavigateToGuideHome?.(listingId);
            return true;
        } catch (error) {
            console.warn('[HostPocketShareButton] copy failed', error);
            return false;
        }
    }

    function init() {
        if (global.__hpShareButtonBound) return;
        global.__hpShareButtonBound = true;

        global.document.addEventListener('click', (event) => {
            const button = event.target.closest(`[${ATTR}]`);
            if (!button) return;
            if (global.hpHasDashboardController?.()) return;

            event.preventDefault();
            void handleClick(button);
        }, true);
    }

    global.HostPocketShareButton = {
        ATTR,
        VARIANTS,
        render,
        setUrl,
        resolveShareUrl,
        handleClick,
        init
    };

    if (global.document?.readyState === 'loading') {
        global.document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})(window);
