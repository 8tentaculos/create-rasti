import { Component } from 'rasti';
import type { ComponentPartial } from 'rasti';
import cn from '../lib/cn.js';

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
            <button class="${cn('button', this.props.className)}" onClick=${this.props.handleClick}>
                ${this.props.renderChildren()}
            </button>
        `;
    }
}

export default Button;
