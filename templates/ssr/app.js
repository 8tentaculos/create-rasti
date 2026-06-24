import fs from 'node:fs/promises';
import express from 'express';

const isProduction = process.env.NODE_ENV === 'production';
const base = process.env.BASE || '/';

const templateHtml = isProduction
    ? await fs.readFile('./dist/client/index.html', 'utf-8')
    : '';

const app = express();

/** @type {object|undefined} Vite dev server instance */
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
        /** @type {Function} Server render function */
        let render;
        if (!isProduction) {
            template = await fs.readFile('./index.html', 'utf-8');
            template = await vite.transformIndexHtml(url, template);
            render = (await vite.ssrLoadModule('/src/entry-server.js')).render;
        } else {
            template = templateHtml;
            render = (await import('./dist/server/entry-server.js')).render;
        }

        const rendered = await render(url);

        let html = template
            .replace('<!--app-head-->', rendered.head ?? '')
            .replace('<!--app-html-->', rendered.html ?? '');

        if (rendered.bodyClassName) {
            html = html.replace('<body>', '<body class="' + rendered.bodyClassName + '">');
        }
        if (rendered.dataColorScheme) {
            html = html.replace('<html', '<html data-color-scheme="' + rendered.dataColorScheme + '"');
        }
        if (rendered.title) {
            html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + rendered.title + '</title>');
        }

        res.status(200).set({ 'Content-Type' : 'text/html' }).send(html);
    } catch (e) {
        vite?.ssrFixStacktrace(e);
        console.log(e.stack);
        res.status(500).end(e.stack);
    }
});

export default app;
