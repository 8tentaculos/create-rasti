import { validatePlan } from '../src/validate.js';
import { PRESET_IDS } from '../extras/rasti-icons/src/presets.js';

const valid = {
    name : 'my-app',
    base : 'spa',
    features : { tailwind : false, cssfun : false, icons : false, router : false }
};

describe('validatePlan', () => {
    it('accepts a valid SPA plan', () => {
        expect(validatePlan(valid).valid).toBe(true);
    });

    it('accepts ssr base', () => {
        expect(validatePlan({ ...valid, base : 'ssr' }).valid).toBe(true);
    });

    it('accepts static base', () => {
        expect(validatePlan({ ...valid, base : 'static' }).valid).toBe(true);
    });

    it('accepts valid icon preset', () => {
        const plan = { ...valid, features : { ...valid.features, icons : [PRESET_IDS[0]] } };
        expect(validatePlan(plan).valid).toBe(true);
    });

    it('accepts name with dashes and underscores', () => {
        expect(validatePlan({ ...valid, name : 'my_app-2' }).valid).toBe(true);
    });

    it('rejects missing name', () => {
        const result = validatePlan({ ...valid, name : null });
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/required/i);
    });

    it('rejects name with spaces', () => {
        expect(validatePlan({ ...valid, name : 'my app' }).valid).toBe(false);
    });

    it('rejects name with @ symbol', () => {
        expect(validatePlan({ ...valid, name : '@foo' }).valid).toBe(false);
    });

    it('rejects unknown base template', () => {
        const result = validatePlan({ ...valid, base : 'webpack' });
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/invalid base/i);
    });

    it('rejects invalid icon preset', () => {
        const plan = { ...valid, features : { ...valid.features, icons : ['nonexistent-icons'] } };
        const result = validatePlan(plan);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/invalid icon/i);
    });

    it('rejects tailwind + cssfun together', () => {
        const plan = { ...valid, features : { ...valid.features, tailwind : true, cssfun : true } };
        const result = validatePlan(plan);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/mutually exclusive/i);
    });
});
