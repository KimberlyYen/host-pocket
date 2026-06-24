/**
 * Airbnb Experience Details API layer (SearchAPI-compatible shape).
 * Set window.SEARCHAPI_KEY to fetch live data; otherwise uses local fixtures.
 */
(function (global) {
    const FIXTURES = {
        '5829101': {
            experience: {
                id: '5829101',
                title: 'Borough Market Food Walk & Brunch',
                description: 'Sample artisan sourdough, British cheese, and seasonal produce with a local food guide through London\'s oldest market.',
                link: 'https://www.airbnb.com/experiences/5829101',
                product_type: 'EXPERIENCE',
                category: 'Food & Drink',
                rating: 4.92,
                reviews: 1248,
                language: 'Hosted in English.',
                meeting_point: 'Borough Market, London Bridge',
                cover_image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
                media: [
                    { type: 'image', url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80' },
                    { type: 'image', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80' }
                ],
                highlights: [
                    { type: 'PROFILE', name: 'Hosted by Emma', description: 'Shoreditch host & market regular', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
                    { type: 'BADGE', name: 'Small group', description: 'Up to 8 guests per session' }
                ],
                agenda_preamble: 'Emma recommends arriving around 10 AM on Saturdays for the best stalls and shortest queues.',
                agenda: [
                    { position: 1, title: 'Meet at Borough Market', description: 'Quick intro and market map handout.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80' },
                    { position: 2, title: 'Tasting route', description: 'Sourdough, cheese, and coffee at Emma\'s favorite vendors.', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80' }
                ],
                location: { address: 'Borough Market, London SE1', locality: 'London', country: 'United Kingdom', display_label: 'London, UK', latitude: 51.5054, longitude: -0.0902 },
                price: { price_label: 'From £18, per guest', price: '£18', extracted_price: 18, qualifier: '/ guest' },
                availability: [
                    { day: 'Sat, 28 Jun', duration: '10:00 – 12:00', start_time: '10:00 am', availability_description: '6 spots available', is_available: true, remaining_capacity: 6 },
                    { day: 'Sun, 29 Jun', duration: '10:00 – 12:00', start_time: '10:00 am', availability_description: '4 spots available', is_available: true, remaining_capacity: 4 }
                ],
                guest_requirements: { min_age: 12, is_min_age_enabled: true, is_children_allowed: true, children_min_age: 6, children_max_age: 17 },
                accessibility_features: [{ type: 'NO_STAIRS_OR_STEPS', name: 'Step-free access' }, { type: 'WIDE_ENTRANCE', name: 'Wide entrance' }],
                cancellation_policy: { type: 'FLEX_CANCELLATION', name: 'Free cancellation', description: 'Up to 24 hours before start time' }
            },
            host: { id: '220987401', name: 'Emma', profile_link: 'https://www.airbnb.com/users/show/220987401', title: 'Host', about: 'London local and Shoreditch Superhost who curates food walks for guests.', tagline: 'Market insider & host', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
            reviews: [
                { review_id: 'r1', text: 'Perfect Saturday morning — the sourdough stop alone was worth it!', rating: 5, date: '2 weeks ago', user: { name: 'James', location: 'Manchester, UK' } },
                { review_id: 'r2', text: 'Emma knows every vendor. Felt like a local friend showing us around.', rating: 5, date: '1 month ago', user: { name: 'Sophie', location: 'Paris, France' } }
            ],
            similar_experiences: [
                { id: '5829102', title: 'Thames Riverside Photography Walk', link: 'https://www.airbnb.com/experiences/5829102', category: 'Outdoors', rating: 4.88, reviews: 412, price: 'Free', extracted_price: 0, duration: '2h', location: 'London', images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80'] },
                { id: '6785604', title: 'Fast-Access Seine River Cruise', link: 'https://www.airbnb.com/experiences/6785604', category: 'Landmarks', rating: 4.68, reviews: 302, price: 'From £22, per guest', extracted_price: 22, duration: '1h', location: 'London', images: ['https://images.unsplash.com/photo-1480072618760-64360a658a43?auto=format&fit=crop&w=400&q=80'] }
            ],
            i18n: {
                zh: {
                    title: '博羅市場週末早午餐',
                    description: '跟著在地嚮導品嚐現烤酸種麵包、英式起司與季節食材，走訪倫敦最經典的博羅市場。',
                    agenda_preamble: 'Emma 建議週六上午 10 點前往，排隊最短、攤位最齊全。',
                    language: '體驗語言：英文'
                }
            }
        },
        '5829102': {
            experience: {
                id: '5829102',
                title: 'Thames Riverside Sunset Walk',
                description: 'A guided riverside stroll from Tower Bridge at golden hour — London\'s classic free hidden gem with host tips.',
                link: 'https://www.airbnb.com/experiences/5829102',
                category: 'Outdoors',
                rating: 4.88,
                reviews: 412,
                language: 'Hosted in English.',
                meeting_point: 'Tower Bridge, London',
                cover_image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' }],
                highlights: [{ type: 'BADGE', name: 'Free experience', description: 'No booking fee for host-pocket guests' }],
                agenda: [{ position: 1, title: 'Tower Bridge meetup', description: 'Start at 6 PM for sunset over the Thames.' }],
                location: { display_label: 'Tower Bridge, London', latitude: 51.5055, longitude: -0.0754 },
                price: { price_label: 'Free', price: 'Free', extracted_price: 0, qualifier: '' },
                availability: [{ day: 'Daily', duration: '6:00 – 7:30 pm', start_time: '6:00 pm', availability_description: 'Open walk', is_available: true }],
                guest_requirements: { min_age: 0, is_min_age_enabled: false, is_children_allowed: true },
                accessibility_features: [{ type: 'FLAT_SMOOTH', name: 'Mostly flat paths' }],
                cancellation_policy: { name: 'Flexible', description: 'Cancel anytime before start' }
            },
            host: { name: 'Emma', about: 'Evening walks are my favorite way to show guests the city.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r3', text: 'Sunset on the Thames was magical.', rating: 5, date: '3 days ago', user: { name: 'Alex', location: 'Berlin' } }],
            similar_experiences: [{ id: '5829101', title: 'Borough Market Food Walk', rating: 4.92, reviews: 1248, price: 'From £18', extracted_price: 18, images: ['https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '泰晤士河黃昏河畔漫步', description: '傍晚從倫敦塔橋出發沿河散步，夕陽映在泰晤士河上的經典免費秘境。' } }
        },
        '3310245': {
            experience: {
                id: '3310245',
                title: 'Da\'an Classic Breakfast & Soy Milk Tour',
                description: 'Weekend morning queue for youtiao and hot soy milk on Fushun Street — a Taipei local ritual.',
                link: 'https://www.airbnb.com/experiences/3310245',
                category: 'Food & Drink',
                rating: 4.91,
                reviews: 856,
                cover_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' }],
                highlights: [{ type: 'PROFILE', name: 'Hosted by Mia', description: 'Da\'an designer-loft host' }],
                agenda_preamble: 'Best around 8 AM on weekends before the line gets long.',
                agenda: [{ position: 1, title: 'Fushun Street breakfast', description: 'Fresh youtiao, soy milk, and egg crepes.' }],
                location: { display_label: 'Da\'an, Taipei', locality: 'Taipei', country: 'Taiwan' },
                price: { price_label: 'From NT$120, per guest', price: 'NT$120', extracted_price: 120, qualifier: '/ guest' },
                availability: [{ day: 'Sat–Sun', duration: '8:00 – 9:30 am', availability_description: 'Walk-in friendly', is_available: true }],
                guest_requirements: { min_age: 6, is_children_allowed: true },
                accessibility_features: [{ type: 'STREET_LEVEL', name: 'Street-level access' }],
                cancellation_policy: { name: 'Free cancellation', description: 'Up to 12 hours before' }
            },
            host: { name: 'Mia', about: 'I send every guest to this breakfast line first.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r4', text: 'Exactly like a local friend\'s recommendation.', rating: 5, user: { name: 'Lin', location: 'Taichung' } }],
            similar_experiences: [{ id: '3310246', title: 'Xiangshan Sunset & Taipei 101', rating: 4.95, reviews: 2103, price: 'Free', extracted_price: 0, images: ['https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '撫順街傳統早餐與豆漿', description: '週末早上品嚐現炸油條與濃豆漿，本地人排隊的經典早餐路線。' } }
        },
        '3310246': {
            experience: {
                id: '3310246',
                title: 'Xiangshan Trail Sunset & Taipei 101 Views',
                description: 'A 20-minute hike to the viewpoint where Taipei 101 glows at sunset.',
                link: 'https://www.airbnb.com/experiences/3310246',
                category: 'Outdoors',
                rating: 4.95,
                reviews: 2103,
                cover_image: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=800&q=80',
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=800&q=80' }],
                highlights: [{ type: 'BADGE', name: 'Free', description: 'Public trail, no ticket needed' }],
                agenda: [{ position: 1, title: 'Trailhead at 5 PM', description: 'Bring water; ~20 min to the platform.' }],
                location: { display_label: 'Xiangshan, Taipei', locality: 'Taipei', country: 'Taiwan' },
                price: { price_label: 'Free', extracted_price: 0 },
                availability: [{ day: 'Daily', duration: '5:00 – 7:00 pm', availability_description: 'Best clear days', is_available: true }],
                guest_requirements: { min_age: 8, is_children_allowed: true },
                accessibility_features: [{ type: 'STAIRS', name: 'Steep stairs — not wheelchair accessible' }],
                cancellation_policy: { name: 'Flexible', description: 'Weather-dependent self-guided walk' }
            },
            host: { name: 'Mia', about: 'This view is why I love hosting in Da\'an.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r5', text: 'Taipei 101 at dusk — unforgettable.', rating: 5, user: { name: 'Yuki', location: 'Osaka' } }],
            similar_experiences: [{ id: '3310245', title: 'Da\'an Breakfast Tour', rating: 4.91, extracted_price: 120, images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '象山步道夕陽看台北 101', description: '傍晚登山約 20 分鐘，夕陽灑在台北 101 上的台北最經典免費秘境。' } }
        },
        '4410201': {
            experience: {
                id: '4410201',
                title: 'Trakai Castle Lake Kayak',
                description: 'Paddle in front of the island castle — best light before 4 PM in summer.',
                link: 'https://www.airbnb.com/experiences/4410201',
                category: 'Outdoors',
                rating: 4.87,
                reviews: 324,
                cover_image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
                media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80' }],
                price: { price_label: 'From €35, per guest', extracted_price: 35, qualifier: '/ guest' },
                location: { display_label: 'Trakai, Lithuania' },
                availability: [{ day: 'Wed–Sun', duration: '2:00 – 4:00 pm', availability_description: '8 spots', is_available: true }],
                guest_requirements: { min_age: 14, is_children_allowed: false },
                accessibility_features: [{ type: 'PHYSICAL_EFFORT', name: 'Moderate physical effort' }],
                cancellation_policy: { name: 'Standard', description: 'Up to 48 hours before' },
                agenda: [{ position: 1, title: 'Lake briefing', description: '30-min drive from Old Town, gear included.' }]
            },
            host: { name: 'Mindaugas', about: 'Summer on the lake is non-negotiable for my guests.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r6', text: 'Castle views from the water were stunning.', rating: 5, user: { name: 'Anna', location: 'Warsaw' } }],
            similar_experiences: [{ id: '4410202', title: 'Amber Workshop', rating: 4.90, extracted_price: 25, images: ['https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '特拉凱城堡湖上獨木舟', description: '夏季下午 4 點前在城堡前湖上划獨木舟，光線最佳。' } }
        },
        '4410202': {
            experience: {
                id: '4410202',
                title: 'Old Town Amber Workshop',
                description: 'Hands-on amber polishing in a Old Town atelier — book one day ahead.',
                link: 'https://www.airbnb.com/experiences/4410202',
                category: 'Arts & Culture',
                rating: 4.90,
                reviews: 198,
                cover_image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
                price: { price_label: 'From €25, per guest', extracted_price: 25 },
                location: { display_label: 'Vilnius Old Town' },
                availability: [{ day: 'Tue–Sat', duration: '11:00 am – 1:00 pm', availability_description: '5 spots', is_available: true }],
                guest_requirements: { min_age: 10, is_children_allowed: true },
                accessibility_features: [{ type: 'STAIRS', name: 'Historic building — narrow stairs' }],
                cancellation_policy: { name: 'Moderate', description: 'Up to 24 hours before' },
                agenda: [{ position: 1, title: 'Workshop intro', description: '10-min walk from the loft.' }]
            },
            host: { name: 'Mindaugas', about: 'Every guest leaves with a tiny amber keepsake.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r7', text: 'Unique souvenir we made ourselves.', rating: 5, user: { name: 'Petra', location: 'Prague' } }],
            similar_experiences: [{ id: '4410201', title: 'Trakai Kayak', rating: 4.87, extracted_price: 35, images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '舊城琥珀工藝工作坊', description: '步行 10 分鐘到工作坊，親手打磨琥珀小飾品，需提前一天預約。' } }
        },
        '5510301': {
            experience: {
                id: '5510301',
                title: 'Lapa Samba Night Experience',
                description: 'Friday night street samba and live music in Lapa — liveliest after 9 PM.',
                link: 'https://www.airbnb.com/experiences/5510301',
                category: 'Nightlife',
                rating: 4.85,
                reviews: 567,
                cover_image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
                price: { price_label: 'From R$80, per guest', extracted_price: 80 },
                location: { display_label: 'Lapa, Rio de Janeiro' },
                availability: [{ day: 'Fri', duration: '9:00 pm – 12:00 am', availability_description: '12 spots', is_available: true }],
                guest_requirements: { min_age: 18, is_children_allowed: false },
                accessibility_features: [{ type: 'LOUD_MUSIC', name: 'Loud music in venues' }],
                cancellation_policy: { name: 'Strict', description: 'Non-refundable within 24h' },
                agenda: [{ position: 1, title: 'Meet in Lapa', description: 'Carlos walks you to his favorite roda de samba.' }]
            },
            host: { name: 'Carlos', about: 'Samba is how I welcome every guest to Rio.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r8', text: 'Energy was incredible — felt safe with Carlos.', rating: 5, user: { name: 'Maria', location: 'São Paulo' } }],
            similar_experiences: [{ id: '5510302', title: 'Sugarloaf Sunrise', rating: 4.93, extracted_price: 120, images: ['https://images.unsplash.com/photo-1548919973-8162e84749af?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '拉帕區森巴之夜體驗', description: '週五晚間街頭森巴與現場音樂，建議 9 點後前往。' } }
        },
        '5510302': {
            experience: {
                id: '5510302',
                title: 'Sugarloaf Sunrise Cable Car',
                description: 'Leave Copacabana at 6 AM for sunrise over Guanabara Bay.',
                link: 'https://www.airbnb.com/experiences/5510302',
                category: 'Outdoors',
                rating: 4.93,
                reviews: 891,
                cover_image: 'https://images.unsplash.com/photo-1548919973-8162e84749af?auto=format&fit=crop&w=800&q=80',
                price: { price_label: 'From R$120, per guest', extracted_price: 120 },
                location: { display_label: 'Copacabana, Rio' },
                availability: [{ day: 'Daily', duration: '6:00 – 8:00 am', availability_description: '6 spots', is_available: true }],
                guest_requirements: { min_age: 8, is_children_allowed: true },
                accessibility_features: [{ type: 'CABLE_CAR', name: 'Cable car accessible' }],
                cancellation_policy: { name: 'Flexible', description: 'Weather reschedule offered' },
                agenda: [{ position: 1, title: 'Cable car ascent', description: '8-min ride from base station.' }]
            },
            host: { name: 'Carlos', about: 'Sunrise from Sugarloaf is my #1 Rio tip.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
            reviews: [{ review_id: 'r9', text: 'Worth the early wake-up.', rating: 5, user: { name: 'Tom', location: 'New York' } }],
            similar_experiences: [{ id: '5510301', title: 'Lapa Samba Night', rating: 4.85, extracted_price: 80, images: ['https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80'] }],
            i18n: { zh: { title: '糖麵包山日出健行', description: '清晨從科帕卡巴納搭纜車上糖麵包山，俯瞰日出與瓜納巴拉灣。' } }
        }
    };

    function localizePayload(payload, isZh) {
        if (!payload || !isZh || !payload.i18n?.zh) return payload;
        const zh = payload.i18n.zh;
        const exp = { ...payload.experience };
        if (zh.title) exp.title = zh.title;
        if (zh.description) exp.description = zh.description;
        if (zh.agenda_preamble) exp.agenda_preamble = zh.agenda_preamble;
        if (zh.language) exp.language = zh.language;
        return { ...payload, experience: exp };
    }

    function escapeHtml(str) {
        return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function renderPanel(payload, options = {}) {
        const isZh = options.isZh !== false && (options.isZh ?? ((global.currentLanguage || 'zh') === 'zh'));
        const data = localizePayload(payload, isZh);
        const exp = data.experience || {};
        const host = data.host || {};
        const price = exp.price || {};
        const loc = exp.location || {};
        const cancel = exp.cancellation_policy || {};
        const reqs = exp.guest_requirements || {};
        const media = (exp.media && exp.media.length) ? exp.media : (exp.cover_image ? [{ type: 'image', url: exp.cover_image }] : []);
        const hero = media.find(m => m.type === 'image')?.url || exp.cover_image || '';
        const highlights = exp.highlights || [];
        const agenda = exp.agenda || [];
        const availability = exp.availability || [];
        const reviews = data.reviews || [];
        const similar = data.similar_experiences || [];
        const a11y = exp.accessibility_features || [];

        const labels = isZh ? {
            agenda: '行程內容', host: '體驗達人', availability: '近期可預訂', reviews: '旅客評價',
            location: '地點', logistics: '須知與政策', similar: '相似體驗', map: '地圖導航',
            openAirbnb: '在 Airbnb 查看', guestReq: '賓客要求', accessibility: '無障礙設施',
            cancellation: '取消政策', perGuest: '每位房客', reviewsCount: '則評價'
        } : {
            agenda: 'Agenda', host: 'Your host', availability: 'Upcoming availability', reviews: 'Reviews',
            location: 'Location', logistics: 'Good to know', similar: 'Similar experiences', map: 'Map route',
            openAirbnb: 'View on Airbnb', guestReq: 'Guest requirements', accessibility: 'Accessibility',
            cancellation: 'Cancellation', perGuest: 'per guest', reviewsCount: 'reviews'
        };

        const guestReqText = reqs.is_min_age_enabled
            ? (isZh ? `年齡 ${reqs.min_age} 歲以上` : `Ages ${reqs.min_age}+`)
            : (isZh ? '無年齡限制' : 'All ages welcome');

        return `
            <div class="h-44 relative shrink-0">
                <img src="${escapeHtml(hero)}" alt="" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <span class="absolute bottom-3 left-4 bg-white/90 text-hp-dark text-xs font-bold px-2 py-0.5 rounded-md">${escapeHtml(exp.category || 'Experience')}</span>
            </div>
            <div class="p-5 space-y-4">
                <div>
                    <h2 class="text-md font-extrabold text-hp-dark leading-snug">${escapeHtml(exp.title)}</h2>
                    <div class="flex flex-wrap items-center gap-2 mt-1.5">
                        <span class="text-xs font-bold text-hp-dark">★ ${exp.rating ?? '—'}</span>
                        <span class="text-xs text-hp-muted">(${Number(exp.reviews || 0).toLocaleString()} ${labels.reviewsCount})</span>
                        <span class="text-xs font-bold text-hp-coral">${escapeHtml(price.price_label || price.price || '')}</span>
                        ${price.extracted_price != null ? `<span class="text-xs text-hp-muted font-mono">extracted_price: ${price.extracted_price}</span>` : ''}
                    </div>
                    <p class="text-xs text-hp-muted mt-2 leading-relaxed">${escapeHtml(exp.description)}</p>
                    ${exp.link ? `<a href="${escapeHtml(exp.link)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-xs font-bold text-hp-coral mt-2 hover:underline"><i class="fa-brands fa-airbnb"></i> ${labels.openAirbnb}</a>` : ''}
                </div>

                ${highlights.length ? `
                <div class="flex flex-wrap gap-2">
                    ${highlights.map(h => `<span class="text-xs bg-hp-bgLight border border-hp-border rounded-lg px-2.5 py-1.5"><strong>${escapeHtml(h.name)}</strong>${h.description ? ` · ${escapeHtml(h.description)}` : ''}</span>`).join('')}
                </div>` : ''}

                ${exp.agenda_preamble ? `<p class="text-xs text-[#332C2A] bg-hp-coral/5 border border-hp-coral/10 rounded-xl p-3 leading-relaxed">${escapeHtml(exp.agenda_preamble)}</p>` : ''}

                ${agenda.length ? `
                <section>
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#8C807A] mb-2">${labels.agenda}</h3>
                    <ol class="space-y-2">
                        ${agenda.map(step => `
                            <li class="flex gap-3 bg-white border border-hp-border rounded-xl p-3">
                                <span class="w-6 h-6 rounded-full bg-hp-coral text-white text-xs font-black flex items-center justify-center shrink-0">${step.position || ''}</span>
                                <div>
                                    <p class="text-xs font-bold text-hp-dark">${escapeHtml(step.title)}</p>
                                    <p class="text-xs text-hp-muted mt-0.5 leading-relaxed">${escapeHtml(step.description)}</p>
                                </div>
                            </li>`).join('')}
                    </ol>
                </section>` : ''}

                ${host.name ? `
                <section class="flex gap-3 items-start border border-hp-border rounded-2xl p-3 bg-white">
                    ${host.avatar ? `<img src="${escapeHtml(host.avatar)}" alt="" class="w-12 h-12 rounded-full object-cover shrink-0">` : ''}
                    <div>
                        <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#8C807A]">${labels.host}</h3>
                        <p class="text-xs font-bold text-hp-dark mt-0.5">${escapeHtml(host.name)}${host.tagline ? ` · ${escapeHtml(host.tagline)}` : ''}</p>
                        <p class="text-xs text-hp-muted mt-1 leading-relaxed">${escapeHtml(host.about || '')}</p>
                    </div>
                </section>` : ''}

                ${availability.length ? `
                <section>
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#8C807A] mb-2">${labels.availability}</h3>
                    <div class="space-y-2">
                        ${availability.slice(0, 4).map(slot => `
                            <div class="flex justify-between items-center bg-hp-bgLight border border-hp-border rounded-xl px-3 py-2.5">
                                <div>
                                    <p class="text-xs font-bold text-hp-dark">${escapeHtml(slot.day)}</p>
                                    <p class="text-xs text-hp-muted">${escapeHtml(slot.duration || slot.start_time || '')}</p>
                                </div>
                                <span class="text-xs font-bold ${slot.is_available ? 'text-emerald-600' : 'text-hp-muted'}">${escapeHtml(slot.availability_description || '')}</span>
                            </div>`).join('')}
                    </div>
                </section>` : ''}

                ${reviews.length ? `
                <section>
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#8C807A] mb-2">${labels.reviews}</h3>
                    <div class="space-y-2">
                        ${reviews.slice(0, 3).map(r => `
                            <div class="bg-white border border-hp-border rounded-xl p-3">
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-xs font-bold text-hp-dark">${escapeHtml(r.user?.name || 'Guest')}</span>
                                    <span class="text-xs text-hp-coral">★ ${r.rating}</span>
                                </div>
                                <p class="text-xs text-[#332C2A] leading-relaxed">${escapeHtml(r.text || r.highlighted_comment)}</p>
                                ${r.date ? `<p class="text-xs text-hp-muted mt-1">${escapeHtml(r.date)}</p>` : ''}
                            </div>`).join('')}
                    </div>
                </section>` : ''}

                <section>
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#8C807A] mb-2">${labels.logistics}</h3>
                    <div class="grid grid-cols-1 gap-2 text-xs">
                        ${loc.display_label ? `<div class="bg-white border border-hp-border rounded-xl p-3"><span class="font-bold text-hp-dark">${labels.location}:</span> ${escapeHtml(loc.display_label)}${loc.address ? ` · ${escapeHtml(loc.address)}` : ''}</div>` : ''}
                        <div class="bg-white border border-hp-border rounded-xl p-3"><span class="font-bold text-hp-dark">${labels.guestReq}:</span> ${guestReqText}</div>
                        ${a11y.length ? `<div class="bg-white border border-hp-border rounded-xl p-3"><span class="font-bold text-hp-dark">${labels.accessibility}:</span> ${a11y.map(f => escapeHtml(f.name)).join(' · ')}</div>` : ''}
                        ${cancel.name ? `<div class="bg-white border border-hp-border rounded-xl p-3"><span class="font-bold text-hp-dark">${labels.cancellation}:</span> ${escapeHtml(cancel.name)}${cancel.description ? ` — ${escapeHtml(cancel.description)}` : ''}</div>` : ''}
                    </div>
                </section>

                ${similar.length ? `
                <section>
                    <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#8C807A] mb-2">${labels.similar}</h3>
                    <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
                        ${similar.map(s => `
                            <button type="button" data-action="click->dashboard#openSimilarExperience" data-experience-id="${escapeHtml(s.id)}"
                                    class="min-w-[160px] w-[160px] shrink-0 bg-white border border-hp-border rounded-xl overflow-hidden text-left hover:border-hp-coral transition active:scale-[0.98]">
                                ${s.images?.[0] ? `<img src="${escapeHtml(s.images[0])}" alt="" class="w-full h-20 object-cover">` : ''}
                                <div class="p-2.5">
                                    <p class="text-xs font-bold text-hp-dark line-clamp-2 leading-snug">${escapeHtml(s.title)}</p>
                                    <p class="text-xs text-hp-muted mt-0.5">★ ${s.rating} · ${escapeHtml(s.price || '')}</p>
                                </div>
                            </button>`).join('')}
                    </div>
                </section>` : ''}
            </div>`;
    }

    async function fetchDetails(experienceId, options = {}) {
        const id = String(experienceId || '').trim();
        if (!id) return null;
        const apiKey = options.apiKey || global.SEARCHAPI_KEY;
        if (apiKey) {
            try {
                const url = new URL('https://www.searchapi.io/api/v1/search');
                url.searchParams.set('engine', 'airbnb_experience_details');
                url.searchParams.set('experience_id', id);
                url.searchParams.set('api_key', apiKey);
                if (options.currency) url.searchParams.set('currency', options.currency);
                if (options.airbnb_domain) url.searchParams.set('airbnb_domain', options.airbnb_domain);
                const res = await fetch(url.toString());
                if (res.ok) return await res.json();
            } catch (_) { /* fall through to fixtures */ }
        }
        return FIXTURES[id] ? { ...FIXTURES[id], search_parameters: { engine: 'airbnb_experience_details', experience_id: id } } : null;
    }

    function getExperienceIdForRec(guidesDb, listingId, recIndex) {
        const listing = guidesDb?.[listingId];
        if (!listing) return null;
        return recIndex === 1 ? listing.recExperienceId1 : listing.recExperienceId2;
    }

    global.ExperienceDetailsAPI = {
        FIXTURES,
        fetchDetails,
        localizePayload,
        renderPanel,
        getExperienceIdForRec
    };
})(window);
