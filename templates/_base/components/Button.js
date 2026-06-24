import { Component } from 'rasti';
import cn from '../lib/cn.js';

/**
 * @typedef {Object} ButtonProps
 * @property {Function} handleClick - Click handler.
 * @property {string} [className] - Additional CSS classes.
 */

/** Reusable styled button. Renders children via props.renderChildren().
 * @type {typeof import('rasti').Component<ButtonProps>}
 */
const Button = Component.create`
    <button
        class="${({ props }) => cn('button', props.className)}"
        onClick="${({ props }) => props.handleClick}"
    >
        ${({ props }) => props.renderChildren()}
    </button>
`;

export default Button;
