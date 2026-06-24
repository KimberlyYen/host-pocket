(function () {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-password-toggle]');
        if (!button) return;

        const wrap = button.closest('[data-password-field]');
        const input = wrap?.querySelector('input');
        if (!input) return;

        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';

        const icon = button.querySelector('i');
        if (icon) {
            icon.className = show
                ? 'fa-solid fa-eye-slash text-xs text-hp-muted'
                : 'fa-regular fa-eye text-xs text-hp-muted';
        }

        button.setAttribute('aria-label', show ? '隱藏密碼' : '顯示密碼');
        button.setAttribute('aria-pressed', show ? 'true' : 'false');
    });
})();
