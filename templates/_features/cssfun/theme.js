import { createTheme } from 'cssfun';

/**
 * Application color theme with light and dark variants.
 * CSS custom properties are scoped under the `--fun-*` prefix (e.g. `--fun-bg`, `--fun-text`).
 * The active scheme is controlled by the `data-color-scheme` attribute on `<html>`;
 * it defaults to the system preference and can be toggled at runtime.
 */
export const theme = createTheme({
    light : {
        bg : '#f5f5f5',
        text : '#1a1a1a',
        accent : '#0d9488',
        link : '#0d9488',
        linkHover : '#14b8a6',
        cardBg : 'linear-gradient(180deg, rgba(255, 255, 255, 0.84) 0%, rgba(255, 255, 255, 0.72) 100%)',
        cardBorder : 'rgba(15, 23, 42, 0.1)',
        cardShadow : '0 8px 32px rgba(15, 23, 42, 0.08)',
        cardInset : 'inset 0 1px 0 rgba(255, 255, 255, 0.45)',
        metaBg : 'rgba(15, 23, 42, 0.04)',
        metaBorder : 'rgba(15, 23, 42, 0.06)',
        buttonBg : 'linear-gradient(180deg, rgba(13, 148, 136, 0.18) 0%, rgba(255, 255, 255, 0.92) 100%)',
        buttonBorder : 'rgba(15, 23, 42, 0.1)',
        buttonHoverBg : 'linear-gradient(180deg, rgba(13, 148, 136, 0.26) 0%, rgba(255, 255, 255, 0.96) 100%)',
        buttonHoverBorder : 'rgba(13, 148, 136, 0.4)',
        buttonShadow : '0 4px 16px rgba(15, 23, 42, 0.06)',
        buttonHoverShadow : '0 4px 16px rgba(15, 23, 42, 0.1)',
        codeBg : 'rgba(15, 23, 42, 0.05)',
        codeBorder : 'rgba(15, 23, 42, 0.1)',
        mutedText : 'rgba(15, 23, 42, 0.56)',
        showWhenLight : '',
        showWhenDark : 'none'
    },
    dark : {
        bg : '#0a0a0a',
        text : '#ffffff',
        accent : '#5ee9df',
        link : '#5ee9df',
        linkHover : '#93fdf5',
        cardBg : 'linear-gradient(180deg, rgba(20, 24, 28, 0.92) 0%, rgba(10, 10, 10, 0.82) 100%)',
        cardBorder : 'rgba(255, 255, 255, 0.1)',
        cardShadow : '0 12px 40px rgba(0, 0, 0, 0.2)',
        cardInset : 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        metaBg : 'rgba(255, 255, 255, 0.04)',
        metaBorder : 'rgba(255, 255, 255, 0.06)',
        buttonBg : 'linear-gradient(180deg, rgba(94, 233, 223, 0.2) 0%, rgba(255, 255, 255, 0.06) 100%)',
        buttonBorder : 'rgba(255, 255, 255, 0.12)',
        buttonHoverBg : 'linear-gradient(180deg, rgba(94, 233, 223, 0.28) 0%, rgba(255, 255, 255, 0.1) 100%)',
        buttonHoverBorder : 'rgba(94, 233, 223, 0.4)',
        buttonShadow : '0 6px 20px rgba(0, 0, 0, 0.16)',
        buttonHoverShadow : '0 6px 20px rgba(0, 0, 0, 0.2)',
        codeBg : 'rgba(255, 255, 255, 0.08)',
        codeBorder : 'rgba(255, 255, 255, 0.1)',
        mutedText : 'rgba(255, 255, 255, 0.56)',
        showWhenLight : 'none',
        showWhenDark : ''
    }
});

export default theme;
