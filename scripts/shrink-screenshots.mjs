// Re-encodes docs/screenshots/*.png as palette PNGs so the committed screenshots stay small.
import sharp from 'sharp';
import { readdirSync, renameSync, statSync } from 'node:fs';

const DIR = 'docs/screenshots';
let before = 0;
let after = 0;
for (const name of readdirSync(DIR).filter((n) => n.endsWith('.png'))) {
  const path = `${DIR}/${name}`;
  const input = sharp(path);
  const size = statSync(path).size;
  const info = await input
    .png({ palette: true, quality: 80, compressionLevel: 9, effort: 8 })
    .toFile(`${path}.tmp`);
  renameSync(`${path}.tmp`, path);
  before += size;
  after += info.size;
}
console.log(`Screenshots: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
