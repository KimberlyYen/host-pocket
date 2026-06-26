(function (global) {
    const INCLUDE_RE = /\{\{>\s*([\w/]+)(?:\s+([^}]+))?\s*\}\}/;
    const BLOCK_RE = /\{\{#\s*([\w/]+)\s*\}\}([\s\S]*?)\{\{\/\s*\1\s*\}\}/;
    const LOCAL_RE = /\{\{(\w+)\}\}/g;
    const RAW_LOCALS = new Set(['yield']);
    const _cache = Object.create(null);

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function partialUrl(name) {
        const segments = name.split('/');
        const fileName = `_${segments.pop()}.html`;
        return `/partials/${segments.join('/')}/${fileName}`;
    }

    function parseIncludeParams(params) {
        const locals = {};
        if (!params) return locals;

        params.trim().split(/\s+/).forEach((pair) => {
            const eq = pair.indexOf('=');
            if (eq === -1) return;
            locals[pair.slice(0, eq)] = pair.slice(eq + 1);
        });

        return locals;
    }

    function applyLocals(html, locals) {
        return html.replace(LOCAL_RE, (match, key) => {
            if (!(key in locals)) return match;
            const value = locals[key] ?? '';
            if (RAW_LOCALS.has(key)) return String(value);
            return escapeHtml(value);
        });
    }

    async function fetchPartial(name) {
        if (_cache[name]) return _cache[name];

        const url = partialUrl(name);
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) {
            throw new Error(`Partial not found: ${name} (${res.status})`);
        }

        const html = await res.text();
        _cache[name] = html;
        return html;
    }

    async function processIncludes(html, locals, stack) {
        let out = html;
        let match = out.match(INCLUDE_RE);
        while (match) {
            const full = match[0];
            const partialName = match[1];
            const params = match[2];
            const childLocals = { ...locals, ...parseIncludeParams(params) };
            const rendered = await renderPartial(partialName, childLocals, stack);
            out = out.replace(full, () => rendered);
            match = out.match(INCLUDE_RE);
        }
        return out;
    }

    async function processBlocks(html, locals, stack) {
        let out = html;
        let match = out.match(BLOCK_RE);
        while (match) {
            const full = match[0];
            const partialName = match[1];
            const inner = match[2];
            const processedInner = await processIncludes(inner, locals, stack);
            const rendered = await renderPartial(partialName, { ...locals, yield: processedInner }, stack);
            out = out.replace(full, () => rendered);
            match = out.match(BLOCK_RE);
        }
        return out;
    }

    async function renderPartial(name, locals = {}, stack = new Set()) {
        if (stack.has(name)) {
            throw new Error(`Circular partial include: ${name}`);
        }

        stack.add(name);
        let html = await fetchPartial(name);
        html = await processBlocks(html, locals, stack);
        html = await processIncludes(html, locals, stack);
        html = applyLocals(html, locals);
        stack.delete(name);
        return html;
    }

    global.PartialsClient = {
        partialUrl,
        renderPartial,
        clearCache() {
            Object.keys(_cache).forEach((key) => delete _cache[key]);
        }
    };
})(window);
