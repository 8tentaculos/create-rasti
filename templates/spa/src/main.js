import App from './App.js';
{{#if ROUTER}}
import { route } from './router-setup.js';
{{#endif}}
{{#if CSSFUN}}
import { theme } from './theme.js';

document.body.classList.add(theme.classes.root);
{{#else}}
import './style.css';
{{#endif}}

{{#if ROUTER}}
// Routing loads the chunk of the page, which `App` renders on mount.
route(window.location.pathname + window.location.search).then(
    ({ model, router }) => App.mount({ model, router }, document.querySelector('#app')),
    (error) => console.error('Could not load the page', error)
);
{{#else}}
App.mount({}, document.querySelector('#app'));
{{#endif}}
