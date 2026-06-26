/**
 * Content preset template buttons — Stimulus controller.
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    global.registerHostSettingsController('content-preset-picker', class extends Controller {
        static targets = ['button'];

        setSelected(listingId) {
            const id = String(listingId || '').trim().toUpperCase();
            this.buttonTargets.forEach((btn) => {
                const active = btn.dataset.presetId === id;
                btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
        }

        clearSelected() {
            this.setSelected('');
        }

        async import(event) {
            const btn = event.currentTarget;
            if (!btn || btn.disabled) return;

            const id = btn.dataset.presetId;
            if (!id) return;

            const previous = this.buttonTargets.find((el) => el.getAttribute('aria-pressed') === 'true');
            this.buttonTargets.forEach((el) => el.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            btn.disabled = true;

            try {
                if (!global.HostSettingsPresets?.fetchPreset) {
                    throw new Error('範本模組未載入');
                }

                const preset = await global.HostSettingsPresets.fetchPreset(id);
                this.dispatch('imported', { detail: { preset, listingId: id }, bubbles: true });
            } catch (error) {
                if (previous) previous.setAttribute('aria-pressed', 'true');
                else btn.setAttribute('aria-pressed', 'false');

                this.dispatch('error', { detail: { error, listingId: id }, bubbles: true });
            } finally {
                btn.disabled = false;
            }
        }
    });
})(window);
