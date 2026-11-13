# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `--ts` (alias `--typescript`) and a language prompt: the app is written in TypeScript, with a strict `tsconfig.json`, `npm run typecheck`, and a type check before `npm run build`. Components are `Component` subclasses; the router, `cn`, icons and the Node server stay JavaScript and are checked through `checkJs`.

- Generated projects get the Agent Skills shipped with `rasti` (always) and `cssfun` (with `--cssfun`) in `.agents/skills/`, linked from `.claude/skills/`. They are copied from the CLI's own dependencies, so no network is needed.
- Icon components take `size` (both dimensions) and `label` (accessible name; without it the icon is `aria-hidden`). Their props are typed inside the component and for its callers.

### Changed

- Bump generated-project `rasti` to `^5.0.0-alpha.0` and `cssfun` to `^0.4.0-alpha.0`.
- Bump generated-project `vite` to `^8.3.5`, `cross-env` to `^10.1.0`, `path-to-regexp` to `^9.0.0`, `tailwindcss` / `@tailwindcss/vite` to `^4.3.3`, `express` to `^5.3.0`, `compression` to `^1.8.2` and `sirv` to `^3.0.2`.
- `App` is a `Component` subclass with a stable `handleIncrement` class field, following the Rasti 5 skill.
- SSR: `window.__APP_OPTIONS__` escapes `<`, so a request URL holding `</script>` can't break out of the script tag; production 500 responses no longer include the stack trace.
- Icon components leave `class` out without a `className`, and follow the text color: hardcoded black becomes `currentColor`.
- micro-router: the scroll reset moves from `delegateNavigation` to `navigate()`, so a programmatic navigation also lands at the top. `navigate(url, { resetScroll : false })` keeps the position; a `popstate` leaves it to the browser.
- The JSDoc of `cn`, `router-setup.js`, the SSR `app.js` and `build-static.js` type-checks under `strict` with `checkJs` (TypeScript 5.9 and 7).

### Removed

- The network fetch of Rasti's `AGENTS.md` as `AGENTS-RASTI.md`, replaced by the bundled skills.

### Fixed

- Feathericon components: the XML prolog before `<svg>` kept `class`, `width` and `height` from being applied, and broke the single-root template under Rasti 5.
- micro-router: its typedefs used Closure function types (`function(string): boolean`), which TypeScript 7 doesn't parse; `Route`, `Router` and `Location` now resolve for TS consumers.
- `cn` and micro-router: `ClassValue` and `Params` were typed as `Object.<string, …>`, which a declaration build writes as `Object<string, …>`, not a valid TypeScript type (TS2315). They use `Record<string, …>`, as do the other generic JSDoc types in both helpers.
- micro-router: a `popstate` from an in-page anchor jump (`#section`) no longer routes the same URL again and re-renders the page.
- Generated `AGENTS.md` listed `npm start` and `npm run serve:static`, which don't exist; they are `npm run preview` and `npm run preview:static`.

## [0.0.2] - 2026-07-25

### Added

- GitHub Actions workflows for CI (`ci.yml`) and npm release (`release.yml`).

### Changed

- Bump generated-project `rasti` dependency to `^4.1.0`.
- Bump generated-project `cssfun` dependency to `^0.1.0`.

## [0.0.1] - 2026-06-24

### Added

- Initial release.
- SPA, SSR, and Static project templates.
- Optional features: Tailwind CSS, CSSFUN, micro-router, rasti-icons.
- Interactive mode via `@clack/prompts`.
- Conditional template engine with `{{#if}}` / `{{#elif}}` / `{{#else}}` / `{{#endif}}`.
- Convention-based styled template resolution (`-tailwind`, `-cssfun` variants).

[unreleased]: https://github.com/8tentaculos/create-rasti/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/8tentaculos/create-rasti/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/8tentaculos/create-rasti/releases/tag/v0.0.1
