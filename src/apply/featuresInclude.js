import path from 'node:path';
import fs from 'node:fs/promises';
import { PRESETS } from '../../extras/rasti-icons/src/presets.js';

const CREATE_RASTI_REPO = 'https://github.com/8tentaculos/create-rasti/tree/master';

/**
 * Build the HTML for the features info block from plan.
 * @param {object} plan - Plan with features and base
 * @returns {string} HTML fragment for the info block
 */
function buildFeaturesHtml(plan) {
    const items = [];

    if (plan.features.router) {
        items.push(`<p>Router: <a href="${CREATE_RASTI_REPO}/extras/micro-router" target="_blank" rel="noopener">micro-router</a></p>`);
    }

    if (plan.features.icons) {
        const iconSets = plan.features.icons
            .map((presetId) => {
                const preset = PRESETS[presetId];
                return `<a href="${preset.homepage}" target="_blank" rel="noopener">${preset.label}</a>`;
            })
            .join(', ');

        items.push(`<p>Icons: <a href="${CREATE_RASTI_REPO}/extras/rasti-icons" target="_blank" rel="noopener">rasti-icons</a> (${iconSets})</p>`);
    }

    if (items.length === 0) {
        items.push('<p>No optional extras included.</p>');
    }

    return items.join('\n');
}

/**
 * Replace {{FEATURES_INCLUDE}} in a file with the features list HTML.
 * @param {string} filePath - Path to the file
 * @param {string} html - Features list HTML
 */
async function replaceInFile(filePath, html) {
    try {
        let content = await fs.readFile(filePath, 'utf-8');
        if (!content.includes('{{FEATURES_INCLUDE}}')) return;
        content = content.replaceAll('{{FEATURES_INCLUDE}}', html);
        await fs.writeFile(filePath, content, 'utf-8');
    } catch {
        // file may not exist
    }
}

/**
 * Replace {{FEATURES_INCLUDE}} in App.js and in all pages (when router).
 * @param {object} ctx - Context with plan, targetDir
 */
export async function applyFeaturesInclude(ctx) {
    const { plan, targetDir } = ctx;
    const html = buildFeaturesHtml(plan);

    const homePath = path.join(targetDir, 'src', 'components', 'Home.js');
    await replaceInFile(homePath, html);

    const pagesDir = path.join(targetDir, 'src', 'pages');
    try {
        const entries = await fs.readdir(pagesDir, { withFileTypes : true });
        for (const e of entries) {
            if (e.isFile() && (e.name.endsWith('.js') || e.name.endsWith('.ts'))) {
                await replaceInFile(path.join(pagesDir, e.name), html);
            }
        }
    } catch {
        // no pages dir (no router)
    }
}
