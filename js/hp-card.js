/**
 * Reusable card shell — white bordered panel used across host/admin pages.
 */
(function (global) {
    const ROOT_CLASS = 'hp-card';
    const STACK_CLASS = 'hp-card--stack';
    const DEFAULT_CLASS = `${ROOT_CLASS} ${STACK_CLASS}`;

    function className(options = {}) {
        const parts = [ROOT_CLASS];
        if (options.stack !== false) parts.push(STACK_CLASS);
        if (options.className) parts.push(String(options.className).trim());
        return parts.filter(Boolean).join(' ');
    }

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

    function render(options = {}) {
        const tag = options.tag || 'section';
        const content = options.content ?? options.children ?? '';
        const attrs = {
            class: className({
                stack: options.stack,
                className: options.className
            }),
            ...options.attrs
        };
        if (options.id) attrs.id = options.id;
        const attrString = formatAttrs(attrs);
        return attrString ? `<${tag} ${attrString}>${content}</${tag}>` : `<${tag}>${content}</${tag}>`;
    }

    function injectStyles() {
        const doc = global.document;
        if (!doc || doc.getElementById('hp-card-styles')) return;

        const style = doc.createElement('style');
        style.id = 'hp-card-styles';
        style.textContent = `
            .hp-card {
                background-color: #fff;
                border: 1px solid #EBE5DF;
                border-radius: 1rem;
                padding: 1.25rem;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            }
            .hp-card--stack > :not([hidden]) ~ :not([hidden]) {
                margin-top: 1rem;
            }
        `;
        doc.head.appendChild(style);
    }

    global.HostPocketCard = {
        ROOT_CLASS,
        STACK_CLASS,
        DEFAULT_CLASS,
        className,
        render,
        injectStyles
    };

    injectStyles();
})(window);
