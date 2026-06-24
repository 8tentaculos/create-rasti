# {{NAME}}

{{#if STATIC}}
Pre-rendered static site with [Rasti](https://rasti.js.org) {{RASTI_VERSION}} + [Vite](https://vite.dev) + [Express](https://expressjs.com){{#if TAILWIND}}, styled with [Tailwind CSS](https://tailwindcss.com){{#endif}}{{#if CSSFUN}}, styled with [CSSFUN](https://cssfun.js.org){{#endif}}.
{{#elif SSR}}
Server-side rendered app with [Rasti](https://rasti.js.org) {{RASTI_VERSION}} + [Vite](https://vite.dev) + [Express](https://expressjs.com){{#if TAILWIND}}, styled with [Tailwind CSS](https://tailwindcss.com){{#endif}}{{#if CSSFUN}}, styled with [CSSFUN](https://cssfun.js.org){{#endif}}.
{{#else}}
Single page app powered by [Rasti](https://rasti.js.org) {{RASTI_VERSION}} + [Vite](https://vite.dev){{#if TAILWIND}}, styled with [Tailwind CSS](https://tailwindcss.com){{#endif}}{{#if CSSFUN}}, styled with [CSSFUN](https://cssfun.js.org){{#endif}}.
{{#endif}}

## Commands

```bash
npm run dev      # development server (HMR)
npm run build    # production build
npm run preview  # preview production build
{{#if SSR}}
npm start        # start Express server (requires npm run build first)
{{#endif}}
{{#if STATIC}}
npm run build:static   # pre-render configured routes to dist/static/
npm run serve:static   # serve pre-rendered files locally
{{#endif}}
```

## Architecture

Components live in `src/components/` and are [Rasti components](./AGENTS-RASTI.md) defined with `Component.create`.
`App` is the root component — it owns `this.state` and passes values and callbacks down as props. State is a [Rasti Model](./AGENTS-RASTI.md); mutations trigger re-renders automatically.
{{#if CSSFUN}}
Theming uses `src/theme.js` (light/dark via `data-color-scheme` on `<html>`; CSS variables prefixed `--fun-*`).
{{#endif}}
{{#if ROUTER}}
Routing is handled by `src/router-setup.js` — routes update `state.location`; client-side links use the `data-router` attribute.
{{#endif}}
{{#if STATIC}}
Routes to pre-render are listed in `static.config.js`.
{{#endif}}

## Conventions

- ESM throughout, 4-space indentation, single quotes, semicolons
- Spaces around colons in objects: `{ key : value }`
- Component files are PascalCase; utilities are camelCase

## Rasti API reference

See [AGENTS-RASTI.md](./AGENTS-RASTI.md) — Rasti's AGENTS.md: component creation, template interpolations, lifecycle hooks, Model.
