// Derives the web logo, favicon and PWA icons from the brand logo.
// The brand file itself is never modified; outputs go to src/ui/assets and public/.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SOURCE = 'assets/brand/geogo-logo.jpg';

mkdirSync('src/ui/assets', { recursive: true });
mkdirSync('public', { recursive: true });

// Full logo (globe + wordmark), trimmed of the white margin, small enough for the header.
await sharp(SOURCE)
  .extract({ left: 260, top: 300, width: 1530, height: 1420 })
  .resize({ width: 480 })
  .webp({ quality: 85 })
  .toFile('src/ui/assets/logo.webp');

console.log('Icons written.');
