import path from 'node:path';
import { copyTemplateDir, copyTemplateFile, copyStyledTemplate, copyExtraFile } from '../utils/template.js';
import { updatePackageName } from '../utils/pkg.js';
import { getBaseContext } from './description.js';

/**
 * Apply the SSR base template.
 * @param {object} ctx - Context object with plan and targetDir
 */
export async function applySsr(ctx) {
    const { plan, targetDir } = ctx;
    const routeAbout = plan.base === 'static' ? '/about/' : '/about';
    const context = {
        ...getBaseContext(plan),
        CSSFUN : plan.features.cssfun ? 'true' : '',
        TAILWIND : plan.features.tailwind ? 'true' : '',
        ROUTER : plan.features.router ? 'true' : '',
        ROUTE_ABOUT : routeAbout
    };

    await copyTemplateDir('ssr', targetDir, context);
    await copyStyledTemplate('_base/App.js', path.join(targetDir, 'src', 'App.js'), context, plan);
    await copyStyledTemplate('_base/components/Button.js', path.join(targetDir, 'src', 'components', 'Button.js'), context, plan);
    await copyStyledTemplate('_base/components/Home.js', path.join(targetDir, 'src', 'components', 'Home.js'), context, plan);
    await copyStyledTemplate('_base/components/Header.js', path.join(targetDir, 'src', 'components', 'Header.js'), context, plan);
    await copyTemplateFile('_base/style.css', path.join(targetDir, 'src', 'style.css'), context);
    await copyExtraFile('cn/src/index.js', path.join(targetDir, 'src', 'lib', 'cn.js'));
    await updatePackageName(targetDir, plan.name);
}
