import { match, compile } from 'path-to-regexp';

/**
 * Route parameters by name. Wildcard parameters (e.g. `*rest`) are arrays of path segments.
 * @typedef {Object.<string, (string|Array.<string>)>} Params
 */

/**
 * @typedef {Object} Location
 * @property {string} path - The route path pattern (e.g., `/user/:id`).
 * @property {Params} params - Route parameters decoded from the URL path. Wildcard parameters (e.g. `*rest`) are arrays of path segments. Untrusted input: escape at the point of output.
 * @property {Object.<string, string>} query - Query parameters parsed from the URL query string. Untrusted input, same as `params`.
 * @property {(url: string) => boolean} test - A function to test if a given URL matches this route. Returns `true` if the URL matches the route, `false` otherwise.
 */

/**
 * @typedef {Object} Route
 * @property {string} path - The route path pattern (e.g., `/user/:id`).
 * @property {(location: Location) => *} action - The action function to call when the route matches. Receives a `Location` object as parameter.
 */

/**
 * @typedef {Object} NavigateOptions
 * @property {boolean} [addToHistory=true] - Whether to add the navigation to the browser's history.
 * @property {boolean} [replaceHistory=false] - Whether to replace the current history entry instead of adding a new one.
 */

/**
 * @typedef {Object} Router
 * @property {(url: string, options?: NavigateOptions) => *} navigate - Navigates to a given URL, matches a route, and returns its action result.
 * @property {(path: string, params?: Params, query?: Object.<string, string>) => string} createUrl - Creates a URL from a route path, parameters, and query string.
 * @property {(rootElement: HTMLElement) => () => void} delegateNavigation - Delegates navigation events for links with `data-router` attributes. Returns a cleanup function.
 * @property {() => () => void} bindHistory - Binds browser history changes to the navigation logic. Returns a cleanup function.
 */

/**
 * Creates a router with navigation, URL creation, and event delegation.
 *
 * `params` and `query` on a `Location` come from the URL and are decoded but not
 * escaped. Escape them at the point of output, in the context of that output.
 *
 * @param {Array.<Route>} routes - Array of route objects. Each route must have a `path` and an `action` function.
 * @param {Object} [routerOptions={}] - Options for the router.
 * @param {string} [routerOptions.baseUrl=''] - A base URL to prepend to all routes and navigation.
 * @returns {Router} - Router object with navigation, URL creation, and event delegation methods.
 */
export default function createRouter(routes, routerOptions = {}) {
    const { baseUrl = '' } = routerOptions;

    /**
     * Compiled matchers, keyed by route path. Built on first match and reused afterwards.
     * @type {Map<string, import('path-to-regexp').MatchFunction<Params>>}
     */
    const matchers = new Map();

    /**
     * Path and query of the last URL routed, to tell a new page from an in-page anchor jump.
     * @type {string|null}
     */
    let currentUrl = null;

    /**
     * Removes `baseUrl` from the start of a pathname.
     * Only strips on a path segment boundary, so a `baseUrl` of `/app` leaves
     * `/application/x` untouched.
     * @param {string} pathname - The pathname to strip.
     * @returns {string} - The pathname without the base url.
     * @private
     */
    const stripBaseUrl = (pathname) => {
        if (!baseUrl || !pathname.startsWith(baseUrl)) return pathname;

        const rest = pathname.slice(baseUrl.length);
        return rest === '' || rest.startsWith('/') ? rest : pathname;
    };

    /**
     * Gets the pathname and query string from a given url.
     * The fragment is dropped: it takes no part in matching.
     * @param {string} url - The url to get the pathname and query string from.
     * @returns {{ pathname: string, query: (string|undefined) }} - The pathname and query string.
     * @private
     */
    const getUrlParts = (url) => {
        const [pathname, query] = url.split('#')[0].split('?');
        // Stripping the whole pathname (a url equal to `baseUrl`) leaves the root route.
        return { pathname : stripBaseUrl(pathname) || '/', query };
    };

    /**
     * Gets the memoized matcher for a route path.
     * @param {string} routePath - The route path to match against.
     * @returns {import('path-to-regexp').MatchFunction<Params>} - The matcher function.
     * @private
     */
    const getMatcher = (routePath) => {
        let matcher = matchers.get(routePath);

        if (!matcher) {
            matcher = /** @type {import('path-to-regexp').MatchFunction<Params>} */ (match(routePath, { decode : decodeURIComponent }));
            matchers.set(routePath, matcher);
        }

        return matcher;
    };

    /**
     * Gets the match result from a given pathname and route path.
     * @param {string} pathname - The pathname to match.
     * @param {string} routePath - The route path to match.
     * @returns {import('path-to-regexp').Match<Params>} - The match result, or `false` if no match is found.
     * @private
     */
    const getMatch = (pathname, routePath) => getMatcher(routePath)(pathname);

    /**
     * Matches a given url against the routes.
     * @param {string} url - The url to match.
     * @returns {(() => *)|null} - A function that calls the matched route's action with a `Location` object, or `null` if no match is found.
     * @private
     */
    const matchRoute = (url) => {
        const { pathname, query } = getUrlParts(url);

        for (const route of routes) {
            const matched = getMatch(pathname, route.path);

            if (matched) {
                /** @type {Location} */
                const location = {
                    path : route.path,
                    params : matched.params,
                    query : Object.fromEntries(new URLSearchParams(query).entries()),
                    test : (url) => !!getMatch(getUrlParts(url).pathname, route.path)
                };

                return () => route.action(location);
            }
        }

        return null;
    };

    /**
     * Navigates to a given path, matches a route, and calls its action with a `Location` object.
     *
     * History is updated before the action runs, so an action that redirects can
     * replace the entry it was reached through: `navigate('/login', { replaceHistory : true })`.
     *
     * @param {string} url - The path to navigate to, including query string.
     * @param {NavigateOptions} [options={}] - Options for navigation.
     * @returns {*} The matched route action result, or `undefined` if no route matches. Async actions return a Promise.
     */
    const navigate = (url, options = {}) => {
        const { addToHistory = true, replaceHistory = false } = options;
        // Match the route and query
        const matched = matchRoute(url);

        if (matched) {
            currentUrl = url.split('#')[0];
            // Handle browser history
            if (addToHistory && typeof window !== 'undefined') {
                window.history[replaceHistory ? 'replaceState' : 'pushState']({}, '', url);
            }
            // Call the route's action
            return matched();
        } else {
            console.error('No route matched:', url);
        }

        return undefined;
    };

    /**
     * Creates a URL from a route path, parameters, and query string.
     * @param {string} path - The route path (e.g., `/user/:id`).
     * @param {Params} [params={}] - Parameters to replace in the path (e.g., `{ id : '123' }` for `/user/:id`). Wildcard parameters take an array of segments.
     * @param {Object.<string, string>} [query={}] - Query parameters to append to the URL (e.g., `{ page : '1', sort : 'name' }`).
     * @returns {string} - The generated URL with query parameters.
     */
    const createUrl = (path, params = {}, query = {}) => {
        const toPath = compile(path, { encode : encodeURIComponent });
        const basePath = toPath(params);

        const queryString = new URLSearchParams(query).toString();
        return `${baseUrl}${queryString ? `${basePath}?${queryString}` : basePath}`;
    };

    /**
     * Delegates navigation events for links with `data-router` attributes.
     * Links the router cannot own (cross-origin, `target`, `download`, `rel="external"`)
     * are left to the browser's default handling.
     * @param {HTMLElement} rootElement - The root element to listen for click events.
     * @returns {() => void} - A function to undelegate the event listener.
     */
    const delegateNavigation = (rootElement) => {
        /** @param {MouseEvent} event */
        const handleClick = (event) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 || // Only left-click
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey // Modifier keys
            ) {
                return;
            }

            const target = /** @type {Element|null} */ (event.target);
            const anchor = /** @type {HTMLAnchorElement|SVGAElement|null} */ (
                typeof target?.closest === 'function' ? target.closest('a[data-router]') : null
            );

            if (!anchor) return;

            const anchorTarget = anchor.getAttribute('target');
            const rel = anchor.getAttribute('rel');

            if (
                anchor.hasAttribute('download') ||
                (anchorTarget && anchorTarget !== '_self') ||
                (rel && rel.split(/\s+/).includes('external'))
            ) {
                return;
            }

            // `href` is an absolute string on HTML anchors; SVG anchors need the raw attribute.
            const href = typeof anchor.href === 'string' ? anchor.href : anchor.getAttribute('href');

            if (href === null) return;

            const url = new URL(href, window.location.href);

            if (url.origin !== window.location.origin) return;

            event.preventDefault();
            window.scrollTo({ top : 0, behavior : 'instant' });
            navigate(url.pathname + url.search);
        };
        // Bind the click event to the root element.
        rootElement.addEventListener('click', handleClick);
        // Return a function to remove the event listener.
        return () => {
            rootElement.removeEventListener('click', handleClick);
        };
    };

    /**
     * Binds browser history changes to the navigation logic.
     * A `popstate` that keeps the routed path and query, such as a jump to an in-page
     * anchor, is ignored. No-op outside the browser.
     * @returns {() => void} - A function to unbind the `popstate` event listener.
     */
    const bindHistory = () => {
        if (typeof window === 'undefined') return () => {};

        const handlePopState = () => {
            const url = window.location.pathname + window.location.search;
            // Routing the same URL again would re-render the page under the reader.
            if (url === currentUrl) return;
            // On popstate, navigate to the current URL
            navigate(url, { addToHistory : false });
        };

        window.addEventListener('popstate', handlePopState);

        // Return a function to remove the event listener
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    };

    return { navigate, createUrl, delegateNavigation, bindHistory };
}
