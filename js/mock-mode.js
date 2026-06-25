(function (global) {
    if (global.HP_MOCK_DATA === undefined) {
        global.HP_MOCK_DATA = true;
    }

    /** 分享指南主頁用的寫死路徑（mock / demo） */
    global.HP_GUIDE_SHARE_PATHS = {
        'TAIPEI-CITY': '/guide/TAIPEI-CITY',
        'UK-LONDON': '/guide/UK-LONDON',
        'VILNIUS-OLDTOWN': '/guide/VILNIUS-OLDTOWN',
        'RIO-COPACABANA': '/guide/RIO-COPACABANA'
    };

    function isMockDataEnabled() {
        return global.HP_MOCK_DATA !== false;
    }

    global.HostPocketConfig = {
        isMockDataEnabled
    };
})(window);
