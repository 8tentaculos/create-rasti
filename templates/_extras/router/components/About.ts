import { Component } from 'rasti';

/** About page. */
class About extends Component {
    template() {
        return this.html`
            <div class="page">
                <div class="info">
                    <div class="info-stack">
                        <p class="info-description">This is the About page. Add your content here.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

export default About;
