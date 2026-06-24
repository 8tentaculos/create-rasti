import { Component } from 'rasti';
import { css } from 'cssfun';

const { classes } = css({
    root : {
        width : '100%',
        display : 'flex',
        justifyContent : 'center'
    },
    info : {
        width : 'min(100%, 720px)',
        padding : 'clamp(20px, 4vw, 30px)',
        background : 'var(--fun-cardBg)',
        borderRadius : '24px',
        border : '1px solid var(--fun-cardBorder)',
        boxShadow : 'var(--fun-cardInset), var(--fun-cardShadow)',
        backdropFilter : 'blur(18px)'
    },
    infoStack : {
        display : 'grid',
        gap : '16px'
    },
    infoDescription : {
        margin : 0,
        lineHeight : '1.7',
        fontSize : '15px'
    }
});

/**
 * About page (cssfun).
 */
const About = Component.create`
    <div class="${classes.root}">
        <div class="${classes.info}">
            <div class="${classes.infoStack}">
                <p class="${classes.infoDescription}">This is the About page. Add your content here.</p>
            </div>
        </div>
    </div>
`;

export default About;
