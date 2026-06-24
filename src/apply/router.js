import path from 'node:path';
import fs from 'node:fs/promises';
import { copyTemplateFile, copyStyledTemplate, copyExtraFile } from '../utils/template.js';
import { addDependencies } from '../utils/pkg.js';
import { getBaseContext } from './description.js';
import { VERSIONS } from '../versions.js';

/**
 * Build the template context for router-related files.
 * @param {object} plan - Project plan
 * @returns {object} Template placeholder values
 */
function getRouterContext(plan) {
    const routeAbout = plan.base === 'static' ? '/about/' : '/about';
    return {
        ...getBaseContext(plan),
        ROUTE_ABOUT : routeAbout,
        CSSFUN : plan.features.cssfun ? 'true' : '',
        TAILWIND : plan.features.tailwind ? 'true' : '',
        ROUTER : 'true'
    };
}

export async function applyRouter(ctx) {
    const { plan, targetDir } = ctx;
    const context = getRouterContext(plan);

    await addDependencies(targetDir, { dependencies : { 'path-to-regexp' : VERSIONS.pathToRegexp } });

    await copyExtraFile('micro-router/src/index.js', path.join(targetDir, 'src', 'lib', 'router.js'));

    await copyTemplateFile('_extras/router/router-setup.js', path.join(targetDir, 'src', 'router-setup.js'), context);

    const componentsDir = path.join(targetDir, 'src', 'components');
    await fs.mkdir(componentsDir, { recursive : true });
    await copyStyledTemplate('_extras/router/components/About.js', path.join(componentsDir, 'About.js'), context, plan);

    if (!plan.features.cssfun) {
        const stylePath = path.join(targetDir, 'src', 'style.css');
        try {
            let css = await fs.readFile(stylePath, 'utf-8');
            if (!css.includes('.nav')) {
                css += '\n.nav { display: flex; gap: 1rem; }\n';
                await fs.writeFile(stylePath, css, 'utf-8');
            }
        } catch {
            // no style.css (e.g. tailwind replaces it)
        }
    }
}
