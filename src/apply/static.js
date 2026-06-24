import path from 'node:path';
import { copyTemplateFile } from '../utils/template.js';
import { mergeScripts } from '../utils/pkg.js';

/**
 * Build STATIC_ROUTES placeholder value for static.config.js.
 * @param {object} plan - Project plan
 * @returns {string} Lines for the array (e.g. "  '/',\n  '/about/',\n")
 */
function getStaticRoutes(plan) {
    if (plan.features.router) {
        return '    \'/\',\n    \'/about/\',\n';
    }
    return '    \'/\',\n';
}

/**
 * Apply static overlay: static.config.js, build script, package.json scripts.
 * @param {object} ctx - Context with plan and targetDir
 */
export async function applyStatic(ctx) {
    const { plan, targetDir } = ctx;

    const staticRoutes = getStaticRoutes(plan);
    await copyTemplateFile(
        'static/static.config.js',
        path.join(targetDir, 'static.config.js'),
        { STATIC_ROUTES : staticRoutes }
    );

    await copyTemplateFile(
        'static/scripts/build-static.js',
        path.join(targetDir, 'scripts', 'build-static.js'),
        {}
    );
    await copyTemplateFile(
        'static/scripts/serve-static.js',
        path.join(targetDir, 'scripts', 'serve-static.js'),
        {}
    );

    await mergeScripts(targetDir, {
        'build:static' : 'npm run build && node scripts/build-static.js',
        'preview:static' : 'node scripts/serve-static.js'
    });
}
