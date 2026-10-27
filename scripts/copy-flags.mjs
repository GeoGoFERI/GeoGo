// Copies the Twemoji flag SVG for every alpha-2 code in the Europe table into src/data/flags.
// Twemoji graphics: CC BY 4.0 (see ATTRIBUTIONS.md). Run after changing the tables.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';

// Only European countries are ever named in a prompt or fact card, so only they need flags.
const TABLES = ['src/data/countriesEurope.ts'];
const OUT = 'src/data/flags';
const SOURCE = 'node_modules/@twemoji/svg';

// Matches both `a2: 'SI'` and the compact `c('705', 'SI', ...)` form.
const codes = new Set();
for (const file of TABLES) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/a2: '([A-Z]{2})'/g)) codes.add(m[1]);
  for (const m of text.matchAll(/[ct]\('[^']+', '([A-Z]{2})'/g)) codes.add(m[1]);
}

// A flag emoji is two regional indicator symbols: 'A' maps to U+1F1E6.
const toFile = (code) =>
  [...code].map((ch) => (0x1f1e6 + ch.charCodeAt(0) - 65).toString(16)).join('-') + '.svg';

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const available = new Set(readdirSync(SOURCE));
const missing = [];
for (const code of [...codes].sort()) {
  const file = toFile(code);
  if (available.has(file)) copyFileSync(`${SOURCE}/${file}`, `${OUT}/${code.toLowerCase()}.svg`);
  else missing.push(code);
}
console.log(
  `Copied ${codes.size - missing.length} flags. Missing: ${missing.join(', ') || 'none'}`,
);
