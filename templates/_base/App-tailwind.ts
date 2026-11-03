import { Component, Model } from 'rasti';
import Header from './components/Header.ts';
import Home from './components/Home.ts';
{{#if ROUTER}}
import About from './components/About.ts';
import { createAppRouter } from './router-setup.ts';
import type { Location, Router } from './lib/router.js';
{{#endif}}

interface AppAttributes {
    count: number;
{{#if ROUTER}}
    location: Location | null;
{{#endif}}
}

/** Application state. Mutating it re-renders `App`. */
class AppState extends Model<AppAttributes> {}
interface AppState extends AppAttributes {} // exposes the attributes on the model

{{#if ROUTER}}
/** Options `App` is created with. Rasti keeps the ones it doesn't reserve as props. */
export interface AppProps {
    /** URL to route on creation (the request URL on the server). */
    url?: string;
}

{{#endif}}
/** Root application component. Owns the state and passes values and callbacks down as props. */
{{#if ROUTER}}
class App extends Component<AppProps, AppState> {
    /** Set in `onCreate`, which runs in the base constructor: `declare` keeps a field initializer from resetting it. */
    declare router: Router;

    onCreate(options: AppProps = {}) {
        this.state = new AppState({ location : null, count : 0 });
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
class App extends Component<{}, AppState> {
    onCreate() {
        this.state = new AppState({ count : 0 });
    }
{{#endif}}

    /** Created once per instance, so `Home` doesn't re-render for a new callback on every render. */
    handleIncrement = () => {
        this.state!.count++;
    };

    template() {
        const state = this.state!;

        return this.html`
            <div class="font-sans flex min-h-dvh flex-col items-center gap-6 md:gap-10 max-w-[1000px] mx-auto p-5 md:p-12 box-border text-white">
                <${Header} />
{{#if ROUTER}}
                ${state.location?.test('/') ?
                    this.html`<${Home} count="${state.count}" handleIncrement=${this.handleIncrement} />` :
                    this.html`<${About} />`}
{{#else}}
                <${Home} count="${state.count}" handleIncrement=${this.handleIncrement} />
{{#endif}}
            </div>
        `;
    }
}

export default App;
