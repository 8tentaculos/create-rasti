import createRouter from './lib/router.js';

const DEFAULT_TITLE = '{{NAME}}';

/**
 * Maps route paths to document titles.
 * @type {Object.<string, string>}
 */
const PAGE_TITLES = {
    '/' : 'Home | {{NAME}}',
    '/about' : 'About | {{NAME}}'
};

/**
 * Normalize path for lookup (strip trailing slash; '' -> '/').
 * @param {string} p
 * @returns {string}
 */
function normalizePath(p) {
    return (p || '/').replace(/\/$/, '') || '/';
}

/**
 * Get document title for a route path.
 * @param {string} path - Route path (e.g. '/', '/about', '/about/')
 * @returns {string} Page title
 */
export function getTitleForPath(path) {
    return PAGE_TITLES[normalizePath(path)] ?? DEFAULT_TITLE;
}

/**
 * Get document title for a request URL (for SSR).
 * @param {string} url - Request URL
 * @returns {string} Page title
 */
export function getTitleForUrl(url) {
    const pathname = typeof url === 'string' ? url.replace(/\?.*$/, '').replace(/^https?:\/\/[^/]+/, '') || '/' : '/';
    const path = pathname === '' ? '/' : pathname;
    return getTitleForPath(path);
}

/**
 * Create router bound to model (sets model.location on navigate).
 * Updates document.title on client when route changes.
 * @param {{ location: (import('./lib/router.js').Location|null) }} model - Model with location
 * @returns {import('./lib/router.js').Router} Router with navigate, delegateNavigation, bindHistory, createUrl
 */
export function createAppRouter(model) {
    /** @param {import('./lib/router.js').Location} location */
    const action = (location) => {
        model.location = location;
        if (typeof document !== 'undefined') document.title = getTitleForPath(location.path);
    };

    return createRouter([
        { path : '/', action },
        { path : '{{ROUTE_ABOUT}}', action }
    ]);
}
