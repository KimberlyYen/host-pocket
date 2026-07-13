(function (global) {
    if (!global.registerHostSettingsController || typeof Stimulus === 'undefined') return;

    const { Controller } = Stimulus;

    const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=300&q=80';
    const PAGE_SIZE = 10;
    const NEARBY_DISTANCE_M = 2000;

    const TYPE_META = {
        all: { zh: '全部', en: 'All' },
        attraction: { zh: '景點', en: 'Attractions' },
        restaurant: { zh: '餐廳', en: 'Restaurants' },
        hotel: { zh: '住宿', en: 'Hotels' },
        bus: { zh: '公車站', en: 'Bus' },
        trail: { zh: '步道', en: 'Trails' },
        cycling: { zh: '自行車', en: 'Cycling' },
        event: { zh: '活動', en: 'Events' },
        service: { zh: '服務', en: 'Services' },
        template: { zh: '範本', en: 'Templates' }
    };

    const TYPE_IMAGES = {
        attraction: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=300&q=80',
        restaurant: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=300&q=80',
        hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
        bus: 'https://images.unsplash.com/photo-1544620341-5adcce6e85ad?auto=format&fit=crop&w=300&q=80',
        trail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80',
        cycling: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=300&q=80',
        event: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80',
        service: IMAGE_FALLBACK,
        template: IMAGE_FALLBACK
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
            'categories', 'status', 'pager', 'pageInfo', 'prevBtn', 'nextBtn'
        ];

        connect() {
            this.pickIndex = null;
            this.items = [];
            this.category = 'all';
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
            const index = event.detail?.index;
            if (!index) return;

            this.pickIndex = index;
            this.category = 'all';
            this.page = 1;
            this.items = [];
            this.origin = null;
            this.source = null;

            this.titleTarget.textContent = `快速選擇景點 · 推薦 ${index}`;
            this.subtitleTarget.textContent = '正在取得附近景點…';
            this.emptyTarget.classList.add('hidden');
            this.listTarget.innerHTML = '';
            this.setStatus('定位並載入 TDX 附近資料中…');
            this.renderCategories([]);
            this.renderPager(0);
            this.show();

            try {
                const loaded = await this.loadNearbyItems();
                if (!loaded) {
                    this.loadTemplateFallback();
                }
            } catch (error) {
                console.warn('[attraction-picker]', error);
                this.loadTemplateFallback();
            }

            this.refreshView();
        }

        async loadNearbyItems() {
            const geo = await this.resolveGeolocation();
            if (!geo) return false;

            this.origin = { lat: geo.lat, lng: geo.lng };
            const url = new URL('/api/tourism/nearby', global.location.origin);
            url.searchParams.set('X', String(geo.lng));
            url.searchParams.set('Y', String(geo.lat));
            url.searchParams.set('Distance', String(NEARBY_DISTANCE_M));

            const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data.ok === false) {
                this.setStatus(data.error || `載入失敗（${response.status}）`);
                return false;
            }

            const rows = Array.isArray(data.value) ? data.value : [];
            this.items = rows
                .map((row) => this.mapNearbyRow(row, geo))
                .filter((item) => item?.titleZh);
            this.source = 'tdx';
            this.subtitleTarget.textContent = `依目前位置 · ${NEARBY_DISTANCE_M}m 內 · ${this.items.length} 筆`;
            return this.items.length > 0;
        }

        async resolveGeolocation() {
            if (global.HostPocketGeolocation?.request) {
                return global.HostPocketGeolocation.request({ force: false, timeoutMs: 10000 });
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
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                );
            });
        }

        loadTemplateFallback() {
            const listingId = this.readListingId();
            const catalog = global.HostSettingsAttractions?.getForListing(listingId);
            if (!catalog?.known || !catalog.attractions?.length) {
                this.items = [];
                this.source = 'empty';
                this.subtitleTarget.textContent = `Listing「${listingId}」尚無資料，且附近 API 無法載入。`;
                this.setStatus('請允許定位，或改選示範主題後再試。');
                return;
            }

            this.items = catalog.attractions.map((item) => ({
                ...item,
                type: 'template',
                _source: 'template'
            }));
            this.source = 'template';
            this.subtitleTarget.textContent = `${catalog.label} 範本（${listingId}）· 定位／Nearby 不可用時的備援`;
            this.setStatus('已改用示範範本。允許定位後可載入附近真實景點。');
        }

        mapNearbyRow(row, geo) {
            const type = row.type || 'attraction';
            const meta = TYPE_META[type] || TYPE_META.attraction;
            const name = String(row.name || row.AttractionName || row.RestaurantName
                || row.HotelName || row.StationName || '').trim();
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
                experienceId: '',
                titleZh: name,
                titleEn: name,
                img: TYPE_IMAGES[type] || IMAGE_FALLBACK,
                badgeZh: meta.zh,
                badgeEn: meta.en,
                distZh: dist.zh,
                distEn: dist.en,
                priceZh: type === 'attraction' || type === 'trail' ? '免費／現場計價' : '現場計價',
                priceEn: 'Check on site',
                descZh: `附近推薦（TDX）：${name}`,
                descEn: `Nearby tip (TDX): ${name}`,
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

        filteredItems() {
            if (this.category === 'all') return this.items;
            return this.items.filter((item) => item.type === this.category);
        }

        availableCategories() {
            const counts = new Map();
            this.items.forEach((item) => {
                const key = item.type || 'attraction';
                counts.set(key, (counts.get(key) || 0) + 1);
            });
            const cats = [{ id: 'all', count: this.items.length }];
            Array.from(counts.entries())
                .sort((a, b) => b[1] - a[1])
                .forEach(([id, count]) => cats.push({ id, count }));
            return cats;
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
                this.emptyTarget.textContent = this.source === 'empty'
                    ? '目前沒有可選景點'
                    : '此分類尚無資料';
                this.renderPager(0);
                if (this.source === 'tdx') {
                    this.setStatus('附近沒有找到資料，可稍後再試或改用手動填寫。');
                }
                return;
            }

            this.emptyTarget.classList.add('hidden');
            const start = (this.page - 1) * PAGE_SIZE;
            const pageItems = filtered.slice(start, start + PAGE_SIZE);
            this.renderList(pageItems);
            this.renderPager(filtered.length);

            const from = start + 1;
            const to = start + pageItems.length;
            this.setStatus(`顯示第 ${from}–${to} 筆，共 ${filtered.length} 筆（每頁 ${PAGE_SIZE} 筆）`);
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
            this.listTarget.innerHTML = attractions.map((item) => `
                <button type="button"
                        class="hp-attraction-item w-full text-left rounded-xl border border-hp-border bg-white p-3 hover:border-hp-coral hover:shadow-sm transition flex gap-3"
                        data-action="click->attraction-picker#select"
                        data-attraction-id="${this.escapeAttr(item.id)}">
                    <img src="${this.escapeAttr(item.img || IMAGE_FALLBACK)}" alt="" loading="lazy"
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
