import { parseArgs } from '../src/args.js';
import { DEFAULT_PRESET } from '../extras/rasti-icons/src/presets.js';

describe('parseArgs', () => {
    it('returns defaults for empty argv', () => {
        const args = parseArgs([]);
        expect(args.name).toBeNull();
        expect(args.ssr).toBe(false);
        expect(args.static).toBe(false);
        expect(args.tailwind).toBe(false);
        expect(args.cssfun).toBe(false);
        expect(args.icons).toBeNull();
        expect(args.router).toBe(false);
        expect(args.help).toBe(false);
    });

    it('parses positional arg as project name', () => {
        expect(parseArgs(['my-app']).name).toBe('my-app');
    });

    it('parses --ssr', () => {
        expect(parseArgs(['--ssr']).ssr).toBe(true);
    });

    it('parses --static', () => {
        expect(parseArgs(['--static']).static).toBe(true);
    });

    it('parses --tailwind', () => {
        expect(parseArgs(['--tailwind']).tailwind).toBe(true);
    });

    it('parses --cssfun', () => {
        expect(parseArgs(['--cssfun']).cssfun).toBe(true);
    });

    it('parses --router', () => {
        expect(parseArgs(['--router']).router).toBe(true);
    });

    it('parses --help', () => {
        expect(parseArgs(['--help']).help).toBe(true);
    });

    it('parses -h as help', () => {
        expect(parseArgs(['-h']).help).toBe(true);
    });

    it('--icons without value uses default preset', () => {
        expect(parseArgs(['--icons']).icons).toEqual([DEFAULT_PRESET]);
    });

    it('--icons with single value', () => {
        expect(parseArgs(['--icons', 'heroicons-solid']).icons).toEqual(['heroicons-solid']);
    });

    it('--icons with comma-separated values', () => {
        expect(parseArgs(['--icons', 'heroicons-solid,akar-icons']).icons).toEqual(['heroicons-solid', 'akar-icons']);
    });

    it('--icons repeated collects all values', () => {
        expect(parseArgs(['--icons', 'heroicons-solid', '--icons', 'akar-icons']).icons)
            .toEqual(['heroicons-solid', 'akar-icons']);
    });

    it('parses combined flags with project name', () => {
        const args = parseArgs(['my-app', '--ssr', '--tailwind']);
        expect(args.name).toBe('my-app');
        expect(args.ssr).toBe(true);
        expect(args.tailwind).toBe(true);
    });
});
