(function (global) {
    function show(_title, _message, _type, _options) {
        // General toasts disabled — use hpShowCopyHint for share copy feedback.
    }

    function copyTextSync(text) {
        const value = String(text || '');
        if (!value) return false;
        const temp = document.createElement('textarea');
        temp.value = value;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        temp.style.top = '0';
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        temp.setSelectionRange(0, value.length);
        let ok = false;
        try {
            ok = document.execCommand('copy');
        } catch {
            ok = false;
        }
        document.body.removeChild(temp);
        return ok;
    }

    async function copyText(text) {
        const value = String(text || '');
        if (!value) return false;
        if (copyTextSync(value)) return true;
        if (navigator.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(value);
                return true;
            } catch {
                return copyTextSync(value);
            }
        }
        return false;
    }

    function showCopyHint(message, anchorEl, options = {}) {
        document.querySelector('.hp-copy-hint')?.remove();

        const hint = document.createElement('div');
        hint.className = 'hp-copy-hint';
        hint.setAttribute('role', 'status');
        hint.setAttribute('aria-live', 'polite');
        hint.textContent = message;

        if (options.centered) {
            hint.classList.add('hp-copy-hint--centered');
        } else if (anchorEl?.getBoundingClientRect) {
            const rect = anchorEl.getBoundingClientRect();
            hint.classList.add('hp-copy-hint--below');
            hint.style.top = `${rect.bottom + 8}px`;
            hint.style.left = `${rect.left + rect.width / 2}px`;
        } else {
            hint.classList.add('hp-copy-hint--centered');
        }

        document.body.appendChild(hint);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => hint.classList.add('hp-copy-hint--show'));
        });
        window.setTimeout(() => {
            hint.classList.remove('hp-copy-hint--show');
            window.setTimeout(() => hint.remove(), 220);
        }, options.durationMs || 1800);
    }

    function showCopyFeedback(message, anchorEl, options = {}) {
        showCopyHint(message, anchorEl, options);
        if (!anchorEl?.classList) return;
        anchorEl.classList.add('hp-copy-btn--copied');
        const ms = options.durationMs || 2000;
        window.clearTimeout(anchorEl._hpCopyFeedbackTimer);
        anchorEl._hpCopyFeedbackTimer = window.setTimeout(() => {
            anchorEl.classList.remove('hp-copy-btn--copied');
        }, ms);
    }

    global.hpTriggerToast = show;
    global.hpCopyText = copyText;
    global.hpCopyTextSync = copyTextSync;
    global.hpShowCopyHint = showCopyHint;
    global.hpShowCopyFeedback = showCopyFeedback;
    global.HostPocketToast = { show, copyText, copyTextSync, showCopyHint, showCopyFeedback };
})(window);
