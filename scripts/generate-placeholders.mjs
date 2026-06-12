// Genererer enkle plassholder-bilder slik at siden bygger og kan vises før du
// laster opp egne foto. ERSTATT disse med dine egne bilder (samme filnavn, eller
// oppdater filnavnet i innholdsfilene). Kjør på nytt: `npm run placeholders`.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const targets = [
  { path: 'src/images/hero/hero.jpg', w: 1800, h: 1100, label: 'Hero', c1: '#2a6f6b', c2: '#16403e' },
  { path: 'src/images/gallery/living-room.jpg', w: 1200, h: 900, label: 'Living room', c1: '#3a7d78', c2: '#1f5350' },
  { path: 'src/images/gallery/bedroom.jpg', w: 1200, h: 900, label: 'Bedroom', c1: '#6a8caf', c2: '#3c5a78' },
  { path: 'src/images/gallery/kitchen.jpg', w: 1200, h: 900, label: 'Kitchen', c1: '#c08a4a', c2: '#8a5e2a' },
  { path: 'src/images/gallery/terrace.jpg', w: 1200, h: 900, label: 'Terrace', c1: '#7d9a4a', c2: '#52682c' },
  { path: 'src/images/gallery/sea-view.jpg', w: 1200, h: 900, label: 'Sea view', c1: '#3f8fb0', c2: '#1f5d78' },
  { path: 'src/images/gallery/surroundings.jpg', w: 1200, h: 900, label: 'Surroundings', c1: '#4f7d5a', c2: '#2c5236' },
];

for (const t of targets) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${t.w}" height="${t.h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${t.c1}"/>
        <stop offset="100%" stop-color="${t.c2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <text x="50%" y="50%" fill="rgba(255,255,255,0.85)" font-size="${Math.round(t.w / 18)}"
          font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">
      ${t.label} — placeholder
    </text>
  </svg>`;
  await mkdir(dirname(t.path), { recursive: true });
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile(t.path);
  console.log('wrote', t.path);
}
