import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import sirv from 'sirv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(__dirname, '..', 'dist', 'static');
const port = Number(process.env.PORT) || 5173;

const handler = sirv(dir, { dev : true });

createServer((req, res) => {
    handler(req, res, () => {
        res.statusCode = 404;
        res.end();
    });
}).listen(port, () => {
    console.log(`Serving dist/static at http://localhost:${port}`);
});
