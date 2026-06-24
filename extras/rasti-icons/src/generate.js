import fs from 'node:fs';
import path from 'node:path';

/**
 * Convert kebab-case SVG filename to PascalCase component name.
 * @param {string} filename - e.g. 'arrow-right.svg'
 * @returns {string} e.g. 'ArrowRight'
 */
function toPascalCase(filename) {
    return filename
        .replace('.svg', '')
        .replace(/-(.)/g, (_, c) => c.toUpperCase())
        .replace(/^(.)/, m => m.toUpperCase());
}

/**
 * Extract a size value from the SVG opening tag.
 * Tries direct attribute first, falls back to viewBox.
 * @param {string} tag - The opening <svg ...> tag string
 * @param {'width'|'height'} dim - Dimension to extract
 * @returns {string} Numeric string, e.g. '24'
 */
function extractSize(tag, dim) {
    // Match only real SVG width/height attributes (not stroke-width, etc.)
    const direct = tag.match(new RegExp(`\\s${dim}="(\\d+(?:\\.\\d+)?)"`));
    if (direct) return direct[1];
    const vb = tag.match(/\bviewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
    if (vb) return dim === 'width' ? vb[1] : vb[2];
    return '24';
}

/**
 * Transform raw SVG content into a Rasti component template body.
 * Replaces/adds class, width, height with dynamic props expressions.
 * @param {string} svgContent - Raw SVG file content
 * @returns {string} Indented SVG ready to embed in Component.create`...`
 */
function transformSvg(svgContent) {
    const openEnd = svgContent.indexOf('>');
    const openTag = svgContent.slice(0, openEnd + 1);
    const rest = svgContent.slice(openEnd + 1);

    const origW = extractSize(openTag, 'width');
    const origH = extractSize(openTag, 'height');

    // Build template expression strings (written as literal text to output files)
    const classExpr = 'class="${({ props }) => props.className || \'\'}"';
    const widthExpr = `width="\${({ props }) => props.width || '${origW}'}"`;
    const heightExpr = `height="\${({ props }) => props.height || '${origH}'}"`;

    const newTag = openTag
        .replace(/\s+class="[^"]*"/g, '')
        .replace(/\s+width="[^"]*"/g, '')
        .replace(/\s+height="[^"]*"/g, '')
        .replace('<svg', `<svg ${classExpr} ${widthExpr} ${heightExpr}`);

    return (newTag + rest)
        .replace(/\n$/, '')
        .replace(/^ {2}/gm, '    ')
        .replace(/^/gm, '    ');
}

/**
 * Generate Rasti icon components from a GitHub-hosted SVG directory.
 * @param {object} options
 * @param {string} options.source    - GitHub API URL for directory listing
 * @param {string} [options.license] - Raw URL for license file (optional)
 * @param {string} options.output    - Absolute path to output directory
 * @returns {Promise<number>} Number of icons generated
 */
export async function generateIcons({ source, license, output }) {
    fs.mkdirSync(output, { recursive : true });

    if (license) {
        const licRes = await fetch(license);
        if (!licRes.ok) throw new Error(`License fetch failed: ${licRes.status}`);
        fs.writeFileSync(path.join(output, 'LICENSE.txt'), await licRes.text());
    }

    const listRes = await fetch(source);
    if (!listRes.ok) throw new Error(`Source fetch failed: ${listRes.status}`);
    const files = await listRes.json();

    if (!Array.isArray(files)) {
        throw new Error(`Unexpected response from source URL. Got: ${JSON.stringify(files).slice(0, 100)}`);
    }

    let count = 0;
    for (const item of files) {
        if (item.type !== 'file' || !item.name.endsWith('.svg')) continue;
        const iconName = toPascalCase(item.name);
        const svgRes = await fetch(item.download_url);
        if (!svgRes.ok) throw new Error(`SVG fetch failed for ${item.name}: ${svgRes.status}`);
        const svgContent = await svgRes.text();
        const transformed = transformSvg(svgContent);
        const component = [
            `import { Component } from 'rasti';`,
            ``,
            `/**`,
            ` * @typedef {Object} IconProps`,
            ` * @property {string} [className]`,
            ` * @property {string} [width]`,
            ` * @property {string} [height]`,
            ` */`,
            ``,
            `/** @type {typeof import('rasti').Component<IconProps>} */`,
            `const ${iconName} = Component.create\``,
            transformed,
            `\`;`,
            ``,
            `export default ${iconName};`,
            ``
        ].join('\n');
        fs.writeFileSync(path.join(output, `${iconName}.js`), component);
        count++;
    }

    return count;
}
