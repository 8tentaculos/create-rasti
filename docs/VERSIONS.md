# Versions

All versions pinned in generated projects live in [`src/versions.js`](../src/versions.js).

Base templates (`spa/package.json`, `ssr/package.json`) reference them through `{{*_VERSION}}` placeholders, resolved by `getBaseContext(plan)` in `src/apply/description.js`. Feature appliers (`tailwind.js`, `cssfun.js`, `router.js`) read the constants directly when calling `addDependencies`.

## Values outside `versions.js`

- **Logo / favicon CDN URLs** — derived from `VERSIONS.rasti`, exposed as `{{LOGO_SRC}}`, `{{LOGO_LIGHT_SRC}}`, and `{{FAVICON_SRC}}`. Bumping `rasti` updates them automatically.
- **`rasti` / `cssfun`** — also this repo's `dependencies`: `src/apply/agents.js` copies their Agent Skills (`node_modules/<pkg>/skills/<pkg>`) into generated projects, so they must match `VERSIONS.rasti` / `VERSIONS.cssfun`.
- **`path-to-regexp`** — also pinned in `extras/micro-router/package.json` for local linting, and in this repo's `devDependencies` so `test/router.test.js` can import the router. Keep both in sync with `VERSIONS.pathToRegexp`.
- **External links pinned to `master`** — the create-rasti repo link in `src/apply/featuresInclude.js`. Update only if the default branch changes.

## Bump checklist

1. Edit the constant in `src/versions.js`.
2. If bumping `pathToRegexp`, mirror in `extras/micro-router/package.json` and in this repo's `devDependencies`.
3. If bumping `rasti` or `cssfun`, mirror in this repo's `dependencies` and `npm install`, so the copied skills match.
4. If bumping `rasti`, verify the logo asset exists on the new tag.
5. Run `npm test` (`test/versions.test.js` fails on a missed mirror; it also runs lint).
6. Generate a project with each relevant flag combination and verify it builds and runs:
   - SPA: `npm run dev`, `npm run build`, `npm run preview`
   - SSR: `npm run dev`, `npm run build`, `npm run preview`
   - Static: `npm run build:static`, `npm run preview:static`

Dev dependencies of this repo (`@clack/prompts`, `eslint`, etc.) do not affect generated output and can be bumped independently.
