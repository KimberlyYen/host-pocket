(function (global) {
    const DEFAULT_THRESHOLD = 40;

    function bindHorizontalSwipe(element, handlers, options = {}) {
        if (!element || element.dataset.hpSwipeBound === 'true') return;
        element.dataset.hpSwipeBound = 'true';

        const threshold = options.threshold ?? DEFAULT_THRESHOLD;
        let startX = 0;
        let startY = 0;
        let tracking = false;

        element.addEventListener('touchstart', (e) => {
            if (!e.touches.length) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            tracking = true;
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            if (!tracking) return;
            tracking = false;
            const touch = e.changedTouches[0];
            if (!touch) return;
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return;
            if (dx > 0) handlers.onSwipeRight?.();
            else handlers.onSwipeLeft?.();
        }, { passive: true });

        element.addEventListener('touchcancel', () => {
            tracking = false;
        }, { passive: true });
    }

    global.HostPocketImageSwipe = { bindHorizontalSwipe };
})(window);
