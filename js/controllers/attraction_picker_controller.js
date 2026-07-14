(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    const PAGE_SIZE = 10;
    const NEARBY_DISTANCE_M = 1000;

    const TYPE_META = {
        all: { zh: '全部', en: 'All' },
        attraction: { zh: '景點', en: 'Attractions' },
        restaurant: { zh: '餐廳', en: 'Restaurants' },
        hotel: { zh: '住宿', en: 'Hotels' },
        bus: { zh: '公車站', en: 'Bus' },
        trail: { zh: '步道', en: 'Trails' },
        cycling: { zh: '自行車', en: 'Cycling' },
        event: { zh: '活動', en: 'Events' },
        bike: { zh: 'YouBike', en: 'Bike' },
        metro: { zh: '捷運', en: 'Metro' },
        rail: { zh: '鐵路', en: 'Rail' },
        airport: { zh: '機場', en: 'Airport' },
        port: { zh: '港口', en: 'Port' },
        service: { zh: '服務', en: 'Services' }
    };

    function haversineMeters(lat1, lng1, lat2, lng2) {
        if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
        const toRad = (d) => (d * Math.PI) / 180;
        const R = 6371000;
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
    }

    function formatDistance(meters) {
        if (!Number.isFinite(meters)) {
            return { zh: '附近', en: 'Nearby' };
        }
        if (meters < 1000) {
            const m = Math.round(meters);
            return { zh: `約 ${m} 公尺`, en: `About ${m} m` };
        }
        const km = (meters / 1000).toFixed(1);
        return { zh: `約 ${km} 公里`, en: `About ${km} km` };
    }

    global.registerHostSettingsController('attraction-picker', class extends Controller {
        static targets = [
            'modal', 'backdrop', 'list', 'title', 'subtitle', 'empty',
            'categories', 'status', 'pager', 'pageInfo', 'prevBtn', 'nextBtn', 'search',
            'cancelBtn', 'confirmBtn'
        ];

        connect() {
            this.pickIndex = null;
            this.pendingAttraction = null;
            this.items = [];
            this.category = 'all';
            this.query = '';
            this.page = 1;
            this.origin = null;
            this.source = null;
            this.onExperiencePickOpen = (event) => this.open(event);
            global.document.addEventListener('experience-pick:open', this.onExperiencePickOpen);
        }

        disconnect() {
            global.document.removeEventListener('experience-pick:open', this.onExperiencePickOpen);
        }

        async open(event) {
            const index = Number(event.detail?.index);
            if (!Number.isFinite(index) || index < 1) return;

            this.pickIndex = index;
            this.pendingAttraction = null;
            this.category = 'all';
            this.query = '';
            this.page = 1;
            this.items = [];
            this.origin = null;
            this.source = null;

            this.titleTarget.textContent = `快速選擇景點 · 推薦 ${index}`;
            this.subtitleTarget.textContent = '正在取得附近景點…';
            this.emptyTarget.classList.add('hidden');
            this.listTarget.innerHTML = '';
            if (this.hasSearchTarget) this.searchTarget.value = '';
            this.setStatus('定位並載入 TDX 附近資料中…');
            this.renderCategories([]);
            this.renderPager(0);
            this.syncConfirmButton();
            this.show();

            try {
                const result = await this.loadNearbyItems();
                if (!result.ok) {
                    this.showApiEmpty(result.reason || 'load-failed');
                }
            } catch (error) {
                console.warn('[attraction-picker]', error);
                this.showApiEmpty(error?.message || 'load-failed');
            }

            this.refreshView();
        }

        async loadNearbyItems() {
            const geo = await this.resolveGeolocation();
            if (!geo) {
                return { ok: false, reason: 'no-location' };
            }

            this.origin = { lat: geo.lat, lng: geo.lng };
            // Live Server (5500/etc.) has no API — route through ListingSettingsAPI base (localhost:3000).
            const apiBase = global.ListingSettingsAPI?.getApiBase?.() || '';
            const url = new URL(`${apiBase}/api/tourism/nearby`, global.location.origin);
            url.searchParams.set('X', String(geo.lng));
            url.searchParams.set('Y', String(geo.lat));
            url.searchParams.set('Distance', String(NEARBY_DISTANCE_M));

            const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.ok === false) {
                const hint = (!apiBase && /5500|5501|8080|8000|5173/.test(String(global.location.port || '')))
                    ? '請同時啟動 npm start（:3000），Live Server 無法提供 TDX API'
                    : (data.error || `載入失敗（${response.status}）`);
                this.setStatus(hint);
                return { ok: false, reason: data.error || `http-${response.status}` };
            }

            const rows = this.extractNearbyRows(data);
            this.items = rows
                .map((row) => this.mapNearbyRow(row, geo))
                .filter((item) => item?.titleZh);
            this.source = 'tdx';
            this.subtitleTarget.textContent = `依目前位置 · ${NEARBY_DISTANCE_M}m 內 · ${this.items.length} 筆`;

            if (!this.items.length) {
                return { ok: false, reason: 'empty' };
            }
            return { ok: true };
        }

        extractNearbyRows(data) {
            if (Array.isArray(data?.value) && data.value.length) return data.value;
            const raw = data?.raw && typeof data.raw === 'object' ? data.raw : data;
            const groups = [
                raw?.RelatedAttractions,
                raw?.RelatedRestaurants,
                raw?.RelatedHotels,
                raw?.RelatedTourismServiceSites,
                raw?.RelatedTrails,
                raw?.RelatedCyclingRoutes,
                raw?.RelatedEvents,
                raw?.RelatedBusStations,
                raw?.RelatedBusStops,
                raw?.RelatedBikeStations,
                raw?.RelatedMetroStations
            ];
            const rows = [];
            groups.forEach((list) => {
                if (!Array.isArray(list)) return;
                list.forEach((item) => {
                    if (!item || typeof item !== 'object') return;
                    const type = item.AttractionName ? 'attraction'
                        : item.RestaurantName ? 'restaurant'
                            : item.HotelName ? 'hotel'
                                : item.StationName ? 'bus'
                                    : item.TrailName ? 'trail'
                                        : item.type || 'attraction';
                    rows.push({ ...item, type, name: item.AttractionName || item.RestaurantName
                        || item.HotelName || item.StationName || item.TrailName || item.Name || item.name });
                });
            });
            return rows;
        }

        async resolveGeolocation() {
            if (global.HostPocketGeolocation?.request) {
                // Prefer a live fix when opening the picker so results match the user.
                return global.HostPocketGeolocation.request({ force: true, timeoutMs: 12000 });
            }
            if (!global.navigator?.geolocation) return null;

            return new Promise((resolve) => {
                global.navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        at: Date.now()
                    }),
                    () => resolve(null),
                    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
                );
            });
        }

        showApiEmpty(reason) {
            this.items = [];
            this.source = 'empty';
            if (reason === 'no-location') {
                this.subtitleTarget.textContent = '需要位置權限才能載入附近景點';
                this.setStatus('請允許瀏覽器定位後，再點一次「快速選擇景點」。');
                return;
            }
            if (reason === 'empty') {
                this.subtitleTarget.textContent = `附近 ${NEARBY_DISTANCE_M}m 尚無 TDX 資料`;
                this.setStatus('請稍後再試，或手動填寫推薦地點。');
                return;
            }
            this.subtitleTarget.textContent = '無法從 TDX API 取得資料';
            this.setStatus(typeof reason === 'string' && reason !== 'load-failed'
                ? reason
                : '請確認已設定 TDX_CLIENT_ID／TDX_CLIENT_SECRET，並重新整理後再試。');
        }

        mapNearbyRow(row, geo) {
            const type = row.type || 'attraction';
            const meta = TYPE_META[type] || TYPE_META.attraction;
            // Prefer official TDX name fields (AttractionName / RestaurantName / …).
            const name = String(
                row.AttractionName
                || row.RestaurantName
                || row.HotelName
                || row.TourismServiceName
                || row.TrailName
                || row.RouteName
                || row.EventName
                || row.StationName
                || row.name
                || ''
            ).trim();
            if (!name) return null;

            const id = String(row.id || row.AttractionID || row.RestaurantID
                || row.HotelID || row.StationUID || `${type}-${name}`).trim();
            const lat = Number(row.lat ?? row.PositionLat);
            const lng = Number(row.lng ?? row.PositionLon);
            const meters = haversineMeters(geo.lat, geo.lng, lat, lng);
            const dist = formatDistance(meters);

            return {
                id,
                type,
                attractionName: name,
                experienceId: id ? `tdx:${id}` : '',
                titleZh: name,
                titleEn: name,
                // Cover image is uploaded by the host — never fill from API / stock photos.
                img: '',
                badgeZh: meta.zh,
                badgeEn: meta.en,
                distZh: dist.zh,
                distEn: dist.en,
                priceZh: '',
                priceEn: '',
                descZh: '',
                descEn: '',
                explorerDistZh: dist.zh,
                explorerDistEn: dist.en,
                lat: Number.isFinite(lat) ? lat : null,
                lng: Number.isFinite(lng) ? lng : null,
                _source: 'tdx',
                _meters: meters
            };
        }

        readListingId() {
            const input = global.document.getElementById('listingIdInput');
            return global.HostSettingsAttractions?.resolveListingId(input?.value)
                || global.HostGuideSettings?.normalizeListingId(input?.value)
                || 'TAIPEI-CITY';
        }

        matchQuery(item, query) {
            if (!query) return true;
            const haystack = [
                item.titleZh, item.titleEn, item.attractionName,
                item.badgeZh, item.badgeEn
            ].map((v) => String(v || '').toLowerCase()).join(' ');
            return haystack.includes(query);
        }

        itemsMatchingSearch() {
            const q = String(this.query || '').trim().toLowerCase();
            if (!q) return this.items;
            return this.items.filter((item) => this.matchQuery(item, q));
        }

        filteredItems() {
            const list = this.itemsMatchingSearch();
            if (this.category === 'all') return list;
            return list.filter((item) => item.type === this.category);
        }

        availableCategories() {
            const list = this.itemsMatchingSearch();
            const counts = new Map();
            list.forEach((item) => {
                const key = item.type || 'attraction';
                counts.set(key, (counts.get(key) || 0) + 1);
            });
            const cats = [{ id: 'all', count: list.length }];
            Array.from(counts.entries())
                .sort((a, b) => b[1] - a[1])
                .forEach(([id, count]) => cats.push({ id, count }));
            return cats;
        }

        onSearch(event) {
            this.query = event.currentTarget?.value || '';
            this.page = 1;
            this.refreshView();
        }

        refreshView() {
            const filtered = this.filteredItems();
            const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1);
            if (this.page > totalPages) this.page = totalPages;
            if (this.page < 1) this.page = 1;

            this.renderCategories(this.availableCategories());

            if (!filtered.length) {
                this.listTarget.innerHTML = '';
                this.emptyTarget.classList.remove('hidden');
                const q = String(this.query || '').trim();
                if (q) {
                    this.emptyTarget.textContent = `找不到「${q}」相關景點`;
                    this.setStatus('請換個關鍵字，或切換分類後再試。');
                } else {
                    this.emptyTarget.textContent = this.source === 'empty'
                        ? '目前沒有可選的 API 景點'
                        : '此分類尚無資料';
                    if (this.source === 'tdx') {
                        this.setStatus('附近沒有找到資料，可稍後再試或手動填寫。');
                    }
                }
                this.renderPager(0);
                return;
            }

            this.emptyTarget.classList.add('hidden');
            const start = (this.page - 1) * PAGE_SIZE;
            const pageItems = filtered.slice(start, start + PAGE_SIZE);
            this.renderList(pageItems);
            this.renderPager(filtered.length);

            const from = start + 1;
            const to = start + pageItems.length;
            const q = String(this.query || '').trim();
            const searchNote = q ? ` · 搜尋「${q}」` : '';
            this.setStatus(`顯示第 ${from}–${to} 筆，共 ${filtered.length} 筆（每頁 ${PAGE_SIZE} 筆）${searchNote}`);
        }

        renderCategories(cats) {
            if (!this.hasCategoriesTarget) return;
            if (!cats.length) {
                this.categoriesTarget.innerHTML = '';
                return;
            }

            this.categoriesTarget.innerHTML = cats.map((cat) => {
                const meta = TYPE_META[cat.id] || { zh: cat.id, en: cat.id };
                const active = cat.id === this.category;
                return `
                    <button type="button"
                            class="hp-attraction-cat ${active ? 'is-active' : ''}"
                            data-action="click->attraction-picker#changeCategory"
                            data-category="${this.escapeAttr(cat.id)}"
                            aria-pressed="${active ? 'true' : 'false'}">
                        ${this.escapeHtml(meta.zh)}
                        <span class="hp-attraction-cat__count">${cat.count}</span>
                    </button>
                `;
            }).join('');
        }

        renderList(attractions) {
            const selectedId = this.pendingAttraction ? String(this.pendingAttraction.id) : '';
            this.listTarget.innerHTML = attractions.map((item) => {
                const name = item.attractionName || item.titleZh || '';
                const selected = selectedId && String(item.id) === selectedId;
                return `
                <button type="button"
                        class="hp-attraction-item w-full text-left rounded-xl border border-hp-border bg-white px-3.5 py-3 hover:border-hp-coral hover:shadow-sm transition${selected ? ' is-selected' : ''}"
                        data-action="click->attraction-picker#select"
                        data-attraction-id="${this.escapeAttr(item.id)}"
                        aria-pressed="${selected ? 'true' : 'false'}">
                    <span class="block text-sm font-black text-hp-dark leading-snug">${this.escapeHtml(name)}</span>
                    <span class="block text-[10px] text-hp-muted mt-1">${this.escapeHtml(item.badgeZh)}${item.distZh ? ` · ${this.escapeHtml(item.distZh)}` : ''}</span>
                </button>
            `;
            }).join('');
        }

        syncConfirmButton() {
            if (!this.hasConfirmBtnTarget) return;
            this.confirmBtnTarget.disabled = !this.pendingAttraction;
        }

        renderPager(total) {
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
            if (this.hasPageInfoTarget) {
                this.pageInfoTarget.textContent = total
                    ? `第 ${this.page} / ${totalPages} 頁`
                    : '—';
            }
            if (this.hasPrevBtnTarget) {
                this.prevBtnTarget.disabled = this.page <= 1 || total === 0;
            }
            if (this.hasNextBtnTarget) {
                this.nextBtnTarget.disabled = this.page >= totalPages || total === 0;
            }
            if (this.hasPagerTarget) {
                this.pagerTarget.classList.toggle('hidden', total === 0 && this.source !== 'tdx');
            }
        }

        changeCategory(event) {
            const next = event.currentTarget?.dataset?.category;
            if (!next || next === this.category) return;
            this.category = next;
            this.page = 1;
            this.refreshView();
        }

        prevPage() {
            if (this.page <= 1) return;
            this.page -= 1;
            this.refreshView();
        }

        nextPage() {
            const totalPages = Math.max(1, Math.ceil(this.filteredItems().length / PAGE_SIZE) || 1);
            if (this.page >= totalPages) return;
            this.page += 1;
            this.refreshView();
        }

        select(event) {
            const button = event.currentTarget;
            const id = button.dataset.attractionId;
            const attraction = this.items.find((item) => String(item.id) === String(id));
            if (!attraction || !Number.isFinite(this.pickIndex)) return;

            this.pendingAttraction = attraction;
            this.listTarget.querySelectorAll('.hp-attraction-item').forEach((el) => {
                const on = String(el.dataset.attractionId) === String(id);
                el.classList.toggle('is-selected', on);
                el.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            this.syncConfirmButton();
        }

        async confirmSelection(event) {
            event?.preventDefault?.();
            event?.stopPropagation?.();

            const attraction = this.pendingAttraction;
            const pickIndex = Number(this.pickIndex);
            if (!attraction || !Number.isFinite(pickIndex)) return;
            if (this._confirming) return;
            this._confirming = true;

            if (this.hasConfirmBtnTarget) this.confirmBtnTarget.disabled = true;

            try {
                const host = this.getHostSettingsController();
                if (host?.saveAttractionSelection) {
                    const { mode } = await host.saveAttractionSelection(pickIndex, attraction);
                    const label = attraction?.titleZh ? `「${attraction.titleZh}」` : '';
                    host.showStatus?.(
                        mode === 'database'
                            ? `已帶入並儲存推薦 ${pickIndex}${label}`
                            : `已帶入並儲存推薦 ${pickIndex}${label}（本機瀏覽器）`
                    );
                    this.notifySelected(attraction, { saved: true, mode, index: pickIndex });
                } else {
                    this.applyToForm(pickIndex, attraction);
                    await this.saveSelectionToDb(pickIndex, attraction);
                }
            } catch (error) {
                console.error('[attraction-picker] confirm/save failed', error);
                this.notifySelected(attraction, {
                    saved: false,
                    error: error?.message || '儲存失敗',
                    index: pickIndex
                });
                const host = this.getHostSettingsController();
                host?.showError?.(error?.message || '景點儲存失敗');
            } finally {
                this._confirming = false;
                this.close();
            }
        }

        cancel(event) {
            event?.preventDefault?.();
            event?.stopPropagation?.();
            this.close();
        }

        getHostSettingsController() {
            const el = global.document.querySelector('[data-controller~="host-settings"]');
            if (!el) return null;
            return global.__hpHostSettingsStimulusApp
                ?.getControllerForElementAndIdentifier?.(el, 'host-settings') || null;
        }

        applyToForm(index, attraction) {
            const form = global.document.querySelector('[data-host-settings-target="form"]');
            if (!form) throw new Error('找不到設定表單，無法帶入景點');

            const fields = global.HostSettingsAttractions?.toFormFields?.(index, attraction);
            if (!fields) throw new Error('景點欄位對應失敗');

            Object.entries(fields).forEach(([name, value]) => {
                // Cover image stays empty — hosts upload it themselves.
                if (/^recImg\d+$/.test(name)) return;
                const escaped = typeof CSS !== 'undefined' && CSS.escape
                    ? CSS.escape(name)
                    : String(name).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                let el = form.querySelector(`[name="${escaped}"]`);
                if (!el) {
                    const named = form.elements.namedItem(name);
                    if (named && typeof named.dispatchEvent === 'function') el = named;
                    else if (named && typeof named.length === 'number') el = named[0];
                }
                if (!el || typeof el.dispatchEvent !== 'function') return;
                el.value = value ?? '';
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }

        async saveSelectionToDb(index, attraction) {
            const host = this.getHostSettingsController();
            if (host?.persistFormSettings) {
                const { mode } = await host.persistFormSettings();
                const label = attraction?.titleZh ? `「${attraction.titleZh}」` : '';
                host.showStatus?.(
                    mode === 'database'
                        ? `已帶入並儲存推薦 ${index}${label}`
                        : `已帶入並儲存推薦 ${index}${label}（本機瀏覽器）`
                );
                this.notifySelected(attraction, { saved: true, mode });
                return;
            }

            // Fallback if Stimulus controller is not ready.
            if (!global.HostGuideSettings?.save) {
                throw new Error('儲存模組未載入');
            }
            const id = host?.getListingId?.()
                || global.HostGuideSettings.normalizeListingId(
                    global.document.getElementById('listingIdInput')?.value
                );
            if (!id) throw new Error('請輸入房源代碼');

            const formData = host?.readForm?.() || {};
            if (!Object.keys(formData).length) {
                // Last-resort: merge only the selected attraction fields.
                Object.assign(
                    formData,
                    global.HostSettingsAttractions.toFormFields(index, attraction)
                );
            }
            await global.HostGuideSettings.isDatabaseAvailable?.();
            await global.HostGuideSettings.save(id, formData);
            this.notifySelected(attraction, {
                saved: true,
                mode: global.HostGuideSettings.getStorageMode?.() || 'local'
            });
        }

        notifySelected(attraction, extra = {}) {
            const hostSettings = global.document.querySelector('[data-controller~="host-settings"]');
            if (!hostSettings) return;
            const index = Number(extra.index ?? this.pickIndex);

            hostSettings.dispatchEvent(new CustomEvent('attraction-selected', {
                bubbles: true,
                detail: {
                    title: attraction?.titleZh || '',
                    ...extra,
                    index
                }
            }));
        }

        setStatus(text) {
            if (!this.hasStatusTarget) return;
            this.statusTarget.textContent = text || '';
            this.statusTarget.classList.toggle('hidden', !text);
        }

        show() {
            this.modalTarget.classList.add('is-open');
            this.modalTarget.setAttribute('aria-hidden', 'false');
            global.document.body.classList.add('hp-attraction-picker-open');
        }

        close() {
            const modal = this.hasModalTarget ? this.modalTarget : this.element;
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            global.document.body.classList.remove('hp-attraction-picker-open');
            this.pickIndex = null;
            this.pendingAttraction = null;
            this.syncConfirmButton();
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
