import createRouter from './lib/router.js';
import type { Location, Router } from './lib/router.js';

const DEFAULT_TITLE = '{{NAME}}';

/** Maps route paths to document titles. */
const PAGE_TITLES: Record<string, string> = {
    '/' : 'Home | {{NAME}}',
    '/about' : 'About | {{NAME}}'
};

/** Normalize path for lookup (strip trailing slash; '' -> '/'). */
function normalizePath(p: string): string {
    return (p || '/').replace(/\/$/, '') || '/';
}

/**
 * Get document title for a route path.
 * @param path - Route path (e.g. '/', '/about', '/about/')
 * @returns Page title
 */
export function getTitleForPath(path: string): string {
    return PAGE_TITLES[normalizePath(path)] ?? DEFAULT_TITLE;
}

/**
 * Get document title for a request URL (for SSR).
 * @param url - Request URL
 * @returns Page title
 */
export function getTitleForUrl(url: string): string {
    const pathname = url.replace(/\?.*$/, '').replace(/^https?:\/\/[^/]+/, '') || '/';
    return getTitleForPath(pathname);
}

/**
 * Create router bound to model (sets model.location on navigate).
 * Updates document.title on client when route changes.
 * @param model - Model with location
 * @returns Router with navigate, delegateNavigation, bindHistory, createUrl
 */
export function createAppRouter(model: { location: Location | null }): Router {
    const action = (location: Location) => {
        model.location = location;
        if (typeof document !== 'undefined') document.title = getTitleForPath(location.path);
    };

    return createRouter([
        { path : '/', action },
        { path : '{{ROUTE_ABOUT}}', action }
    ]);
}
