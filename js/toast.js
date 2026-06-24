(function (global) {
    let root = null;
    let hideTimer = null;

    const TYPE_STYLES = {
        success: {
            bar: 'bg-emerald-500',
            icon: 'fa-circle-check',
            iconColor: 'text-emerald-600'
        },
        error: {
            bar: 'bg-red-500',
            icon: 'fa-circle-xmark',
            iconColor: 'text-red-600'
        },
        info: {
            bar: 'bg-hp-coral',
            icon: 'fa-circle-info',
            iconColor: 'text-hp-coral'
        }
    };

    function ensureRoot() {
        if (root) return root;
        root = document.createElement('div');
        root.id = 'hp-toast-root';
        root.setAttribute('aria-live', 'polite');
        root.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[min(340px,calc(100vw-2rem))] pointer-events-none';
        document.body.appendChild(root);
        return root;
    }

    function show(title, message, type) {
        const style = TYPE_STYLES[type] || TYPE_STYLES.info;
        const container = ensureRoot();

        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }

        container.innerHTML = '';
        const toast = document.createElement('div');
        toast.className = 'pointer-events-auto bg-white border border-hp-border rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100';
        toast.innerHTML = `
            <div class="h-1 ${style.bar}"></div>
            <div class="flex items-start gap-3 p-4">
                <i class="fa-solid ${style.icon} ${style.iconColor} text-base mt-0.5 shrink-0"></i>
                <div class="min-w-0 flex-1">
                    <p class="text-xs font-black text-hp-dark leading-snug">${escapeHtml(title)}</p>
                    ${message ? `<p class="text-[11px] text-hp-muted mt-1 leading-relaxed whitespace-pre-line">${escapeHtml(message)}</p>` : ''}
                </div>
            </div>`;
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('scale-100');
        });

        hideTimer = setTimeout(() => {
            toast.classList.add('opacity-0', '-translate-y-1');
            setTimeout(() => {
                if (container.contains(toast)) toast.remove();
            }, 300);
        }, type === 'error' ? 6000 : 4500);
    }

    function escapeHtml(text) {
        return String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    global.hpTriggerToast = show;
    global.HostPocketToast = { show };
})(window);
