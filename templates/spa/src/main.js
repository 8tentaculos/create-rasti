import App from './App.js';
{{#if CSSFUN}}
import { theme } from './theme.js';

document.body.classList.add(theme.classes.root);
{{#else}}
import './style.css';
{{#endif}}

{{#if ROUTER}}
const options = { url : window.location.pathname + window.location.search };
App.mount(options, document.querySelector('#app'));
{{#else}}
App.mount({}, document.querySelector('#app'));
{{#endif}}
