(function (global) {
    const CATALOG = {
        'TAIPEI-CITY': {
            label: '台北',
            attractions: [
                {
                    id: 'tw-songshan',
                    experienceId: '3319001',
                    titleZh: '松山文創園區 Indie 設計週末',
                    titleEn: 'Songshan Creative Park Indie Design Weekend',
                    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '設計市集', badgeEn: 'Design Market',
                    distZh: '捷運 12 分鐘可達', distEn: '12 mins by MRT',
                    priceZh: 'NT$200 起', priceEn: 'From NT$200',
                    descZh: '「Lina 推薦週六下午到松山文創，逛獨立選物與在地插畫展，適合雨天的室內路線。」',
                    descEn: 'Lina suggests Songshan Creative Park on Saturday afternoons for indie design shops and illustration exhibits.',
                    explorerDistZh: '捷運 12 分鐘（約 4 公里）', explorerDistEn: '12 mins by MRT (~4 km)'
                },
                {
                    id: 'tw-jiantan',
                    experienceId: '3319002',
                    titleZh: '劍潭山親山步道 · 101 側面夕景',
                    titleEn: 'Jiantan Mountain Trail · 101 Side Sunset',
                    img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '夕景秘境', badgeEn: 'Sunset View',
                    distZh: '步行 18 分鐘可達', distEn: '18 mins on foot',
                    priceZh: '免費', priceEn: 'Free',
                    descZh: '「Lina 在地力薦：傍晚 5 點從劍潭捷運站步行上山，可從側面看 101 亮燈，比象山人少。」',
                    descEn: 'Start from Jiantan MRT around 5 PM for a quieter side view of Taipei 101 lighting up.',
                    explorerDistZh: '步行 18 分鐘（約 1.1 公里）', explorerDistEn: '18 mins walk (~1.1 km)'
                },
                {
                    id: 'tw-treasure-hill',
                    experienceId: '3319003',
                    titleZh: '寶藏巖藝術村茶席體驗',
                    titleEn: 'Treasure Hill Art Village Tea Session',
                    img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '茶席體驗', badgeEn: 'Tea Session',
                    distZh: '捷運 18 分鐘可達', distEn: '18 mins by MRT',
                    priceZh: 'NT$350 起', priceEn: 'From NT$350',
                    descZh: '「週日下午在寶藏巖頂端茶室，Lina 會推薦一家可預約的冷泡茶席，俯瞰汀州路車流。」',
                    descEn: 'Sunday afternoons at a hilltop tea room in Treasure Hill with cold-brew tea overlooking Tingzhou Road.',
                    explorerDistZh: '捷運 18 分鐘（約 5.5 公里）', explorerDistEn: '18 mins by MRT (~5.5 km)'
                },
                {
                    id: 'tw-daan-park',
                    experienceId: '3319004',
                    titleZh: '大安森林公園晨間慢跑路線',
                    titleEn: "Da'an Forest Park Morning Run Loop",
                    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '晨間運動', badgeEn: 'Morning Run',
                    distZh: '步行 14 分鐘可達', distEn: '14 mins on foot',
                    priceZh: '免費', priceEn: 'Free',
                    descZh: '「Lina 推薦 6:30 繞公園外圈慢跑一圈，順路在永康街買咖啡，避開中午人潮。」',
                    descEn: 'Lina recommends a 6:30 AM loop around the park and coffee on Yongkang Street before the crowds.',
                    explorerDistZh: '步行 14 分鐘（約 1 公里）', explorerDistEn: '14 mins walk (~1 km)'
                },
                {
                    id: 'tw-yongkang',
                    experienceId: '3319005',
                    titleZh: '永康街深夜牛肉麵地圖',
                    titleEn: 'Yongkang Street Late-night Beef Noodle Map',
                    img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '深夜美食', badgeEn: 'Late-night Food',
                    distZh: '捷運 8 分鐘可達', distEn: '8 mins by MRT',
                    priceZh: 'NT$180 起', priceEn: 'From NT$180',
                    descZh: '「Lina 私藏三家仍營業到 11 點的牛肉麵，適合紅眼航班或加班後的宵夜路線。」',
                    descEn: 'Three beef noodle spots open until 11 PM—ideal after late flights or long work days.',
                    explorerDistZh: '捷運 8 分鐘（約 2.5 公里）', explorerDistEn: '8 mins by MRT (~2.5 km)'
                },
                {
                    id: 'tw-huashan',
                    experienceId: '3319006',
                    titleZh: '華山文創園區夜間展覽',
                    titleEn: 'Huashan Creative Park Night Exhibitions',
                    img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '夜間展覽', badgeEn: 'Night Exhibit',
                    distZh: '捷運 10 分鐘可達', distEn: '10 mins by MRT',
                    priceZh: 'NT$250 起', priceEn: 'From NT$250',
                    descZh: '「週五晚間常有延長開放至 9 點的特展，Lina 會在入住訊息附上當月檔期。」',
                    descEn: 'Friday night shows often run until 9 PM—Lina shares the monthly schedule in your check-in message.',
                    explorerDistZh: '捷運 10 分鐘（約 3 公里）', explorerDistEn: '10 mins by MRT (~3 km)'
                }
            ]
        },
        'UK-LONDON': {
            label: '倫敦',
            attractions: [
                {
                    id: 'uk-camden',
                    experienceId: '5829201',
                    titleZh: 'Camden Market 週六古董尋寶',
                    titleEn: 'Camden Market Saturday Antiques Hunt',
                    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '週末市集', badgeEn: 'Weekend Market',
                    distZh: '地鐵 10 分鐘可達', distEn: '10 mins by Tube',
                    priceZh: '£15 起', priceEn: 'From £15',
                    descZh: '「James 推薦週六 11 點到 Camden Lock，從復古黑膠到手工銀飾，適合帶回小禮物。」',
                    descEn: 'Camden Lock around 11 AM on Saturdays for vintage vinyl and handmade jewelry.',
                    explorerDistZh: '地鐵 10 分鐘（約 3 公里）', explorerDistEn: '10 mins by Tube (~3 km)'
                },
                {
                    id: 'uk-canal-kayak',
                    experienceId: '5829202',
                    titleZh: "Regent's Canal 清晨獨木舟",
                    titleEn: "Regent's Canal Morning Kayak",
                    img: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '運河體驗', badgeEn: 'Canal Experience',
                    distZh: '步行 8 分鐘可達', distEn: '8 mins on foot',
                    priceZh: '£28 起', priceEn: 'From £28',
                    descZh: '「James 在地力薦：週日早上 8 點從 Granary Square 下水，沿運河划到 Camden。」',
                    descEn: 'Launch from Granary Square at 8 AM on Sundays and paddle toward Camden.',
                    explorerDistZh: '步行 8 分鐘（約 650 公尺）', explorerDistEn: '8 mins walk (~650 m)'
                },
                {
                    id: 'uk-primrose',
                    experienceId: '5829203',
                    titleZh: 'Primrose Hill 日出野餐',
                    titleEn: 'Primrose Hill Sunrise Picnic',
                    img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '日出野餐', badgeEn: 'Sunrise Picnic',
                    distZh: '地鐵 15 分鐘可達', distEn: '15 mins by Tube',
                    priceZh: '免費', priceEn: 'Free',
                    descZh: '「James 建議夏季 5 點登頂 Primrose Hill，帶咖啡與可頌，俯瞰倫敦天際線。」',
                    descEn: 'Summit Primrose Hill at 5 AM in summer with coffee and croissants.',
                    explorerDistZh: '地鐵 15 分鐘（約 4 公里）', explorerDistEn: '15 mins by Tube (~4 km)'
                },
                {
                    id: 'uk-british-library',
                    experienceId: '5829204',
                    titleZh: '大英圖書館閱讀室導覽',
                    titleEn: 'British Library Reading Room Tour',
                    img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '文化導覽', badgeEn: 'Culture Tour',
                    distZh: '步行 12 分鐘可達', distEn: '12 mins on foot',
                    priceZh: '£12 起', priceEn: 'From £12',
                    descZh: '「James 推薦預約 King\'s Library 導覽，一窺《大憲章》複製品。」',
                    descEn: "Book the King's Library tour to see the Magna Carta facsimile.",
                    explorerDistZh: '步行 12 分鐘（約 900 公尺）', explorerDistEn: '12 mins walk (~900 m)'
                },
                {
                    id: 'uk-borough',
                    experienceId: '5829205',
                    titleZh: '博羅市場週末早午餐',
                    titleEn: 'Borough Market Weekend Brunch',
                    img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '早午餐', badgeEn: 'Brunch',
                    distZh: '地鐵 18 分鐘可達', distEn: '18 mins by Tube',
                    priceZh: '£18 起', priceEn: 'From £18',
                    descZh: '「Emma 推薦週六上午 10 點前往博羅市場，品嚐現烤酸種麵包與英式起司。」',
                    descEn: 'Borough Market at 10 AM on Saturdays for sourdough and British cheese.',
                    explorerDistZh: '地鐵 18 分鐘（約 5 公里）', explorerDistEn: '18 mins by Tube (~5 km)'
                },
                {
                    id: 'uk-shoreditch',
                    experienceId: '5829206',
                    titleZh: 'Shoreditch 街頭塗鴉導覽',
                    titleEn: 'Shoreditch Street Art Walking Tour',
                    img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '街頭藝術', badgeEn: 'Street Art',
                    distZh: '地鐵 14 分鐘可達', distEn: '14 mins by Tube',
                    priceZh: '£20 起', priceEn: 'From £20',
                    descZh: '「Brick Lane 周邊 90 分鐘步行導覽，James 會標記 Banksy 早期作品位置。」',
                    descEn: 'A 90-minute walk around Brick Lane—James marks early Banksy spots.',
                    explorerDistZh: '地鐵 14 分鐘（約 4.5 公里）', explorerDistEn: '14 mins by Tube (~4.5 km)'
                }
            ]
        },
        'VILNIUS-OLDTOWN': {
            label: '維爾紐斯',
            attractions: [
                {
                    id: 'lt-bernardine',
                    experienceId: '4410301',
                    titleZh: 'Bernardine Garden 櫻花季散步',
                    titleEn: 'Bernardine Garden Cherry Blossom Walk',
                    img: 'https://images.unsplash.com/photo-1522444195799-478538b28823?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '季節限定', badgeEn: 'Seasonal',
                    distZh: '步行 6 分鐘可達', distEn: '6 mins on foot',
                    priceZh: '免費', priceEn: 'Free',
                    descZh: '「Aistė 推薦四月下旬清晨 7 點到 Bernardine Garden，櫻花與舊城牆同框。」',
                    descEn: 'Bernardine Garden around 7 AM in late April for cherry blossoms against the old walls.',
                    explorerDistZh: '步行 6 分鐘（約 450 公尺）', explorerDistEn: '6 mins walk (~450 m)'
                },
                {
                    id: 'lt-kgb',
                    experienceId: '4410302',
                    titleZh: 'KGB Museum 冷戰歷史導覽',
                    titleEn: 'KGB Museum Cold War History Tour',
                    img: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '歷史導覽', badgeEn: 'History Tour',
                    distZh: '步行 12 分鐘可達', distEn: '12 mins on foot',
                    priceZh: '€6 起', priceEn: 'From €6',
                    descZh: '「Aistė 在地力薦：預約英文導覽時段，地下室監獄展區需 90 分鐘。」',
                    descEn: 'Book an English tour slot—the basement prison wing needs 90 minutes.',
                    explorerDistZh: '步行 12 分鐘（約 900 公尺）', explorerDistEn: '12 mins walk (~900 m)'
                },
                {
                    id: 'lt-balloon',
                    experienceId: '4410303',
                    titleZh: '維爾紐斯上空熱氣球晨航',
                    titleEn: 'Vilnius Hot Air Balloon Morning Flight',
                    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '高空體驗', badgeEn: 'Sky Experience',
                    distZh: '車程 15 分鐘', distEn: '15 mins by car',
                    priceZh: '€95 起', priceEn: 'From €95',
                    descZh: '「Aistė 建議預約日出時段，從舊城起飛可俯瞰紅瓦屋頂與 Neris 河。」',
                    descEn: 'A sunrise slot for red rooftops and the Neris River—book a week ahead in summer.',
                    explorerDistZh: '車程 15 分鐘（約 8 公里）', explorerDistEn: '15 mins drive (~8 km)'
                },
                {
                    id: 'lt-organ',
                    experienceId: '4410304',
                    titleZh: '聖凱瑟琳教堂管風琴音樂會',
                    titleEn: "St Catherine's Church Organ Recital",
                    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '古典音樂', badgeEn: 'Classical Music',
                    distZh: '步行 9 分鐘可達', distEn: '9 mins on foot',
                    priceZh: '€10 起', priceEn: 'From €10',
                    descZh: '「週五晚間管風琴短場，Aistė 會提前在社群貼購票連結。」',
                    descEn: 'Friday evening organ recitals—Aistė shares ticket links in advance.',
                    explorerDistZh: '步行 9 分鐘（約 700 公尺）', explorerDistEn: '9 mins walk (~700 m)'
                },
                {
                    id: 'lt-uzupis',
                    experienceId: '4410305',
                    titleZh: 'Užupis 共和國護照蓋章站',
                    titleEn: 'Užupis Republic Passport Stamp',
                    img: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '藝術區', badgeEn: 'Art District',
                    distZh: '步行 4 分鐘可達', distEn: '4 mins on foot',
                    priceZh: '€3 起', priceEn: 'From €3',
                    descZh: '「Aistė 會帶你到 Constitution Wall 旁小書報亭蓋 Užupis 護照章。」',
                    descEn: 'Get your Užupis passport stamp at the kiosk near the Constitution Wall.',
                    explorerDistZh: '步行 4 分鐘（約 300 公尺）', explorerDistEn: '4 mins walk (~300 m)'
                },
                {
                    id: 'lt-cathedral',
                    experienceId: '4410306',
                    titleZh: '維爾紐斯大教堂鐘樓夕陽',
                    titleEn: 'Vilnius Cathedral Bell Tower Sunset',
                    img: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '夕陽觀景', badgeEn: 'Sunset View',
                    distZh: '步行 8 分鐘可達', distEn: '8 mins on foot',
                    priceZh: '€5 起', priceEn: 'From €5',
                    descZh: '「夏季 8 點登鐘樓，舊城紅瓦在夕陽下像明信片一樣。」',
                    descEn: 'Climb the bell tower at 8 PM in summer—the red rooftops glow like a postcard.',
                    explorerDistZh: '步行 8 分鐘（約 600 公尺）', explorerDistEn: '8 mins walk (~600 m)'
                }
            ]
        },
        'RIO-COPACABANA': {
            label: '里約',
            attractions: [
                {
                    id: 'br-acai',
                    experienceId: '5510401',
                    titleZh: 'Botafogo 巴西莓與現榨果汁巡禮',
                    titleEn: 'Botafogo Açaí & Juice Crawl',
                    img: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '美食巡禮', badgeEn: 'Food Crawl',
                    distZh: 'Uber 12 分鐘', distEn: '12 mins by Uber',
                    priceZh: 'R$45 起', priceEn: 'From R$45',
                    descZh: '「Marina 推薦 Botafogo 三家果汁吧，從 açaí bowl 到 soursop 現榨。」',
                    descEn: 'Three Botafogo juice bars—from açaí bowls to soursop shakes.',
                    explorerDistZh: 'Uber 12 分鐘（約 5 公里）', explorerDistEn: '12 mins Uber (~5 km)'
                },
                {
                    id: 'br-tijuca',
                    experienceId: '5510402',
                    titleZh: 'Tijuca 國家森林瀑布健行',
                    titleEn: 'Tijuca National Forest Waterfall Hike',
                    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '雨林健行', badgeEn: 'Rainforest Hike',
                    distZh: 'Uber 25 分鐘', distEn: '25 mins by Uber',
                    priceZh: 'R$90 起', priceEn: 'From R$90',
                    descZh: '「Marina 在地力薦：清晨 7 點出發到 Cascatinha Taunay，避開午後雷雨。」',
                    descEn: 'Leave at 7 AM for Cascatinha Taunay to beat afternoon storms.',
                    explorerDistZh: 'Uber 25 分鐘（約 14 公里）', explorerDistEn: '25 mins Uber (~14 km)'
                },
                {
                    id: 'br-arpoador',
                    experienceId: '5510403',
                    titleZh: 'Arpoador 岩石區日落 Caipirinha',
                    titleEn: 'Arpoador Sunset Caipirinha Spot',
                    img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '日落秘境', badgeEn: 'Sunset Spot',
                    distZh: '步行 11 分鐘可達', distEn: '11 mins on foot',
                    priceZh: 'R$35 起', priceEn: 'From R$35',
                    descZh: '「Marina 建議 5 點前占 Arpoador 岩石區位置，看 Ipanema 與 Copacabana 同時變色。」',
                    descEn: 'Claim a rock at Arpoador before 5 PM to watch both beaches change color.',
                    explorerDistZh: '步行 11 分鐘（約 850 公尺）', explorerDistEn: '11 mins walk (~850 m)'
                },
                {
                    id: 'br-santa-teresa',
                    experienceId: '5510404',
                    titleZh: 'Santa Teresa 復古電車與磁磚工作室',
                    titleEn: 'Santa Teresa Tram & Tile Studio',
                    img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '藝術體驗', badgeEn: 'Art Experience',
                    distZh: 'Uber 18 分鐘', distEn: '18 mins by Uber',
                    priceZh: 'R$70 起', priceEn: 'From R$70',
                    descZh: '「Marina 推薦週六搭復古電車到 Santa Teresa，在磁磚工作室手繪杯墊。」',
                    descEn: 'Take the vintage tram to Santa Teresa on Saturdays and paint tile coasters.',
                    explorerDistZh: 'Uber 18 分鐘（約 9 公里）', explorerDistEn: '18 mins Uber (~9 km)'
                },
                {
                    id: 'br-sugarloaf',
                    experienceId: '5510405',
                    titleZh: '糖麵包山纜車清晨場',
                    titleEn: 'Sugarloaf Cable Car Morning Ride',
                    img: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '經典地標', badgeEn: 'Landmark',
                    distZh: 'Uber 20 分鐘', distEn: '20 mins by Uber',
                    priceZh: 'R$160 起', priceEn: 'From R$160',
                    descZh: '「Marina 建議 8 點第一班纜車，雲層較薄、排隊最短。」',
                    descEn: 'Catch the first cable car at 8 AM for thinner clouds and shorter lines.',
                    explorerDistZh: 'Uber 20 分鐘（約 10 公里）', explorerDistEn: '20 mins Uber (~10 km)'
                },
                {
                    id: 'br-lapa',
                    experienceId: '5510406',
                    titleZh: 'Lapa 階梯週五 Samba 夜',
                    titleEn: 'Lapa Steps Friday Samba Night',
                    img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=300&q=80',
                    badgeZh: '夜生活', badgeEn: 'Nightlife',
                    distZh: 'Uber 22 分鐘', distEn: '22 mins by Uber',
                    priceZh: 'R$50 起', priceEn: 'From R$50',
                    descZh: '「週五晚 Escadaria Selarón 附近有街頭 samba，Marina 會提醒注意随身物品。」',
                    descEn: 'Street samba near Escadaria Selarón on Friday nights—Marina shares safety tips.',
                    explorerDistZh: 'Uber 22 分鐘（約 11 公里）', explorerDistEn: '22 mins Uber (~11 km)'
                }
            ]
        }
    };

    const DEMO_IDS = Object.keys(CATALOG);

    function normalizeListingId(id) {
        if (global.HostGuideSettings?.normalizeListingId) {
            return global.HostGuideSettings.normalizeListingId(id);
        }
        return String(id || '').trim().toUpperCase() || 'TAIPEI-CITY';
    }

    function resolveListingId(raw) {
        const id = normalizeListingId(raw);
        if (CATALOG[id]) return id;

        const input = String(raw || '').trim().toUpperCase();
        const matched = DEMO_IDS.find((demoId) => input.includes(demoId.replace(/-/g, '')) || demoId.includes(input));
        return matched || id;
    }

    function getForListing(listingId) {
        const id = resolveListingId(listingId);
        const entry = CATALOG[id];
        if (!entry) {
            return { listingId: id, label: null, attractions: [], known: false };
        }
        return { listingId: id, label: entry.label, attractions: entry.attractions, known: true };
    }

    function toFormFields(index, attraction) {
        const n = Number(index);
        return {
            [`recExperienceId${n}`]: attraction.experienceId || '',
            [`recTitle${n}Zh`]: attraction.titleZh || '',
            [`recTitle${n}En`]: attraction.titleEn || '',
            [`recImg${n}`]: attraction.img || '',
            [`recBadge${n}Zh`]: attraction.badgeZh || '',
            [`recBadge${n}En`]: attraction.badgeEn || '',
            [`recDist${n}Zh`]: attraction.distZh || '',
            [`recDist${n}En`]: attraction.distEn || '',
            [`recPrice${n}Zh`]: attraction.priceZh || '',
            [`recPrice${n}En`]: attraction.priceEn || '',
            [`desc${n}Zh`]: attraction.descZh || '',
            [`desc${n}En`]: attraction.descEn || '',
            [`recExplorerDist${n}Zh`]: attraction.explorerDistZh || '',
            [`recExplorerDist${n}En`]: attraction.explorerDistEn || ''
        };
    }

    global.HostSettingsAttractions = {
        CATALOG,
        DEMO_IDS,
        normalizeListingId,
        resolveListingId,
        getForListing,
        toFormFields
    };
})(window);
