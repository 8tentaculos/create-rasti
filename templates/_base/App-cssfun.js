import { Component, Model } from 'rasti';
import { css } from 'cssfun';
import Header from './components/Header.js';
import Home from './components/Home.js';
{{#if ROUTER}}
import About from './components/About.js';
import { createAppRouter } from './router-setup.js';
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
{{#if ROUTER}}
 * @property {import('./lib/router.js').Location | null} location
{{#endif}}
 */

/**
 * Root application component with the global styles. Owns the state and passes values and callbacks down as props.
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
            <div class="${classes.root}">
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
