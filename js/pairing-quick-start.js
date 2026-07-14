/**
 * Pairing quick-start —「快速開始」預設房源格線 + 編輯住宿指南連結。
 */
(function (global) {
    const MOUNT_SELECTOR = '[data-hp-pairing-quick-start]';

    const PRESETS = [
        {
            id: 'TAIPEI-CITY',
            lang: 'zh',
            icon: 'fa-city',
            primaryZh: '台北',
            primaryEn: 'Taipei',
            secondaryZh: '信義區天空盒',
            secondaryEn: 'Xinyi skyline stay'
        },
        {
            id: 'UK-LONDON',
            lang: 'en',
            icon: 'fa-landmark',
            primaryZh: '英國',
            primaryEn: 'UK',
            secondaryZh: '倫敦',
            secondaryEn: 'London'
        },
        {
            id: 'VILNIUS-OLDTOWN',
            lang: 'en',
            icon: 'fa-archway',
            primaryZh: '立陶宛',
            primaryEn: 'Lithuania',
            secondaryZh: '維爾紐斯',
            secondaryEn: 'Vilnius'
        },
        {
            id: 'RIO-COPACABANA',
            lang: 'en',
            icon: 'fa-umbrella-beach',
            primaryZh: '巴西',
            primaryEn: 'Brazil',
            secondaryZh: '里約',
            secondaryEn: 'Rio'
        }
    ];

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderPresetButton(preset) {
        const id = escapeHtml(preset.id);
        const icon = escapeHtml(preset.icon || 'fa-location-dot');
        const lang = escapeHtml(preset.lang === 'en' ? 'en' : 'zh');
        return `<button type="button" data-action="click->pairing#quickPair" data-id="${id}" data-lang="${lang}"
                class="hp-pairing-quick-start__item bg-hp-lightDark hover:bg-[#2C2422] border border-[#3E3430] text-center py-3.5 px-3 rounded-2xl transition group flex flex-col items-center gap-2 min-h-[5.5rem] active:scale-[0.98]">
            <span class="hp-pairing-quick-start__icon flex shrink-0 w-9 h-9 rounded-xl bg-hp-dark border border-[#3A2F2C] items-center justify-center text-hp-coral group-hover:text-white group-hover:border-hp-coral/40 transition" aria-hidden="true">
                <i class="fa-solid ${icon} text-sm"></i>
            </span>
            <div class="w-full min-w-0">
                <div class="text-xs text-hp-coral font-bold group-hover:text-white leading-snug" data-global-lang="zh">${escapeHtml(preset.primaryZh)}</div>
                <div class="text-xs text-hp-coral font-bold group-hover:text-white leading-snug hidden" data-global-lang="en">${escapeHtml(preset.primaryEn)}</div>
                <div class="text-[11px] text-hp-muted truncate mt-0.5 leading-snug" data-global-lang="zh">${escapeHtml(preset.secondaryZh)}</div>
                <div class="text-[11px] text-hp-muted truncate mt-0.5 leading-snug hidden" data-global-lang="en">${escapeHtml(preset.secondaryEn)}</div>
            </div>
        </button>`;
    }

    function template(options = {}) {
        const presets = options.presets || PRESETS;
        const settingsHref = options.settingsHref || '/host-settings.html';
        const hideHeading = options.hideHeading === true;
        const grid = presets.map(renderPresetButton).join('\n');

        const heading = hideHeading ? '' : `
    <p class="hp-pairing-quick-start__heading text-xs font-bold text-hp-muted uppercase tracking-widest text-center" data-global-lang="zh">快速開始</p>
    <p class="hp-pairing-quick-start__heading text-xs font-bold text-hp-muted uppercase tracking-widest text-center hidden" data-global-lang="en">Quick Start</p>`;

        const sectionClass = hideHeading
            ? 'hp-pairing-quick-start space-y-3 shrink-0'
            : 'hp-pairing-quick-start space-y-3 shrink-0 mt-4';

        const footer = hideHeading ? '' : `
    <div class="hp-pairing-quick-start__footer text-center mt-4 pt-0">
        <a href="${escapeHtml(settingsHref)}"
           data-pairing-target="settingsLink"
           data-hp-require-login="1"
           class="inline-flex items-center gap-2 text-xs font-bold text-hp-muted hover:text-hp-coral transition">
            <i class="fa-solid fa-sliders" aria-hidden="true"></i>
            <span data-global-lang="zh">編輯住宿指南</span>
            <span data-global-lang="en" class="hidden">Edit your guest guide</span>
        </a>
    </div>`;

        return `<section class="${sectionClass}" aria-label="Quick start">${heading}
    <div class="hp-pairing-quick-start__grid grid grid-cols-2 gap-2">
        ${grid}
    </div>${footer}
</section>`;
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
        el.innerHTML = template(options);
        return el.querySelector('.hp-pairing-quick-start') || el.firstElementChild;
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-pairing-quick-start-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-pairing-quick-start-styles';
        style.textContent = `
            .hp-pairing-quick-start__item:focus-visible {
                outline: 2px solid rgba(255, 91, 62, 0.55);
                outline-offset: 2px;
            }
            .hp-pairing-quick-start__icon {
                transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
            }
            .hp-pairing-quick-start__item:hover .hp-pairing-quick-start__icon,
            .hp-pairing-quick-start__item:focus-visible .hp-pairing-quick-start__icon {
                background-color: rgba(255, 91, 62, 0.12);
            }
        `;
        doc.head.appendChild(style);
    }

    injectStyles();

    global.HostPocketPairingQuickStart = {
        MOUNT_SELECTOR,
        PRESETS,
        template,
        mount,
        renderPresetButton
    };
})(window);
