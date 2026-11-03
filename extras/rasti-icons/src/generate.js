import fs from 'node:fs';
import path from 'node:path';

/** Hardcoded black, which keeps an icon from following the text color. */
const BLACK_PAINT = /\s(fill|stroke)="(?:black|#000|#000000)"/gi;

/**
 * Root attributes the component renders from its props, plus namespace
 * declarations, which inline SVG in HTML takes from the parser instead.
 */
const ROOT_ATTRIBUTES = /\s(?:class|width|height|role|aria-label|aria-hidden|xmlns(?::\w+)?)="[^"]*"/g;

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
    // Match only real SVG width/height attributes (not stroke-width, etc.); `px` units are dropped.
    const direct = tag.match(new RegExp(`\\s${dim}="(\\d+(?:\\.\\d+)?)(?:px)?"`));
    if (direct) return direct[1];
    const vb = tag.match(/\bviewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
    if (vb) return dim === 'width' ? vb[1] : vb[2];
    return '24';
}

/**
 * Re-indent the lines inside the `<svg>` element, one level per nesting step
 * of the source, whatever indentation width the source used.
 * @param {string} body - Markup between the opening and closing `<svg>` tags
 * @param {string} indent - Indentation of the children
 * @returns {string} Re-indented lines
 */
function reindent(body, indent) {
    const lines = body.split('\n').filter(line => line.trim());
    const leads = lines.map(line => line.match(/^\s*/)[0].length);
    const min = Math.min(...leads);
    const step = Math.min(...leads.map(lead => lead - min).filter(Boolean)) || 1;

    return lines
        .map((line, i) => indent + '    '.repeat((leads[i] - min) / step) + line.trim())
        .join('\n');
}

/**
 * Clean an SVG file and split it into the parts a component template needs.
 * Drops what an inline icon doesn't need (XML prolog, doctype, comments, `title`,
 * `desc`, unreferenced ids), and turns hardcoded black into `currentColor`.
 * @param {string} svgContent - Raw SVG file content
 * @returns {{ attributes: string, body: string, width: string, height: string }}
 */
export function transformSvg(svgContent) {
    const svg = svgContent
        .replace(/<\?xml[\s\S]*?\?>/g, '')
        .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(title|desc)\b[^>]*>[\s\S]*?<\/\1>/g, '')
        .replace(BLACK_PAINT, ' $1="currentColor"')
        // Ids repeat across icons on a page; keep only those the icon references itself.
        .replace(/\sid="([^"]*)"/g, (attr, id, _offset, all) => all.includes(`#${id}`) ? attr : '')
        // The markup lands in a template literal.
        .replace(/[`\\]|\$\{/g, m => '\\' + m);

    const open = svg.match(/<svg\b[^>]*>/);
    const close = svg.lastIndexOf('</svg>');
    if (!open || close === -1) throw new Error('No <svg> element found');

    return {
        attributes : open[0].slice(4, -1).replace(ROOT_ATTRIBUTES, '').trim(),
        body : svg.slice(open.index + open[0].length, close),
        width : extractSize(open[0], 'width'),
        height : extractSize(open[0], 'height')
    };
}

/**
 * Build the source of a Rasti icon component from an SVG file.
 * @param {string} name - Component name
 * @param {string} svgContent - Raw SVG file content
 * @returns {string} Module source
 */
export function buildComponent(name, svgContent) {
    const { attributes, body, width, height } = transformSvg(svgContent);
    const sizeDefaults = width === height ?
        `size = '${width}', width = size, height = size` :
        `size, width = size ?? '${width}', height = size ?? '${height}'`;

    return [
        `import { Component } from 'rasti';`,
        ``,
        `/**`,
        ` * @typedef {Object} IconProps`,
        ` * @property {string} [className]`,
        ` * @property {string|number} [size] - Width and height, unless set apart.`,
        ` * @property {string|number} [width]`,
        ` * @property {string|number} [height]`,
        ` * @property {string} [label] - Accessible name. Without it the icon is decorative and hidden from assistive technology.`,
        ` */`,
        ``,
        `const ${name} = Component.create(/** @this {import('rasti').Component<IconProps>} */ function() {`,
        `    const { className, ${sizeDefaults}, label } = this.props;`,
        ``,
        `    return this.html\``,
        `        <svg class="\${className}" width="\${width}" height="\${height}" role="\${label ? 'img' : null}" aria-label="\${label}" aria-hidden="\${label ? null : 'true'}"${attributes ? ' ' + attributes : ''}>`,
        reindent(body, '            '),
        `        </svg>`,
        `    \`;`,
        `});`,
        ``,
        `export default ${name};`,
        ``
    ].join('\n');
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
        fs.writeFileSync(path.join(output, `${iconName}.js`), buildComponent(iconName, await svgRes.text()));
        count++;
    }

    return count;
}
