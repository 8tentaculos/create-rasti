import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { applyBase } from '../src/apply/base.js';
import { applySsr } from '../src/apply/ssr.js';
import { applyStatic } from '../src/apply/static.js';
import { applyTailwind } from '../src/apply/tailwind.js';
import { applyCssfun } from '../src/apply/cssfun.js';
import { applyRouter } from '../src/apply/router.js';
import { applyFeaturesInclude } from '../src/apply/featuresInclude.js';
import { getBaseContext } from '../src/apply/description.js';
import { copyTemplateFile } from '../src/utils/template.js';

const noSpinner = { start : () => {}, stop : () => {} };

const baseFeatures = { tailwind : false, cssfun : false, icons : false, router : false };

/**
 * Run the generation pipeline (mirroring src/apply/index.js) without the network
 * fetch of AGENTS-RASTI.md and without icons (preset/network dependent).
 * @param {string} tmpDir - Temp root
 * @param {object} plan - Project plan
 * @returns {Promise<string>} targetDir
 */
async function generate(tmpDir, plan) {
    const targetDir = path.join(tmpDir, plan.name);
    const ctx = { plan, targetDir, spinner : noSpinner };

    if (plan.base === 'ssr' || plan.base === 'static') {
        await applySsr(ctx);
        if (plan.base === 'static') await applyStatic(ctx);
    } else {
        await applyBase(ctx);
    }

    if (plan.features.tailwind) await applyTailwind(ctx);
    if (plan.features.cssfun) await applyCssfun(ctx);
    if (plan.features.router) await applyRouter(ctx);

    await applyFeaturesInclude(ctx);

    const agentsContext = {
        ...getBaseContext(plan),
        SSR : (plan.base === 'ssr' || plan.base === 'static') ? 'true' : '',
        STATIC : plan.base === 'static' ? 'true' : '',
        TAILWIND : plan.features.tailwind ? 'true' : '',
        CSSFUN : plan.features.cssfun ? 'true' : '',
        ROUTER : plan.features.router ? 'true' : '',
        ICONS : plan.features.icons ? 'true' : ''
    };
    await copyTemplateFile('AGENTS.md', path.join(targetDir, 'AGENTS.md'), agentsContext);

    return targetDir;
}

/**
 * Collect every generated file as a sorted { relativePath: content } map.
 * @param {string} dir - Root directory
 * @returns {Promise<Record<string, string>>}
 */
async function collectTree(dir) {
    const files = {};

    async function walk(current) {
        const entries = await fs.readdir(current, { withFileTypes : true });
        for (const e of entries) {
            const full = path.join(current, e.name);
            if (e.isDirectory()) {
                await walk(full);
            } else {
                const rel = path.relative(dir, full).split(path.sep).join('/');
                files[rel] = await fs.readFile(full, 'utf-8');
            }
        }
    }

    await walk(dir);

    return Object.fromEntries(Object.keys(files).sort().map((k) => [k, files[k]]));
}

const BASES = ['spa', 'ssr', 'static'];
const STYLINGS = [
    { id : 'plain', features : {} },
    { id : 'tailwind', features : { tailwind : true } },
    { id : 'cssfun', features : { cssfun : true } }
];
const ROUTERS = [
    { id : 'no-router', features : {} },
    { id : 'router', features : { router : true } }
];

describe('generated project matrix', () => {
    let tmpDir;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rasti-matrix-'));
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive : true, force : true });
    });

    for (const base of BASES) {
        for (const styling of STYLINGS) {
            for (const router of ROUTERS) {
                const label = `${base} | ${styling.id} | ${router.id}`;

                it(`matches snapshot: ${label}`, async () => {
                    const plan = {
                        name : 'test-app',
                        base,
                        features : { ...baseFeatures, ...styling.features, ...router.features },
                        packageManager : 'npm'
                    };

                    const targetDir = await generate(tmpDir, plan);
                    const tree = await collectTree(targetDir);

                    expect(tree).toMatchSnapshot();
                });

                it(`leaves no {{PLACEHOLDERS}}: ${label}`, async () => {
                    const plan = {
                        name : 'test-app',
                        base,
                        features : { ...baseFeatures, ...styling.features, ...router.features },
                        packageManager : 'npm'
                    };

                    const targetDir = await generate(tmpDir, plan);
                    const tree = await collectTree(targetDir);

                    for (const [rel, content] of Object.entries(tree)) {
                        expect(content, `unreplaced placeholder in ${rel}`).not.toMatch(/\{\{[A-Z_]+\}\}/);
                    }
                });
            }
        }
    }
});
