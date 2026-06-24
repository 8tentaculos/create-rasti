import * as p from '@clack/prompts';
import { getInstallCommand, getDevCommand } from './exec.js';

/**
 * Logging utilities using @clack/prompts for consistent output.
 */
export const log = {
    /**
     * Log an info message.
     * @param {string} message - Message to log
     */
    info : (message) => {
        p.log.info(message);
    },

    /**
     * Log a success message.
     * @param {string} message - Message to log
     */
    success : (message) => {
        p.log.success(message);
    },

    /**
     * Log a warning message.
     * @param {string} message - Message to log
     */
    warn : (message) => {
        p.log.warn(message);
    },

    /**
     * Log an error message.
     * @param {string} message - Message to log
     */
    error : (message) => {
        p.log.error(message);
    },

    /**
     * Log a step message.
     * @param {string} message - Message to log
     */
    step : (message) => {
        p.log.step(message);
    }
};

/**
 * Create a spinner for long-running operations.
 * @returns {object} Spinner object with start and stop methods
 */
export function createSpinner() {
    return p.spinner();
}

/**
 * Show intro message.
 */
export function intro() {
    p.intro('create-rasti');
}

/**
 * Show outro message with next steps.
 * @param {string} projectName - Name of the created project
 * @param {string} [pm='npm'] - Package manager to use
 */
export function outro(projectName, pm = 'npm') {
    const installCmd = getInstallCommand(pm);
    const devCmd = getDevCommand(pm);

    p.note(
        `cd ${projectName}\n${installCmd}\n${devCmd}`,
        'Next steps'
    );

    p.outro('Project ready. Have fun.');
}
