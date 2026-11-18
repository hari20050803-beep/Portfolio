// Renders the live 3D scene in a browser and saves stills as the fallback artwork
// (shown before the scene loads and on devices that don't run it), plus the
// social preview image. Re-run this after changing anything in src/scene.
//
// 1. Build and serve the site in one terminal: npm run build, then npm run preview -- --port 5192
// 2. In another terminal, run:                 npm run poster
//
// Needs Chrome or Edge installed. Uses software rendering, so it takes a minute.
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright-core';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const url = process.env.POSTER_URL ?? 'http://localhost:5192/?scene=webgl';

const browserPath = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(existsSync);

if (!browserPath) throw new Error('Could not find Chrome or Edge.');

const browser = await chromium.launch({
  executablePath: browserPath,
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

async function capture(width, height, deviceScaleFactor, sectionId) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('.stage')?.dataset.phase === 'live', null, {
    timeout: 60000,
  });

  if (sectionId) {
    await page.evaluate((id) => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + window.scrollY);
    }, sectionId);
  }

  // Let the camera settle, then show only the canvas.
  await page.waitForTimeout(sectionId ? 12000 : 5000);
  await page.addStyleTag({
    content: `main,.site-header,.site-footer,.motion-toggle{visibility:hidden!important}
              body::after{display:none!important}.stage__canvas{transition:none!important}`,
  });
  await page.waitForTimeout(500);
  const buffer = await page.screenshot({ type: 'png' });
  await page.close();
  return buffer;
}

const images = path.join(root, 'public/images');

const wide = await capture(1600, 900, 1.2);
await sharp(wide).resize(1920, 1080).webp({ quality: 82 }).toFile(path.join(images, 'hero-poster-wide.webp'));

const tall = await capture(430, 932, 2);
await sharp(tall).resize(860).webp({ quality: 80 }).toFile(path.join(images, 'hero-poster-tall.webp'));

const finaleWide = await capture(1600, 900, 1.2, 'contact');
await sharp(finaleWide).resize(1920, 1080).webp({ quality: 80 }).toFile(path.join(images, 'finale-wide.webp'));

const finaleTall = await capture(430, 932, 2, 'contact');
await sharp(finaleTall).resize(860).webp({ quality: 78 }).toFile(path.join(images, 'finale-tall.webp'));

// Social preview: the same artwork with the name set over it.
const dataUri = (buffer, type) => `data:${type};base64,${buffer.toString('base64')}`;
const font = async (file) => dataUri(await readFile(path.join(root, 'public/fonts', file)), 'font/woff2');
const still = await sharp(wide).resize(1200).jpeg({ quality: 90 }).toBuffer();

const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await card.setContent(`
  <style>
    @font-face { font-family: CardDisplay; src: url(${await font('shippori-800.woff2')}); font-weight: 800; }
    @font-face { font-family: CardBody; src: url(${await font('inter-latin.woff2')}); font-weight: 100 900; }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; overflow: hidden; position: relative; background: #08080a; }
    img { position: absolute; inset: -22px 0; width: 1200px; }
    .scrim { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(8,8,10,.94) 0%, rgba(8,8,10,.74) 36%, rgba(8,8,10,0) 66%); }
    .text { position: absolute; left: 64px; top: 50%; width: 660px; transform: translateY(-50%); }
    .name { font: 600 26px/1.3 CardBody; color: #f1eadf; letter-spacing: .01em; }
    h1 { font: 800 62px/1.08 CardDisplay; color: #f1eadf; margin-top: 16px; }
    .role { font: 600 20px/1.5 CardBody; color: #a3b0bd; margin-top: 22px; }
  </style>
  <img src="${dataUri(still, 'image/jpeg')}" alt="" />
  <div class="scrim"></div>
  <div class="text">
    <p class="name">Ravishangar Harenthira</p>
    <h1>Building intelligent products for the web and beyond.</h1>
    <p class="role">Full Stack Developer Intern | Software Engineer | AI Developer</p>
  </div>`);
await card.evaluate(() => document.fonts.ready);
await card.waitForTimeout(300);
await card.screenshot({ path: path.join(root, 'public/og-image.jpg'), type: 'jpeg', quality: 82 });

await browser.close();
console.log('Wrote the hero and finale artwork to public/images and public/og-image.jpg');
