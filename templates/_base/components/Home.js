import { Component } from 'rasti';
import Button from './Button.js';

/**
 * @typedef {Object} HomeProps
 * @property {number} count - Current counter value.
 * @property {Function} handleIncrement - Increments the counter.
 */

/** Home view: logo, counter and project info.
 * @type {typeof import('rasti').Component<HomeProps>}
 */
const Home = Component.create`
    <div class="home">
        <h1 class="title">
            <a class="logo-link" href="https://rasti.js.org" target="_blank">
                <img class="logo" src="{{LOGO_SRC}}" alt="{{NAME}}" />
            </a>
        </h1>
        <div class="counter">
            <${Button} handleClick="${({ props }) => props.handleIncrement}">
                count is ${({ props }) => props.count}
            </${Button}>
        </div>
        <div class="info">
            <div class="info-stack">
                <p class="info-description">{{DESCRIPTION}}</p>
                <div class="info-includes">{{FEATURES_INCLUDE}}</div>
                <p class="info-hint">Edit <code>src/App.js</code> and save to test HMR.</p>
            </div>
        </div>
    </div>
`;

export default Home;
