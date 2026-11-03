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
{{#if TS}}
npm run typecheck  # type-check with tsc (also run by build)
{{#endif}}
{{#if STATIC}}
npm run build:static    # pre-render configured routes to dist/static/
npm run preview:static  # serve pre-rendered files locally
{{#endif}}
```

## Architecture

`App` (`src/App.{{SRC_EXT}}`) is the root component, written as a `Component` subclass: it owns `this.state` (a Rasti `Model`) and passes values and callbacks down as props. Mutating the state re-renders it.
{{#if TS}}
Presentational components live in `src/components/` and are also `Component` subclasses, the form that types best: `Component<Props, State>` types `this.props` and `this.state`.
{{#else}}
Presentational components live in `src/components/` and are written with `Component.create`.
{{#endif}}
{{#if SSR}}
`src/entry-server.{{SRC_EXT}}` renders `App` to HTML for each request and `src/entry-client.{{SRC_EXT}}` hydrates it in the browser; `app.js` is the Express server that joins them.
{{#endif}}
{{#if CSSFUN}}
Theming uses `src/theme.js` (light/dark via `data-color-scheme` on `<html>`; CSS variables prefixed `--fun-*`).
{{#endif}}
{{#if ROUTER}}
Routing is handled by `src/router-setup.js` — routes update `state.location`; client-side links use the `data-router` attribute.
{{#endif}}
{{#if STATIC}}
Routes to pre-render are listed in `static.config.js`.
{{#endif}}
{{#if ICONS}}
Icon components generated from SVG live in `src/icons/`.
{{#endif}}

## Conventions

- ESM throughout, 4-space indentation, single quotes, semicolons
{{#if TS}}
- TypeScript in `src/` (strict, type-stripped by Vite, checked by `tsc`); `src/lib/`, the Node server files and generated icons are JavaScript typed with JSDoc, which `tsc` checks too (`checkJs`)
- Relative imports name the real file, extension included (`./App.ts`, `./lib/router.js`)
- A field set in `onCreate` is declared with `declare`: `onCreate` runs inside the base constructor, and a field initializer would reset it
{{#endif}}
- Spaces around colons in objects: `{ key : value }`
- Component files are PascalCase; utilities are camelCase
- Name callback props `handle*` (`handleIncrement`), never `on*`: those names belong to DOM events and lifecycle hooks

## Agent skills

Library references for agents, installed as [Agent Skills](https://agentskills.io) in `.agents/skills/` (linked from `.claude/skills/`):

- `rasti` — components, template interpolations, lifecycle hooks, models and server-side rendering
{{#if CSSFUN}}
- `cssfun` — style sheets, selectors, at-rules, themes and server-side rendering
{{#endif}}

They match the library versions this project was created with. After upgrading a library, refresh its skill from `node_modules/<library>/skills/<library>`.
