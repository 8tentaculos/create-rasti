import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { copyTemplateFile } from '../utils/template.js';
import { getBaseContext } from './description.js';

const require = createRequire(import.meta.url);

/**
 * Get the Agent Skills to install for a plan.
 * Each one ships in its npm package under `skills/<name>/`.
 * @param {object} plan - Project plan
 * @returns {string[]} Package names whose skill is installed
 */
export function getSkills(plan) {
    const skills = ['rasti'];
    if (plan.features.cssfun) skills.push('cssfun');
    return skills;
}

/**
 * Copy a package's Agent Skill into `.agents/skills/<name>/` and link it from
 * `.claude/skills/<name>`. The skill is read from this CLI's own dependency,
 * kept on the same version range as the one written to the generated project.
 * @param {string} name - Package (and skill) name
 * @param {string} targetDir - Project root directory
 */
async function installSkill(name, targetDir) {
    const pkgDir = path.dirname(require.resolve(`${name}/package.json`));
    const dest = path.join(targetDir, '.agents', 'skills', name);
    await fs.cp(path.join(pkgDir, 'skills', name), dest, { recursive : true });

    const link = path.join(targetDir, '.claude', 'skills', name);
    await fs.mkdir(path.dirname(link), { recursive : true });

    try {
        // Relative, so the link survives moving or cloning the project.
        await fs.symlink(path.relative(path.dirname(link), dest), link, 'dir');
    } catch (error) {
        // Windows without symlink privileges: fall back to a second copy.
        if (error.code !== 'EPERM') throw error;
        await fs.cp(dest, link, { recursive : true });
    }
}

/**
 * Write the project's AGENTS.md and install the Agent Skills of its libraries.
 * @param {object} ctx - Context with plan, targetDir
 */
export async function applyAgents(ctx) {
    const { plan, targetDir } = ctx;
    const skills = getSkills(plan);

    const context = {
        ...getBaseContext(plan),
        SSR : (plan.base === 'ssr' || plan.base === 'static') ? 'true' : '',
        STATIC : plan.base === 'static' ? 'true' : '',
        TAILWIND : plan.features.tailwind ? 'true' : '',
        CSSFUN : plan.features.cssfun ? 'true' : '',
        ROUTER : plan.features.router ? 'true' : '',
        ICONS : plan.features.icons ? 'true' : ''
    };
    await copyTemplateFile('AGENTS.md', path.join(targetDir, 'AGENTS.md'), context);

    for (const name of skills) {
        await installSkill(name, targetDir);
    }
}
