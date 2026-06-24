/**
 * Airbnb Experience Details API layer (SearchAPI-compatible shape).
 * Set window.SEARCHAPI_KEY to fetch live data; otherwise uses local fixtures.
 */
(function (global) {
    const IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
    const IMG_ONERROR = `this.onerror=null;this.src='${IMAGE_FALLBACK}'`;

    const DEMO_VIDEOS = {
        '5829101': 'https://videos.pexels.com/video-files/5637865/5637865-hd_1920_1080_25fps.mp4',
        '5829102': 'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4',
        '3310245': 'https://videos.pexels.com/video-files/5637865/5637865-hd_1920_1080_25fps.mp4',
        '3310246': 'https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4',
        '4410201': 'https://videos.pexels.com/video-files/6981411/6981411-hd_1920_1080_25fps.mp4',
        '4410202': 'https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_25fps.mp4',
        '5510301': 'https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4',
        '5510302': 'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4',
        default: 'https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_25fps.mp4'
    };

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
                { id: '6785604', title: 'Fast-Access Thames River Cruise', link: 'https://www.airbnb.com/experiences/6785604', category: 'Landmarks', rating: 4.68, reviews: 302, price: 'From £22, per guest', extracted_price: 22, duration: '1h', location: 'London', images: ['https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80'] }
            ],
            i18n: {
                zh: {
                    title: '博羅市場週末早午餐',
                    description: '跟著在地嚮導品嚐現烤酸種麵包、英式起司與季節食材，走訪倫敦最經典的博羅市場。',
                    agenda_preamble: 'Emma 建議週六上午 10 點前往，排隊最短、攤位最齊全。',
                    language: '體驗語言：英文',
                    category: '美食與飲品',
                    meeting_point: '博羅市場，倫敦橋',
                    highlights: [
                        { type: 'PROFILE', name: 'Emma 帶隊', description: '肖爾迪奇房東・市集常客' },
                        { type: 'BADGE', name: '小團體', description: '每場最多 8 位旅客' }
                    ],
                    agenda: [
                        { position: 1, title: '博羅市場集合', description: '簡介與發放市集地圖。' },
                        { position: 2, title: '品嚐路線', description: '酸種麵包、起司與 Emma 私藏咖啡店家。' }
                    ],
                    location: { display_label: '倫敦，英國', address: '博羅市場，倫敦 SE1' },
                    price: { price_label: '每位 £18 起', price: '£18', qualifier: '/ 每位' },
                    availability: [
                        { day: '6 月 28 日（六）', duration: '10:00 – 12:00', start_time: '上午 10:00', availability_description: '尚餘 6 位', is_available: true },
                        { day: '6 月 29 日（日）', duration: '10:00 – 12:00', start_time: '上午 10:00', availability_description: '尚餘 4 位', is_available: true }
                    ],
                    accessibility_features: [{ name: '無台階通道' }, { name: '寬敞入口' }],
                    cancellation_policy: { name: '免費取消', description: '開始時間 24 小時前可取消' },
                    host: { about: '倫敦在地人與肖爾迪奇超讚房東，專為房客策劃美食步行。', tagline: '市集 insider・房東' },
                    reviews: [
                        { review_id: 'r1', text: '週六早晨超棒——光酸種麵包那一站就值了！', rating: 5, date: '2 週前', user: { name: 'James', location: '英國曼徹斯特' } },
                        { review_id: 'r2', text: 'Emma 對每個攤商都瞭若指掌，像在地朋友帶路。', rating: 5, date: '1 個月前', user: { name: 'Sophie', location: '法國巴黎' } }
                    ]
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
            i18n: {
                zh: {
                    title: '泰晤士河黃昏河畔漫步',
                    description: '傍晚從倫敦塔橋出發沿河散步，夕陽映在泰晤士河上的經典免費秘境。',
                    language: '體驗語言：英文',
                    category: '戶外活動',
                    meeting_point: '倫敦塔橋',
                    highlights: [{ type: 'BADGE', name: '免費體驗', description: '房東私藏房客免預約費' }],
                    agenda: [{ position: 1, title: '塔橋集合', description: '傍晚 6 點出發，欣賞泰晤士河夕陽。' }],
                    location: { display_label: '倫敦塔橋，倫敦' },
                    price: { price_label: '免費', price: '免費' },
                    availability: [{ day: '每日', duration: '18:00 – 19:30', start_time: '下午 6:00', availability_description: '自由參加', is_available: true }],
                    accessibility_features: [{ name: '大多平坦步道' }],
                    cancellation_policy: { name: '彈性取消', description: '開始前隨時可取消' },
                    host: { about: '傍晚散步是我向房客展示倫敦最喜歡的方式。', tagline: '河畔導覽・房東' },
                    reviews: [{ review_id: 'r3', text: '泰晤士河上的夕陽太夢幻了。', rating: 5, date: '3 天前', user: { name: 'Alex', location: '德國柏林' } }]
                }
            }
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
            i18n: {
                zh: {
                    title: '撫順街傳統早餐與豆漿',
                    description: '週末早上品嚐現炸油條與濃豆漿，本地人排隊的經典早餐路線。',
                    language: '體驗語言：中文',
                    category: '美食與飲品',
                    agenda_preamble: '建議週末早上 8 點前抵達，避開最長人龍。',
                    highlights: [{ type: 'PROFILE', name: 'Mia 帶隊', description: '大安設計複層房東' }],
                    agenda: [{ position: 1, title: '撫順街早餐', description: '現炸油條、豆漿與蛋餅。' }],
                    location: { display_label: '台北，大安' },
                    price: { price_label: '每位 NT$120 起', price: 'NT$120' },
                    availability: [{ day: '週六至週日', duration: '08:00 – 09:30', availability_description: '現場排隊即可', is_available: true }],
                    accessibility_features: [{ name: '街道平面入口' }],
                    cancellation_policy: { name: '免費取消', description: '開始 12 小時前可取消' },
                    host: { about: '每位房客我都會先帶來這條早餐動線。', tagline: '早餐路線・房東' },
                    reviews: [{ review_id: 'r4', text: '就像在地朋友帶路一樣道地。', rating: 5, user: { name: 'Lin', location: '台中' } }]
                }
            }
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
            i18n: {
                zh: {
                    title: '象山步道夕陽看台北 101',
                    description: '傍晚登山約 20 分鐘，夕陽灑在台北 101 上的台北最經典免費秘境。',
                    category: '戶外活動',
                    highlights: [{ type: 'BADGE', name: '免費', description: '公共步道，無需門票' }],
                    agenda: [{ position: 1, title: '下午 5 點登山口集合', description: '記得帶水，約 20 分鐘抵達觀景台。' }],
                    location: { display_label: '台北，象山' },
                    price: { price_label: '免費' },
                    availability: [{ day: '每日', duration: '17:00 – 19:00', availability_description: '晴天最佳', is_available: true }],
                    accessibility_features: [{ name: '階梯陡峭，輪椅無法進入' }],
                    cancellation_policy: { name: '彈性取消', description: '依天氣自行安排' },
                    host: { about: '這個景色是我愛在大安接待房客的原因。', tagline: '夕陽秘境・房東' },
                    reviews: [{ review_id: 'r5', text: '黃昏的台北 101 令人難忘。', rating: 5, user: { name: 'Yuki', location: '日本大阪' } }]
                }
            }
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
            i18n: {
                zh: {
                    title: '特拉凱城堡湖上獨木舟',
                    description: '夏季下午 4 點前在城堡前湖上划獨木舟，光線最佳。',
                    category: '戶外活動',
                    price: { price_label: '每位 €35 起' },
                    location: { display_label: '特拉凱，立陶宛' },
                    availability: [{ day: '週三至週日', duration: '14:00 – 16:00', availability_description: '尚餘 8 位', is_available: true }],
                    accessibility_features: [{ name: '中等體力需求' }],
                    cancellation_policy: { name: '標準取消', description: '開始 48 小時前可取消' },
                    agenda: [{ position: 1, title: '湖上簡介', description: '舊城出發車程 30 分鐘，裝備已含。' }],
                    host: { about: '夏天帶房客上湖是我絕對不會省略的行程。', tagline: '湖上體驗・房東' },
                    reviews: [{ review_id: 'r6', text: '從水面看城堡太震撼了。', rating: 5, user: { name: 'Anna', location: '波蘭華沙' } }]
                }
            }
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
            i18n: {
                zh: {
                    title: '舊城琥珀工藝工作坊',
                    description: '步行 10 分鐘到工作坊，親手打磨琥珀小飾品，需提前一天預約。',
                    category: '藝術與文化',
                    price: { price_label: '每位 €25 起' },
                    location: { display_label: '維爾紐斯舊城' },
                    availability: [{ day: '週二至週六', duration: '11:00 – 13:00', availability_description: '尚餘 5 位', is_available: true }],
                    accessibility_features: [{ name: '歷史建築，樓梯狹窄' }],
                    cancellation_policy: { name: '中等取消', description: '開始 24 小時前可取消' },
                    agenda: [{ position: 1, title: '工作坊介紹', description: '從閣樓公寓步行 10 分鐘。' }],
                    host: { about: '每位房客都會帶走一枚親手打磨的琥珀紀念。', tagline: '工藝體驗・房東' },
                    reviews: [{ review_id: 'r7', text: '親手做的紀念品獨一無二。', rating: 5, user: { name: 'Petra', location: '捷克布拉格' } }]
                }
            }
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
            i18n: {
                zh: {
                    title: '拉帕區森巴之夜體驗',
                    description: '週五晚間街頭森巴與現場音樂，建議 9 點後前往。',
                    category: '夜生活',
                    price: { price_label: '每位 R$80 起' },
                    location: { display_label: '里約，拉帕區' },
                    availability: [{ day: '週五', duration: '21:00 – 00:00', availability_description: '尚餘 12 位', is_available: true }],
                    accessibility_features: [{ name: '現場音樂音量較大' }],
                    cancellation_policy: { name: '嚴格取消', description: '24 小時內不可退款' },
                    agenda: [{ position: 1, title: '拉帕區集合', description: 'Carlos 帶你前往最愛的 samba roda。' }],
                    host: { about: '森巴是我歡迎每位里約房客的方式。', tagline: '夜間體驗・房東' },
                    reviews: [{ review_id: 'r8', text: '現場能量超強，有 Carlos 帶很安心。', rating: 5, user: { name: 'Maria', location: '巴西聖保羅' } }]
                }
            }
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
            i18n: {
                zh: {
                    title: '糖麵包山日出纜車',
                    description: '清晨從科帕卡巴納搭纜車上糖麵包山，俯瞰日出與瓜納巴拉灣。',
                    category: '戶外活動',
                    price: { price_label: '每位 R$120 起' },
                    location: { display_label: '科帕卡巴納，里約' },
                    availability: [{ day: '每日', duration: '06:00 – 08:00', availability_description: '尚餘 6 位', is_available: true }],
                    accessibility_features: [{ name: '纜車可達' }],
                    cancellation_policy: { name: '彈性取消', description: '遇雨天可改期' },
                    agenda: [{ position: 1, title: '纜車上山', description: '從站點出發約 8 分鐘。' }],
                    host: { about: '糖麵包山日出是我給里約房客的第一建議。', tagline: '日出體驗・房東' },
                    reviews: [{ review_id: 'r9', text: '早起完全值得。', rating: 5, user: { name: 'Tom', location: '美國紐約' } }]
                }
            }
        },
        '6785604': {
            i18n: {
                zh: {
                    title: '泰晤士河快速遊船',
                    price: '每位 £22 起',
                    category: '地標'
                }
            }
        }
    };

    function localizePayload(payload, isZh) {
        if (!payload || !isZh) return payload;
        const zh = payload.i18n?.zh;
        if (!zh) return payload;

        const exp = { ...payload.experience };
        ['title', 'description', 'agenda_preamble', 'language', 'category', 'meeting_point'].forEach(key => {
            if (zh[key]) exp[key] = zh[key];
        });
        if (zh.highlights) exp.highlights = zh.highlights;
        if (zh.agenda) exp.agenda = zh.agenda;
        if (zh.location) exp.location = { ...(exp.location || {}), ...zh.location };
        if (zh.price) exp.price = { ...(exp.price || {}), ...zh.price };
        if (zh.availability) exp.availability = zh.availability;
        if (zh.accessibility_features) exp.accessibility_features = zh.accessibility_features;
        if (zh.cancellation_policy) {
            exp.cancellation_policy = { ...(exp.cancellation_policy || {}), ...zh.cancellation_policy };
        }

        const host = zh.host ? { ...(payload.host || {}), ...zh.host } : payload.host;
        const reviews = zh.reviews || payload.reviews;
        const similar_experiences = (payload.similar_experiences || []).map(sim => {
            const simZh = FIXTURES[sim.id]?.i18n?.zh;
            if (!simZh) return sim;
            return {
                ...sim,
                title: simZh.title || sim.title,
                price: (typeof simZh.price === 'string' ? simZh.price : simZh.price?.price_label) || sim.price,
                category: simZh.category || sim.category
            };
        });

        return { ...payload, experience: exp, host, reviews, similar_experiences };
    }

    function escapeHtml(str) {
        return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function normalizeMedia(exp) {
        const items = (exp.media && exp.media.length)
            ? exp.media.filter(m => m?.url)
            : (exp.cover_image ? [{ type: 'image', url: exp.cover_image }] : []);
        if (items.some(m => m.type === 'video')) return items;

        const poster = items.find(m => m.type === 'image')?.url || exp.cover_image || '';
        const videoUrl = DEMO_VIDEOS[exp.id] || DEMO_VIDEOS.default;
        return [{ type: 'video', url: videoUrl, poster }, ...items];
    }

    function renderMediaHero(media, category, isZh) {
        if (!media.length) {
            return `<div class="exp-media-hero h-[calc(100dvh*5/6)] relative shrink-0 bg-hp-bgLight flex items-center justify-center"><i class="fa-solid fa-image text-hp-muted text-2xl"></i></div>`;
        }

        const slides = media.map((item, i) => {
            const active = i === 0;
            const baseClass = `exp-media-slide absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`;
            if (item.type === 'video') {
                return `<div class="${baseClass}" data-exp-media-index="${i}">
                    <video class="exp-media-video w-full h-full object-cover bg-black pointer-events-none" src="${escapeHtml(item.url)}"${item.poster ? ` poster="${escapeHtml(item.poster)}"` : ''} muted playsinline webkit-playsinline loop disablepictureinpicture disableremoteplayback preload="metadata"${active ? ' autoplay' : ''}></video>
                </div>`;
            }
            return `<div class="${baseClass}" data-exp-media-index="${i}">
                <img src="${escapeHtml(item.url)}" alt="" class="w-full h-full object-cover" onerror="${IMG_ONERROR}">
            </div>`;
        }).join('');

        const nav = media.length > 1 ? `
            <button type="button" data-exp-media-prev aria-label="Previous" class="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition active:scale-95">
                <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button type="button" data-exp-media-next aria-label="Next" class="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center transition active:scale-95">
                <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-1 pointer-events-auto">
                ${media.map((_, i) => `<button type="button" data-exp-media-dot="${i}" aria-label="Slide ${i + 1}" class="w-1.5 h-1.5 rounded-full transition ${i === 0 ? 'bg-white scale-110' : 'bg-white/45 hover:bg-white/70'}"></button>`).join('')}
            </div>` : '';

        return `
            <div class="exp-media-hero h-[calc(100dvh*5/6)] relative shrink-0 overflow-hidden bg-black" data-exp-media-count="${media.length}">
                ${slides}
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none z-[15]"></div>
                ${nav}
                <span class="absolute bottom-3 left-4 z-20 bg-white/90 text-hp-dark text-xs font-bold px-2 py-0.5 rounded-md">${escapeHtml(category || (isZh ? '體驗' : 'Experience'))}</span>
                ${media.some(m => m.type === 'video') ? `<span class="absolute top-3 right-4 z-20 bg-black/45 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">${isZh ? '預覽影片' : 'Preview'}</span>` : ''}
            </div>`;
    }

    function initMediaPlayer(root) {
        const hero = root?.querySelector?.('.exp-media-hero');
        if (!hero || hero.dataset.expMediaBound === 'true') return;
        hero.dataset.expMediaBound = 'true';

        const slides = [...hero.querySelectorAll('.exp-media-slide')];
        const dots = [...hero.querySelectorAll('[data-exp-media-dot]')];
        if (!slides.length) return;

        let index = 0;

        const syncSlide = (next) => {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, i) => {
                const active = i === index;
                slide.classList.toggle('opacity-100', active);
                slide.classList.toggle('z-10', active);
                slide.classList.toggle('opacity-0', !active);
                slide.classList.toggle('z-0', !active);
                slide.classList.toggle('pointer-events-none', !active);
                const video = slide.querySelector('video');
                if (!video) return;
                if (active) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('bg-white', i === index);
                dot.classList.toggle('scale-110', i === index);
                dot.classList.toggle('bg-white/45', i !== index);
            });
        };

        hero.querySelector('[data-exp-media-prev]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            syncSlide(index - 1);
        });
        hero.querySelector('[data-exp-media-next]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            syncSlide(index + 1);
        });
        dots.forEach(dot => dot.addEventListener('click', (e) => {
            e.stopPropagation();
            syncSlide(parseInt(dot.dataset.expMediaDot, 10));
        }));

        slides[0]?.querySelector('video')?.play().catch(() => {});
    }

    function pauseMediaPlayer(root) {
        root?.querySelectorAll?.('video').forEach(video => {
            video.pause();
            video.currentTime = 0;
        });
    }

    function preparePanelContext(payload, options = {}) {
        const isZh = options.isZh !== false && (options.isZh ?? ((global.currentLanguage || 'zh') === 'zh'));
        const data = localizePayload(payload, isZh);
        const exp = data.experience || {};
        const host = data.host || {};
        const price = exp.price || {};
        const loc = exp.location || {};
        const cancel = exp.cancellation_policy || {};
        const reqs = exp.guest_requirements || {};
        const media = normalizeMedia(exp);
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

        return {
            isZh, exp, host, price, loc, cancel, media, highlights, agenda,
            availability, reviews, similar, a11y, labels, guestReqText
        };
    }

    function renderDetailContent(ctx) {
        const { isZh, exp, host, price, loc, cancel, highlights, agenda, availability, reviews, similar, a11y, labels, guestReqText } = ctx;

        return `
            <div class="p-5 space-y-4">
                <div>
                    <h2 class="text-md font-extrabold text-hp-dark leading-snug">${escapeHtml(exp.title)}</h2>
                    <div class="flex flex-wrap items-center gap-2 mt-1.5">
                        <span class="text-xs font-bold text-hp-dark">★ ${exp.rating ?? '—'}</span>
                        <span class="text-xs text-hp-muted">(${Number(exp.reviews || 0).toLocaleString()} ${labels.reviewsCount})</span>
                        <span class="text-xs font-bold text-hp-coral">${escapeHtml(price.price_label || price.price || '')}</span>
                        ${price.extracted_price != null && !isZh ? `<span class="text-xs text-hp-muted font-mono">extracted_price: ${price.extracted_price}</span>` : ''}
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
                    ${host.avatar ? `<img src="${escapeHtml(host.avatar)}" alt="" class="w-12 h-12 rounded-full object-cover shrink-0" onerror="${IMG_ONERROR}">` : ''}
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
                                    <span class="text-xs font-bold text-hp-dark">${escapeHtml(r.user?.name || (isZh ? '旅客' : 'Guest'))}</span>
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
                    <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-1 items-start">
                        ${similar.map(s => `
                            <button type="button" data-action="click->dashboard#openSimilarExperience" data-experience-id="${escapeHtml(s.id)}"
                                    class="min-w-[160px] w-[160px] shrink-0 flex flex-col bg-white border border-hp-border rounded-xl overflow-hidden text-left hover:border-hp-coral transition active:scale-[0.98]">
                                ${s.images?.[0] ? `<img src="${escapeHtml(s.images[0])}" alt="" class="w-full h-20 object-cover bg-hp-bgLight shrink-0" onerror="${IMG_ONERROR}">` : `<div class="w-full h-20 bg-hp-bgLight flex items-center justify-center shrink-0"><i class="fa-solid fa-image text-hp-muted text-lg"></i></div>`}
                                <div class="px-2.5 py-2">
                                    <p class="text-xs font-bold text-hp-dark line-clamp-2 leading-snug">${escapeHtml(s.title)}</p>
                                    <p class="text-xs text-hp-muted mt-0.5">★ ${s.rating}${s.price ? ` · ${escapeHtml(s.price)}` : ''}</p>
                                </div>
                            </button>`).join('')}
                    </div>
                </section>` : ''}
            </div>`;
    }

    function renderBookingBar(isZh) {
        return `<div class="px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button type="button" data-action="click->dashboard#openExpBookingCalendar"
                    class="w-full bg-hp-coral hover:bg-hp-coral/90 text-white text-sm font-bold py-3 rounded-xl transition active:scale-[0.98] shadow-md">
                <i class="fa-regular fa-calendar-check mr-1.5"></i>
                ${isZh ? '預定' : 'Book'}
            </button>
        </div>`;
    }

    function renderMapBar(isZh) {
        return `<div class="px-4 py-2.5 border-b border-hp-border bg-white shrink-0 flex items-center gap-2">
            <button type="button" data-action="click->dashboard#openExpDetailMap"
                    class="inline-flex items-center text-xs font-bold text-hp-coral px-2.5 py-1.5 rounded-lg bg-hp-coral/10 border border-hp-coral/20 whitespace-nowrap">
                <i class="fa-solid fa-map-location-dot mr-1"></i>
                ${isZh ? '地圖' : 'Map'}
            </button>
            <button type="button" data-action="click->dashboard#openExpShareSheet"
                    class="inline-flex items-center text-xs font-bold text-hp-dark px-2.5 py-1.5 rounded-lg bg-hp-bgLight border border-hp-border hover:border-hp-coral/40 whitespace-nowrap transition">
                <i class="fa-solid fa-arrow-up-from-bracket mr-1"></i>
                ${isZh ? '分享' : 'Share'}
            </button>
        </div>`;
    }

    function buildShareContext(payload, options = {}) {
        const isZh = options.isZh !== false && (options.isZh ?? ((global.currentLanguage || 'zh') === 'zh'));
        const data = localizePayload(payload, isZh);
        const exp = data.experience || {};
        const loc = exp.location || {};
        const query = encodeURIComponent(loc.display_label || loc.address || exp.meeting_point || exp.title || '');
        const lat = loc.latitude;
        const lng = loc.longitude;
        const mapsUrl = lat != null && lng != null
            ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            : `https://www.google.com/maps/search/?api=1&query=${query}`;
        const shareUrl = exp.link || mapsUrl;
        const shareText = isZh
            ? `我在 host-pocket 發現這個在地體驗：${exp.title}${loc.display_label ? ` · ${loc.display_label}` : ''}`
            : `Check out this experience on host-pocket: ${exp.title}${loc.display_label ? ` · ${loc.display_label}` : ''}`;
        const cover = normalizeMedia(exp)[0]?.url || exp.cover_image || IMAGE_FALLBACK;

        return { isZh, exp, loc, shareUrl, mapsUrl, shareText, cover };
    }

    function renderShareSheet(payload, options = {}) {
        const ctx = buildShareContext(payload, options);
        const { isZh, exp, loc, shareUrl, mapsUrl, shareText, cover } = ctx;
        const labels = isZh ? {
            link: '分享連結', copy: '複製', copied: '已複製',
            openMaps: 'Google 地圖', whatsapp: 'WhatsApp', email: 'Email', more: '更多分享方式'
        } : {
            link: 'Share link', copy: 'Copy', copied: 'Copied',
            openMaps: 'Google Maps', whatsapp: 'WhatsApp', email: 'Email', more: 'More options'
        };
        const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        const mailUrl = `mailto:?subject=${encodeURIComponent(exp.title || 'host-pocket')}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}\n\n${mapsUrl}`)}`;

        return `
            <div class="space-y-4">
                <div class="flex gap-3 bg-white border border-hp-border rounded-2xl p-3 shadow-sm">
                    <img src="${escapeHtml(cover)}" alt="" class="w-16 h-16 rounded-xl object-cover shrink-0 bg-hp-bgLight" onerror="${IMG_ONERROR}">
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-hp-dark leading-snug line-clamp-2">${escapeHtml(exp.title)}</p>
                        ${loc.display_label || loc.address ? `
                        <p class="text-xs text-hp-muted mt-1 flex items-start gap-1">
                            <i class="fa-solid fa-location-dot text-hp-coral mt-0.5 shrink-0"></i>
                            <span class="line-clamp-2">${escapeHtml(loc.display_label || loc.address)}</span>
                        </p>` : ''}
                    </div>
                </div>

                <div class="bg-hp-bgLight border border-hp-border rounded-2xl p-3">
                    <p class="text-[10px] font-extrabold uppercase tracking-wider text-[#8C807A] mb-2">${labels.link}</p>
                    <div class="flex gap-2 items-stretch">
                        <div class="flex-1 min-w-0 bg-white border border-hp-border rounded-xl px-3 py-2.5 text-xs text-hp-dark truncate font-mono">${escapeHtml(shareUrl)}</div>
                        <button type="button" data-action="click->dashboard#copyExpShareLink"
                                class="shrink-0 px-3 py-2.5 rounded-xl bg-hp-dark hover:bg-hp-lightDark text-white text-xs font-bold transition active:scale-95">
                            ${labels.copy}
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-2">
                    <button type="button" data-action="click->dashboard#copyExpShareLink"
                            class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-hp-border transition">
                        <span class="w-11 h-11 rounded-full bg-hp-bgLight border border-hp-border flex items-center justify-center text-hp-dark"><i class="fa-regular fa-copy"></i></span>
                        <span class="text-[10px] font-bold text-hp-dark">${labels.copy}</span>
                    </button>
                    <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer"
                       class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-hp-border transition">
                        <span class="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><i class="fa-brands fa-google"></i></span>
                        <span class="text-[10px] font-bold text-hp-dark text-center leading-tight">${labels.openMaps}</span>
                    </a>
                    <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener noreferrer"
                       class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-hp-border transition">
                        <span class="w-11 h-11 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-600"><i class="fa-brands fa-whatsapp"></i></span>
                        <span class="text-[10px] font-bold text-hp-dark">${labels.whatsapp}</span>
                    </a>
                    <a href="${escapeHtml(mailUrl)}"
                       class="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-hp-border transition">
                        <span class="w-11 h-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><i class="fa-regular fa-envelope"></i></span>
                        <span class="text-[10px] font-bold text-hp-dark">${labels.email}</span>
                    </a>
                </div>

                <button type="button" data-action="click->dashboard#shareExpNative"
                        class="w-full py-3 rounded-xl border border-hp-border bg-white text-xs font-bold text-hp-dark hover:border-hp-coral transition active:scale-[0.99]">
                    <i class="fa-solid fa-share-nodes mr-1.5 text-hp-coral"></i>${labels.more}
                </button>
            </div>`;
    }

    function pad2(n) { return String(n).padStart(2, '0'); }

    function bookingDateKey(year, month, day) {
        return `${year}-${pad2(month)}-${pad2(day)}`;
    }

    function getBookableDateKeys(availability, year, monthIndex) {
        const keys = new Set();
        const month = monthIndex + 1;
        const lastDay = new Date(year, monthIndex + 1, 0).getDate();

        const addDay = (d) => {
            if (d >= 1 && d <= lastDay) keys.add(bookingDateKey(year, month, d));
        };

        const addWeekdayFilter = (allowed) => {
            for (let d = 1; d <= lastDay; d++) {
                if (allowed.includes(new Date(year, monthIndex, d).getDay())) addDay(d);
            }
        };

        (availability || []).forEach(slot => {
            const text = (slot.day || '').toLowerCase();
            if (/daily|每日/.test(text)) {
                for (let d = 1; d <= lastDay; d++) addDay(d);
                return;
            }
            if (/sat.*sun|sun.*sat|weekend|週末|週六.*週日|週六至週日/.test(text)) {
                addWeekdayFilter([0, 6]);
                return;
            }
            if (/wed.*sun|週三.*週日/.test(text)) {
                addWeekdayFilter([0, 3, 4, 5, 6]);
                return;
            }
            if (/tue.*sat|週二.*週六/.test(text)) {
                addWeekdayFilter([2, 3, 4, 5, 6]);
                return;
            }
            if ((/\bfri\b|週五/.test(text)) && !/[–\-]/.test(text)) {
                addWeekdayFilter([5]);
                return;
            }
            const dayMatch = text.match(/(\d{1,2})\s*(?:jun|june|6\s*月)/i)
                || text.match(/(?:6\s*月|jun)\s*(\d{1,2})/i)
                || text.match(/(\d{1,2})\s*(?:日|th)/i);
            if (dayMatch) {
                const d = parseInt(dayMatch[1], 10);
                if (!Number.isNaN(d)) addDay(d);
            }
        });

        if (!keys.size) {
            const ref = new Date(year, monthIndex, 24);
            for (let i = 1; i <= 14; i++) {
                const dt = new Date(ref);
                dt.setDate(ref.getDate() + i);
                if (dt.getMonth() === monthIndex && dt.getFullYear() === year) {
                    addDay(dt.getDate());
                }
            }
        }

        return keys;
    }

    function format12hTime(h, min, isZh) {
        if (isZh) {
            const period = h >= 12 ? '下午' : '上午';
            const h12 = h % 12 || 12;
            return `${period} ${h12}:${pad2(min)}`;
        }
        const ap = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        return `${h12}:${pad2(min)} ${ap}`;
    }

    function parseDurationMinutes(availability) {
        const slot = (availability || [])[0]?.duration || '';
        const m = slot.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
        if (m) {
            const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
            const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
            return Math.max(30, end - start);
        }
        return 120;
    }

    function formatDurationLabel(minutes, isZh) {
        if (minutes % 60 === 0) {
            const h = minutes / 60;
            return isZh ? `${h} 小時` : `${h} hr${h > 1 ? 's' : ''}`;
        }
        return isZh ? `${minutes} 分鐘` : `${minutes} min`;
    }

    function generateHalfHourSlots(availability) {
        const out = [];
        const seen = new Set();
        const ranges = (availability || []).filter(s => s.is_available !== false);
        const sources = ranges.length ? ranges : [{ duration: '10:00 – 12:00' }];
        sources.forEach(src => {
            const text = src.duration || src.start_time || '';
            const m = text.match(/(\d{1,2}):(\d{2})\s*[–\-]\s*(\d{1,2}):(\d{2})/);
            if (!m) {
                if (!seen.has(text)) {
                    seen.add(text);
                    out.push({ value: text, label24: text, label12: text });
                }
                return;
            }
            const start = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
            const end = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
            for (let t = start; t < end; t += 30) {
                const h = Math.floor(t / 60);
                const min = t % 60;
                const label24 = `${pad2(h)}:${pad2(min)}`;
                if (seen.has(label24)) continue;
                seen.add(label24);
                out.push({ value: label24, label24, label12: format12hTime(h, min, false) });
            }
        });
        return out;
    }

    function formatSelectedDayHeader(dateKey, isZh) {
        const parts = dateKey.split('-').map(Number);
        if (parts.length !== 3) return dateKey;
        const [y, m, d] = parts;
        const date = new Date(y, m - 1, d);
        if (isZh) {
            const wd = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][date.getDay()];
            return `${wd} ${pad2(d)}`;
        }
        return date.toLocaleDateString('en', { weekday: 'short', day: '2-digit' });
    }

    const BOOKING_TIMEZONES = [
        { value: 'Asia/Taipei', label: 'Asia/Taipei' },
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
        { value: 'Europe/London', label: 'Europe/London' },
        { value: 'America/New_York', label: 'America/New_York' }
    ];

    function getBookingMeta(payload, options = {}) {
        const isZh = options.isZh !== false && (options.isZh ?? ((global.currentLanguage || 'zh') === 'zh'));
        const data = localizePayload(payload, isZh);
        const exp = data.experience || {};
        const host = data.host || {};
        const availability = exp.availability || [];
        const minutes = parseDurationMinutes(availability);
        return {
            isZh,
            exp,
            host,
            availability,
            title: exp.title || (isZh ? '在地體驗' : 'Experience'),
            hostName: host.name || (isZh ? '體驗達人' : 'Host'),
            hostAvatar: host.avatar || '',
            duration: formatDurationLabel(minutes, isZh),
            durationMinutes: minutes,
            location: exp.meeting_point || exp.location?.display_label || exp.location?.address || (isZh ? '集合地點待確認' : 'Meeting point TBD'),
            timezone: options.timezone || 'Asia/Taipei'
        };
    }

    function renderBookingTimeColumn(availability, selectedDate, isZh, timeFormat) {
        const use24 = timeFormat !== '12';
        const slots = generateHalfHourSlots(availability);
        const fmtBtn = (fmt, label) => {
            const active = timeFormat === fmt;
            return `<button type="button" data-action="click->dashboard#toggleBookingTimeFormat" data-format="${fmt}"
                class="px-2.5 py-1 text-[10px] font-bold rounded-md transition ${active ? 'bg-hp-dark text-white shadow-sm' : 'text-hp-muted hover:text-hp-dark'}">${label}</button>`;
        };

        if (!selectedDate) {
            return `
                <div class="border border-hp-border rounded-2xl bg-white p-4 min-h-[220px] flex flex-col">
                    <p class="text-xs font-bold text-hp-muted mb-3">${isZh ? '時段' : 'Time'}</p>
                    <div class="flex-1 flex items-center justify-center text-center">
                        <p class="text-xs text-hp-muted leading-relaxed">${isZh ? '請先在左側日曆選擇日期' : 'Select a date on the calendar first'}</p>
                    </div>
                </div>`;
        }

        const dayHeader = formatSelectedDayHeader(selectedDate, isZh);
        const slotButtons = slots.map(slot => {
            const label = use24 ? slot.label24 : (isZh ? format12hTime(parseInt(slot.label24.split(':')[0], 10), parseInt(slot.label24.split(':')[1], 10), true) : slot.label12);
            return `<button type="button" data-action="click->dashboard#confirmExpBooking" data-slot="${escapeHtml(slot.value)}"
                class="w-full py-2.5 rounded-xl border border-hp-border bg-hp-bgLight hover:border-hp-coral hover:bg-white text-xs font-bold text-hp-dark transition active:scale-[0.99]">${escapeHtml(label)}</button>`;
        }).join('');

        return `
            <div class="border border-hp-border rounded-2xl bg-white p-4 flex flex-col min-h-[220px]">
                <div class="flex items-center justify-between gap-2 mb-3 shrink-0">
                    <p class="text-sm font-black text-hp-dark">${escapeHtml(dayHeader)}</p>
                    <div class="inline-flex rounded-lg border border-hp-border p-0.5 bg-hp-bgLight shrink-0">
                        ${fmtBtn('12', isZh ? '12 小時' : '12h')}
                        ${fmtBtn('24', isZh ? '24 小時' : '24h')}
                    </div>
                </div>
                <div class="space-y-2 overflow-y-auto hide-scrollbar max-h-[240px] flex-1">${slotButtons}</div>
            </div>`;
    }

    function renderBookingCalendar(payload, options = {}) {
        const meta = getBookingMeta(payload, options);
        const { isZh, exp, host, availability, title, hostName, hostAvatar, duration, location } = meta;
        const timezone = options.timezone || 'Asia/Taipei';
        const timeFormat = options.timeFormat || '24';
        const viewDate = options.viewDate instanceof Date ? new Date(options.viewDate) : new Date(2026, 5, 1);
        const year = viewDate.getFullYear();
        const monthIndex = viewDate.getMonth();
        const selectedDate = options.selectedDate || null;
        const bookable = getBookableDateKeys(availability, year, monthIndex);

        const monthLabel = isZh
            ? `${monthIndex + 1}月 ${year}`
            : viewDate.toLocaleString('en', { month: 'long', year: 'numeric' });
        const weekdays = isZh
            ? ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
            : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        const firstDow = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        let cells = '';
        for (let i = 0; i < firstDow; i++) cells += '<div class="aspect-square"></div>';
        for (let d = 1; d <= daysInMonth; d++) {
            const key = bookingDateKey(year, monthIndex + 1, d);
            const available = bookable.has(key);
            const selected = selectedDate === key;
            const today = year === 2026 && monthIndex === 5 && d === 24;
            cells += `<button type="button" data-action="click->dashboard#selectBookingDate" data-date="${key}"
                ${available ? '' : 'disabled'}
                class="relative aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition
                    ${selected ? 'bg-hp-dark text-white shadow-md scale-105' : available ? 'bg-hp-bgLight border border-hp-border text-hp-dark hover:border-hp-coral hover:bg-white' : 'text-hp-muted/35 cursor-not-allowed'}
                    ${today && !selected ? 'ring-2 ring-hp-coral/40' : ''}">
                ${d}
                ${available && !selected ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-hp-coral"></span>' : ''}
            </button>`;
        }

        const tzOptions = BOOKING_TIMEZONES.map(tz =>
            `<option value="${tz.value}"${tz.value === timezone ? ' selected' : ''}>${tz.label}</option>`
        ).join('');

        const hostAvatarHtml = hostAvatar
            ? `<img src="${escapeHtml(hostAvatar)}" alt="" class="w-8 h-8 rounded-full object-cover shrink-0 border border-hp-border" onerror="${IMG_ONERROR}">`
            : `<div class="w-8 h-8 rounded-full bg-hp-coral/15 text-hp-coral flex items-center justify-center shrink-0 text-xs font-black">${escapeHtml(hostName.charAt(0))}</div>`;

        return `
            <div class="booking-cal-panel space-y-4">
                <!-- 左欄：體驗資訊 -->
                <div class="border border-hp-border rounded-2xl bg-white p-4 space-y-3">
                    <div class="flex items-center gap-2.5">
                        ${hostAvatarHtml}
                        <span class="text-xs font-bold text-hp-muted">${escapeHtml(hostName)}</span>
                    </div>
                    <h2 class="text-sm font-black text-hp-dark leading-snug">${escapeHtml(title)}</h2>
                    <ul class="space-y-2 text-xs text-hp-muted">
                        <li class="flex items-center gap-2.5">
                            <i class="fa-regular fa-clock w-4 text-center text-hp-coral shrink-0"></i>
                            <span>${escapeHtml(duration)}</span>
                        </li>
                        <li class="flex items-start gap-2.5">
                            <i class="fa-solid fa-map-location-dot w-4 text-center text-hp-coral shrink-0 mt-0.5"></i>
                            <span class="leading-relaxed">${escapeHtml(location)}</span>
                        </li>
                        <li class="flex items-center gap-2.5">
                            <i class="fa-solid fa-globe w-4 text-center text-hp-coral shrink-0"></i>
                            <select data-action="change->dashboard#changeBookingTimezone"
                                class="flex-1 min-w-0 bg-hp-bgLight border border-hp-border rounded-lg px-2 py-1.5 text-xs font-semibold text-hp-dark focus:outline-none focus:border-hp-coral">
                                ${tzOptions}
                            </select>
                        </li>
                    </ul>
                </div>

                <!-- 中欄 + 右欄：日曆 & 時段 -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="border border-hp-border rounded-2xl bg-white p-4">
                        <div class="flex items-center justify-between mb-3">
                            <span class="text-sm font-black text-hp-dark">${monthLabel}</span>
                            <div class="flex gap-1">
                                <button type="button" data-action="click->dashboard#prevBookingMonth"
                                        class="w-7 h-7 rounded-lg border border-hp-border flex items-center justify-center text-hp-dark hover:border-hp-coral transition">
                                    <i class="fa-solid fa-chevron-left text-[10px]"></i>
                                </button>
                                <button type="button" data-action="click->dashboard#nextBookingMonth"
                                        class="w-7 h-7 rounded-lg border border-hp-border flex items-center justify-center text-hp-dark hover:border-hp-coral transition">
                                    <i class="fa-solid fa-chevron-right text-[10px]"></i>
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-7 gap-1 mb-1">
                            ${weekdays.map(w => `<div class="text-[10px] font-bold text-hp-muted text-center py-1">${w}</div>`).join('')}
                        </div>
                        <div class="grid grid-cols-7 gap-1">${cells}</div>
                    </div>
                    ${renderBookingTimeColumn(availability, selectedDate, isZh, timeFormat)}
                </div>
            </div>`;
    }

    function renderPanelParts(payload, options = {}) {
        const ctx = preparePanelContext(payload, options);
        return {
            mediaHtml: renderMediaHero(ctx.media, ctx.exp.category, ctx.isZh),
            mapHtml: renderMapBar(ctx.isZh),
            contentHtml: renderDetailContent(ctx),
            bookingHtml: renderBookingBar(ctx.isZh)
        };
    }

    function renderPanel(payload, options = {}) {
        const parts = renderPanelParts(payload, options);
        return parts.mediaHtml + parts.mapHtml + parts.contentHtml + parts.bookingHtml;
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
        renderPanelParts,
        renderBookingCalendar,
        getBookingMeta,
        buildShareContext,
        renderShareSheet,
        initMediaPlayer,
        pauseMediaPlayer,
        getExperienceIdForRec
    };
})(window);
