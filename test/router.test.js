import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import createRouter from '../extras/micro-router/src/index.js';

/**
 * Builds a router whose routes record the `Location` they were called with.
 * @param {Array.<string>} paths - Route path patterns.
 * @param {Object} [options] - Router options.
 * @returns {Object} The router plus a `calls` array of recorded locations.
 */
function buildRouter(paths, options = {}) {
    const calls = [];
    const routes = paths.map(path => ({ path, action : (location) => { calls.push(location); return path; } }));
    return { router : createRouter(routes, options), calls };
}

/** Navigates with history disabled and silences the no-match log. */
function go(router, url) {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
        return router.navigate(url, { addToHistory : false });
    } finally {
        spy.mockRestore();
    }
}

describe('baseUrl stripping', () => {
    it('only strips baseUrl as a prefix, not anywhere in the url', () => {
        const { router, calls } = buildRouter(['/en/app-store/x'], { baseUrl : '/app' });

        go(router, '/en/app-store/x');

        expect(calls).toHaveLength(1);
        expect(calls[0].path).toBe('/en/app-store/x');
    });

    it('only strips baseUrl on a path segment boundary', () => {
        const { router, calls } = buildRouter(['/application/x'], { baseUrl : '/app' });

        go(router, '/application/x');

        expect(calls).toHaveLength(1);
    });

    it('matches the root route when navigating to the baseUrl itself', () => {
        const { router, calls } = buildRouter(['/'], { baseUrl : '/app' });

        go(router, '/app');

        expect(calls).toHaveLength(1);
        expect(calls[0].path).toBe('/');
    });

    it('strips baseUrl from nested paths', () => {
        const { router, calls } = buildRouter(['/about'], { baseUrl : '/app' });

        go(router, '/app/about');

        expect(calls[0].path).toBe('/about');
    });
});

describe('fragments', () => {
    it('matches a url carrying a fragment', () => {
        const { router, calls } = buildRouter(['/about']);

        go(router, '/about#section');

        expect(calls).toHaveLength(1);
    });

    it('keeps the fragment out of the query', () => {
        const { router, calls } = buildRouter(['/about']);

        go(router, '/about?a=1#section');

        expect(calls[0].query).toEqual({ a : '1' });
    });
});

describe('params', () => {
    it('keeps wildcard params as arrays of segments', () => {
        const { router, calls } = buildRouter(['/files/*rest']);

        go(router, '/files/a/b/c');

        expect(calls[0].params.rest).toEqual(['a', 'b', 'c']);
    });

    it('round-trips a wildcard location back through createUrl', () => {
        const { router, calls } = buildRouter(['/files/*rest']);

        go(router, '/files/a/b/c');

        expect(router.createUrl(calls[0].path, calls[0].params)).toBe('/files/a/b/c');
    });

    it('passes params through undecorated', () => {
        const { router, calls } = buildRouter(['/u/:id']);

        go(router, '/u/%3Cscript%3E');

        expect(calls[0].params.id).toBe('<script>');
    });

    it('passes query through undecorated', () => {
        const { router, calls } = buildRouter(['/s']);

        go(router, '/s?q=%3Cscript%3E');

        expect(calls[0].query.q).toBe('<script>');
    });
});

describe('memoized matchers', () => {
    it('stays correct across repeated calls on the same route', () => {
        const { router, calls } = buildRouter(['/u/:id']);

        go(router, '/u/1');
        const { test } = calls[0];

        expect(test('/u/2')).toBe(true);
        expect(test('/about')).toBe(false);
        expect(test('/u/3')).toBe(true);

        go(router, '/u/4');

        expect(calls.map(location => location.params.id)).toEqual(['1', '4']);
    });

    it('keeps routes sharing a prefix distinct', () => {
        const { router, calls } = buildRouter(['/u/new', '/u/:id']);

        go(router, '/u/new');
        go(router, '/u/7');
        go(router, '/u/new');

        expect(calls.map(location => location.path)).toEqual(['/u/new', '/u/:id', '/u/new']);
    });
});

describe('delegateNavigation', () => {
    let handler;
    let scrolled;

    /** Minimal anchor stub: the handler only reads these members. */
    const anchor = (attrs, href) => ({
        getAttribute : (name) => (name in attrs ? attrs[name] : null),
        hasAttribute : (name) => name in attrs,
        href
    });

    /** Click event whose target resolves to `found` via closest(). */
    const click = (found) => ({
        button : 0,
        defaultPrevented : false,
        target : { closest : () => found },
        preventDefault : vi.fn()
    });

    beforeEach(() => {
        scrolled = false;
        globalThis.window = {
            location : { href : 'https://example.com/current', origin : 'https://example.com' },
            scrollTo : () => { scrolled = true; },
            history : { pushState : () => {}, replaceState : () => {} }
        };
        handler = null;
    });

    afterEach(() => {
        delete globalThis.window;
    });

    /** Delegates on a fake root element and returns the registered click handler. */
    function delegate(router) {
        const root = { addEventListener : (_, fn) => { handler = fn; }, removeEventListener : () => {} };
        router.delegateNavigation(root);
        return handler;
    }

    it('intercepts same-origin links', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);
        const event = click(anchor({ href : '/about' }, 'https://example.com/about'));

        onClick(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(calls).toHaveLength(1);
        expect(scrolled).toBe(true);
    });

    it('leaves cross-origin links to the browser', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);
        const event = click(anchor({ href : 'https://evil.example/about' }, 'https://evil.example/about'));

        onClick(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(calls).toHaveLength(0);
    });

    it('leaves links with a target to the browser', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);
        const event = click(anchor({ href : '/about', target : '_blank' }, 'https://example.com/about'));

        onClick(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(calls).toHaveLength(0);
    });

    it('leaves download links to the browser', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);
        const event = click(anchor({ href : '/about', download : '' }, 'https://example.com/about'));

        onClick(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(calls).toHaveLength(0);
    });

    it('leaves rel="external" links to the browser', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);
        const event = click(anchor({ href : '/about', rel : 'noopener external' }, 'https://example.com/about'));

        onClick(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(calls).toHaveLength(0);
    });

    it('resolves the href attribute when href is not a string (SVG anchors)', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);
        // SVGAElement exposes href as an SVGAnimatedString.
        const event = click(anchor({ href : '/about' }, { baseVal : '/about' }));

        onClick(event);

        expect(calls).toHaveLength(1);
    });

    it('ignores targets that cannot be queried', () => {
        const { router, calls } = buildRouter(['/about']);
        const onClick = delegate(router);

        expect(() => onClick({ button : 0, defaultPrevented : false, target : null, preventDefault : vi.fn() })).not.toThrow();
        expect(calls).toHaveLength(0);
    });
});

describe('bindHistory', () => {
    it('is a no-op without a window', () => {
        const { router } = buildRouter(['/']);

        expect(typeof router.bindHistory()).toBe('function');
    });
});

describe('redirect via replaceHistory', () => {
    it('replaces the entry the redirecting action was reached through', () => {
        const history = [];
        globalThis.window = {
            location : { href : 'https://example.com/', origin : 'https://example.com' },
            history : {
                pushState : (_s, _t, url) => { history.push(url); },
                replaceState : (_s, _t, url) => { history[history.length - 1] = url; }
            }
        };

        const routes = [
            { path : '/admin', action : () => router.navigate('/login', { replaceHistory : true }) },
            { path : '/login', action : () => 'login' }
        ];
        const router = createRouter(routes);

        router.navigate('/admin');

        expect(history).toEqual(['/login']);
        delete globalThis.window;
    });
});
