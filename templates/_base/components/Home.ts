import { Component } from 'rasti';
import Button from './Button.ts';

export interface HomeProps {
    /** Current counter value. */
    count: number;
    /** Increments the counter. */
    handleIncrement: () => void;
}

/** Home view: logo, counter and project info. */
class Home extends Component<HomeProps> {
    template() {
        return this.html`
            <div class="home">
                <h1 class="title">
                    <a class="logo-link" href="https://rasti.js.org" target="_blank">
                        <img class="logo" src="{{LOGO_SRC}}" alt="{{NAME}}" />
                    </a>
                </h1>
                <div class="counter">
                    <${Button} handleClick=${this.props.handleIncrement}>
                        count is ${this.props.count}
                    </${Button}>
                </div>
                <div class="info">
                    <div class="info-stack">
                        <p class="info-description">{{DESCRIPTION}}</p>
                        <div class="info-includes">{{FEATURES_INCLUDE}}</div>
                        <p class="info-hint">Edit <code>src/App.ts</code> and save to test HMR.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

export default Home;
