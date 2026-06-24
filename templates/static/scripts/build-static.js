import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distStatic = path.join(projectRoot, 'dist', 'static');
const distClient = path.join(projectRoot, 'dist', 'client');
const port = Number(process.env.PORT) || 37521;

process.env.NODE_ENV = 'production';

async function waitForServer(baseUrl) {
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(baseUrl);
            if (res.ok) return true;
        } catch {
            // keep waiting
        }
        await new Promise((r) => setTimeout(r, 200));
    }
    return false;
}

function urlToFilePath(fullUrl) {
    const pathname = fullUrl.replace(/\?.*$/, '').replace(/^https?:\/\/[^/]+/, '') || '/';
    const clean = pathname.replace(/^\//, '').replace(/\/$/, '') || 'index';
    return clean === 'index' ? 'index.html' : path.join(clean, 'index.html');
}

/**
 * Normalize a route path for fetching (trailing slash except root).
 * @param {string} s
 * @returns {string}
 */
function normalizeRoutePath(s) {
    if (s === '/' || s === '') return '/';
    return s.endsWith('/') ? s : `${s}/`;
}

/**
 * Ensure output path stays under dist/static (no path traversal).
 * @param {string} distRoot
 * @param {string} rel - posix-style relative path (e.g. 404.html, nested/x.html)
 */
function assertSafeOutput(distRoot, rel) {
    const normalized = path.normalize(rel.replace(/\//g, path.sep));
    if (path.isAbsolute(normalized) || normalized.startsWith('..' + path.sep) || normalized === '..') {
        throw new Error(`Invalid output (must be relative, no ".."): ${rel}`);
    }
    const resolved = path.resolve(distRoot, normalized);
    const relToRoot = path.relative(distRoot, resolved);
    if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) {
        throw new Error(`Invalid output path: ${rel}`);
    }
}

/**
 * @param {string | { route: string, output: string }} item
 * @param {string} baseUrl
 * @returns {{ fetchPath: string, fullUrl: string, outRelative: string }}
 */
function resolveConfigEntry(item, baseUrl) {
    if (typeof item === 'string') {
        const fetchPath = normalizeRoutePath(item);
        const fullUrl = fetchPath === '/' ? `${baseUrl}/` : `${baseUrl}${fetchPath}`;
        const outRelative = urlToFilePath(fullUrl);
        return { fetchPath, fullUrl, outRelative };
    }
    if (item && typeof item === 'object' && typeof item.route === 'string' && typeof item.output === 'string') {
        const fetchPath = normalizeRoutePath(item.route);
        const fullUrl = fetchPath === '/' ? `${baseUrl}/` : `${baseUrl}${fetchPath}`;
        const outRelative = item.output.replace(/\\/g, '/');
        return { fetchPath, fullUrl, outRelative };
    }
    throw new Error(
        'Each static.config.js entry must be a string route or { route: string, output: string }.'
    );
}

async function main() {
    const configPath = path.join(projectRoot, 'static.config.js');
    let entries;
    try {
        const { default: config } = await import(configPath);
        entries = Array.isArray(config) ? config : ['/'];
    } catch (e) {
        console.error(
            'Missing or invalid static.config.js. Export an array of routes (strings) and/or { route, output } objects.'
        );
        process.exit(1);
    }

    const base = process.env.BASE || '/';
    const baseUrl = `http://localhost:${port}${base.replace(/\/$/, '') || ''}`;

    await fs.rm(distStatic, { recursive : true }).catch(() => {});
    await fs.mkdir(distStatic, { recursive : true });
    await fs.cp(distClient, distStatic, { recursive : true });

    // Ensure public dir contents are at the root of dist/static (Vite already copies them to dist/client, but we merge again so it works even with custom publicDir)
    const publicDir = path.join(projectRoot, 'public');
    try {
        const publicEntries = await fs.readdir(publicDir, { withFileTypes : true });
        for (const e of publicEntries) {
            const src = path.join(publicDir, e.name);
            const dest = path.join(distStatic, e.name);
            if (e.isDirectory()) {
                await fs.cp(src, dest, { recursive : true });
            } else {
                await fs.copyFile(src, dest);
            }
        }
    } catch {
        // no public dir or empty
    }

    const appPath = path.join(projectRoot, 'app.js');
    const { default: app } = await import(pathToFileURL(appPath).href);
    const server = app.listen(port);

    const ready = await waitForServer(baseUrl + '/');
    if (!ready) {
        server.close();
        console.error('Server did not start in time.');
        process.exit(1);
    }

    let resolved;
    try {
        resolved = entries.map((item) => resolveConfigEntry(item, baseUrl));
    } catch (err) {
        server.close();
        console.error(err.message || err);
        process.exit(1);
    }

    for (const { fetchPath, fullUrl, outRelative } of resolved) {
        assertSafeOutput(distStatic, outRelative);
        const res = await fetch(fullUrl);
        if (!res.ok) {
            server.close();
            console.error(`Failed to fetch ${fullUrl}: ${res.status}`);
            process.exit(1);
        }
        const html = await res.text();
        const filePath = path.join(distStatic, outRelative);
        await fs.mkdir(path.dirname(filePath), { recursive : true });
        await fs.writeFile(filePath, html, 'utf-8');
        console.log(`  ${fetchPath} -> ${outRelative}`);
    }

    server.close();
    console.log('Static build done.');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
