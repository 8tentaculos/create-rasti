import path from 'node:path';
import { generateIcons } from '../../extras/rasti-icons/src/generate.js';
import { PRESETS } from '../../extras/rasti-icons/src/presets.js';

/**
 * Add icons: fetch SVG components from the selected icon set(s) and write under src/icons/.
 * One set → flat `src/icons/`; multiple sets → `src/icons/<preset>/` each.
 * @param {object} ctx - Context with plan, targetDir
 */
export async function applyIcons(ctx) {
    const { plan, targetDir } = ctx;
    const sets = plan.features.icons;
    const baseDir = path.join(targetDir, 'src', 'icons');
    const useSubdirs = sets.length > 1;

    for (const key of sets) {
        const preset = PRESETS[key];
        const output = useSubdirs ? path.join(baseDir, key) : baseDir;
        await generateIcons({ source : preset.source, license : preset.license, output });
    }
}
