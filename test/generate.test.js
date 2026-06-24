import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { applyBase } from '../src/apply/base.js';
import { applySsr } from '../src/apply/ssr.js';
import { applyStatic } from '../src/apply/static.js';
import { applyFeaturesInclude } from '../src/apply/featuresInclude.js';

const noSpinner = { start : () => {}, stop : () => {} };

const baseFeatures = { tailwind : false, cssfun : false, icons : false, router : false };

function makeCtx(tmpDir, base, features = {}) {
    const plan = {
        name : 'test-app',
        base,
        features : { ...baseFeatures, ...features },
        packageManager : 'npm'
    };
    return {
        plan,
        targetDir : path.join(tmpDir, plan.name),
        spinner : noSpinner
    };
}

async function fileExists(filePath) {
    try { await fs.access(filePath); return true; } catch { return false; }
}

async function readTextFiles(dir) {
    const results = [];
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes : true }); } catch { return results; }
    const textExts = new Set(['.js', '.json', '.html', '.css', '.md', '.svg', '.txt']);
    for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            results.push(...await readTextFiles(p));
        } else if (textExts.has(path.extname(e.name)) || e.name.startsWith('.')) {
            results.push({ file : p, content : await fs.readFile(p, 'utf-8') });
        }
    }
    return results;
}

describe('generate SPA', () => {
    let tmpDir, ctx;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rasti-gen-'));
        ctx = makeCtx(tmpDir, 'spa');
        await applyBase(ctx);
        await applyFeaturesInclude(ctx);
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive : true, force : true });
    });

    it('creates expected files', async () => {
        const d = ctx.targetDir;
        const expected = ['package.json', 'index.html', 'vite.config.js', '.gitignore', 'src/main.js', 'src/App.js', 'src/components/Button.js', 'src/components/Home.js', 'src/components/Header.js', 'src/style.css'];
        for (const f of expected) {
            expect(await fileExists(path.join(d, f)), `missing: ${f}`).toBe(true);
        }
    });

    it('package.json has correct project name', async () => {
        const pkg = JSON.parse(await fs.readFile(path.join(ctx.targetDir, 'package.json'), 'utf-8'));
        expect(pkg.name).toBe('test-app');
    });

    it('no unreplaced {{PLACEHOLDERS}} remain', async () => {
        for (const { file, content } of await readTextFiles(ctx.targetDir)) {
            expect(content, `unreplaced placeholder in ${path.relative(ctx.targetDir, file)}`).not.toMatch(/\{\{[A-Z_]+\}\}/);
        }
    });
});

describe('generate SSR', () => {
    let tmpDir, ctx;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rasti-gen-'));
        ctx = makeCtx(tmpDir, 'ssr');
        await applySsr(ctx);
        await applyFeaturesInclude(ctx);
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive : true, force : true });
    });

    it('creates expected files', async () => {
        const d = ctx.targetDir;
        const expected = ['package.json', 'index.html', 'vite.config.js', 'server.js', 'app.js', 'src/entry-server.js', 'src/entry-client.js', 'src/App.js', 'src/components/Button.js', 'src/components/Home.js', 'src/components/Header.js'];
        for (const f of expected) {
            expect(await fileExists(path.join(d, f)), `missing: ${f}`).toBe(true);
        }
    });

    it('package.json has build:client and build:server scripts', async () => {
        const pkg = JSON.parse(await fs.readFile(path.join(ctx.targetDir, 'package.json'), 'utf-8'));
        expect(pkg.scripts).toHaveProperty('build:client');
        expect(pkg.scripts).toHaveProperty('build:server');
    });

    it('no unreplaced {{PLACEHOLDERS}} remain', async () => {
        for (const { file, content } of await readTextFiles(ctx.targetDir)) {
            expect(content, `unreplaced placeholder in ${path.relative(ctx.targetDir, file)}`).not.toMatch(/\{\{[A-Z_]+\}\}/);
        }
    });
});

describe('generate Static', () => {
    let tmpDir, ctx;

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rasti-gen-'));
        ctx = makeCtx(tmpDir, 'static');
        await applySsr(ctx);
        await applyStatic(ctx);
        await applyFeaturesInclude(ctx);
    });

    afterEach(async () => {
        await fs.rm(tmpDir, { recursive : true, force : true });
    });

    it('creates static-specific files', async () => {
        const d = ctx.targetDir;
        const expected = ['static.config.js', 'scripts/build-static.js', 'scripts/serve-static.js'];
        for (const f of expected) {
            expect(await fileExists(path.join(d, f)), `missing: ${f}`).toBe(true);
        }
    });

    it('package.json has build:static script', async () => {
        const pkg = JSON.parse(await fs.readFile(path.join(ctx.targetDir, 'package.json'), 'utf-8'));
        expect(pkg.scripts).toHaveProperty('build:static');
    });

    it('no unreplaced {{PLACEHOLDERS}} remain', async () => {
        for (const { file, content } of await readTextFiles(ctx.targetDir)) {
            expect(content, `unreplaced placeholder in ${path.relative(ctx.targetDir, file)}`).not.toMatch(/\{\{[A-Z_]+\}\}/);
        }
    });
});
