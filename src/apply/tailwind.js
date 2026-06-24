import path from 'node:path';
import { copyTemplateFile } from '../utils/template.js';
import { addDependencies } from '../utils/pkg.js';
import { VERSIONS } from '../versions.js';

/**
 * Apply Tailwind CSS to the project.
 * @param {object} ctx - Context object with plan and targetDir
 */
export async function applyTailwind(ctx) {
    const { targetDir } = ctx;

    await addDependencies(targetDir, {
        devDependencies : {
            '@tailwindcss/vite' : VERSIONS.tailwindVite,
            'tailwindcss' : VERSIONS.tailwindcss
        }
    });

    // Copy Tailwind style.css (overwrites base style.css)
    await copyTemplateFile(
        '_features/tailwind/style.css',
        path.join(targetDir, 'src', 'style.css'),
        {}
    );

    // Copy Tailwind vite.config.js (overwrites base vite.config.js)
    await copyTemplateFile(
        '_features/tailwind/vite.config.js',
        path.join(targetDir, 'vite.config.js'),
        {}
    );
}
