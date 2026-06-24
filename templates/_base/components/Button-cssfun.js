import { Component } from 'rasti';
import { css } from 'cssfun';
import cn from '../lib/cn.js';

const { classes } = css({
    root : {
        display : 'inline-flex',
        alignItems : 'center',
        justifyContent : 'center',
        minHeight : '52px',
        minWidth : '200px',
        padding : '0 32px',
        fontSize : '20px',
        fontWeight : '650',
        color : 'inherit',
        background : 'var(--fun-buttonBg)',
        border : '1px solid var(--fun-buttonBorder)',
        borderRadius : '999px',
        cursor : 'pointer',
        boxShadow : 'inset 0 1px 0 rgba(255, 255, 255, 0.1), var(--fun-buttonShadow)',
        backdropFilter : 'blur(16px)',
        transition : 'border-color 0.2s ease, background 0.2s ease, transform 0.15s ease',
        '&:hover' : {
            borderColor : 'var(--fun-buttonHoverBorder)',
            background : 'var(--fun-buttonHoverBg)'
        },
        '&:active' : {
            transform : 'scale(0.985)'
        },
    }
});

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
        class="${({ props }) => cn(classes.root, props.className)}"
        onClick="${({ props }) => props.handleClick}"
    >
        ${({ props }) => props.renderChildren()}
    </button>
`;

export default Button;
