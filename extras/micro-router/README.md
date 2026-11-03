# micro-router

A minimal router for [Rasti](https://rasti.js.org) + Vite projects. It handles route matching, URL creation, browser history, and delegated link clicks. Matching is powered by [path-to-regexp](https://github.com/pillarjs/path-to-regexp).

## Why it exists

[Rasti](https://rasti.js.org) projects need routing that runs the same way in the browser and during SSR. This router stays small for that use case: no framework adapters, no component API, and no rendering opinion. It was written for `create-rasti`, but it only depends on plain JavaScript route objects and actions.

## Usage

```javascript
import createRouter from './src/index.js';

const routes = [
    { path : '/', action : (location) => { /* render Home */ } },
    { path : '/about', action : (location) => { /* render About */ } },
    { path : '/users/:id', action : (location) => { /* render User, location.params.id */ } }
];

const router = createRouter(routes, { baseUrl : '' });

// Browser: delegate link clicks and bind history.
router.delegateNavigation(document.querySelector('#app'));
router.bindHistory();

// Programmatic navigation.
router.navigate('/about');

// Async actions can be awaited.
await router.navigate('/users/123');

// URL building with params and query.
router.createUrl('/users/:id', { id : '123' }, { tab : 'posts' });
// => '/users/123?tab=posts'
```

In the browser, links opt in to client-side navigation with `data-router`:

```html
<a href="/about" data-router>About</a>
```

## API

`createRouter(routes, options?)` returns `{ navigate, createUrl, delegateNavigation, bindHistory }`.

| Method | Description |
|---|---|
| `navigate(url, options?)` | Matches `url`, updates browser history when available, invokes the matched route's `action(location)`, and returns the action result. Async actions return a Promise. Options: `{ addToHistory = true, replaceHistory = false }`. |
| `createUrl(path, params?, query?)` | Builds a URL from a route path, route params, and query params. |
| `delegateNavigation(rootElement)` | Intercepts left-clicks on descendant `a[data-router]` links and routes them through `navigate`. Returns a cleanup function. |
| `bindHistory()` | Listens for `popstate` and navigates to the current URL without pushing a new history entry. A `popstate` that keeps the path and query — a jump to an in-page anchor — is ignored. Returns a cleanup function. |

**Options:** `{ baseUrl?: string }` — prepended to generated URLs and stripped before matching. It is only stripped as a prefix, on a path segment boundary: with `baseUrl: '/app'`, `/app/about` matches `/about` while `/application/x` and `/en/app-store/x` are left alone.

**Route:** `{ path: string, action: (location) => any }`.

**Location:** `{ path, params, query, test(url): boolean }` — `params` and `query` are plain objects; `test(url)` reports whether a URL matches the same route. Wildcard params (`/files/*rest`) are arrays of path segments, matching what `path-to-regexp` produces and what `createUrl` expects back.

The fragment is dropped before matching: `/about#section` matches `/about`, and `#section` never leaks into `query`.

Full type signatures live in the JSDoc of `src/index.js`.

## Untrusted input

`params` and `query` are decoded but never transformed. They are attacker-controlled: anyone can craft a URL.

The router does not escape them. Escaping is only meaningful against a known sink — HTML text, an attribute, a `href`, a query, JSON — and the router does not know where a value ends up.

Escape at the point of output, in the context of that output. Template engines that escape interpolations automatically — Rasti's `Component.sanitize` among them — already cover the common case; manual `innerHTML`, `href`, or query building do not.

Note that a param matches any single segment: `/user/:id` matches `/user/abc` as readily as `/user/123`. `path-to-regexp` v8 dropped inline patterns, so a route cannot narrow this — validate in the action and decide there what a bad param means (404, redirect, coercion).

## Redirects

`navigate` updates history before running the action, so an action that redirects can replace the entry it was reached through:

```javascript
{
    path : '/admin',
    action : (location) => {
        if (!session.user) return router.navigate('/login', { replaceHistory : true });
        // ...
    }
}
```

Without `replaceHistory`, the redirect leaves `/admin` in the back stack and the back button lands on a route that redirects again.

## Links

`delegateNavigation` only takes over a link it can own. It leaves the browser's default handling in place — no `preventDefault` — for cross-origin hrefs, `target` other than `_self`, `download`, and `rel="external"`. Modified and non-left clicks are ignored as usual.

## Copy model

This package is meant to be copied into an application, not installed as a public runtime dependency. `create-rasti --router` copies `src/index.js` into the generated project as `src/lib/router.js` and adds `path-to-regexp` to that project's dependencies.

For manual use:

```bash
cp -r extras/micro-router/src ./my-project/src/router
```

```javascript
import createRouter from './src/router/index.js';
```

## License

[MIT](../../LICENSE)
