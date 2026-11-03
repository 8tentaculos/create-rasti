import path from 'node:path';
import { copyTemplateFile } from '../utils/template.js';
import { addDependencies, readPackageJson, mergeScripts } from '../utils/pkg.js';
import { VERSIONS } from '../versions.js';

/**
 * Apply TypeScript tooling: `tsconfig.json`, the compiler and the type packages, and a
 * type check before every build. The `.ts` sources themselves are picked by the base
 * appliers through `copyStyledTemplate` and `copyTemplateDir`.
 * @param {object} ctx - Context object with plan and targetDir
 */
export async function applyTypescript(ctx) {
    const { plan, targetDir } = ctx;
    const isSsr = plan.base === 'ssr' || plan.base === 'static';

    await addDependencies(targetDir, {
        devDependencies : {
            'typescript' : VERSIONS.typescript,
            ...(isSsr && {
                '@types/compression' : VERSIONS.typesCompression,
                '@types/express' : VERSIONS.typesExpress,
                '@types/node' : VERSIONS.typesNode
            })
        }
    });

    await copyTemplateFile('_features/typescript/tsconfig.json', path.join(targetDir, 'tsconfig.json'), {
        SSR : isSsr ? 'true' : '',
        STATIC : plan.base === 'static' ? 'true' : ''
    });

    // Vite only strips types, so the build runs the type check first.
    const { scripts } = await readPackageJson(targetDir);
    await mergeScripts(targetDir, {
        'typecheck' : 'tsc',
        'build' : `tsc && ${scripts.build}`
    });
}
