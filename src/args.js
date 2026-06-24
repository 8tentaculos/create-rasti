import { DEFAULT_PRESET } from '../extras/rasti-icons/src/presets.js';

/**
 * Parse command line arguments without external dependencies.
 * Supports flags (--flag) and positional arguments.
 * @param {string[]} argv - Command line arguments (process.argv.slice(2))
 * @returns {object} Parsed arguments object
 */
export function parseArgs(argv) {
    const args = {
        name : null,
        ssr : false,
        static : false,
        tailwind : false,
        cssfun : false,
        icons : null,
        router : false,
        help : false
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

        if (arg === '--help' || arg === '-h') {
            args.help = true;
        } else if (arg === '--ssr') {
            args.ssr = true;
        } else if (arg === '--static') {
            args.static = true;
        } else if (arg === '--tailwind') {
            args.tailwind = true;
        } else if (arg === '--cssfun') {
            args.cssfun = true;
        } else if (arg === '--icons') {
            if (!args.icons) args.icons = [];
            const next = argv[i + 1];
            if (next && !next.startsWith('-')) {
                const parts = next.split(',').map(s => s.trim()).filter(Boolean);
                args.icons.push(...parts);
                i++;
            } else {
                args.icons.push(DEFAULT_PRESET);
            }
        } else if (arg === '--router') {
            args.router = true;
        } else if (!arg.startsWith('-')) {
            // Positional argument - project name
            if (!args.name) {
                args.name = arg;
            }
        }
    }

    return args;
}
