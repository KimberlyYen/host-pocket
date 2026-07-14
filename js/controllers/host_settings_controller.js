/**
 * Host settings page orchestrator — Stimulus + Turbo Frame (Rails 8 pattern).
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    global.registerHostSettingsController('host-settings', class extends Controller {
        static targets = [
            'formFrame', 'form', 'statusMsg', 'errorMsg', 'basicInfoListingId',
            'extraRecSlots', 'addRecBtn', 'addRecHint'
        ];

        static outlets = ['listing-selector', 'host-preview'];

        static values = {
            initialListing: { type: String, default: '' }
        };

        connect() {
            void global.HostGuideSettings?.isDatabaseAvailable?.();
            this.reloadFormFrame(this.resolveInitialListing());
        }

        maxRecSlots() {
            return global.HostPocketRecSlots?.MAX_REC_SLOTS || 10;
        }

        defaultRecSlots() {
            return global.HostPocketRecSlots?.DEFAULT_REC_SLOTS || 4;
        }

        nextRecSlotIndex() {
            if (!this.hasFormTarget) return this.defaultRecSlots() + 1;
            let highest = this.defaultRecSlots();
            this.formTarget.querySelectorAll('[data-rec-slot], [data-experience-pick-index-value]').forEach((el) => {
                const n = Number(el.getAttribute('data-rec-slot') || el.getAttribute('data-experience-pick-index-value'));
                if (Number.isFinite(n) && n > highest) highest = n;
            });
            // Slots 1–4 live in static partials without data-rec-slot on the outer card.
            for (let i = 1; i <= this.maxRecSlots(); i += 1) {
                if (this.formTarget.querySelector(`[name="recTitle${i}Zh"]`)) {
                    highest = Math.max(highest, i);
                }
            }
            return highest + 1;
        }

        syncAddRecButton() {
            const next = this.nextRecSlotIndex();
            const atMax = next > this.maxRecSlots();
            if (this.hasAddRecBtnTarget) {
                this.addRecBtnTarget.disabled = atMax;
                this.addRecBtnTarget.classList.toggle('opacity-40', atMax);
                this.addRecBtnTarget.classList.toggle('pointer-events-none', atMax);
            }
            if (this.hasAddRecHintTarget) {
                this.addRecHintTarget.textContent = atMax
                    ? '已達上限（景點 10）'
                    : `可新增至景點 ${this.maxRecSlots()}`;
            }
        }

        appendRecSlot(slot) {
            const n = Number(slot);
            if (!Number.isFinite(n) || n < 5 || n > this.maxRecSlots()) return false;
            if (!this.hasFormTarget) return false;
            if (this.formTarget.querySelector(`[name="recTitle${n}Zh"]`)) return false;

            const html = global.HostPocketRecSlots?.buildExperiencePickHtml?.(n);
            if (!html) return false;

            const mount = this.hasExtraRecSlotsTarget
                ? this.extraRecSlotsTarget
                : this.formTarget.querySelector('[data-host-settings-target="extraRecSlots"]');

            if (mount) {
                mount.insertAdjacentHTML('beforeend', html);
            } else {
                const actions = this.formTarget.querySelector('[data-host-settings-target="statusMsg"]')?.closest('div');
                if (actions) actions.insertAdjacentHTML('beforebegin', html);
                else this.formTarget.insertAdjacentHTML('beforeend', html);
            }

            this.syncAddRecButton();
            return true;
        }

        ensureExtraRecSlots(data) {
            const needed = global.HostPocketRecSlots?.highestFilledRecSlot?.(data, this.maxRecSlots())
                || this.defaultRecSlots();
            for (let i = this.defaultRecSlots() + 1; i <= needed; i += 1) {
                this.appendRecSlot(i);
            }
            this.syncAddRecButton();
        }

        addRecSlot() {
            const next = this.nextRecSlotIndex();
            if (next > this.maxRecSlots()) {
                this.showError(`最多只能設定 ${this.maxRecSlots()} 個推薦景點`);
                return;
            }
            if (!this.appendRecSlot(next)) return;
            const panel = this.formTarget.querySelector(`[data-rec-slot="${next}"] details`);
            if (panel) panel.open = true;
            panel?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
            this.showStatus(`已新增推薦地點 ${next}`);
        }

        resolveInitialListing() {
            if (this.initialListingValue) return this.initialListingValue;
            if (this.hasListingSelectorOutlet) return this.listingSelectorOutlet.getValue();
            const params = new URLSearchParams(global.location.search);
            return params.get('listing') || params.get('id') || 'TAIPEI-CITY';
        }

        formFrameUrl(listingId) {
            const id = global.HostGuideSettings.normalizeListingId(listingId);
            return `/host/settings/${encodeURIComponent(id)}/form`;
        }

        reloadFormFrame(listingId) {
            if (!this.hasFormFrameTarget) return;
            this.pendingListingId = global.HostGuideSettings.normalizeListingId(listingId);
            this.formFrameTarget.src = this.formFrameUrl(this.pendingListingId);
        }

        async handleFrameMissing(event) {
            event.preventDefault();
            await this.renderFormClientSide(this.pendingListingId || this.resolveInitialListing());
        }

        async handleFrameLoad() {
            const listingId = this.pendingListingId || this.resolveInitialListing();
            const id = global.HostGuideSettings.normalizeListingId(listingId);

            global.HostGuideSettings.invalidateCache(id);
            try {
                const data = await this.loadFormData(id);
                requestAnimationFrame(() => {
                    if (this.hasFormTarget) this.fillForm(data);
                    this.syncFormWidgets();
                    if (this.hasBasicInfoListingIdTarget) {
                        this.basicInfoListingIdTarget.textContent = id;
                    }
                });
            } catch (error) {
                console.warn('[host-settings] cache refresh failed', error);
                requestAnimationFrame(() => {
                    this.syncFormWidgets();
                    if (this.hasBasicInfoListingIdTarget) {
                        this.basicInfoListingIdTarget.textContent = id;
                    }
                });
            }
        }

        syncFormWidgets() {
            if (!this.hasFormTarget) return;

            this.formTarget.querySelectorAll('[data-experience-pick-target="imgInput"], [data-experience-pick-target="titleInput"]').forEach((el) => {
                el.dispatchEvent(new Event('input', { bubbles: true }));
            });

            this.formTarget.querySelectorAll('[data-room-gallery-target="galleryText"]').forEach((el) => {
                el.dispatchEvent(new Event('input', { bubbles: true }));
            });

            this.formTarget.dispatchEvent(new CustomEvent('host-settings:form-filled', { bubbles: true }));
        }

        async loadFormData(listingId) {
            const id = global.HostGuideSettings.normalizeListingId(listingId);
            let data = {};

            try {
                const preset = await global.HostSettingsPresets.fetchPreset(id);
                data = { ...preset.data };
            } catch {
                // preset optional for custom listing IDs
            }

            global.HostGuideSettings.invalidateCache(id);
            const overrides = await global.HostGuideSettings.ensureLoaded(id);
            const cleaned = global.HostGuideSettings.stripLegacyDemoRecOverrides(id, overrides);
            if (cleaned) {
                data = global.HostGuideSettings.merge(data, cleaned);
            }

            return data;
        }

        async renderFormClientSide(listingId) {
            if (!this.hasFormFrameTarget) return;

            const id = global.HostGuideSettings.normalizeListingId(listingId);
            this.formFrameTarget.removeAttribute('src');
            this.formFrameTarget.innerHTML = '<div class="hp-card p-6 text-center text-xs text-hp-muted" aria-busy="true">載入設定中…</div>';

            try {
                if (!global.PartialsClient) {
                    throw new Error('PartialsClient 未載入');
                }

                const [html, data] = await Promise.all([
                    global.PartialsClient.renderPartial('host_settings/form', {
                        listingId: id,
                        statusMsg: '',
                        errorMsg: '',
                        statusMsgHidden: 'hidden',
                        errorMsgHidden: 'hidden'
                    }),
                    this.loadFormData(id)
                ]);

                this.formFrameTarget.innerHTML = html;

                requestAnimationFrame(() => {
                    if (this.hasFormTarget) this.fillForm(data);
                    if (this.hasBasicInfoListingIdTarget) {
                        this.basicInfoListingIdTarget.textContent = id;
                    }
                });
            } catch (error) {
                console.error('[host-settings] client form render failed', error);
                this.formFrameTarget.innerHTML = `<div class="hp-card p-6 text-center text-xs text-red-600">載入失敗：${error?.message || '未知錯誤'}</div>`;
            }
        }

        getListingId() {
            if (this.hasListingSelectorOutlet) {
                const id = this.listingSelectorOutlet.getValue();
                if (id) return id;
            }

            if (this.pendingListingId) {
                return global.HostGuideSettings.normalizeListingId(this.pendingListingId);
            }

            const input = global.document.getElementById('listingIdInput');
            if (input?.value?.trim()) {
                return global.HostGuideSettings.normalizeListingId(input.value);
            }

            if (this.hasFormTarget) {
                const match = String(this.formTarget.action || '').match(/\/host\/settings\/([^/?#]+)/);
                if (match?.[1]) {
                    return global.HostGuideSettings.normalizeListingId(decodeURIComponent(match[1]));
                }
            }

            return this.resolveInitialListing();
        }

        loadListingFromEvent(event) {
            void this.loadListing(event.detail?.listingId);
        }

        attractionSelected(event) {
            const { index, title } = event.detail || {};
            if (title) {
                this.showStatus(`已帶入景點至推薦 ${index}：${title}`);
            }
        }

        showStatus(text) {
            if (!this.hasStatusMsgTarget) return;
            if (this.hasErrorMsgTarget) this.errorMsgTarget.classList.add('hidden');
            this.statusMsgTarget.textContent = text;
            this.statusMsgTarget.classList.remove('hidden');
        }

        showError(text) {
            if (!this.hasErrorMsgTarget) return;
            if (this.hasStatusMsgTarget) this.statusMsgTarget.classList.add('hidden');
            this.errorMsgTarget.textContent = text;
            this.errorMsgTarget.classList.remove('hidden');
        }

        collapseAllPanels() {
            const root = this.hasFormTarget ? this.formTarget : this.element;
            if (global.HostPocketCollapse?.collapseAll) {
                global.HostPocketCollapse.collapseAll(root);
                return;
            }
            root.querySelectorAll('.hp-collapse[open]').forEach((el) => {
                el.open = false;
            });
        }

        formField(name) {
            if (!this.hasFormTarget) return null;
            const field = this.formTarget.elements.namedItem(name);
            if (field) return field;
            const escaped = typeof CSS !== 'undefined' && CSS.escape
                ? CSS.escape(name)
                : String(name).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            return this.formTarget.querySelector(`[name="${escaped}"]`);
        }

        fillForm(data) {
            if (!this.hasFormTarget) return;

            this.ensureExtraRecSlots(data || {});

            global.HostGuideSettings.EDITABLE_FIELDS.forEach((name) => {
                const el = this.formField(name);
                if (el) el.value = data[name] ?? '';
            });

            const galleryEl = this.formField('roomGalleryText');
            if (galleryEl) {
                const fromGallery = global.HostGuideSettings.galleryToText(data.roomGallery);
                galleryEl.value = fromGallery || (data.roomImg ? String(data.roomImg).trim() : '');
            }

            this.syncFormWidgets();
            this.syncAddRecButton();
        }

        readForm() {
            const data = {};

            if (!this.hasFormTarget) return data;

            global.HostGuideSettings.EDITABLE_FIELDS.forEach((name) => {
                const el = this.formField(name);
                if (el) data[name] = el.value.trim();
            });

            const galleryEl = this.formField('roomGalleryText');
            const gallery = global.HostGuideSettings.parseGalleryText(galleryEl?.value || '');
            if (gallery.length) {
                data.roomGallery = gallery;
                data.roomImg = gallery[0];
            }

            if (data.desc2Zh) {
                data.targetTitleZh = data.recTitle2Zh;
                data.targetTitleEn = data.recTitle2En;
                data.descZh = data.desc2Zh;
                data.descEn = data.desc2En;
                data.explorerDistZh = data.recExplorerDist2Zh || data.recDist2Zh;
                data.explorerDistEn = data.recExplorerDist2En || data.recDist2En;
            }

            return data;
        }

        async loadListing(rawId) {
            const id = global.HostGuideSettings.normalizeListingId(rawId);
            if (!id) {
                this.showError('請輸入房源代碼');
                return;
            }

            if (this.hasListingSelectorOutlet) this.listingSelectorOutlet.setValue(id);

            if (global.AirbnbListing?.isAirbnbNumericId?.(id)) {
                this.showStatus('正在從 Airbnb 帶入房源資料…');
                try {
                    await global.AirbnbListing.seedMissingSettings(id);
                    this.showStatus('已帶入 Airbnb 房源資料（僅填補空白欄位）');
                } catch (error) {
                    console.warn('[host-settings] Airbnb listing seed failed', error);
                    this.showError(error?.message || '無法從 Airbnb 帶入資料，仍可手動填寫');
                }
            }

            this.reloadFormFrame(id);
        }

        beforeSubmit(event) {
            event.preventDefault();
            void this.submitSettings();
        }

        async persistFormSettings() {
            const id = this.getListingId();
            if (!id) {
                throw new Error('請輸入房源代碼');
            }

            await global.HostGuideSettings.isDatabaseAvailable();
            const formData = this.readForm();
            await global.HostGuideSettings.save(id, formData);
            this.writePreviewLocalStorage(id, formData);
            global.HostGuideSettings.invalidateCache(id);

            return {
                id,
                formData,
                mode: global.HostGuideSettings.getStorageMode()
            };
        }

        async submitSettings() {
            try {
                const { id, mode, formData } = await this.persistFormSettings();
                let data = await this.loadFormData(id);
                // Prefer just-saved form values so newly added rec slots stay visible
                // even if a stale API response omitted them.
                if (formData && global.HostGuideSettings?.merge) {
                    data = global.HostGuideSettings.merge(data || {}, formData);
                }
                if (this.hasFormTarget) this.fillForm(data);

                this.showStatus(mode === 'database' ? '已儲存' : '已儲存（本機瀏覽器）');
            } catch (error) {
                console.error(error);
                this.showError(error?.message || '儲存失敗');
            }
        }

        async preview() {
            if (!this.hasHostPreviewOutlet) {
                this.showError('預覽面板未就緒');
                return;
            }

            try {
                const { id } = await this.persistFormSettings();
                this.showStatus('已儲存並開啟預覽');
                this.hostPreviewOutlet.open({ listingId: id });
            } catch (error) {
                console.error(error);
                this.showError(error?.message || '預覽前儲存失敗');
            }
        }

        writePreviewLocalStorage(id, formData) {
            const payload = global.HostGuideSettings.pickEditable(formData || this.readForm());

            if (Array.isArray(formData?.roomGallery) && formData.roomGallery.length) {
                payload.roomGallery = formData.roomGallery;
                payload.roomImg = formData.roomImg || formData.roomGallery[0];
            }

            payload.updatedAt = new Date().toISOString();

            try {
                const all = JSON.parse(global.localStorage.getItem(global.HostGuideSettings.STORAGE_KEY) || '{}');
                all[id] = {
                    ...(all[id] || {}),
                    ...payload,
                    updatedAt: payload.updatedAt
                };
                global.localStorage.setItem(global.HostGuideSettings.STORAGE_KEY, JSON.stringify(all));
                global.HostGuideSettings.invalidateCache(id);
            } catch (error) {
                console.warn('[preview] localStorage write failed', error);
            }
        }

        async reset() {
            const id = this.getListingId();
            if (!id) return;
            if (!global.confirm(`確定清除 ${id} 的自訂設定？`)) return;

            try {
                await global.HostGuideSettings.remove(id);
                this.reloadFormFrame(id);
                this.showStatus(`已清除 ${id} 的自訂設定，恢復預設內容`);
            } catch (error) {
                console.error(error);
                this.showError(error?.message || '清除失敗');
            }
        }
    });
})(window);
