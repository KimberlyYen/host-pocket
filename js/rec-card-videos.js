/**
 * 16 unique rec-card preview videos (4 listings × 4 slots).
 * Verified Pexels CDN (HEAD 200). No URL reused across regions/slots.
 */
(function (global) {
    const V = {
        taipei1: 'https://videos.pexels.com/video-files/2169880/2169880-hd_1920_1080_30fps.mp4',
        taipei2: 'https://videos.pexels.com/video-files/3255272/3255272-hd_1920_1080_25fps.mp4',
        taipei3: 'https://videos.pexels.com/video-files/1943483/1943483-hd_1920_1080_25fps.mp4',
        taipei4: 'https://videos.pexels.com/video-files/1893623/1893623-hd_1920_1080_25fps.mp4',
        uk1: 'https://videos.pexels.com/video-files/2169879/2169879-hd_1920_1080_30fps.mp4',
        uk2: 'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4',
        uk3: 'https://videos.pexels.com/video-files/3255273/3255273-hd_1920_1080_25fps.mp4',
        uk4: 'https://videos.pexels.com/video-files/1943484/1943484-hd_1920_1080_25fps.mp4',
        vilnius1: 'https://videos.pexels.com/video-files/1893625/1893625-hd_1920_1080_25fps.mp4',
        vilnius2: 'https://videos.pexels.com/video-files/1943485/1943485-hd_1920_1080_25fps.mp4',
        vilnius3: 'https://videos.pexels.com/video-files/3044454/3044454-hd_1920_1080_25fps.mp4',
        vilnius4: 'https://videos.pexels.com/video-files/3255274/3255274-hd_1920_1080_25fps.mp4',
        rio1: 'https://videos.pexels.com/video-files/856974/856974-hd_1920_1080_25fps.mp4',
        rio2: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4',
        rio3: 'https://videos.pexels.com/video-files/3255275/3255275-hd_1920_1080_25fps.mp4',
        rio4: 'https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4'
    };

    const LISTING_REC_VIDEOS = {
        'TAIPEI-CITY': [V.taipei1, V.taipei2, V.taipei3, V.taipei4],
        'UK-LONDON': [V.uk1, V.uk2, V.uk3, V.uk4],
        'VILNIUS-OLDTOWN': [V.vilnius1, V.vilnius2, V.vilnius3, V.vilnius4],
        'RIO-COPACABANA': [V.rio1, V.rio2, V.rio3, V.rio4]
    };

    /** Flat list of all 16 URLs in listing order (for uniqueness checks). */
    const ALL_REC_VIDEOS = Object.values(LISTING_REC_VIDEOS).flat();

    function getForRec(listingId, recIndex) {
        const listing = String(listingId || '').trim().toUpperCase();
        const slot = Number(recIndex);
        const videos = LISTING_REC_VIDEOS[listing];
        if (!videos || slot < 1 || slot > videos.length) return null;
        return videos[slot - 1];
    }

    global.RecCardVideos = {
        LISTING_REC_VIDEOS,
        ALL_REC_VIDEOS,
        DEFAULT: V.taipei1,
        REC_SLOT_VIDEOS: LISTING_REC_VIDEOS['TAIPEI-CITY'],
        getForRec
    };
})(window);
