import { Component, Model } from 'rasti';
import Header from './components/Header.js';
import Home from './components/Home.js';
{{#if ROUTER}}
import { About } from './router-setup.js';
{{#endif}}

/**
 * @typedef {Object} AppState
 * @property {number} count
 */
{{#if ROUTER}}

/**
 * Options `App` is created with, along with the `model` from `route`. Rasti keeps the ones it doesn't reserve as props.
 * @typedef {Object} AppProps
 * @property {import('./lib/router.js').Router} router - Router that updates the model, bound to links and history once hydrated.
 */
{{#endif}}

/**
 * Root application component. Owns the state and passes values and callbacks down as props.
{{#if ROUTER}}
 * Renders the page at `model.location`, which `route` in `router-setup.js` sets.
 * @extends {Component<AppProps, AppState, import('./router-setup.js').RouteState>}
{{#else}}
 * @extends {Component<{}, AppState>}
{{#endif}}
 */
class App extends Component {
    onCreate() {
        this.state = new Model({ count : 0 });
    }
{{#if ROUTER}}

    onHydrate() {
        const { router } = this.props;
        this.destroyQueue.push(
            router.delegateNavigation(this.el),
            router.bindHistory()
        );
    }
{{#endif}}

    /** Created once per instance, so `Home` doesn't re-render for a new callback on every render. */
    handleIncrement = () => {
        this.state.count++;
    };

    template() {
{{#if ROUTER}}
        // `location` is null for a URL no route matches: no page renders.
        const { location } = this.model;

{{#endif}}
        return this.html`
            <div class="font-sans flex min-h-dvh flex-col items-center gap-6 md:gap-10 max-w-[1000px] mx-auto p-5 md:p-12 box-border text-white">
                <${Header} />
{{#if ROUTER}}
                ${location?.test('/') ?
                    this.html`<${Home} count="${this.state.count}" handleIncrement=${this.handleIncrement} />` :
                    location && this.html`<${About.Component} />`}
{{#else}}
                <${Home} count="${this.state.count}" handleIncrement=${this.handleIncrement} />
{{#endif}}
            </div>
        `;
    }
}

export default App;
