# create-rasti

Scaffold [Rasti](https://rasti.js.org) + [Vite](https://vite.dev) projects from the command line.

Pick a template (SPA, SSR, or pre-rendered Static), add styling, routing, and icon components — get a ready-to-run project in seconds.

## Quick start

```bash
npm create rasti        # interactive
npm create rasti my-app # SPA, non-interactive
```

Create a server-rendered project with routing and Tailwind:

```bash
npm create rasti my-app --ssr --router --tailwind
```

## Templates

- **SPA** *(default)*: Rasti + Vite for client-rendered applications.
- **SSR** *(`--ssr`)*: Rasti + Vite + Express, rendered on the server and hydrated in the browser.
- **Static** *(`--static`)*: SSR in development, plus `npm run build:static` to pre-render the URLs declared in `static.config.js` into `dist/static`.

For Static projects, string entries derive the output path from the route (`/about/` becomes `about/index.html`). Object entries such as `{ route, output }` allow custom output files, including a top-level `404.html`.

## Styling

Styling options are mutually exclusive:

- **`--tailwind`**: add [Tailwind CSS](https://tailwindcss.com).
- **`--cssfun`**: add [CSSFUN](https://cssfun.js.org), including light and dark theme setup.

Without either flag, the generated project uses plain CSS.

## Extras

### `--router`

Adds a small universal router built on [path-to-regexp](https://github.com/pillarjs/path-to-regexp). It is copied into the generated project as `src/lib/router.js`, then wired through `src/router-setup.js`, example pages, and an App shell with navigation.

The router is intentionally narrow: route matching, URL creation, browser history, and delegated `a[data-router]` links. It works with SPA, SSR, and Static templates.

### `--icons [preset[,preset...]]`

Generates one Rasti component per SVG icon under `src/icons/`:

```js
import Heart from './icons/Heart.js';
// <Heart className="..." width={24} height={24} />
```

A single preset writes components directly to `src/icons/`. Multiple presets write each set under `src/icons/<preset>/`.

| Preset | Source | License |
|---|---|---|
| `heroicons-outline` *(default)* | [Heroicons](https://heroicons.com) by Tailwind Labs | MIT |
| `heroicons-solid` | [Heroicons](https://heroicons.com) by Tailwind Labs | MIT |
| `akar-icons` | [Akar Icons](https://akaricons.com) by Arturo Wibawa | MIT |
| `feathericon` | [Feathericon](https://feathericon.github.io/feathericon/) by Megumi Hano | MIT |
| `pixelarticons` | [Pixelarticons](https://pixelarticons.com) by Halfmage | MIT |

SVGs are downloaded from GitHub when the project is generated, so this option requires an internet connection.

The CLI writes an `AGENTS.md` to the generated project root with project-specific context (stack, commands, architecture, conventions). It also tries to fetch Rasti's `AGENTS.md` as `AGENTS-RASTI.md`; if that request fails, project generation continues without it.

## Flags

| Flag | Description |
|------|-------------|
| `--ssr` | Use the SSR template |
| `--static` | Use the Static template |
| `--tailwind` | Add Tailwind CSS |
| `--cssfun` | Add CSSFUN |
| `--router` | Add micro-router |
| `--icons [preset[,preset]]` | Add rasti-icons (default preset: `heroicons-outline`) |
| `--help` | Show help |

`--ssr`/`--static` and `--tailwind`/`--cssfun` are mutually exclusive.

## Development

```bash
git clone https://github.com/8tentaculos/create-rasti.git
cd create-rasti
npm install
npm run test
npx create-rasti
```

Before bumping any version pinned in generated projects, see [`docs/VERSIONS.md`](docs/VERSIONS.md).

## License

[MIT](LICENSE)
