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
 * SSR render: pass url so App onCreate runs router.navigate; inject __APP_OPTIONS__ and page title for client hydrate.
 * @param {string} url - Request URL
 * @returns {{ html: string, head?: string, bodyClassName?: string, title?: string }}
 */
export function render(url) {
    Component.resetUid();
    const options = { url };
    const app = App.mount(options);
    const html = app.toString();
    const title = getTitleForUrl(url);
{{#if CSSFUN}}
    const styles = StyleSheet.toString();
    const script = `<script>window.__APP_OPTIONS__=${JSON.stringify(options)}</script>`;
    return { html, head : styles + script, title, bodyClassName : theme.classes.root };
{{#else}}
    const script = `<script>window.__APP_OPTIONS__=${JSON.stringify(options)}</script>`;
    return { html, head : script, title };
{{#endif}}
}
{{#else}}
/**
 * Server-side render function.
 * Returns HTML string to be injected into the template.
 * @param {string} _url - Request URL
 * @returns {object} Rendered content { html: string, head?: string }
 */
export function render(_url) {
    Component.resetUid();
    const html = App.mount({}).toString();
{{#if CSSFUN}}
    const styles = StyleSheet.toString();
    return { html, head : styles, bodyClassName : theme.classes.root };
{{#else}}
    return { html };
{{#endif}}
}
{{#endif}}
