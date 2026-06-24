import { Component } from 'rasti';
import { css } from 'cssfun';
import Button from './Button.js';

const { classes } = css({
    root : {
        width : '100%',
        display : 'flex',
        flexDirection : 'column',
        alignItems : 'center',
        gap : 'clamp(24px, 6vw, 40px)'
    },
    title : { display : 'flex', alignItems : 'center', justifyContent : 'center', gap : '16px', fontSize : '36px', fontWeight : '700', margin : 0 },
    logoLink : { display : 'inline-block' },
    logoLight : { height : 'clamp(56px, 15vw, 96px)', display : 'var(--fun-showWhenLight)' },
    logoDark : { height : 'clamp(56px, 15vw, 96px)', display : 'var(--fun-showWhenDark)' },
    counter : {
        display : 'flex',
        alignItems : 'center',
        justifyContent : 'center'
    },
    info : {
        width : 'min(100%, 720px)',
        padding : 'clamp(20px, 4vw, 30px)',
        background : 'var(--fun-cardBg)',
        borderRadius : '24px',
        border : '1px solid var(--fun-cardBorder)',
        boxShadow : 'var(--fun-cardInset), var(--fun-cardShadow)',
        backdropFilter : 'blur(18px)',
        '& code' : {
            backgroundColor : 'var(--fun-codeBg)',
            padding : '3px 10px',
            borderRadius : '999px',
            fontSize : '13px',
            fontFamily : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontWeight : '600',
            border : '1px solid var(--fun-codeBorder)'
        }
    },
    infoStack : {
        display : 'grid',
        gap : '16px'
    },
    infoDescription : {
        margin : 0,
        lineHeight : '1.7',
        fontSize : '15px'
    },
    infoIncludes : {
        padding : '16px 20px',
        borderRadius : '16px',
        background : 'var(--fun-metaBg)',
        border : '1px solid var(--fun-metaBorder)',
        '& p' : {
            margin : 0,
            lineHeight : '1.7'
        },
        '& p + p' : {
            marginTop : '8px'
        }
    },
    infoHint : {
        margin : 0,
        lineHeight : '1.7',
        color : 'var(--fun-mutedText)'
    }
});

/**
 * @typedef {Object} HomeProps
 * @property {number} count - Current counter value.
 * @property {Function} handleIncrement - Increments the counter.
 */

/** Home view: logo, counter and project info.
 * @type {typeof import('rasti').Component<HomeProps>}
 */
const Home = Component.create`
    <div class="${classes.root}">
        <h1 class="${classes.title}">
            <a class="${classes.logoLink}" href="https://rasti.js.org" target="_blank"><img class="${classes.logoLight}" src="{{LOGO_LIGHT_SRC}}" alt="{{NAME}}" /><img class="${classes.logoDark}" src="{{LOGO_SRC}}" alt="{{NAME}}" /></a>
        </h1>
        <div class="${classes.counter}">
            <${Button} handleClick="${({ props }) => props.handleIncrement}">
                count is ${({ props }) => props.count}
            </${Button}>
        </div>
        <div class="${classes.info}">
            <div class="${classes.infoStack}">
                <p class="${classes.infoDescription}">{{DESCRIPTION}}</p>
                <div class="${classes.infoIncludes}">{{FEATURES_INCLUDE}}</div>
                <p class="${classes.infoHint}">Edit <code>src/App.js</code> and save to test HMR.</p>
            </div>
        </div>
    </div>
`;

export default Home;
