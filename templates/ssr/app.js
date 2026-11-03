import fs from 'node:fs/promises';
import express from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const base = process.env.BASE || '/';

const templateHtml = isProduction
    ? await fs.readFile('./dist/client/index.html', 'utf-8')
    : '';

const app = express();

/** @type {import('vite').ViteDevServer|undefined} Vite dev server instance */
let vite;
if (!isProduction) {
    const { createServer } = await import('vite');
    vite = await createServer({
        server : { middlewareMode : true },
        appType : 'custom',
        base
    });
    app.use(vite.middlewares);
} else {
    const compression = (await import('compression')).default;
    const sirv = (await import('sirv')).default;
    app.use(compression());
    app.use(base, sirv('./dist/client', { extensions : [] }));
}

app.use('*all', async (req, res) => {
    try {
        const url = '/' + req.originalUrl.replace(base, '');

        /** @type {string} */
        let template;
        /** @type {typeof import('./src/entry-server.js').render} */
        let render;
        if (vite) {
            template = await fs.readFile('./index.html', 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            render = (await vite.ssrLoadModule('/src/entry-server.js')).render;
        } else {
            template = templateHtml;
            // @ts-ignore Built by `vite build --ssr`, so it only exists after a build.
            render = (await import('./dist/server/entry-server.js')).render;
        }

        const rendered = await render(url);

        let html = template
            .replace('<!--app-head-->', rendered.head ?? '')
            .replace('<!--app-html-->', rendered.html ?? '');

        if (rendered.bodyClassName) {
            html = html.replace('<body>', '<body class="' + rendered.bodyClassName + '">');
        }
        if (rendered.title) {
            html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + rendered.title + '</title>');
        }

        res.status(200).set({ 'Content-Type' : 'text/html' }).send(html);
    } catch (error) {
        const e = /** @type {Error} */ (error);
        vite?.ssrFixStacktrace(e);
        console.error(e.stack);
        // The stack helps in development but would expose server internals in production.
        res.status(500).end(isProduction ? 'Internal Server Error' : e.stack);
    }
});

export default app;
