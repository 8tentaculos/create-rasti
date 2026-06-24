import path from 'node:path';
import fs from 'node:fs/promises';
import { applyBase } from './base.js';
import { applySsr } from './ssr.js';
import { applyStatic } from './static.js';
import { applyTailwind } from './tailwind.js';
import { applyCssfun } from './cssfun.js';
import { applyIcons } from './icons.js';
import { applyRouter } from './router.js';
import { applyFeaturesInclude } from './featuresInclude.js';
import { getBaseContext } from './description.js';
import { copyTemplateFile } from '../utils/template.js';
import { createSpinner, log } from '../utils/logger.js';

const RASTI_AGENTS_MD_URL = 'https://raw.githubusercontent.com/8tentaculos/rasti/master/docs/AGENTS.md';

/**
 * Fetch Rasti AGENTS.md and write to project root as AGENTS-RASTI.md.
 * @param {string} targetDir - Project root directory
 */
async function fetchRastiAgentsMd(targetDir) {
    const res = await fetch(RASTI_AGENTS_MD_URL);
    if (!res.ok) throw new Error(`Failed to fetch AGENTS-RASTI.md: ${res.status}`);
    const text = await res.text();
    await fs.writeFile(path.join(targetDir, 'AGENTS-RASTI.md'), text, 'utf-8');
}

/**
 * Apply a project plan by copying templates and applying features.
 * @param {object} plan - Project plan object
 */
export async function applyPlan(plan) {
    const targetDir = path.resolve(process.cwd(), plan.name);
    const spinner = createSpinner();

    const ctx = {
        plan,
        targetDir,
        spinner
    };

    try {
        spinner.start('Creating project...');

        if (plan.base === 'ssr' || plan.base === 'static') {
            await applySsr(ctx);
            if (plan.base === 'static') {
                await applyStatic(ctx);
            }
        } else {
            await applyBase(ctx);
        }

        spinner.stop('Project created');

        if (plan.features.tailwind) {
            spinner.start('Adding Tailwind CSS...');
            await applyTailwind(ctx);
            spinner.stop('Tailwind CSS added');
        }

        if (plan.features.cssfun) {
            spinner.start('Adding CSSFUN...');
            await applyCssfun(ctx);
            spinner.stop('CSSFUN added');
        }

        if (plan.features.router) {
            spinner.start('Adding micro-router...');
            await applyRouter(ctx);
            spinner.stop('micro-router added');
        }

        if (plan.features.icons) {
            const iconLabel = plan.features.icons.join(', ');
            spinner.start(`Adding rasti-icons (${iconLabel})...`);
            await applyIcons(ctx);
            spinner.stop('rasti-icons added');
        }

        spinner.start('Writing features list...');
        await applyFeaturesInclude(ctx);
        spinner.stop('Features list written');

        spinner.start('Writing AGENTS.md...');
        const agentsContext = {
            ...getBaseContext(plan),
            SSR : (plan.base === 'ssr' || plan.base === 'static') ? 'true' : '',
            STATIC : plan.base === 'static' ? 'true' : '',
            TAILWIND : plan.features.tailwind ? 'true' : '',
            CSSFUN : plan.features.cssfun   ? 'true' : '',
            ROUTER : plan.features.router   ? 'true' : '',
            ICONS : plan.features.icons    ? 'true' : '',
        };
        await copyTemplateFile('AGENTS.md', path.join(ctx.targetDir, 'AGENTS.md'), agentsContext);
        spinner.stop('AGENTS.md written');

        spinner.start('Adding Rasti AGENTS.md...');
        try {
            await fetchRastiAgentsMd(ctx.targetDir);
            spinner.stop('Rasti AGENTS.md added');
        } catch {
            spinner.stop('Could not fetch Rasti AGENTS.md (offline?) — skipped');
        }

        logSummary(plan);

    } catch (error) {
        spinner.stop('Failed');
        throw error;
    }
}

/**
 * Log a summary of what was created.
 * @param {object} plan - Project plan object
 */
function logSummary(plan) {
    const features = [];

    if (plan.features.tailwind) features.push('Tailwind CSS');
    if (plan.features.cssfun) features.push('CSSFUN');
    if (plan.features.icons) {
        features.push(`rasti-icons (${plan.features.icons.join(', ')})`);
    }
    if (plan.features.router) features.push('micro-router');

    const featureList = features.length > 0
        ? `\n  Features: ${features.join(', ')}`
        : '';

    const templateLabel = plan.base === 'static' ? 'Static (SSR + static build)' : plan.base.toUpperCase();
    log.info(`Project: ${plan.name}\n  Template: ${templateLabel}${featureList}`);
}
