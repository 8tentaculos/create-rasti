import { parseArgs } from './args.js';
import { runPrompts } from './prompts.js';
import { createPlan } from './plan.js';
import { validatePlan } from './validate.js';
import { applyPlan } from './apply/index.js';
import { log, intro, outro } from './utils/logger.js';
import { DEFAULT_PRESET, PRESET_IDS } from '../extras/rasti-icons/src/presets.js';

/**
 * Main entry point for the CLI.
 * Handles both flag-based and interactive modes.
 * @param {string[]} argv - Command line arguments
 */
export async function run(argv) {
    try {
        intro();

        const args = parseArgs(argv);

        if (args.help) {
            showHelp();
            return;
        }

        const needsPrompts = !args.name;

        let options;
        if (needsPrompts) {
            options = await runPrompts(args);
            if (!options) return; // User cancelled
        } else {
            options = args;
        }

        const plan = createPlan(options);
        const validation = validatePlan(plan);

        if (!validation.valid) {
            log.error(validation.error);
            process.exit(1);
        }

        await applyPlan(plan);

        outro(plan.name, plan.packageManager);
    } catch (error) {
        log.error(error.message);
        process.exit(1);
    }
}

/**
 * Show help message.
 */
function showHelp() {
    const presetList = PRESET_IDS.join(', ');

    console.log(`
create-rasti - Create Rasti + Vite projects

Usage:
  npm create rasti [project-name] [options]

Options:
  --ssr        Use SSR template instead of SPA
  --static     Use Static template (SSR + pre-rendered static build)
  --tailwind   Add Tailwind CSS
  --cssfun     Add CSSFUN (CSS-in-JS with light and dark themes)
  --icons [sets]     Add rasti-icons (preset ids: ${DEFAULT_PRESET} (default), ${presetList}).
                     Repeat flag or use comma-separated list. Multiple sets are written under src/icons/<preset>/ each;
                     a single set uses src/icons/ directly.
  --router     Add micro-router (universal router, two pages and links)
  --help       Show this help message

Examples:
  npm create rasti                     # Interactive mode
  npm create rasti my-app              # Create SPA project
  npm create rasti my-app --ssr        # Create SSR project
  npm create rasti my-app --static     # Create static site (SSR + static build)
  npm create rasti my-app --tailwind   # Create SPA with Tailwind
  npm create rasti my-app --icons                       # SPA with ${DEFAULT_PRESET} in src/icons
  npm create rasti my-app --icons heroicons-outline     # SPA with heroicons-outline in src/icons
  npm create rasti my-app --icons akar-icons            # SPA with akar-icons in src/icons
  npm create rasti my-app --icons feathericon           # SPA with feathericon in src/icons
  npm create rasti my-app --icons pixelarticons         # SPA with pixelarticons in src/icons
  npm create rasti my-app --icons heroicons-solid,heroicons-outline  # Multiple sets in subfolders under src/icons
  npm create rasti my-app --router     # SPA with two pages and universal router

Note: --tailwind and --cssfun are mutually exclusive.
`);
}
