/**
 * Lightweight canvas confetti — full-screen rain or localized burst.
 */
(function (global) {
    const COLORS = ['#E8756A', '#F4A261', '#FFE066', '#FFFFFF', '#7BC4A8', '#264653'];
    const DURATION_MS = 2800;
    let canvas = null;
    let ctx = null;
    let rafId = null;
    let particles = [];
    let startedAt = 0;
    let burstTimers = [];

    function prefersReducedMotion() {
        return global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    }

    function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement('canvas');
        canvas.className = 'hp-confetti-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.cssText = [
            'position:fixed',
            'inset:0',
            'width:100%',
            'height:100%',
            'pointer-events:none',
            'z-index:55'
        ].join(';');
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
    }

    function resizeCanvas() {
        if (!canvas || !ctx) return;
        const dpr = Math.min(global.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(global.innerWidth * dpr);
        canvas.height = Math.floor(global.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function resolveOrigin(origin) {
        if (origin && typeof origin === 'object' && 'x' in origin && 'y' in origin) {
            return {
                x: Math.max(0.08, Math.min(0.92, origin.x)),
                y: Math.max(0.08, Math.min(0.92, origin.y))
            };
        }
        const el = origin instanceof Element ? origin : null;
        if (!el) return { x: 0.5, y: 0.45 };
        const rect = el.getBoundingClientRect();
        if (!rect.width && !rect.height) return { x: 0.5, y: 0.45 };
        return {
            x: (rect.left + rect.width / 2) / global.innerWidth,
            y: (rect.top + rect.height / 2) / global.innerHeight
        };
    }

    function createParticle(x, y, vx, vy, sizeScale = 1) {
        return {
            x,
            y,
            vx,
            vy,
            w: (5 + Math.random() * 7) * sizeScale,
            h: (3 + Math.random() * 5) * sizeScale,
            rot: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.35,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            alpha: 1,
            shape: Math.random() > 0.35 ? 'rect' : 'circle'
        };
    }

    function spawnBurst(origin, count) {
        const ox = origin.x * global.innerWidth;
        const oy = origin.y * global.innerHeight;
        for (let i = 0; i < count; i += 1) {
            const angle = (-Math.PI / 2) + (Math.random() - 0.5) * 1.4;
            const speed = 6 + Math.random() * 10;
            particles.push(createParticle(
                ox + (Math.random() - 0.5) * 24,
                oy + (Math.random() - 0.5) * 12,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed - 4
            ));
        }
    }

    function spawnFullScreenRain(count) {
        const w = global.innerWidth;
        const h = global.innerHeight;
        for (let i = 0; i < count; i += 1) {
            const fromTop = Math.random() > 0.25;
            particles.push(createParticle(
                Math.random() * w,
                fromTop ? -20 - Math.random() * h * 0.15 : Math.random() * h * 0.5,
                (Math.random() - 0.5) * 8,
                fromTop ? 3 + Math.random() * 8 : 2 + Math.random() * 6,
                0.85 + Math.random() * 0.35
            ));
        }
    }

    function spawnFullScreenCannons(count) {
        const w = global.innerWidth;
        const h = global.innerHeight;
        const origins = [
            { x: 0, y: h + 10 },
            { x: w, y: h + 10 },
            { x: w * 0.5, y: h + 10 },
            { x: 0, y: -10 },
            { x: w, y: -10 },
            { x: w * 0.5, y: -10 }
        ];
        origins.forEach((origin) => {
            for (let i = 0; i < count / origins.length; i += 1) {
                const angle = origin.y < 0
                    ? Math.PI / 2 + (Math.random() - 0.5) * 1.2
                    : -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
                const speed = 7 + Math.random() * 9;
                particles.push(createParticle(
                    origin.x + (Math.random() - 0.5) * 40,
                    origin.y,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ));
            }
        });
    }

    function drawFrame(now) {
        if (!ctx || !canvas) return;
        const elapsed = now - startedAt;
        ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);

        particles = particles.filter((p) => {
            p.vy += 0.26;
            p.vx *= 0.988;
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.spin;
            p.alpha = Math.max(0, 1 - elapsed / DURATION_MS);

            if (p.alpha <= 0) return false;

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }
            ctx.restore();
            return p.y < global.innerHeight + 60 && p.y > -80;
        });

        if (elapsed < DURATION_MS || particles.length) {
            rafId = global.requestAnimationFrame(drawFrame);
        } else {
            cleanup();
        }
    }

    function clearBurstTimers() {
        burstTimers.forEach((id) => global.clearTimeout(id));
        burstTimers = [];
    }

    function cleanup() {
        clearBurstTimers();
        if (rafId) {
            global.cancelAnimationFrame(rafId);
            rafId = null;
        }
        particles = [];
        if (ctx && canvas) {
            ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);
        }
        canvas?.remove();
        canvas = null;
        ctx = null;
    }

    function celebrate(options = {}) {
        if (prefersReducedMotion()) return;

        cleanup();
        ensureCanvas();
        resizeCanvas();

        const fullScreen = options.fullScreen !== false;
        const count = Math.max(40, Math.min(220, Number(options.particleCount) || 120));

        if (fullScreen) {
            spawnFullScreenRain(count);
            spawnFullScreenCannons(Math.floor(count * 0.45));
            burstTimers.push(global.setTimeout(() => spawnFullScreenRain(Math.floor(count * 0.55)), 180));
            burstTimers.push(global.setTimeout(() => spawnFullScreenCannons(Math.floor(count * 0.3)), 420));
            burstTimers.push(global.setTimeout(() => spawnFullScreenRain(Math.floor(count * 0.35)), 720));
        } else {
            const origin = resolveOrigin(options.origin);
            spawnBurst(origin, count);
            if (options.burst !== false) {
                spawnBurst({ x: origin.x, y: Math.max(0.12, origin.y - 0.06) }, Math.floor(count * 0.35));
            }
        }

        startedAt = global.performance?.now?.() ?? Date.now();
        rafId = global.requestAnimationFrame(drawFrame);

        global.addEventListener('resize', resizeCanvas, { once: true, passive: true });
    }

    const ONCE_KEYS = {
        share: 'hp-confetti-once-share',
        booking: 'hp-confetti-once-booking'
    };

    function hasCelebrated(kind) {
        const key = ONCE_KEYS[kind];
        if (!key) return true;
        try {
            return sessionStorage.getItem(key) === '1';
        } catch {
            return false;
        }
    }

    /** Full-screen confetti at most once per kind per browser tab session. */
    function celebrateOnce(kind, options = {}) {
        if (!kind || hasCelebrated(kind)) return false;
        try {
            sessionStorage.setItem(ONCE_KEYS[kind], '1');
        } catch { /* ignore */ }
        celebrate(options);
        return true;
    }

    global.hpCelebrate = celebrate;
    global.hpCelebrateOnce = celebrateOnce;
})(window);
