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
 * @property {import('./router-setup.js').Location | null} location
{{#endif}}
 */

/** Root application component with CSS-in-JS global styles.
 * @type {typeof import('rasti').Component<{}, AppState>}
 */
const App = Component.create`
    <div class="${classes.root}">
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
    onCreate(options = {}) {
        this.state = new Model({ count : 0 });
    }
});
{{#endif}}

export default App;
