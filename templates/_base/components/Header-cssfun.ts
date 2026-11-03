import { Component } from 'rasti';
import { css } from 'cssfun';
import cn from '../lib/cn.js';
import Button from './Button.ts';

const { classes } = css({
    root : {
        display : 'flex',
        alignItems : 'center',
        width : '100%'
    },
    nav : {
        display : 'flex',
        gap : '16px'
    },
    actions : {
        display : 'flex',
        gap : '10px',
        marginLeft : 'auto'
    },
    showWhenLight : {
        display : 'var(--fun-showWhenLight)'
    },
    showWhenDark : {
        display : 'var(--fun-showWhenDark)'
    },
    buttonSm : {
        minHeight : '40px',
        minWidth : 'auto',
        padding : '0 16px',
        fontSize : '13px',
        fontWeight : '600',
        letterSpacing : '0.01em'
    }
});

function setColorScheme(mode: 'light' | 'dark') {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('data-color-scheme', mode);
}

/** App header (cssfun): light/dark theme toggle, and navigation when router is enabled. */
class Header extends Component {
    template() {
        return this.html`
            <header class="${classes.root}">
{{#if ROUTER}}
                <nav class="${classes.nav}">
                    <a data-router href="/">Home</a>
                    <a data-router href="{{ROUTE_ABOUT}}">About</a>
                </nav>
{{#endif}}
                <div class="${classes.actions}">
                    <${Button}
                        className=${cn(classes.buttonSm, classes.showWhenDark)}
                        handleClick=${() => setColorScheme('light')}
                    >
                        Light
                    </${Button}>
                    <${Button}
                        className=${cn(classes.buttonSm, classes.showWhenLight)}
                        handleClick=${() => setColorScheme('dark')}
                    >
                        Dark
                    </${Button}>
                </div>
            </header>
        `;
    }
}

export default Header;
