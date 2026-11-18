// Injects the server-rendered page into dist/index.html so the content is
// visible before any JavaScript runs and can be read by search engines.
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const ssrDir = path.join(root, '.ssr');
const htmlPath = path.join(root, 'dist', 'index.html');

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const appHtml = await render();

const template = await readFile(htmlPath, 'utf8');
if (!template.includes('<!--app-html-->')) {
  throw new Error('dist/index.html is missing the <!--app-html--> placeholder.');
}

await writeFile(htmlPath, template.replace('<!--app-html-->', () => appHtml));
await rm(ssrDir, { recursive: true, force: true });

console.log(`Prerendered ${Math.round(appHtml.length / 1024)} KB of HTML into dist/index.html`);
