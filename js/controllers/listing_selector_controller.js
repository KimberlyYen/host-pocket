/**
 * Listing ID input, demo topics — Stimulus controller (HTML partial in host-settings.html).
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    global.registerHostSettingsController('listing-selector', class extends Controller {
        static targets = ['input'];

        connect() {
            if (this.hasInputTarget && !this.inputTarget.value) {
                const params = new URLSearchParams(global.location.search);
                this.inputTarget.value = params.get('listing') || params.get('id') || 'TAIPEI-CITY';
            }
        }

        normalizeId(id) {
            if (global.HostGuideSettings?.normalizeListingId) {
                return global.HostGuideSettings.normalizeListingId(id);
            }
            return String(id || '').trim().toUpperCase() || 'TAIPEI-CITY';
        }

        getValue() {
            return this.hasInputTarget ? this.normalizeId(this.inputTarget.value) : '';
        }

        setValue(id) {
            if (this.hasInputTarget) {
                this.inputTarget.value = this.normalizeId(id);
            }
        }

        load() {
            const listingId = this.getValue();
            if (!listingId) return;

            this.setValue(listingId);
            this.dispatch('load', { detail: { listingId }, bubbles: true });
        }

        selectDemo(event) {
            const id = event.currentTarget?.dataset?.demoId;
            if (!id) return;

            this.setValue(id);
            this.load();
        }
    });
})(window);
