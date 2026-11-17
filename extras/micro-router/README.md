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
| `navigate(url, options?)` | Matches `url`, updates browser history when available, invokes the matched route's `action(location, { signal })`, and returns the action result. Async actions return a Promise. Options: `{ addToHistory = true, replaceHistory = false, resetScroll = true }`. A navigation that adds or replaces a history entry scrolls once the action is done: to the element the URL hash names, or to the top. Pass `resetScroll : false` to keep the position, e.g. for a tab switch that only updates the query. |
| `createUrl(path, params?, query?)` | Builds a URL from a route path, route params, and query params. |
| `delegateNavigation(rootElement)` | Intercepts left-clicks on descendant `a[data-router]` links and routes them through `navigate`, hash included. If the action rejects, the link is followed with a full page load. Returns a cleanup function. |
| `bindHistory()` | Listens for `popstate` and navigates to the current URL without pushing a new history entry or scrolling, so the browser restores the position. A `popstate` that keeps the path and query — a jump to an in-page anchor — is ignored. If the action rejects, the page is reloaded. Returns a cleanup function. |

**Options:** `{ baseUrl?: string }` — prepended to generated URLs and stripped before matching. It is only stripped as a prefix, on a path segment boundary: with `baseUrl: '/app'`, `/app/about` matches `/about` while `/application/x` and `/en/app-store/x` are left alone.

**Route:** `{ path: string, action: (location, context) => any }`. `context` is `{ signal: AbortSignal }`.

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

## Async actions

An action may return a Promise, e.g. to import the module of a page before rendering it. `navigate` returns that Promise, and the scroll waits for it, so a hash target rendered by the page is there to scroll to.

A slow action can finish after the reader has moved on. Each action receives a `signal`, aborted as soon as a newer navigation starts — a click, a `popstate`, or a redirect from the action itself. Check it before rendering, so a late page does not replace the current one:

```javascript
{
    path : '/reports',
    action : async (location, { signal }) => {
        // The page is a chunk of its own, loaded on first visit.
        const { default : Reports } = await import('./Reports.js');
        if (signal.aborted) return;
        model.page = Reports;
    }
}
```

The signal can also be handed to the requests the action makes, e.g. `fetch(url, { signal })`, to cancel them.

A rejected action rejects the Promise `navigate` returns, unless a newer navigation replaced it: then it resolves to `undefined`. Navigations the router starts on its own recover with a full page load instead: a link click loads its URL, and a `popstate` reloads the page. That covers a chunk that no longer exists after a new deploy.

## Links

`delegateNavigation` only takes over a link it can own. It leaves the browser's default handling in place — no `preventDefault` — for cross-origin hrefs, `target` other than `_self`, `download`, and `rel="external"`. Modified and non-left clicks are ignored as usual. A link to an anchor on the current page (same path and query, with a hash) is also left to the browser, which jumps to it without routing the page again.

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
