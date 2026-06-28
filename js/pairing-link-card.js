/**
 * Pairing link card — reusable「連結 Airbnb 房源」區塊（Guest pairing screen）。
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-pairing-link-card]';
    const PARTIAL_NAME = 'components/pairing_link_card';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatAttrs(attrs = {}) {
        return Object.entries(attrs)
            .filter(([, value]) => value !== undefined && value !== null && value !== false)
            .map(([key, value]) => {
                if (value === true) return escapeHtml(key);
                return `${escapeHtml(key)}="${escapeHtml(value)}"`;
            })
            .join(' ');
    }

    /** Default markup — kept in sync with partials/components/_pairing_link_card.html */
    function template() {
        return `<div class="hp-pairing-link-card bg-[#292220] border border-[#3E3430] rounded-3xl overflow-hidden shadow-2xl">
    <div class="hp-pairing-link-card__header flex items-center gap-2 px-5 pt-5 pb-3">
        <span class="hp-pairing-link-card__status w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
        <span class="text-xs font-bold tracking-wider text-hp-coral" data-global-lang="zh">連結您的 Airbnb 房源</span>
        <span class="text-xs uppercase font-bold tracking-wider text-hp-coral hidden" data-global-lang="en">Link Your Airbnb Listing</span>
    </div>
    <div class="hp-pairing-link-card__body px-5 pb-3">
        <label class="text-xs font-semibold text-hp-muted mb-1 block">
            <span data-global-lang="zh">Airbnb 房源編號</span>
            <span data-global-lang="en" class="hidden">Airbnb Listing ID</span>
        </label>
        <p class="text-xs text-hp-muted/80 mb-1.5 leading-relaxed" data-global-lang="zh">打開 Airbnb 房源頁，複製網址中 <span class="text-hp-coral font-semibold">rooms/</span> 後面的數字</p>
        <p class="text-xs text-hp-muted/80 mb-1.5 leading-relaxed hidden" data-global-lang="en">Open your Airbnb listing page and copy the numbers after <span class="text-hp-coral font-semibold">rooms/</span> in the URL</p>
        <p class="text-xs text-hp-muted/60 mb-2 font-mono leading-relaxed" data-global-lang="zh">例：airbnb.com.tw/rooms/<span class="text-hp-coral">12345678</span></p>
        <p class="text-xs text-hp-muted/60 mb-2 font-mono leading-relaxed hidden" data-global-lang="en">e.g. airbnb.com/rooms/<span class="text-hp-coral">12345678</span></p>
        <div class="hp-pairing-link-card__input-wrap bg-hp-dark rounded-2xl px-4 py-3.5 border border-[#3A2F2C] focus-within:border-hp-coral/60 transition-all">
            <input type="text"
                   data-pairing-target="input"
                   placeholder="12345678"
                   value=""
                   class="hp-pairing-link-card__input bg-transparent text-base font-mono font-bold text-white focus:outline-none w-full uppercase tracking-widest placeholder:text-hp-muted/40">
        </div>
    </div>
    <div class="hp-pairing-link-card__actions px-5 pb-5">
        <button type="button" data-action="click->pairing#performPairing"
                class="hp-pairing-link-card__submit w-full bg-hp-coral hover:bg-hp-coralDark text-white text-xs font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-hp-coral/25 flex items-center justify-center gap-2 active:scale-[0.98]">
            <i class="fa-solid fa-link text-xs" aria-hidden="true"></i>
            <span data-global-lang="zh">連結房源並建立指南</span>
            <span data-global-lang="en" class="hidden">Link Listing & Build Guide</span>
            <i class="fa-solid fa-arrow-right text-xs opacity-70" aria-hidden="true"></i>
        </button>
    </div>
    <div class="hp-pairing-link-card__footer border-t border-[#3E3430] bg-gradient-to-b from-hp-coral/[0.04] to-transparent px-5 py-4 text-center">
        <p class="text-xs font-medium leading-relaxed text-[#EFECE9]/85" data-global-lang="zh">專為 Airbnb 房東打造的自動化在地指南</p>
        <p class="text-xs font-medium leading-relaxed text-[#EFECE9]/85 italic hidden" data-global-lang="en">"Automated local experience guide for Airbnb hosts."</p>
    </div>
</div>`;
    }

    function render(options = {}) {
        const attrs = formatAttrs(options.attrs);
        const inner = options.content ?? template();
        if (options.wrapper === false) return inner;
        const wrapperClass = options.wrapperClass || 'space-y-4';
        return attrs
            ? `<div class="${escapeHtml(wrapperClass)}" ${attrs}>${inner}</div>`
            : `<div class="${escapeHtml(wrapperClass)}">${inner}</div>`;
    }

    function resolveMountEl(target) {
        const doc = global.document;
        if (!doc) return null;
        if (!target) return doc.querySelector(MOUNT_SELECTOR);
        if (typeof target === 'string') return doc.querySelector(target);
        return target;
    }

    function mount(target, options = {}) {
        const el = resolveMountEl(target);
        if (!el) return null;
        el.innerHTML = render({ ...options, wrapper: false });
        return el.querySelector('.hp-pairing-link-card') || el.firstElementChild;
    }

    async function mountAsync(target, options = {}) {
        const el = resolveMountEl(target);
        if (!el) return null;

        if (global.PartialsClient?.renderPartial) {
            try {
                const html = await global.PartialsClient.renderPartial(PARTIAL_NAME);
                el.innerHTML = html.trim();
                return el.querySelector('.hp-pairing-link-card') || el.firstElementChild;
            } catch (error) {
                console.warn('[HostPocketPairingLinkCard] partial load failed, using inline template', error);
            }
        }

        return mount(el, options);
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-pairing-link-card-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-pairing-link-card-styles';
        style.textContent = `
            .hp-pairing-link-card {
                --hp-pairing-card-bg: #292220;
                --hp-pairing-card-border: #3E3430;
            }
            .hp-pairing-link-card__input:focus-visible {
                outline: none;
            }
            .hp-pairing-link-card__submit:focus-visible {
                outline: 2px solid rgba(255, 91, 62, 0.55);
                outline-offset: 2px;
            }
        `;
        doc.head.appendChild(style);
    }

    injectStyles();

    global.HostPocketPairingLinkCard = {
        MOUNT_SELECTOR,
        PARTIAL_NAME,
        template,
        render,
        mount,
        mountAsync
    };
})(window);
