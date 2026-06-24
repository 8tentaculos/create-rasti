import { detectPackageManager } from './utils/exec.js';

/**
 * Normalize icons option to false or a deduped preset id array.
 * @param {string|string[]|false|null|undefined} icons
 * @returns {false|string[]}
 */
function normalizeIconSets(icons) {
    if (icons == null || icons === false) return false;
    const arr = Array.isArray(icons) ? icons : [icons];
    const deduped = [...new Set(arr)];
    return deduped.length ? deduped : false;
}

/**
 * Create a project plan from user options.
 * @param {object} options - User options from args or prompts
 * @returns {object} Project plan object
 */
export function createPlan(options) {
    const base = options.static ? 'static' : (options.ssr ? 'ssr' : 'spa');
    return {
        name : options.name,
        base,
        features : {
            tailwind : options.tailwind || false,
            cssfun : options.cssfun || false,
            icons : normalizeIconSets(options.icons),
            router : options.router || false
        },
        packageManager : detectPackageManager()
    };
}
