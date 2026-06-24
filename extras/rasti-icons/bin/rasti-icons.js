#!/usr/bin/env node
import path from 'node:path';
import { generateIcons } from '../src/generate.js';
import { DEFAULT_PRESET, PRESETS } from '../src/presets.js';

function parseArgs(argv) {
    const args = { preset : null, source : null, license : null, output : null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--preset')       { args.preset  = argv[++i]; }
        else if (arg === '--source')  { args.source  = argv[++i]; }
        else if (arg === '--license') { args.license = argv[++i]; }
        else if (arg === '--output')  { args.output  = argv[++i]; }
    }
    return args;
}

function showHelp() {
    const presetList = Object.keys(PRESETS).map(k => `    ${k}`).join('\n');
    console.log(`
rasti-icons — Generate Rasti icon components from GitHub-hosted SVG sets

Usage:
  rasti-icons --preset <name> [--output <dir>]
  rasti-icons --source <github-api-url> [--license <url>] --output <dir>

Options:
  --preset <name>    Built-in preset (see below)
  --source <url>     GitHub API URL for a directory listing of SVG files
  --license <url>    Raw URL for the license file (optional)
  --output <dir>     Output directory (default: ./icons/<preset> or ./icons)

Presets:
${presetList}

Examples:
  rasti-icons --preset ${DEFAULT_PRESET}
  rasti-icons --preset heroicons-outline --output ./src/icons
  rasti-icons --preset akar-icons --output ./src/icons
  rasti-icons --preset feathericon --output ./src/icons
  rasti-icons --preset pixelarticons --output ./src/icons
  rasti-icons --source https://api.github.com/repos/owner/repo/contents/svg --output ./icons
`);
}

async function main() {
    const argv = process.argv.slice(2);

    if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
        showHelp();
        return;
    }

    const args = parseArgs(argv);

    let source  = args.source;
    let license = args.license;
    let outputDir = args.output;

    if (args.preset) {
        const preset = PRESETS[args.preset];
        if (!preset) {
            console.error(`Unknown preset "${args.preset}". Valid presets: ${Object.keys(PRESETS).join(', ')}`);
            process.exit(1);
        }
        source  = source  || preset.source;
        license = license || preset.license;
        if (!outputDir) outputDir = `./icons/${args.preset}`;
    }

    if (!source) {
        showHelp();
        process.exit(1);
    }

    if (!outputDir) outputDir = './icons';

    const output = path.resolve(process.cwd(), outputDir);
    console.log(`Fetching icons from ${source}...`);
    const count = await generateIcons({ source, license, output });
    console.log(`Done. Generated ${count} icon${count !== 1 ? 's' : ''} → ${output}`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
