/**
 * Routes to pre-render for `npm run build:static`.
 *
 * Each entry is either:
 * - A string path (trailing slash added if missing; output path is derived, e.g. `/about/` -> `about/index.html`).
 * - `{ route: string, output: string }` to fetch `route` and write HTML to `output` under dist/static (e.g. root `404.html`).
 *
 * @type {Array<string | { route: string, output: string }>}
 */
export default [
{{STATIC_ROUTES}}
    // Example: custom output file (uncomment and add a /404/ route in the app/router if needed)
    // { route : '/404/', output : '404.html' },
];
