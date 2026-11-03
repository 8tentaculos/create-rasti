import { Component } from 'rasti';
import type { ComponentPartial } from 'rasti';
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

export interface ButtonProps {
    /** Click handler. */
    handleClick: (event: MouseEvent) => void;
    /** Additional CSS classes. */
    className?: string;
    /** The content between the tags, passed by Rasti. */
    renderChildren: () => ComponentPartial;
}

/** Reusable styled button. Renders children via props.renderChildren(). */
class Button extends Component<ButtonProps> {
    template() {
        return this.html`
            <button class="${cn(classes.root, this.props.className)}" onClick=${this.props.handleClick}>
                ${this.props.renderChildren()}
            </button>
        `;
    }
}

export default Button;
