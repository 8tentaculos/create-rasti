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
| `bindHistory()` | Listens for `popstate` and navigates to the current URL without pushing a new history entry. Returns a cleanup function. |

**Options:** `{ baseUrl?: string }` — prepended to generated URLs and stripped before matching.

**Route:** `{ path: string, action: (location) => any }`.

**Location:** `{ path, params, query, test(url): boolean }` — `params` and `query` are plain objects; `test(url)` reports whether a URL matches the same route.

Full type signatures live in the JSDoc of `src/index.js`.

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
