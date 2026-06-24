import { Component, Model } from 'rasti';
import Header from './components/Header.js';
import Home from './components/Home.js';
{{#if ROUTER}}
import About from './components/About.js';
import { createAppRouter } from './router-setup.js';
{{#endif}}

/**
 * @typedef {Object} AppState
 * @property {number} count
{{#if ROUTER}}
 * @property {import('./router-setup.js').Location | null} location
{{#endif}}
 */

/** Root application component.
 * @type {typeof import('rasti').Component<{}, AppState>}
 */
const App = Component.create`
    <div class="app">
        <${Header} />
{{#if ROUTER}}
        ${({ state, partial }) => state.location?.test('/') ?
            partial`<${Home} count="${({ state }) => state.count}" handleIncrement="${({ state }) => () => { state.count++; }}" />` :
            partial`<${About} />`}
{{#else}}
        <${Home} count="${({ state }) => state.count}" handleIncrement="${({ state }) => () => { state.count++; }}" />
{{#endif}}
    </div>
{{#if ROUTER}}
`.extend({
    /**
     * @param {Object} [options]
     * @param {string} [options.url] - Initial URL for server-side routing.
     */
    onCreate(options = {}) {
        this.state = new Model({ location : null, count : 0 });
        this.router = createAppRouter(this.state);
        const url = options.url ?? (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/');
        this.router.navigate(url, { addToHistory : false });
    },
    onHydrate() {
        this.destroyQueue.push(
            this.router.delegateNavigation(this.el),
            this.router.bindHistory()
        );
    }
});
{{#else}}
`.extend({
    onCreate() {
        this.state = new Model({ count : 0 });
    }
});
{{#endif}}

export default App;
