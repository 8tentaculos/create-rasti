import { Component, Model } from 'rasti';
import { css } from 'cssfun';
import Header from './components/Header.js';
import Home from './components/Home.js';
{{#if ROUTER}}
import { About } from './router-setup.js';
{{#endif}}

const { classes } = css({
    '@global' : {
        body : {
            background : 'var(--fun-bg)',
            color : 'var(--fun-text)',
            margin : 0,
            padding : 0
        },
        'a' : {
            color : 'var(--fun-link)',
            textDecoration : 'none',
            transition : 'color 0.2s ease',
            '&:hover' : { color : 'var(--fun-linkHover)', textDecoration : 'underline' }
        }
    },
    root : {
        fontFamily : 'system-ui, sans-serif',
        minHeight : '100dvh',
        display : 'flex',
        flexDirection : 'column',
        alignItems : 'center',
        gap : 'clamp(24px, 5vw, 40px)',
        maxWidth : '1000px',
        margin : '0 auto',
        padding : 'clamp(20px, 5vw, 48px)',
        boxSizing : 'border-box'
    }
});

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
 * Root application component with the global styles. Owns the state and passes values and callbacks down as props.
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
            <div class="${classes.root}">
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
