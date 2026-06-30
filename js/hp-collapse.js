/**
 * Reusable collapsible panel — expand/collapse sections with a trigger button.
 */
(function (global) {
    const ROOT_CLASS = 'hp-collapse';
    const TRIGGER_CLASS = 'hp-collapse__trigger';
    const BODY_CLASS = 'hp-collapse__body';

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderTrigger(options = {}) {
        const title = escapeHtml(options.title || '');
        const iconClass = options.iconClass ? escapeHtml(options.iconClass) : '';
        const hint = escapeHtml(options.hint || '房源名稱、Wi‑Fi、照片等');
        const expandLabel = escapeHtml(options.expandLabel || '展開');
        const collapseLabel = escapeHtml(options.collapseLabel || '收合');
        const icon = iconClass ? `<i class="${iconClass} text-hp-coral"></i>` : '';

        return `<summary class="${TRIGGER_CLASS}">
            <span class="hp-collapse__leading min-w-0">
                <span class="text-xs font-black flex items-center gap-2">${icon}${title}</span>
                <span class="hp-collapse__hint">${hint}</span>
            </span>
            <span class="hp-collapse__action" aria-hidden="true">
                <span class="hp-collapse__label-expand">${expandLabel}</span>
                <span class="hp-collapse__label-collapse">${collapseLabel}</span>
                <i class="fa-solid fa-chevron-down hp-collapse__chevron"></i>
            </span>
        </summary>`;
    }

    function render(options = {}) {
        const open = options.open ? ' open' : '';
        const bodyClass = [BODY_CLASS, options.bodyClass].filter(Boolean).join(' ');
        const content = options.content ?? options.children ?? '';
        const attrs = options.id ? ` id="${escapeHtml(options.id)}"` : '';

        return `<details class="${ROOT_CLASS}"${open}${attrs}>
            ${renderTrigger(options)}
            <div class="${escapeHtml(bodyClass)}">${content}</div>
        </details>`;
    }

    function setOpen(root, open) {
        if (!root) return;
        root.open = Boolean(open);
    }

    function isOpen(root) {
        return Boolean(root?.open);
    }

    function bind(root) {
        if (!root || root.dataset.hpCollapseBound === 'true') return root;
        root.dataset.hpCollapseBound = 'true';
        return root;
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-collapse-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-collapse-styles';
        style.textContent = `
            .hp-collapse > summary {
                list-style: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.75rem;
                user-select: none;
            }
            .hp-collapse > summary::-webkit-details-marker { display: none; }
            .hp-collapse__leading {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            .hp-collapse__hint {
                font-size: 10px;
                color: #8C807A;
                line-height: 1.4;
            }
            .hp-collapse__action {
                display: inline-flex;
                align-items: center;
                gap: 0.375rem;
                flex-shrink: 0;
                font-size: 10px;
                font-weight: 700;
                color: #8C807A;
                padding: 0.375rem 0.625rem;
                border-radius: 0.5rem;
                border: 1px solid #EBE5DF;
                background: #FAF8F5;
                transition: border-color 0.2s ease, color 0.2s ease;
            }
            .hp-collapse[open] .hp-collapse__action {
                color: #FF5B3E;
                border-color: rgba(255, 91, 62, 0.35);
                background: rgba(255, 91, 62, 0.05);
            }
            .hp-collapse__label-collapse { display: none; }
            .hp-collapse[open] .hp-collapse__label-expand { display: none; }
            .hp-collapse[open] .hp-collapse__label-collapse { display: inline; }
            .hp-collapse__chevron {
                font-size: 9px;
                transition: transform 0.2s ease;
            }
            .hp-collapse[open] .hp-collapse__chevron { transform: rotate(180deg); }
            .hp-collapse__body {
                margin-top: 1rem;
                padding-top: 0;
                border-top: none;
            }
            .hp-collapse__body.hp-card--stack > :not([hidden]) ~ :not([hidden]) {
                margin-top: 1rem;
            }
            .hp-collapse__peek-value {
                padding: 0.625rem 0.75rem;
                border-radius: 0.75rem;
                border: 1px solid #EBE5DF;
                background: #FAF8F5;
                font-size: 12px;
                color: #8C807A;
                min-height: 2.5rem;
                display: flex;
                align-items: center;
            }
            .hp-card > .hp-collapse {
                margin-top: 0;
                padding-top: 0;
                border-top: none;
            }
        `;
        doc.head.appendChild(style);
    }

    function collapseAll(root) {
        const scope = root && root.querySelectorAll ? root : global.document;
        scope.querySelectorAll(`.${ROOT_CLASS}[open]`).forEach((el) => {
            el.open = false;
        });
    }

    global.HostPocketCollapse = {
        ROOT_CLASS,
        TRIGGER_CLASS,
        BODY_CLASS,
        render,
        renderTrigger,
        setOpen,
        isOpen,
        bind,
        collapseAll,
        injectStyles
    };

    injectStyles();
})(window);
