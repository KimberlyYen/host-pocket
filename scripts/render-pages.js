#!/usr/bin/env node
/**
 * Expand {{> partial }} includes into static HTML pages.
 * Source: *.page.html → output: host-settings.html (same basename without .page)
 */
const fs = require('fs');
const path = require('path');
const { renderDocument } = require('../server/partials');

const ROOT = path.join(__dirname, '..');

const PAGES = [
    { template: 'host-settings.page.html', output: 'host-settings.html' }
];

function renderPages() {
    PAGES.forEach(({ template, output }) => {
        const templatePath = path.join(ROOT, template);
        const outputPath = path.join(ROOT, output);

        if (!fs.existsSync(templatePath)) {
            console.warn(`[render-pages] skip missing template: ${template}`);
            return;
        }

        const html = renderDocument(template);
        fs.writeFileSync(outputPath, html, 'utf8');
        console.log(`[render-pages] ${template} → ${output}`);
    });
}

renderPages();
