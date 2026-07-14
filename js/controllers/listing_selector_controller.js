/**
 * Listing ID input, demo topics — Stimulus controller (HTML partial in host-settings.html).
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;
    const LAST_LISTING_KEY = 'hp:host-settings:last-listing';

    function readUrlListing() {
        try {
            const params = new URLSearchParams(global.location.search || '');
            return params.get('listing') || params.get('id') || '';
        } catch {
            return '';
        }
    }

    function readStoredListing() {
        try {
            return global.sessionStorage?.getItem(LAST_LISTING_KEY) || '';
        } catch {
            return '';
        }
    }

    function readRecentLocalListing() {
        try {
            return global.HostGuideSettings?.getMostRecentlySavedListingId?.() || '';
        } catch {
            return '';
        }
    }

    function writeStoredListing(id) {
        try {
            if (id) global.sessionStorage?.setItem(LAST_LISTING_KEY, id);
        } catch {
            // ignore quota / private mode
        }
    }

    global.registerHostSettingsController('listing-selector', class extends Controller {
        static targets = ['input'];

        inputEl() {
            if (this.hasInputTarget) return this.inputTarget;
            return this.element.querySelector('[data-listing-selector-target="input"]');
        }

        connect() {
            const input = this.inputEl();
            if (!input) return;

            // Prefer URL / last-used / most recently saved so refresh keeps the edited listing.
            const fromUrl = readUrlListing();
            const fromStore = readStoredListing();
            const fromLocal = readRecentLocalListing();
            const preferred = fromUrl || input.value || fromStore || fromLocal || 'TAIPEI-CITY';
            input.value = this.normalizeId(preferred);
            writeStoredListing(this.normalizeId(input.value));
        }

        normalizeId(id) {
            if (global.AirbnbListing?.parseAirbnbListingId) {
                return global.AirbnbListing.parseAirbnbListingId(id) || 'TAIPEI-CITY';
            }
            if (global.HostGuideSettings?.normalizeListingId) {
                return global.HostGuideSettings.normalizeListingId(id);
            }
            return String(id || '').trim().toUpperCase() || 'TAIPEI-CITY';
        }

        getValue() {
            const input = this.inputEl();
            return input ? this.normalizeId(input.value) : '';
        }

        setValue(id) {
            const input = this.inputEl();
            if (input) {
                input.value = this.normalizeId(id);
                writeStoredListing(input.value);
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
