import { Component } from 'rasti';

/** App header: navigation (when router is enabled). */
class Header extends Component {
    template() {
        return this.html`
            <header class="header">
{{#if ROUTER}}
                <nav class="nav">
                    <a data-router href="/">Home</a>
                    <a data-router href="{{ROUTE_ABOUT}}">About</a>
                </nav>
{{#endif}}
            </header>
        `;
    }
}

export default Header;
