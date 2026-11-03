import fs from 'node:fs/promises';
import { VERSIONS } from '../src/versions.js';

/** Reads a package.json relative to the repo root. */
async function readPkg(relPath) {
    return JSON.parse(await fs.readFile(new URL(`../${relPath}`, import.meta.url), 'utf-8'));
}

describe('versions mirrored outside versions.js', () => {
    it('installs skills from the same rasti and cssfun ranges the projects get', async () => {
        const { dependencies } = await readPkg('package.json');

        expect(dependencies.rasti).toBe(VERSIONS.rasti);
        expect(dependencies.cssfun).toBe(VERSIONS.cssfun);
    });

    it('tests the router against the path-to-regexp range the projects get', async () => {
        const root = await readPkg('package.json');
        const router = await readPkg('extras/micro-router/package.json');

        expect(root.devDependencies['path-to-regexp']).toBe(VERSIONS.pathToRegexp);
        expect(router.dependencies['path-to-regexp']).toBe(VERSIONS.pathToRegexp);
    });
});
