/**
 * Guest app preview drawer — Stimulus controller.
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    global.registerHostSettingsController('host-preview', class extends Controller {
        static targets = ['drawer', 'closeBtn', 'frame', 'title'];

        close() {
            this.drawerTarget.classList.remove('is-open');
            this.drawerTarget.setAttribute('aria-hidden', 'true');
            global.document.body.classList.remove('hp-preview-open');
            this.frameTarget.src = 'about:blank';
        }

        closeOnEscape(event) {
            if (event.key !== 'Escape') return;
            if (!this.drawerTarget.classList.contains('is-open')) return;
            this.close();
        }

        open({ listingId, syncPreview }) {
            if (typeof syncPreview === 'function') {
                syncPreview(listingId);
            }

            this.titleTarget.textContent = listingId;
            this.frameTarget.src = `/index.html?listing=${encodeURIComponent(listingId)}&preview=1&t=${Date.now()}`;
            this.drawerTarget.classList.add('is-open');
            this.drawerTarget.setAttribute('aria-hidden', 'false');
            global.document.body.classList.add('hp-preview-open');
            this.closeBtnTarget.focus();
        }
    });
})(window);
