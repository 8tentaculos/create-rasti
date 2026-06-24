import { copyTemplateFile } from '../src/utils/template.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

let tmpDir;

beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'rasti-tmpl-'));
});

afterEach(async () => {
    await fs.rm(tmpDir, { recursive : true, force : true });
});

describe('copyTemplateFile — placeholder replacement', () => {
    it('replaces {{RASTI_VERSION}} and {{VITE_VERSION}} in spa/package.json', async () => {
        const dest = path.join(tmpDir, 'package.json');
        await copyTemplateFile('spa/package.json', dest, {
            RASTI_VERSION : '^4.0.1',
            VITE_VERSION : '^7.0.0'
        });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('^4.0.1');
        expect(content).toContain('^7.0.0');
        expect(content).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });
});

describe('App styling variants', () => {
    const sharedCtx = {
        LOGO_SRC : 'https://example.com/logo.svg',
        NAME : 'test-app',
        DESCRIPTION : 'Test description',
        FEATURES_INCLUDE : ''
    };

    it('_base/App-tailwind.js renders the tailwind root', async () => {
        const dest = path.join(tmpDir, 'App.js');
        await copyTemplateFile('_base/App-tailwind.js', dest, { ...sharedCtx, ROUTER : '' });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('font-sans');
        expect(content).not.toContain('class="app"');
    });

    it('_base/App.js renders the plain root', async () => {
        const dest = path.join(tmpDir, 'App.js');
        await copyTemplateFile('_base/App.js', dest, { ...sharedCtx, ROUTER : '' });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('class="app"');
        expect(content).not.toContain('font-sans');
    });

    it('leaves no {{#if}} / {{#endif}} tags in output', async () => {
        const dest = path.join(tmpDir, 'App.js');
        await copyTemplateFile('_base/App.js', dest, { ...sharedCtx, ROUTER : 'true' });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).not.toMatch(/\{\{#(if|else|endif)/);
    });
});

describe('copyTemplateFile — _base/components/Home.js', () => {
    const sharedCtx = {
        LOGO_SRC : 'https://example.com/logo.svg',
        NAME : 'test-app',
        DESCRIPTION : 'Test description',
        FEATURES_INCLUDE : ''
    };

    it('replaces LOGO_SRC placeholder', async () => {
        const dest = path.join(tmpDir, 'Home.js');
        await copyTemplateFile('_base/components/Home.js', dest, { ...sharedCtx, TAILWIND : '', CSSFUN : '' });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('https://example.com/logo.svg');
        expect(content).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });

    it('Home-tailwind.js renders tailwind styles', async () => {
        const dest = path.join(tmpDir, 'Home.js');
        await copyTemplateFile('_base/components/Home-tailwind.js', dest, { ...sharedCtx });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('font-bold');
        expect(content).not.toContain('class="home"');
    });

    it('Home.js renders base styles', async () => {
        const dest = path.join(tmpDir, 'Home.js');
        await copyTemplateFile('_base/components/Home.js', dest, { ...sharedCtx });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('class="home"');
        expect(content).not.toContain('font-sans');
    });
});

describe('copyTemplateFile — _base/components/Button.js', () => {
    it('Button-tailwind.js renders the tailwind variant', async () => {
        const dest = path.join(tmpDir, 'Button.js');
        await copyTemplateFile('_base/components/Button-tailwind.js', dest, {});
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('rounded-full');
        expect(content).not.toContain("'button'");
    });

    it('Button.js renders the base variant', async () => {
        const dest = path.join(tmpDir, 'Button.js');
        await copyTemplateFile('_base/components/Button.js', dest, {});
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain("'button'");
        expect(content).not.toContain('rounded-full');
    });
});

describe('copyTemplateFile — _base/components/Header.js', () => {
    const sharedCtx = { TAILWIND : '', CSSFUN : '' };

    it('renders nav links when ROUTER is truthy', async () => {
        const dest = path.join(tmpDir, 'Header.js');
        await copyTemplateFile('_base/components/Header.js', dest, { ...sharedCtx, ROUTER : 'true', ROUTE_ABOUT : '/about' });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).toContain('data-router');
        expect(content).toContain('/about');
    });

    it('renders no nav links when ROUTER is falsy', async () => {
        const dest = path.join(tmpDir, 'Header.js');
        await copyTemplateFile('_base/components/Header.js', dest, { ...sharedCtx, ROUTER : '', ROUTE_ABOUT : '' });
        const content = await fs.readFile(dest, 'utf-8');
        expect(content).not.toContain('data-router');
    });
});
