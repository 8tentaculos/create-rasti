import App from './App.js';
{{#if CSSFUN}}
import { theme } from './theme.js';

document.body.classList.add(theme.classes.root);
{{#else}}
import './style.css';
{{#endif}}

// The third argument `true` enables hydration of server-rendered HTML.
{{#if ROUTER}}
App.mount(window.__APP_OPTIONS__, document.querySelector('#app'), true);
{{#else}}
App.mount({}, document.querySelector('#app'), true);
{{#endif}}
