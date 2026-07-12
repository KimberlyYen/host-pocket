(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80';

    global.registerHostSettingsController('attraction-picker', class extends Controller {
        static targets = ['modal', 'backdrop', 'list', 'title', 'subtitle', 'empty'];

        connect() {
            this.pickIndex = null;
            this.onExperiencePickOpen = (event) => this.open(event);
            global.document.addEventListener('experience-pick:open', this.onExperiencePickOpen);
        }

        disconnect() {
            global.document.removeEventListener('experience-pick:open', this.onExperiencePickOpen);
        }

        open(event) {
            const index = event.detail?.index;
            if (!index) return;

            this.pickIndex = index;
            const listingId = this.readListingId();
            const catalog = global.HostSettingsAttractions?.getForListing(listingId);

            if (!catalog?.known) {
                this.titleTarget.textContent = '快速選擇景點';
                this.subtitleTarget.textContent = `Listing「${listingId}」尚無景點範本，請選擇示範主題或手動填寫。`;
                this.listTarget.innerHTML = '';
                this.emptyTarget.classList.remove('hidden');
                this.show();
                return;
            }

            this.titleTarget.textContent = `快速選擇景點 · 推薦 ${index}`;
            this.subtitleTarget.textContent = `${catalog.label}（${listingId}）`;
            this.emptyTarget.classList.add('hidden');
            this.renderList(catalog.attractions);
            this.show();
        }

        readListingId() {
            const input = global.document.getElementById('listingIdInput');
            return global.HostSettingsAttractions?.resolveListingId(input?.value)
                || global.HostGuideSettings?.normalizeListingId(input?.value)
                || 'TAIPEI-CITY';
        }

        renderList(attractions) {
            this.listTarget.innerHTML = attractions.map((item) => `
                <button type="button"
                        class="hp-attraction-item w-full text-left rounded-xl border border-hp-border bg-white p-3 hover:border-hp-coral hover:shadow-sm transition flex gap-3"
                        data-action="click->attraction-picker#select"
                        data-attraction-id="${item.id}">
                    <img src="${this.escapeAttr(item.img)}" alt="" loading="lazy"
                         onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'"
                         class="w-14 h-14 rounded-lg object-cover shrink-0 bg-hp-bgLight">
                    <span class="min-w-0 flex-1">
                        <span class="block text-xs font-black text-hp-dark line-clamp-1">${this.escapeHtml(item.titleZh)}</span>
                        <span class="block text-[10px] text-hp-muted mt-0.5 line-clamp-1">${this.escapeHtml(item.badgeZh)} · ${this.escapeHtml(item.distZh)}</span>
                        <span class="block text-[10px] font-bold text-hp-coral mt-1">${this.escapeHtml(item.priceZh)}</span>
                    </span>
                </button>
            `).join('');
        }

        select(event) {
            const button = event.currentTarget;
            const id = button.dataset.attractionId;
            const listingId = this.readListingId();
            const catalog = global.HostSettingsAttractions.getForListing(listingId);
            const attraction = catalog.attractions.find((item) => item.id === id);
            if (!attraction || !this.pickIndex) return;

            this.applyToForm(this.pickIndex, attraction);
            this.close();
            this.notifySelected(attraction);
        }

        applyToForm(index, attraction) {
            const form = global.document.querySelector('[data-host-settings-target="form"]');
            if (!form) return;

            const fields = global.HostSettingsAttractions.toFormFields(index, attraction);
            Object.entries(fields).forEach(([name, value]) => {
                const el = form.elements.namedItem(name);
                if (!el) return;
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            });
        }

        notifySelected(attraction) {
            const hostSettings = global.document.querySelector('[data-controller~="host-settings"]');
            if (!hostSettings) return;

            hostSettings.dispatchEvent(new CustomEvent('host-settings:attraction-selected', {
                bubbles: true,
                detail: {
                    index: this.pickIndex,
                    title: attraction.titleZh
                }
            }));
        }

        show() {
            this.modalTarget.classList.add('is-open');
            this.modalTarget.setAttribute('aria-hidden', 'false');
            global.document.body.classList.add('hp-attraction-picker-open');
        }

        close() {
            this.modalTarget.classList.remove('is-open');
            this.modalTarget.setAttribute('aria-hidden', 'true');
            global.document.body.classList.remove('hp-attraction-picker-open');
            this.pickIndex = null;
        }

        closeOnEscape(event) {
            if (event.key !== 'Escape') return;
            if (!this.modalTarget.classList.contains('is-open')) return;
            this.close();
        }

        closeOnBackdrop(event) {
            if (event.target === this.backdropTarget) this.close();
        }

        escapeHtml(value) {
            return String(value ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        }

        escapeAttr(value) {
            return this.escapeHtml(value).replace(/'/g, '&#39;');
        }
    });
})(window);
