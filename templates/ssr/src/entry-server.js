import { Component } from 'rasti';
import App from './App.js';
{{#if ROUTER}}
import { getTitleForUrl } from './router-setup.js';
{{#endif}}
{{#if CSSFUN}}
import { theme } from './theme.js';
import { StyleSheet } from 'cssfun';
{{#endif}}

{{#if ROUTER}}
/**
 * Serializes the render options for an inline `<script>`, as unicode escapes for the
 * characters that could close the tag (`</script>`) or break older JavaScript parsers.
 * @param {Object} options - Per-request options.
 * @returns {string} JSON safe to embed into an inline script.
 */
function serializeOptions(options) {
    return JSON.stringify(options).replace(
        /[<>&\u2028\u2029]/g,
        char => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
    );
}

{{#endif}}
/**
 * Server-side render function.
 * Returns the pieces `app.js` injects into the `index.html` template.
 * @param {string} {{#if ROUTER}}url{{#else}}_url{{#endif}} - Request URL
 * @returns {{ html: string, head?: string, title?: string, bodyClassName?: string }}
 */
export function render({{#if ROUTER}}url{{#else}}_url{{#endif}}) {
    // Hydration matches elements by uid, so every request numbers them from the start.
    Component.resetUid();
{{#if ROUTER}}
    const options = { url };
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
