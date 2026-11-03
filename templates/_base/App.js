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
 * @property {import('./lib/router.js').Location | null} location
{{#endif}}
 */

/**
 * Root application component. Owns the state and passes values and callbacks down as props.
 * @extends {Component<{}, AppState>}
 */
class App extends Component {
{{#if ROUTER}}
    /**
     * @param {Object} [options]
     * @param {string} [options.url] - URL to route on creation (the request URL on the server).
     */
    onCreate(options = {}) {
        this.state = new Model({ location : null, count : 0 });
        this.router = createAppRouter(this.state);
        this.router.navigate(options.url ?? '/', { addToHistory : false });
    }

    onHydrate() {
        this.destroyQueue.push(
            this.router.delegateNavigation(this.el),
            this.router.bindHistory()
        );
    }
{{#else}}
    onCreate() {
        this.state = new Model({ count : 0 });
    }
{{#endif}}

    /** Created once per instance, so `Home` doesn't re-render for a new callback on every render. */
    handleIncrement = () => {
        this.state.count++;
    };

    template() {
        return this.html`
            <div class="app">
                <${Header} />
{{#if ROUTER}}
                ${this.state.location?.test('/') ?
                    this.html`<${Home} count="${this.state.count}" handleIncrement=${this.handleIncrement} />` :
                    this.html`<${About} />`}
{{#else}}
                <${Home} count="${this.state.count}" handleIncrement=${this.handleIncrement} />
{{#endif}}
            </div>
        `;
    }
}

export default App;
