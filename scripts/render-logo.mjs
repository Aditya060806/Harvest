// Rasterize img/logo.svg into PNGs (general use + VS Code extension icon).
// Usage: npm run logo
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = path.join(root, 'img', 'logo.svg');

const targets = [
  { out: 'img/logo.png', size: 512 },
  { out: 'img/logo-256.png', size: 256 },
  { out: 'harvest-guard/icon.png', size: 128 }, // VS Code Marketplace icon
];

for (const t of targets) {
  const outPath = path.join(root, t.out);
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(svg, { density: 384 })
    .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
  console.log(`\u2713 ${t.out} (${t.size}px)`);
}
