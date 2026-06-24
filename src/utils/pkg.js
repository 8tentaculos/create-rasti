import { readFile, writeFile } from './copy.js';
import path from 'node:path';

/**
 * Read package.json from a directory.
 * @param {string} dir - Directory path
 * @returns {Promise<object>} Package.json content
 */
export async function readPackageJson(dir) {
    const pkgPath = path.join(dir, 'package.json');
    const content = await readFile(pkgPath);
    return JSON.parse(content);
}

/**
 * Write package.json to a directory.
 * @param {string} dir - Directory path
 * @param {object} pkg - Package.json content
 */
export async function writePackageJson(dir, pkg) {
    const pkgPath = path.join(dir, 'package.json');
    // Use 4 spaces indentation to match Rasti style
    const content = JSON.stringify(pkg, null, 4);
    await writeFile(pkgPath, content + '\n');
}

/**
 * Add dependencies to package.json.
 * @param {string} dir - Directory path
 * @param {object} deps - Dependencies to add { dependencies?: object, devDependencies?: object }
 */
export async function addDependencies(dir, deps) {
    const pkg = await readPackageJson(dir);

    if (deps.dependencies) {
        pkg.dependencies = pkg.dependencies || {};
        Object.assign(pkg.dependencies, deps.dependencies);
        // Sort dependencies
        pkg.dependencies = sortObject(pkg.dependencies);
    }

    if (deps.devDependencies) {
        pkg.devDependencies = pkg.devDependencies || {};
        Object.assign(pkg.devDependencies, deps.devDependencies);
        // Sort devDependencies
        pkg.devDependencies = sortObject(pkg.devDependencies);
    }

    await writePackageJson(dir, pkg);
}

/**
 * Update package.json name field.
 * @param {string} dir - Directory path
 * @param {string} name - New package name
 */
export async function updatePackageName(dir, name) {
    const pkg = await readPackageJson(dir);
    pkg.name = name;
    await writePackageJson(dir, pkg);
}

/**
 * Merge scripts into package.json (add or override).
 * @param {string} dir - Directory path
 * @param {object} scripts - Scripts to merge { scriptName: "command", ... }
 */
export async function mergeScripts(dir, scripts) {
    const pkg = await readPackageJson(dir);
    pkg.scripts = pkg.scripts || {};
    Object.assign(pkg.scripts, scripts);
    await writePackageJson(dir, pkg);
}

/**
 * Sort object keys alphabetically.
 * @param {object} obj - Object to sort
 * @returns {object} Sorted object
 */
function sortObject(obj) {
    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = obj[key];
            return result;
        }, {});
}
