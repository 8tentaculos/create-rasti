import { execSync } from 'node:child_process';

/**
 * Detect the package manager being used.
 * Checks npm_config_user_agent or falls back to checking available commands.
 * @returns {string} Package manager name (npm, pnpm, bun)
 */
export function detectPackageManager() {
    const userAgent = process.env.npm_config_user_agent || '';

    if (userAgent.includes('pnpm')) {
        return 'pnpm';
    }

    if (userAgent.includes('bun')) {
        return 'bun';
    }

    if (userAgent.includes('yarn')) {
        return 'yarn';
    }

    // Fallback: check if pnpm or bun is available
    if (isCommandAvailable('pnpm')) {
        return 'pnpm';
    }

    if (isCommandAvailable('bun')) {
        return 'bun';
    }

    return 'npm';
}

/**
 * Check if a command is available in the system.
 * @param {string} command - Command name
 * @returns {boolean} True if command is available
 */
function isCommandAvailable(command) {
    try {
        execSync(`${command} --version`, { stdio : 'ignore' });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get the install command for the detected package manager.
 * @param {string} pm - Package manager name
 * @returns {string} Install command
 */
export function getInstallCommand(pm) {
    switch (pm) {
    case 'pnpm':
        return 'pnpm install';
    case 'bun':
        return 'bun install';
    case 'yarn':
        return 'yarn';
    default:
        return 'npm install';
    }
}

/**
 * Get the dev command for the detected package manager.
 * @param {string} pm - Package manager name
 * @returns {string} Dev command
 */
export function getDevCommand(pm) {
    switch (pm) {
    case 'pnpm':
        return 'pnpm dev';
    case 'bun':
        return 'bun dev';
    case 'yarn':
        return 'yarn dev';
    default:
        return 'npm run dev';
    }
}
