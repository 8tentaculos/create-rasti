import { Component } from 'rasti';
import App from './App.ts';
{{#if ROUTER}}
import type { AppProps } from './App.ts';
import { getTitleForUrl } from './router-setup.ts';
{{#endif}}
{{#if CSSFUN}}
import { theme } from './theme.js';
import { StyleSheet } from 'cssfun';
{{#endif}}

/** The pieces `app.js` injects into the `index.html` template. */
export interface RenderResult {
    html: string;
    head?: string;
    title?: string;
    bodyClassName?: string;
}

{{#if ROUTER}}
/**
 * Serializes the render options for an inline `<script>`, as unicode escapes for the
 * characters that could close the tag (`</script>`) or break older JavaScript parsers.
 * @param options - Per-request options.
 * @returns JSON safe to embed into an inline script.
 */
function serializeOptions(options: AppProps): string {
    return JSON.stringify(options).replace(
        /[<>&\u2028\u2029]/g,
        char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
    );
}

{{#endif}}
/**
 * Server-side render function.
 * @param {{#if ROUTER}}url{{#else}}_url{{#endif}} - Request URL
 */
export function render({{#if ROUTER}}url{{#else}}_url{{#endif}}: string): RenderResult {
    // Hydration matches elements by uid, so every request numbers them from the start.
    Component.resetUid();
{{#if ROUTER}}
    const options: AppProps = { url };
    const html = new App(options).toString();
    // The client hydrates with the same options.
    const script = `<script>window.__APP_OPTIONS__=${serializeOptions(options)}</script>`;
{{#if CSSFUN}}
    // <style> tags for every style sheet the app modules registered on import, theme included.
    return { html, head : StyleSheet.toString() + script, title : getTitleForUrl(url), bodyClassName : theme.classes.root };
{{#else}}
    return { html, head : script, title : getTitleForUrl(url) };
{{#endif}}
{{#else}}
    const html = new App().toString();
{{#if CSSFUN}}
    // <style> tags for every style sheet the app modules registered on import, theme included.
    return { html, head : StyleSheet.toString(), bodyClassName : theme.classes.root };
{{#else}}
    return { html };
{{#endif}}
{{#endif}}
}
