/**
 * Host settings page orchestrator — Stimulus + Turbo Frame (Rails 8 pattern).
 */
(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    global.registerHostSettingsController('host-settings', class extends Controller {
        static targets = ['formFrame', 'form', 'statusMsg', 'errorMsg', 'basicInfoListingId'];

        static outlets = ['listingSelector', 'hostPreview'];

        static values = {
            initialListing: { type: String, default: '' }
        };

        connect() {
            this.reloadFormFrame(this.resolveInitialListing());
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
                await global.HostGuideSettings.ensureLoaded(id);
            } catch (error) {
                console.warn('[host-settings] cache refresh failed', error);
            }

            requestAnimationFrame(() => {
                this.syncFormWidgets();
            });
        }

        syncFormWidgets() {
            if (!this.hasFormTarget) return;

            this.formTarget.querySelectorAll('[data-experience-pick-target="imgInput"], [data-experience-pick-target="titleInput"]').forEach((el) => {
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

            const overrides = await global.HostGuideSettings.ensureLoaded(id);
            if (overrides) {
                data = global.HostGuideSettings.merge(data, overrides);
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
            return this.hasListingSelectorOutlet ? this.listingSelectorOutlet.getValue() : '';
        }

        loadListingFromEvent(event) {
            void this.loadListing(event.detail?.listingId);
        }

        attractionSelected(event) {
            const { index, title } = event.detail || {};
            if (title) {
                this.showStatus(`已帶入景點至在地精選 ${index}：${title}`);
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

        fillForm(data) {
            if (!this.hasFormTarget) return;

            global.HostGuideSettings.EDITABLE_FIELDS.forEach((name) => {
                const el = this.formTarget.elements.namedItem(name);
                if (el) el.value = data[name] ?? '';
            });

            const galleryEl = this.formTarget.elements.namedItem('roomGalleryText');
            if (galleryEl) {
                galleryEl.value = global.HostGuideSettings.galleryToText(data.roomGallery);
            }

            this.syncFormWidgets();
        }

        readForm() {
            const data = {};

            if (!this.hasFormTarget) return data;

            global.HostGuideSettings.EDITABLE_FIELDS.forEach((name) => {
                const el = this.formTarget.elements.namedItem(name);
                if (el) data[name] = el.value.trim();
            });

            const galleryEl = this.formTarget.elements.namedItem('roomGalleryText');
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
            this.reloadFormFrame(id);
        }

        async beforeSubmit(event) {
            await global.HostGuideSettings.isDatabaseAvailable();
            if (global.HostGuideSettings.getStorageMode() === 'database') return;

            event.preventDefault();

            const id = this.getListingId();
            if (!id) {
                this.showError('請輸入房源代碼');
                return;
            }

            try {
                await global.HostGuideSettings.save(id, this.readForm());
                this.showStatus('已儲存');
            } catch (error) {
                console.error(error);
                this.showError(error?.message || '儲存失敗');
            }
        }

        preview() {
            const id = this.getListingId();
            if (!id) {
                this.showError('請先載入房源');
                return;
            }

            if (!this.hasHostPreviewOutlet) return;

            this.hostPreviewOutlet.open({
                listingId: id,
                syncPreview: (listingId) => this.syncPreviewToLocalStorage(listingId)
            });
        }

        syncPreviewToLocalStorage(id) {
            const formData = this.readForm();
            const payload = global.HostGuideSettings.pickEditable(formData);

            if (Array.isArray(formData.roomGallery) && formData.roomGallery.length) {
                payload.roomGallery = formData.roomGallery;
                payload.roomImg = formData.roomImg || formData.roomGallery[0];
            }

            payload.updatedAt = new Date().toISOString();

            try {
                const all = JSON.parse(global.localStorage.getItem(global.HostGuideSettings.STORAGE_KEY) || '{}');
                all[id] = payload;
                global.localStorage.setItem(global.HostGuideSettings.STORAGE_KEY, JSON.stringify(all));
            } catch (error) {
                console.warn('[preview] localStorage sync failed', error);
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
