// Local preview: serves the static site and /api/grade on http://localhost:3000.
// Loads .env.local if present. Without API keys the grader runs on labelled sample data.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envFile = path.join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    const value = match?.[2].replace(/^["']|["']$/g, '');
    if (match && value && !(match[1] in process.env)) process.env[match[1]] = value;
  }
}

const { default: handler } = await import('../api/grade.js');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
const PORT = Number(process.env.PORT) || 3000;

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/grade') return handler(req, res);

    const pathname = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
    const rel = decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = path.resolve(root, rel);
    const allowed = file.startsWith(root + path.sep) && /\.(html|js|css|png|svg)$/.test(file) && !file.includes(`${path.sep}lib${path.sep}`);
    if (!allowed || !existsSync(file)) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    res.end(await readFile(file));
  })
  .listen(PORT, () => console.log(`Dev server on http://localhost:${PORT}/ai-search-grader.html`));
