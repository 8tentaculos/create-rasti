import App from './App.ts';
{{#if ROUTER}}
import type { AppProps } from './App.ts';
{{#endif}}
{{#if CSSFUN}}
import { theme } from './theme.js';

document.body.classList.add(theme.classes.root);
{{#else}}
import './style.css';
{{#endif}}
{{#if ROUTER}}

declare global {
    interface Window {
        /** The options the server rendered `App` with, written into the page by `entry-server`. */
        __APP_OPTIONS__: AppProps;
    }
}
{{#endif}}

// The third argument `true` hydrates the server-rendered HTML instead of rendering it again.
{{#if ROUTER}}
// The server writes the options it rendered with, so the client hydrates from the same ones.
App.mount(window.__APP_OPTIONS__, document.querySelector('#app')!, true);
{{#else}}
App.mount({}, document.querySelector('#app')!, true);
{{#endif}}
