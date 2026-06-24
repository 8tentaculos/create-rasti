import { VERSIONS } from '../versions.js';

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/8tentaculos/rasti@v' + VERSIONS.rasti.replace(/^[\^~]/, '') + '/docs';

/** Logo and favicon URLs served from the Rasti CDN. */
const LOGO_SRC = CDN_BASE + '/logo-dark.svg';
const LOGO_LIGHT_SRC = CDN_BASE + '/logo.svg';
const FAVICON_SRC = CDN_BASE + '/favicon.svg';

/**
 * Shared placeholder context for template copying.
 * @param {object} plan - Project plan
 * @returns {object} Placeholder map for copyTemplateFile/copyTemplateDir
 */
export function getBaseContext(plan) {
    return {
        NAME : plan.name,
        DESCRIPTION : getDescription(plan),
        LOGO_SRC,
        LOGO_LIGHT_SRC,
        FAVICON_SRC,
        RASTI_VERSION : VERSIONS.rasti,
        VITE_VERSION : VERSIONS.vite,
        EXPRESS_VERSION : VERSIONS.express,
        COMPRESSION_VERSION : VERSIONS.compression,
        SIRV_VERSION : VERSIONS.sirv,
        CROSS_ENV_VERSION : VERSIONS.crossEnv
    };
}

/**
 * Build the {{DESCRIPTION}} HTML for a given plan.
 * Centralizes the description logic used by base, ssr, and router appliers.
 * @param {object} plan - Project plan
 * @returns {string} HTML description string
 */
export function getDescription(plan) {
    const isSsr = plan.base === 'ssr' || plan.base === 'static';
    const parts = ['<a href="https://rasti.js.org" target="_blank">Rasti</a>', '<a href="https://vite.dev" target="_blank">Vite</a>'];

    if (isSsr) parts.push('<a href="https://expressjs.com" target="_blank">Express</a>');

    let styling = '';
    if (plan.features.tailwind) {
        styling = ', styled with <a href="https://tailwindcss.com" target="_blank">Tailwind CSS</a>';
    } else if (plan.features.cssfun) {
        styling = ', styled with <a href="https://cssfun.js.org" target="_blank">CSSFUN</a> (CSS-in-JS with light and dark themes)';
    }

    if (plan.base === 'static') {
        return `Pre-rendered static site with ${parts.join(' + ')}${styling}. Development uses SSR; run <code>npm run build:static</code> to export configured URLs to static HTML under <code>dist/static</code>.`;
    }

    const prefix = isSsr ? 'Server-side rendered app with' : 'Single page app powered by';
    return `${prefix} ${parts.join(' + ')}${styling}.`;
}
