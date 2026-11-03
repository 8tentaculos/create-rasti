import App from './App.js';
{{#if CSSFUN}}
import { theme } from './theme.js';

document.body.classList.add(theme.classes.root);
{{#else}}
import './style.css';
{{#endif}}

{{#if ROUTER}}
App.mount({ url : window.location.pathname + window.location.search }, document.querySelector('#app'));
{{#else}}
App.mount({}, document.querySelector('#app'));
{{#endif}}
