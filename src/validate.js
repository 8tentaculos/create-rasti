import { PRESET_IDS } from '../extras/rasti-icons/src/presets.js';

/**
 * Validate a project plan.
 * @param {object} plan - Project plan object
 * @returns {object} Validation result { valid: boolean, error?: string }
 */
export function validatePlan(plan) {
    // Check required fields
    if (!plan.name) {
        return { valid : false, error : 'Project name is required' };
    }

    // Validate project name format
    if (!/^[a-z0-9-_]+$/i.test(plan.name)) {
        return {
            valid : false,
            error : 'Project name can only contain letters, numbers, dashes and underscores'
        };
    }

    // Check base template
    if (!['spa', 'ssr', 'static'].includes(plan.base)) {
        return { valid : false, error : 'Invalid base template. Must be "spa", "ssr" or "static"' };
    }

    // Check icon sets
    if (plan.features.icons) {
        for (const id of plan.features.icons) {
            if (!PRESET_IDS.includes(id)) {
                return {
                    valid : false,
                    error : `Invalid icon set "${id}". Valid: ${PRESET_IDS.join(', ')}`
                };
            }
        }
    }

    // Check mutually exclusive features
    if (plan.features.tailwind && plan.features.cssfun) {
        return {
            valid : false,
            error : 'Cannot use both Tailwind and CSSFUN. They are mutually exclusive.'
        };
    }

    return { valid : true };
}
