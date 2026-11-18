// Produces the optimised portrait crops and icon sizes in public/.
// Reads ../source/photo.jpg and public/favicon.svg. It never modifies the source.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const photo = path.resolve(root, '..', 'source', 'photo.jpg');

// Head-and-shoulders crop of the 1400x1400 photo, matching the CV.
const crop = { left: 312, top: 174, width: 776, height: 776 };

const portrait = () => sharp(photo).extract(crop);

await portrait().resize(360).webp({ quality: 74 }).toFile(path.join(publicDir, 'images/portrait-360.webp'));
await portrait().resize(720).webp({ quality: 74 }).toFile(path.join(publicDir, 'images/portrait-720.webp'));
await portrait().resize(720).jpeg({ quality: 76, mozjpeg: true }).toFile(path.join(publicDir, 'images/portrait-720.jpg'));

const favicon = await readFile(path.join(publicDir, 'favicon.svg'));
for (const [size, name] of [
  [32, 'favicon-32.png'],
  [180, 'apple-touch-icon.png'],
  [192, 'favicon-192.png'],
  [512, 'favicon-512.png'],
]) {
  await sharp(favicon, { density: 600 }).resize(size).png({ compressionLevel: 9 }).toFile(path.join(publicDir, name));
}

console.log('Wrote portrait crops and favicon sizes to public/');
