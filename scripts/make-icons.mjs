// Derives the web logo, favicon and PWA icons from the brand logo.
// The brand file itself is never modified; outputs go to src/ui/assets and public/.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SOURCE = 'assets/brand/geogo-logo.jpg';
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Bounding boxes measured on the 2048 px source (non-white pixels), plus a small margin.
const GLOBE = { left: 421, top: 323, width: 1172, height: 961 };
const LOGO = { left: 279, top: 323, width: 1488, height: 1400 };

mkdirSync('src/ui/assets', { recursive: true });
mkdirSync('public/icons', { recursive: true });

// Full logo (globe + wordmark), trimmed of the white margin, small enough for the header.
await sharp(SOURCE)
  .extract(LOGO)
  .resize({ width: 480 })
  .webp({ quality: 85 })
  .toFile('src/ui/assets/logo.webp');

// The globe box is wider than tall, so it is letterboxed onto a white square.
// sharp allows one resize per pipeline, so the square is rendered to a buffer first.
const square = await sharp(SOURCE)
  .extract(GLOBE)
  .resize(GLOBE.width, GLOBE.width, { fit: 'contain', background: WHITE })
  .png()
  .toBuffer();
const globe = () => sharp(square);

// Plain ("any") icons: the globe fills the square on its white background.
for (const size of [48, 180, 192, 512]) {
  await globe()
    .resize(size, size)
    .png({ compressionLevel: 9, palette: true })
    .toFile(`public/icons/icon-${size}.png`);
}

// Maskable icon: launchers may crop to a circle covering the central 80 %, so the globe
// is shrunk to about 70 % and padded with white to stay inside that safe zone.
const inner = Math.round(512 * 0.7);
const pad = Math.round((512 - inner) / 2);
await globe()
  .resize(inner, inner)
  .extend({
    top: pad,
    bottom: 512 - inner - pad,
    left: pad,
    right: 512 - inner - pad,
    background: WHITE,
  })
  .png()
  .toFile('public/icons/maskable-512.png');

console.log('Icons written.');
