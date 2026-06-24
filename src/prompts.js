import * as p from '@clack/prompts';
import { DEFAULT_PRESET, PRESET_OPTIONS } from '../extras/rasti-icons/src/presets.js';

/**
 * Run interactive prompts to gather project options.
 * @param {object} defaults - Default values from command line args
 * @returns {Promise<object|null>} Options object or null if cancelled
 */
export async function runPrompts(defaults = {}) {
    const options = { ...defaults };

    // Project name
    const name = await p.text({
        message : 'Project name',
        placeholder : 'my-rasti-app',
        validate : (value) => {
            if (!value) return 'Project name is required';
            if (!/^[a-z0-9-_]+$/i.test(value)) {
                return 'Project name can only contain letters, numbers, dashes and underscores';
            }
        }
    });

    if (p.isCancel(name)) {
        p.cancel('Operation cancelled.');
        return null;
    }

    options.name = name;

    // Template base
    const base = await p.select({
        message : 'Select template',
        options : [
            { value : 'spa', label : 'SPA', hint : 'Single Page Application' },
            { value : 'ssr', label : 'SSR', hint : 'Server-Side Rendering' },
            { value : 'static', label : 'Static', hint : 'Pre-rendered static site (SSR + static build)' }
        ],
        initialValue : defaults.static ? 'static' : (defaults.ssr ? 'ssr' : 'spa')
    });

    if (p.isCancel(base)) {
        p.cancel('Operation cancelled.');
        return null;
    }

    options.ssr = base === 'ssr' || base === 'static';
    options.static = base === 'static';

    // Styling option
    const styling = await p.select({
        message : 'Select styling',
        options : [
            { value : 'none', label : 'None', hint : 'Plain CSS' },
            { value : 'tailwind', label : 'Tailwind CSS', hint : 'Utility-first CSS' },
            { value : 'cssfun', label : 'CSSFUN', hint : 'CSS-in-JS with light and dark themes' }
        ],
        initialValue : defaults.tailwind ? 'tailwind' : defaults.cssfun ? 'cssfun' : 'none'
    });

    if (p.isCancel(styling)) {
        p.cancel('Operation cancelled.');
        return null;
    }

    options.tailwind = styling === 'tailwind';
    options.cssfun = styling === 'cssfun';

    // Router
    const router = await p.confirm({
        message : 'Add micro-router?',
        initialValue : defaults.router || false
    });

    if (p.isCancel(router)) {
        p.cancel('Operation cancelled.');
        return null;
    }

    options.router = router;

    // Icons
    const addIcons = await p.confirm({
        message : 'Add icon components?',
        initialValue : !!defaults.icons
    });

    if (p.isCancel(addIcons)) {
        p.cancel('Operation cancelled.');
        return null;
    }

    if (addIcons) {
        const initialIconSets = Array.isArray(defaults.icons)
            ? defaults.icons
            : (defaults.icons ? [defaults.icons] : [DEFAULT_PRESET]);

        const iconsets = await p.multiselect({
            message : 'Which icon sets?',
            options : PRESET_OPTIONS,
            initialValues : initialIconSets,
            required : true
        });

        if (p.isCancel(iconsets)) {
            p.cancel('Operation cancelled.');
            return null;
        }

        options.icons = iconsets;
    } else {
        options.icons = null;
    }

    return options;
}
