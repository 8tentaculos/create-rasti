import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');
const EXTRAS_DIR = path.resolve(__dirname, '../../extras');

/**
 * Copy a file from the `extras/` directory verbatim (no placeholder processing).
 * Used for standalone mini-packages copied into generated projects (e.g. cn, micro-router).
 * @param {string} extraPath - Relative path inside extras/ (e.g. 'cn/src/index.js')
 * @param {string} destPath - Absolute destination path
 */
export async function copyExtraFile(extraPath, destPath) {
    const src = path.join(EXTRAS_DIR, extraPath);
    const content = await fs.readFile(src, 'utf-8');
    await fs.mkdir(path.dirname(destPath), { recursive : true });
    await fs.writeFile(destPath, content, 'utf-8');
}

/**
 * Process conditional blocks: {{#if KEY}}...{{#elif KEY}}...{{#else}}...{{#endif}}.
 * Supports nesting. Evaluates KEY as truthy/falsy against context.
 * @param {string} content - Template content
 * @param {object} context - Values to evaluate conditions
 * @returns {string} Processed content
 */
function processConditionals(content, context) {
    const RE = /(?:^[ \t]*)?(?:\{\{#if\s+(\w+)\}\}|\{\{#elif\s+(\w+)\}\}|\{\{#else\}\}|\{\{#endif\}\})(?:[ \t]*$\n?)?/gm;
    const stack = [];
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = RE.exec(content)) !== null) {
        const [token, ifKey, elifKey] = match;
        const textBefore = content.slice(lastIndex, match.index);
        const shouldEmit = stack.length === 0 || stack[stack.length - 1].emit;

        if (shouldEmit) result += textBefore;
        lastIndex = RE.lastIndex;

        if (ifKey) {
            const parentEmit = stack.length === 0 || stack[stack.length - 1].emit;
            const condTrue = parentEmit && !!context[ifKey];
            stack.push({ resolved : condTrue, emit : condTrue });
        } else if (elifKey) {
            const frame = stack[stack.length - 1];
            const parentEmit = stack.length <= 1 || stack[stack.length - 2].emit;
            if (parentEmit && !frame.resolved && !!context[elifKey]) {
                frame.emit = true;
                frame.resolved = true;
            } else {
                frame.emit = false;
            }
        } else if (token.includes('#else')) {
            const frame = stack[stack.length - 1];
            const parentEmit = stack.length <= 1 || stack[stack.length - 2].emit;
            frame.emit = parentEmit && !frame.resolved;
            if (frame.emit) frame.resolved = true;
        } else {
            stack.pop();
        }
    }

    const tailEmit = stack.length === 0 || stack[stack.length - 1].emit;
    if (tailEmit) result += content.slice(lastIndex);

    // Collapse runs of 3+ newlines (left by conditional blocks) into 2
    return result.replace(/\n{3,}/g, '\n\n');
}

/**
 * Copy a template file processing placeholders.
 * @param {string} templatePath - Relative path in templates/
 * @param {string} destPath - Absolute destination path
 * @param {object} context - Values to replace placeholders
 */
export async function copyTemplateFile(templatePath, destPath, context = {}) {
    const src = path.join(TEMPLATES_DIR, templatePath);
    let content = await fs.readFile(src, 'utf-8');

    // Process conditional blocks first
    content = processConditionals(content, context);

    // Replace placeholders {{KEY}} with context values
    for (const [key, value] of Object.entries(context)) {
        content = content.replaceAll(`{{${key}}}`, value);
    }

    // Ensure directory exists
    await fs.mkdir(path.dirname(destPath), { recursive : true });
    await fs.writeFile(destPath, content, 'utf-8');
}

/**
 * Copy a template directory to the target, processing placeholders in all files.
 * @param {string} templateName - Name of the template directory (spa, ssr)
 * @param {string} targetDir - Target directory path
 * @param {object} context - Values to replace placeholders
 */
export async function copyTemplateDir(templateName, targetDir, context = {}) {
    const templateDir = path.join(TEMPLATES_DIR, templateName);
    await copyDirRecursive(templateDir, targetDir, context);
}

/**
 * Recursively copy a directory, processing placeholders in text files.
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {object} context - Values to replace placeholders
 */
async function copyDirRecursive(src, dest, context) {
    await fs.mkdir(dest, { recursive : true });

    const entries = await fs.readdir(src, { withFileTypes : true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirRecursive(srcPath, destPath, context);
        } else {
            if (isTextFile(entry.name)) {
                let content = await fs.readFile(srcPath, 'utf-8');
                content = processConditionals(content, context);

                for (const [key, value] of Object.entries(context)) {
                    content = content.replaceAll(`{{${key}}}`, value);
                }

                await fs.writeFile(destPath, content, 'utf-8');
            } else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }
}

/**
 * Check if a file is a text file based on extension.
 * @param {string} filename - File name
 * @returns {boolean} True if text file
 */
function isTextFile(filename) {
    const textExtensions = [
        '.js', '.ts', '.jsx', '.tsx',
        '.json', '.html', '.css', '.scss',
        '.md', '.txt', '.svg', '.xml',
        '.gitkeep', '.gitignore', '.env'
    ];

    const ext = path.extname(filename).toLowerCase();
    return textExtensions.includes(ext) || filename.startsWith('.');
}

/**
 * Copy a template file, auto-resolving styling variant by convention.
 * Given `dir/File.js` and plan with tailwind, looks for `dir/File-tailwind.js` first.
 * Falls back to `dir/File-cssfun.js` if cssfun, then `dir/File.js`.
 * @param {string} templatePath - Base template path (e.g. '_extras/router/App.js')
 * @param {string} destPath - Absolute destination path
 * @param {object} context - Values to replace placeholders
 * @param {object} plan - Project plan (checks plan.features.tailwind / cssfun)
 */
export async function copyStyledTemplate(templatePath, destPath, context, plan) {
    const ext = path.extname(templatePath);
    const base = templatePath.slice(0, -ext.length);

    let resolvedPath = templatePath;
    if (plan.features.tailwind) {
        const candidate = `${base}-tailwind${ext}`;
        const full = path.join(TEMPLATES_DIR, candidate);
        try { await fs.access(full); resolvedPath = candidate; } catch { /* fallback to base */ }
    } else if (plan.features.cssfun) {
        const candidate = `${base}-cssfun${ext}`;
        const full = path.join(TEMPLATES_DIR, candidate);
        try { await fs.access(full); resolvedPath = candidate; } catch { /* fallback to base */ }
    }

    await copyTemplateFile(resolvedPath, destPath, context);
}

/**
 * Copy a directory from source path to destination (no placeholder processing).
 * Used for copying generated output (e.g. extras/rasti-heroicons/src/icons) into the project.
 * @param {string} sourceDir - Absolute path to source directory
 * @param {string} destDir - Absolute path to destination directory
 * @returns {Promise<void>}
 */
export async function copyDirFromTo(sourceDir, destDir) {
    await fs.mkdir(destDir, { recursive : true });
    const entries = await fs.readdir(sourceDir, { withFileTypes : true });
    for (const entry of entries) {
        const srcPath = path.join(sourceDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        if (entry.isDirectory()) {
            await copyDirFromTo(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}
