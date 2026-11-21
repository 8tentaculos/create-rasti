import { Model } from 'rasti';
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

{{#if SSR}}
/**
 * Every page `lazy` created, for `loadPages`.
 * @type {Array<{ load : () => Promise<unknown> }>}
 */
const lazyPages = [];

{{#endif}}
/**
 * A page kept in a chunk of its own. `Component` is `null` until `load` imports it.
 * @template T
 * @param {() => Promise<{ default : T }>} importModule - Imports the page module, e.g. `() => import('./components/About.js')`.
 * @returns {{ Component : T|null, load : () => Promise<T> }}
 */
const lazy = (importModule) => {
    /** @type {{ Component : T|null, load : () => Promise<T> }} */
    const page = {
        Component : null,
        async load() {
            page.Component ??= (await importModule()).default;
            return page.Component;
        }
    };
{{#if SSR}}
    lazyPages.push(page);
{{#endif}}
    return page;
};

/**
 * About page, loaded by its route on the first visit.
 */
export const About = lazy(() => import('./components/About.js'));
{{#if SSR}}

/**
 * Load every page kept in a chunk of its own. The server awaits it before its first render, so
 * no request waits for a chunk{{#if CSSFUN}}, and every page embeds the style sheets of all of them,
 * whatever pages earlier requests loaded: the browser finds them in the page and attaches none{{#endif}}.
 * @returns {Promise<void>}
 */
export async function loadPages() {
    await Promise.all(lazyPages.map((page) => page.load()));
}
{{#endif}}

/**
 * Model the router updates and `App` renders.
 * @typedef {Object} RouteState
 * @property {import('./lib/router.js').Location|null} location - Location of the page shown, `null` for a URL no route matches.
 */

/**
 * Route `url` before mounting `App`: create the model it renders and the router that
 * updates it, and navigate to `url`, which loads the chunk of its page. Rendering is
 * synchronous, so await it before rendering on the server or hydrating in the browser.
 * Updates document.title on client when route changes.
 * @param {string} url - Path and query.
 * @returns {Promise<{ model: RouteState, router: import('./lib/router.js').Router }>} The `model` and `router` options for `App`.
 */
export async function route(url) {
    const model = /** @type {RouteState} */ (new Model({ location : null }));

    /**
     * Action that shows a page, once its chunk (if any) is loaded.
     * @param {{ load : () => Promise<*> }} [page] - Lazy page the route renders.
     * @returns {(location: import('./lib/router.js').Location, context: import('./lib/router.js').ActionContext) => Promise<void>}
     */
    const show = (page) => async (location, { signal }) => {
        await page?.load();
        // A newer navigation took over while the chunk loaded.
        if (signal.aborted) return;
        model.location = location;
        if (typeof document !== 'undefined') document.title = getTitleForPath(location.path);
    };

    const router = createRouter([
        { path : '/', action : show() },
        { path : '{{ROUTE_ABOUT}}', action : show(About) }
    ]);

    await router.navigate(url, { addToHistory : false });

    return { model, router };
}
