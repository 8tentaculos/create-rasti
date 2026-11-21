import { Component } from 'rasti';
import App from './App.js';
{{#if ROUTER}}
import { route, getTitleForUrl, loadPages } from './router-setup.js';
{{#endif}}
{{#if CSSFUN}}
import { theme } from './theme.js';
import { StyleSheet } from 'cssfun';
{{#endif}}

{{#if ROUTER}}
// Every page is in memory before the first render.
await loadPages();

/**
 * Serializes the render options for an inline `<script>`, as unicode escapes for the
 * characters that could close the tag (`</script>`) or break older JavaScript parsers.
 * @param {{ url: string }} options - Per-request options.
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
{{#if ROUTER}}
 * @returns {Promise<{ html: string, head?: string, title?: string, bodyClassName?: string }>}
{{#else}}
 * @returns {{ html: string, head?: string, title?: string, bodyClassName?: string }}
{{#endif}}
 */
export {{#if ROUTER}}async {{#endif}}function render({{#if ROUTER}}url{{#else}}_url{{#endif}}) {
{{#if ROUTER}}
    // Rendering is synchronous, so it waits for routing to set the page.
    const { model, router } = await route(url);
{{#endif}}
    // Hydration matches elements by uid, so every request numbers them from the start.
    Component.resetUid();
{{#if ROUTER}}
    const html = new App({ model, router }).toString();
    const options = { url };
    // The client hydrates with the same options.
    const script = `<script>window.__APP_OPTIONS__=${serializeOptions(options)}</script>`;
{{#if CSSFUN}}
    // <style> tags for every style sheet the app modules registered on import, theme and every page included.
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
