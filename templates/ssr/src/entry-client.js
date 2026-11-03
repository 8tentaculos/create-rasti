import App from './App.js';
{{#if CSSFUN}}
import { theme } from './theme.js';

document.body.classList.add(theme.classes.root);
{{#else}}
import './style.css';
{{#endif}}

// The third argument `true` hydrates the server-rendered HTML instead of rendering it again.
{{#if ROUTER}}
// The server writes the options it rendered with, so the client hydrates from the same ones.
App.mount(window.__APP_OPTIONS__, document.querySelector('#app'), true);
{{#else}}
App.mount({}, document.querySelector('#app'), true);
{{#endif}}
