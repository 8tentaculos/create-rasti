import { Component } from 'rasti';

/**
 * About page.
 */
const About = Component.create`
    <div class="flex w-full justify-center">
        <div class="w-full max-w-[720px] rounded-3xl border border-white/12 bg-linear-to-b from-[rgba(20,24,28,0.92)] to-[rgba(10,10,10,0.82)] p-5 md:p-[30px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-[18px]">
            <p class="m-0 text-[15px] leading-[1.7] text-white/88">This is the About page. Add your content here.</p>
        </div>
    </div>
`;

export default About;
