import { Component } from 'rasti';

/**
 * App header: navigation (when router is enabled).
 */
const Header = Component.create`
    <header class="flex w-full items-center">
{{#if ROUTER}}
        <nav class="flex gap-6">
            <a data-router href="/">Home</a>
            <a data-router href="{{ROUTE_ABOUT}}">About</a>
        </nav>
{{#endif}}
    </header>
`;

export default Header;
