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

// The third argument `true` hydrates the server-rendered HTML instead of rendering it again.
{{#if ROUTER}}
// The server writes the options it rendered with, so the client routes the same URL. Routing
// loads the chunk of the page, which hydration needs to render the markup the server sent.
route(window.__APP_OPTIONS__.url).then(
    ({ model, router }) => App.mount({ model, router }, document.querySelector('#app'), true),
    (error) => console.error('Could not load the page to hydrate it', error)
);
{{#else}}
App.mount({}, document.querySelector('#app'), true);
{{#endif}}
