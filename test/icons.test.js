import { Component } from 'rasti';
import { buildComponent } from '../extras/rasti-icons/src/generate.js';

/**
 * Builds an icon component from SVG source and evaluates it against the real Rasti.
 * @param {string} svg - SVG file content
 * @returns {typeof Component} The icon component
 */
function build(svg) {
    const source = buildComponent('Icon', svg)
        .replace(/^import .*$/m, '')
        .replace(/^export default .*$/m, 'return Icon;');
    return new Function('Component', source)(Component);
}

/** Renders an icon to HTML with the given props. */
function render(svg, props = {}) {
    Component.resetUid();
    return new (build(svg))(props).toString();
}

const HEROICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
  <path stroke-linecap="round" d="M3 3h18"/>
</svg>
`;

const FEATHERICON = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: sketchtool -->
    <title>heart</title>
    <desc>Created with sketchtool.</desc>
    <g id="shape" stroke="none" fill="none">
        <g id="heart" fill="#000000">
            <path d="M12,20 Z"></path>
        </g>
    </g>
</svg>
`;

const AKAR = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0)">
<path d="M0 0" stroke="black"/>
</g>
<defs>
<clipPath id="clip0"><rect width="24" height="24" fill="white"/></clipPath>
</defs>
</svg>
`;

describe('icon components', () => {
    it('renders the size from the source and the class from props', () => {
        const html = render(HEROICON, { className : 'icon' });

        expect(html).toMatch(/^<svg class="icon" width="24" height="24"/);
        expect(html).toContain('stroke="currentColor"');
    });

    it('leaves the class out without a className', () => {
        expect(render(HEROICON)).not.toContain('class=');
    });

    it('sets both dimensions with size, and lets width or height override it', () => {
        expect(render(HEROICON, { size : 32 })).toMatch(/width="32" height="32"/);
        expect(render(HEROICON, { size : 32, height : 16 })).toMatch(/width="32" height="16"/);
    });

    it('is decorative without a label', () => {
        const html = render(HEROICON);

        expect(html).toContain('aria-hidden="true"');
        expect(html).not.toContain('role=');
        expect(html).not.toContain('aria-label=');
    });

    it('is an image named by its label', () => {
        const html = render(HEROICON, { label : 'Menu' });

        expect(html).toContain('role="img"');
        expect(html).toContain('aria-label="Menu"');
        expect(html).not.toContain('aria-hidden');
    });

    it('cleans up exported files: prolog, comments, title, desc, ids, namespaces', () => {
        const html = render(FEATHERICON, { className : 'icon' });

        expect(html).toMatch(/^<svg class="icon" width="24" height="24"/);
        for (const leftover of ['<?xml', '<!--', '<title', '<desc', 'id=', 'xmlns', 'xlink']) {
            expect(html).not.toContain(leftover);
        }
    });

    it('turns hardcoded black into currentColor', () => {
        expect(render(FEATHERICON)).toContain('fill="currentColor"');
        expect(render(AKAR)).toContain('stroke="currentColor"');
        expect(render(AKAR)).toContain('fill="white"');
    });

    it('keeps the ids the icon references', () => {
        const html = render(AKAR);

        expect(html).toContain('id="clip0"');
        expect(html).toContain('url(#clip0)');
    });

    it('escapes markup that would break the template literal', () => {
        const svg = '<svg viewBox="0 0 24 24"><text>`${x}` \\</text></svg>';

        expect(render(svg)).toContain('<text>`${x}` \\</text>');
    });
});
