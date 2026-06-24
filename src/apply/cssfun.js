import path from 'node:path';
import fs from 'node:fs/promises';
import { copyTemplateFile } from '../utils/template.js';
import { addDependencies } from '../utils/pkg.js';
import { getBaseContext } from './description.js';
import { VERSIONS } from '../versions.js';

/**
 * Apply cssfun to the project.
 * @param {object} ctx - Context object with plan and targetDir
 */
export async function applyCssfun(ctx) {
    const { plan, targetDir } = ctx;
    const isSsr = plan.base === 'ssr' || plan.base === 'static';
    const routeAbout = plan.base === 'static' ? '/about/' : '/about';
    const context = {
        ...getBaseContext(plan),
        ROUTER : plan.features.router ? 'true' : '',
        ROUTE_ABOUT : routeAbout
    };

    await addDependencies(targetDir, {
        dependencies : {
            'cssfun' : VERSIONS.cssfun
        }
    });

    // App and components (Button, Home, Header) are resolved by copyStyledTemplate
    // in the base appliers, which pick the *-cssfun.js variants when cssfun is enabled.
    await copyTemplateFile('_features/cssfun/theme.js', path.join(targetDir, 'src', 'theme.js'), {});

    // cssfun handles all styling — drop the base style.css.
    await fs.rm(path.join(targetDir, 'src', 'style.css'), { force : true });

    if (isSsr) {
        await copyTemplateFile('_features/cssfun/index.html', path.join(targetDir, 'index.html'), context);
    }
}
