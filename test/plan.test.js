import { createPlan } from '../src/plan.js';

const base = {
    name : 'my-app',
    ssr : false,
    static : false,
    tailwind : false,
    cssfun : false,
    icons : null,
    router : false
};

describe('createPlan', () => {
    it('defaults to spa base', () => {
        expect(createPlan(base).base).toBe('spa');
    });

    it('uses ssr when ssr is true', () => {
        expect(createPlan({ ...base, ssr : true }).base).toBe('ssr');
    });

    it('static takes priority over ssr', () => {
        expect(createPlan({ ...base, ssr : true, static : true }).base).toBe('static');
    });

    it('normalizes icons null to false', () => {
        expect(createPlan(base).features.icons).toBe(false);
    });

    it('normalizes icons false to false', () => {
        expect(createPlan({ ...base, icons : false }).features.icons).toBe(false);
    });

    it('normalizes icons string to array', () => {
        expect(createPlan({ ...base, icons : 'heroicons-solid' }).features.icons).toEqual(['heroicons-solid']);
    });

    it('normalizes icons array', () => {
        expect(createPlan({ ...base, icons : ['heroicons-solid'] }).features.icons).toEqual(['heroicons-solid']);
    });

    it('deduplicates icons', () => {
        expect(createPlan({ ...base, icons : ['heroicons-solid', 'heroicons-solid'] }).features.icons)
            .toEqual(['heroicons-solid']);
    });

    it('includes packageManager field', () => {
        expect(createPlan(base)).toHaveProperty('packageManager');
    });

    it('sets tailwind and router features', () => {
        const plan = createPlan({ ...base, tailwind : true, router : true });
        expect(plan.features.tailwind).toBe(true);
        expect(plan.features.router).toBe(true);
    });
});
