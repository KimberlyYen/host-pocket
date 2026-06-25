(function (global) {
    function show(_title, _message, _type, _options) {
        // General toasts disabled — use hpShowCopyHint for share copy feedback.
    }

    async function copyText(text) {
        const value = String(text || '');
        if (!value) return false;
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return true;
        }
        const temp = document.createElement('textarea');
        temp.value = value;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed';
        temp.style.left = '-9999px';
        document.body.appendChild(temp);
        temp.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(temp);
        return ok;
    }

    function showCopyHint(message, anchorEl) {
        document.querySelector('.hp-copy-hint')?.remove();

        const hint = document.createElement('div');
        hint.className = 'hp-copy-hint';
        hint.setAttribute('role', 'status');
        hint.textContent = message;

        if (anchorEl?.getBoundingClientRect) {
            const rect = anchorEl.getBoundingClientRect();
            hint.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 48)}px`;
            hint.style.left = `${rect.left + rect.width / 2}px`;
        } else {
            hint.style.top = '50%';
            hint.style.left = '50%';
            hint.style.transform = 'translate(-50%, -50%)';
        }

        document.body.appendChild(hint);
        requestAnimationFrame(() => hint.classList.add('hp-copy-hint--show'));
        window.setTimeout(() => {
            hint.classList.remove('hp-copy-hint--show');
            window.setTimeout(() => hint.remove(), 220);
        }, 1400);
    }

    global.hpTriggerToast = show;
    global.hpCopyText = copyText;
    global.hpShowCopyHint = showCopyHint;
    global.HostPocketToast = { show, copyText, showCopyHint };
})(window);
