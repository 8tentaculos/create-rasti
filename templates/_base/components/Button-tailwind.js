import { Component } from 'rasti';
import cn from '../lib/cn.js';

/**
 * The base classes for the button.
 */
const BASE_CLASSES = [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-full',
    'border',
    'border-white/12',
    'bg-linear-to-b',
    'from-[#5ee9df]/20',
    'to-white/6',
    'text-white',
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_6px_20px_rgba(0,0,0,0.18)]',
    'backdrop-blur-md',
    'transition-[border-color,background,transform]',
    'duration-200',
    'hover:border-[#5ee9df]/40',
    'hover:from-[#5ee9df]/28',
    'hover:to-white/10',
    'active:scale-[0.985]',
    'active:duration-150',
    'min-h-13',
    'min-w-[200px]',
    'px-8',
    'text-xl',
    'font-[650]'
];

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
        class="${({ props }) => cn(BASE_CLASSES, props.className)}"
        onClick="${({ props }) => props.handleClick}"
    >
        ${({ props }) => props.renderChildren()}
    </button>
`;

export default Button;
