# rasti-icons

Generate [Rasti](https://rasti.js.org) components from GitHub-hosted SVG icon sets.

This tool is used by `create-rasti --icons`, and it can also run directly when a project needs to regenerate icons or use a custom SVG source.

## With create-rasti

```bash
npm create rasti my-app --icons
npm create rasti my-app --icons pixelarticons
npm create rasti my-app --icons heroicons-outline,heroicons-solid
```

The default preset is `heroicons-outline`. A single preset writes components to `src/icons/`; multiple presets write each set to `src/icons/<preset>/`.

## Standalone usage

### Built-in presets

```bash
node bin/rasti-icons.js --preset heroicons-outline
node bin/rasti-icons.js --preset akar-icons --output ./src/icons
node bin/rasti-icons.js --preset feathericon --output ./src/icons
node bin/rasti-icons.js --preset pixelarticons --output ./src/icons
```

Available presets: `heroicons-outline`, `heroicons-solid`, `akar-icons`, `feathericon`, `pixelarticons`.

When `--output` is omitted, preset output defaults to `./icons/<preset>`.

### Custom SVG set

```bash
node bin/rasti-icons.js \
  --source https://api.github.com/repos/owner/repo/contents/path/to/svgs \
  --license https://raw.githubusercontent.com/owner/repo/main/LICENSE \
  --output ./icons
```

`--source` must be a GitHub API directory listing URL that returns a JSON array of file objects with `download_url`. `--license` is optional. Custom source output defaults to `./icons`.

## Generated components

Each SVG file becomes a Rasti component. The generated component accepts optional `props.className`, `props.width`, and `props.height`. If width or height is not provided, the original SVG dimensions are used.

```javascript
import Heart from './icons/Heart.js';

// Mount with default size.
Heart.mount({}, container);

// Mount with custom class and size.
Heart.mount({ className : 'icon icon-red', width : '32', height : '32' }, container);
```

Icon filenames are converted from `kebab-case.svg` to `PascalCase.js`.

## Licenses

Each generated output directory contains a `LICENSE.txt` with the upstream icon set license when a license URL is provided.

## License

[MIT](../../LICENSE)
