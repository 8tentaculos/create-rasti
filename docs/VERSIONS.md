# Versions

All versions pinned in generated projects live in [`src/versions.js`](../src/versions.js).

Base templates (`spa/package.json`, `ssr/package.json`) reference them through `{{*_VERSION}}` placeholders, resolved by `getBaseContext(plan)` in `src/apply/description.js`. Feature appliers (`tailwind.js`, `cssfun.js`, `router.js`) read the constants directly when calling `addDependencies`.

## Values outside `versions.js`

- **Logo / favicon CDN URLs** — derived from `VERSIONS.rasti`, exposed as `{{LOGO_SRC}}`, `{{LOGO_LIGHT_SRC}}`, and `{{FAVICON_SRC}}`. Bumping `rasti` updates them automatically.
- **`path-to-regexp`** — also pinned in `extras/micro-router/package.json` for local linting. Keep it in sync with `VERSIONS.pathToRegexp`.
- **External links pinned to `master`** — Rasti `AGENTS.md` URL (written as `AGENTS-RASTI.md`) in `src/apply/index.js` and the create-rasti repo link in `src/apply/featuresInclude.js`. Update only if the default branch changes.

## Bump checklist

1. Edit the constant in `src/versions.js`.
2. If bumping `pathToRegexp`, mirror in `extras/micro-router/package.json`.
3. If bumping `rasti`, verify the logo asset exists on the new tag.
4. Run `npm run lint`.
5. Generate a project with each relevant flag combination and verify it builds and runs:
   - SPA: `npm run dev`, `npm run build`, `npm run preview`
   - SSR: `npm run dev`, `npm run build`, `npm run preview`
   - Static: `npm run build:static`, `npm run preview:static`

Dev dependencies of this repo (`@clack/prompts`, `eslint`, etc.) do not affect generated output and can be bumped independently.
