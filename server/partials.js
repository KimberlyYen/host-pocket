const fs = require('fs');
const path = require('path');

const PARTIALS_ROOT = path.join(__dirname, '..', 'partials');
const INCLUDE_RE = /\{\{>\s*([\w/]+)(?:\s+([^}]+))?\s*\}\}/g;
const BLOCK_RE = /\{\{#\s*([\w/]+)(?:\s+([^}]+))?\s*\}\}([\s\S]*?)\{\{\/\s*\1\s*\}\}/g;
const LOCAL_RE = /\{\{(\w+)\}\}/g;
const RAW_LOCALS = new Set(['yield']);

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function partialFilePath(name) {
    const segments = name.split('/');
    const fileName = `_${segments.pop()}.html`;
    return path.join(PARTIALS_ROOT, ...segments, fileName);
}

function readPartial(name) {
    const filePath = partialFilePath(name);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Partial not found: ${name} (${filePath})`);
    }
    return fs.readFileSync(filePath, 'utf8');
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
    const resolved = { variant: 'panel', ...locals };
    return html.replace(LOCAL_RE, (match, key) => {
        if (!(key in resolved)) return match;
        const value = resolved[key] ?? '';
        if (RAW_LOCALS.has(key)) return String(value);
        return escapeHtml(value);
    });
}

function processIncludes(html, locals, stack) {
    return html.replace(INCLUDE_RE, (_, partialName, params) => {
        const childLocals = { ...locals, ...parseIncludeParams(params) };
        return renderPartial(partialName, childLocals, stack);
    });
}

function processBlocks(html, locals, stack) {
    return html.replace(BLOCK_RE, (_, partialName, params, inner) => {
        const processedInner = processIncludes(inner, locals, stack);
        const blockLocals = { ...locals, ...parseIncludeParams(params), yield: processedInner };
        return renderPartial(partialName, blockLocals, stack);
    });
}

function renderPartial(name, locals = {}, stack = new Set()) {
    if (stack.has(name)) {
        throw new Error(`Circular partial include: ${name}`);
    }

    stack.add(name);
    let html = readPartial(name);
    html = processBlocks(html, locals, stack);
    html = processIncludes(html, locals, stack);
    html = applyLocals(html, locals);
    stack.delete(name);
    return html;
}

function partialUrl(name) {
    const segments = name.split('/');
    const fileName = `_${segments.pop()}.html`;
    return `/partials/${segments.join('/')}/${fileName}`;
}

module.exports = {
    PARTIALS_ROOT,
    escapeHtml,
    partialFilePath,
    partialUrl,
    readPartial,
    renderPartial,
    applyLocals
};
