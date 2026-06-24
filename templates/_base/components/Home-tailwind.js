import { Component } from 'rasti';
import Button from './Button.js';

/**
 * @typedef {Object} HomeProps
 * @property {number} count - Current counter value.
 * @property {Function} handleIncrement - Increments the counter.
 */

/** Home view: logo, counter and project info.
 * @type {typeof import('rasti').Component<HomeProps>}
 */
const Home = Component.create`
    <div class="flex w-full flex-col items-center gap-6 md:gap-10">
        <h1 class="flex items-center justify-center gap-4 text-4xl font-bold m-0">
            <a class="inline-block" href="https://rasti.js.org" target="_blank">
                <img class="h-14 md:h-24 block" src="{{LOGO_SRC}}" alt="{{NAME}}" />
            </a>
        </h1>
        <div class="flex items-center">
            <${Button} handleClick="${({ props }) => props.handleIncrement}">
                count is ${({ props }) => props.count}
            </${Button}>
        </div>
        <div class="w-full max-w-[720px] rounded-3xl border border-white/12 bg-linear-to-b from-[rgba(20,24,28,0.92)] to-[rgba(10,10,10,0.82)] p-5 md:p-[30px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-[18px]">
            <div class="grid gap-4">
                <p class="m-0 text-[15px] leading-[1.7] text-white/88">{{DESCRIPTION}}</p>
                <div class="rounded-2xl border border-white/6 bg-white/4 px-5 py-4 leading-[1.7] text-white/88 [&_p+p]:mt-2 [&_p]:m-0">{{FEATURES_INCLUDE}}</div>
                <p class="m-0 leading-[1.7] text-white/58">Edit <code class="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[13px] font-semibold font-mono">src/App.js</code> and save to test HMR.</p>
            </div>
        </div>
    </div>
`;

export default Home;
