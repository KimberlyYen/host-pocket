/**
 * Guest app preview drawer — Stimulus controller.
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    global.registerHostSettingsController('host-preview', class extends Controller {
        static targets = ['drawer', 'closeBtn', 'frame', 'title', 'langZhBtn', 'langEnBtn'];

        static values = {
            lang: { type: String, default: 'zh' },
            listingId: String
        };

        connect() {
            this.onFrameLoad = this.onFrameLoad.bind(this);
            this.frameTarget.addEventListener('load', this.onFrameLoad);
            this.syncLangButtons();
        }

        disconnect() {
            this.frameTarget.removeEventListener('load', this.onFrameLoad);
        }

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

        open({ listingId }) {
            this.listingIdValue = listingId;
            this.titleTarget.textContent = listingId;
            this.loadPreviewFrame();
            this.drawerTarget.classList.add('is-open');
            this.drawerTarget.setAttribute('aria-hidden', 'false');
            global.document.body.classList.add('hp-preview-open');
            this.syncLangButtons();
            this.closeBtnTarget.focus();
        }

        switchLanguage(event) {
            const lang = event.currentTarget?.dataset?.lang;
            if (lang !== 'zh' && lang !== 'en') return;
            this.langValue = lang;
            this.syncLangButtons();
            this.applyPreviewLanguage(lang);
        }

        loadPreviewFrame() {
            const listingId = this.listingIdValue || '';
            const lang = this.langValue === 'en' ? 'en' : 'zh';
            this.frameTarget.src = `/index.html?listing=${encodeURIComponent(listingId)}&preview=1&lang=${lang}&t=${Date.now()}`;
        }

        onFrameLoad() {
            if (!this.frameTarget.src || this.frameTarget.src === 'about:blank') return;
            this.applyPreviewLanguage(this.langValue === 'en' ? 'en' : 'zh');
        }

        syncLangButtons() {
            const lang = this.langValue === 'en' ? 'en' : 'zh';
            if (this.hasLangZhBtnTarget) {
                this.langZhBtnTarget.classList.toggle('is-active', lang === 'zh');
                this.langZhBtnTarget.setAttribute('aria-pressed', lang === 'zh' ? 'true' : 'false');
            }
            if (this.hasLangEnBtnTarget) {
                this.langEnBtnTarget.classList.toggle('is-active', lang === 'en');
                this.langEnBtnTarget.setAttribute('aria-pressed', lang === 'en' ? 'true' : 'false');
            }
        }

        applyPreviewLanguage(lang) {
            const chosen = lang === 'en' ? 'en' : 'zh';
            const win = this.frameTarget.contentWindow;
            if (!win) return;

            try {
                const app = win.__hpStimulusApp;
                const globalCtrl = app?.getControllerForElementAndIdentifier(win.document.body, 'global');
                if (globalCtrl?.setLanguage) {
                    globalCtrl.setLanguage(chosen, { silent: true, force: true });
                    return;
                }
            } catch (error) {
                console.warn('[host-preview] iframe language switch failed', error);
            }

            try {
                const doc = win.document;
                doc.querySelectorAll('[data-global-lang="zh"]').forEach((el) => {
                    el.classList.toggle('hidden', chosen !== 'zh');
                });
                doc.querySelectorAll('[data-global-lang="en"]').forEach((el) => {
                    el.classList.toggle('hidden', chosen !== 'en');
                });
                win.currentLanguage = chosen;
                win.dispatchEvent(new CustomEvent('hp:v4-lang'));
            } catch (error) {
                console.warn('[host-preview] iframe language fallback failed', error);
            }
        }
    });
})(window);
