import { Model } from 'rasti';
import createRouter from './lib/router.js';
import type { ActionContext, Location, Router } from './lib/router.js';

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

/** A page kept in a chunk of its own. `Component` is `null` until `load` imports it. */
interface LazyPage<T> {
    Component: T | null;
    load(): Promise<T>;
}

/**
 * Wraps the import of a page module.
 * @param importModule - Imports the page module, e.g. `() => import('./components/About.ts')`.
 */
const lazy = <T>(importModule: () => Promise<{ default: T }>): LazyPage<T> => {
    const page: LazyPage<T> = {
        Component : null,
        async load() {
            page.Component ??= (await importModule()).default;
            return page.Component;
        }
    };
    return page;
};

/** About page, loaded by its route on the first visit. */
export const About = lazy(() => import('./components/About.ts'));

interface RouteAttributes {
    /** Location of the page shown, `null` for a URL no route matches. */
    location: Location | null;
}

/** Model the router updates and `App` renders. */
export class RouteModel extends Model<RouteAttributes> {}
export interface RouteModel extends RouteAttributes {} // exposes the attributes on the model

/**
 * Route `url` before mounting `App`: create the model it renders and the router that
 * updates it, and navigate to `url`, which loads the chunk of its page. Rendering is
 * synchronous, so await it before rendering on the server or hydrating in the browser.
 * Updates document.title on client when route changes.
 * @param url - Path and query.
 * @returns The `model` and `router` options for `App`.
 */
export async function route(url: string): Promise<{ model: RouteModel, router: Router }> {
    const model = new RouteModel({ location : null });

    /** Action that shows a page, once its chunk (if any) is loaded. */
    const show = (page?: LazyPage<unknown>) => async (location: Location, { signal }: ActionContext) => {
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
