import { match, compile } from 'path-to-regexp';

/**
 * @typedef {Object} Location
 * @property {string} path - The route path pattern (e.g., `/user/:id`).
 * @property {Object.<string, string>} params - The route parameters extracted from the URL path, sanitized to prevent injection attacks.
 * @property {Object.<string, string>} query - The query parameters parsed from the URL query string.
 * @property {function(string): boolean} test - A function to test if a given URL matches this route. Returns `true` if the URL matches the route, `false` otherwise.
 */

/**
 * @typedef {Object} Route
 * @property {string} path - The route path pattern (e.g., `/user/:id`).
 * @property {function(Location): *} action - The action function to call when the route matches. Receives a `Location` object as parameter.
 */

/**
 * @typedef {Object} Router
 * @property {function(string, Object=): *} navigate - Navigates to a given URL, matches a route, and returns its action result.
 * @property {function(string, Object=, Object=): string} createUrl - Creates a URL from a route path, parameters, and query string.
 * @property {function(HTMLElement): function(): void} delegateNavigation - Delegates navigation events for links with `data-router` attributes. Returns a cleanup function.
 * @property {function(): function(): void} bindHistory - Binds browser history changes to the navigation logic. Returns a cleanup function.
 */

/**
 * Creates a router with navigation, URL creation, and event delegation.
 * @param {Array.<Route>} routes - Array of route objects. Each route must have a `path` and an `action` function.
 * @param {Object} [routerOptions={}] - Options for the router.
 * @param {string} [routerOptions.baseUrl=''] - A base URL to prepend to all routes and navigation.
 * @returns {Router} - Router object with navigation, URL creation, and event delegation methods.
 */
export default function createRouter(routes, routerOptions = {}) {
    const { baseUrl = '' } = routerOptions;

    /**
     * Gets the pathname and query string from a given url.
     * @param {string} url - The url to get the pathname and query string from.
     * @returns {Object} - The pathname and query string.
     * @private
     */
    const getUrlParts = (url) => {
        const [pathname, query] = url.replace(baseUrl, '').split('?');
        return { pathname, query };
    };

    /**
     * Gets the match result from a given pathname and route path.
     * @param {string} pathname - The pathname to match.
     * @param {string} routePath - The route path to match.
     * @returns {Object|null} - The match result, or `null` if no match is found.
     * @private
     */
    const getMatch = (pathname, routePath) => {
        const matcher = match(routePath, { decode : decodeURIComponent });
        return matcher(pathname);
    };

    /**
     * Matches a given url against the routes.
     * @param {string} url - The url to match.
     * @returns {(function(): *)|null} - A function that calls the matched route's action with a `Location` object, or `null` if no match is found.
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
                    params : sanitizeParams(matched.params),
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
     * @param {string} url - The path to navigate to, including query string.
     * @param {Object} [options={}] - Options for navigation.
     * @param {boolean} [options.addToHistory=true] - Whether to add the navigation to the browser's history.
     * @param {boolean} [options.replaceHistory=false] - Whether to replace the current history entry instead of adding a new one.
     * @returns {*} The matched route action result, or `undefined` if no route matches. Async actions return a Promise.
     */
    const navigate = (url, options = {}) => {
        const { addToHistory = true, replaceHistory = false } = options;
        // Match the route and query
        const matched = matchRoute(url);

        if (matched) {
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
     * @param {Object.<string, string>} [params={}] - Parameters to replace in the path (e.g., `{ id : '123' }` for `/user/:id`).
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
     * @param {HTMLElement} rootElement - The root element to listen for click events.
     * @returns {Function} - A function to undelegate the event listener.
     */
    const delegateNavigation = (rootElement) => {
        const handleClick = (event) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 || // Only left-click
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey // Modifier keys
            ) {
                return;
            }

            const anchor = event.target.closest('a[data-router]');

            if (anchor && anchor.href) {
                event.preventDefault();
                const url = new URL(anchor.href);
                window.scrollTo({ top : 0, behavior : 'instant' });
                navigate(url.pathname + url.search);
            }
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
     * @returns {Function} - A function to unbind the `popstate` event listener.
     */
    const bindHistory = () => {
        const handlePopState = () => {
            // On popstate, navigate to the current URL
            navigate(window.location.pathname + window.location.search, { addToHistory : false });
        };

        window.addEventListener('popstate', handlePopState);

        // Return a function to remove the event listener
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    };

    /**
     * Sanitizes route parameters to prevent injection attacks.
     * @param {Object} params - The route parameters.
     * @returns {Object} - The sanitized parameters.
     */
    const sanitizeParams = (params) => {
        const sanitized = {};
        for (const [key, value] of Object.entries(params)) {
            sanitized[key] = String(value).replace(/[<>]/g, '');
        }
        return sanitized;
    };

    return { navigate, createUrl, delegateNavigation, bindHistory };
}
