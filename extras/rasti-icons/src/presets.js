export const DEFAULT_PRESET = 'heroicons-outline';

export const PRESETS = {
    'heroicons-outline' : {
        label : 'Heroicons Outline',
        hint : '24px, by Tailwind Labs (MIT)',
        sourceName : 'Heroicons by Tailwind Labs',
        licenseName : 'MIT',
        homepage : 'https://heroicons.com',
        source : 'https://api.github.com/repos/tailwindlabs/heroicons/contents/optimized/24/outline',
        license : 'https://raw.githubusercontent.com/tailwindlabs/heroicons/master/LICENSE'
    },
    'heroicons-solid' : {
        label : 'Heroicons Solid',
        hint : '24px, by Tailwind Labs (MIT)',
        sourceName : 'Heroicons by Tailwind Labs',
        licenseName : 'MIT',
        homepage : 'https://heroicons.com',
        source : 'https://api.github.com/repos/tailwindlabs/heroicons/contents/optimized/24/solid',
        license : 'https://raw.githubusercontent.com/tailwindlabs/heroicons/master/LICENSE'
    },
    pixelarticons : {
        label : 'Pixelarticons',
        hint : 'by Halfmage (MIT)',
        sourceName : 'Pixelarticons by Halfmage',
        licenseName : 'MIT',
        homepage : 'https://pixelarticons.com',
        source : 'https://api.github.com/repos/halfmage/pixelarticons/contents/svg',
        license : 'https://raw.githubusercontent.com/halfmage/pixelarticons/master/LICENSE'
    },
    'akar-icons' : {
        label : 'Akar Icons',
        hint : '24px, by Arturo Wibawa (MIT)',
        sourceName : 'Akar Icons by Arturo Wibawa',
        licenseName : 'MIT',
        homepage : 'https://akaricons.com',
        source : 'https://api.github.com/repos/artcoholic/akar-icons/contents/src/svg',
        license : 'https://raw.githubusercontent.com/artcoholic/akar-icons/master/LICENSE'
    },
    feathericon : {
        label : 'Feathericon',
        hint : 'by Megumi Hano (MIT)',
        sourceName : 'Feathericon by Megumi Hano',
        licenseName : 'MIT',
        homepage : 'https://feathericon.github.io/feathericon/',
        source : 'https://api.github.com/repos/feathericon/feathericon/contents/src/svg',
        license : 'https://raw.githubusercontent.com/feathericon/feathericon/master/LICENSE'
    }
};

export const PRESET_IDS = Object.keys(PRESETS);

export const PRESET_OPTIONS = PRESET_IDS.map((value) => {
    const { label, hint } = PRESETS[value];

    return { value, label, hint };
});
