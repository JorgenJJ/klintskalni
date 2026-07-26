// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sentral i18n-konfig. Vil du legge til et nytt språk, gjør du det i
// src/i18n/languages.ts (én liste) og kopierer innholdsfilene – se README.
import { locales, defaultLang } from './src/i18n/languages.ts';

// Kun i dev: Astros dev-server serverer ikke katalog-URLen «/admin» (den finner
// bare den eksplisitte fila public/admin/index.html), så Sveltia CMS gir 404
// lokalt. I produksjon serverer Cloudflare index.html for «/admin/» automatisk.
// Denne lille integrasjonen skriver «/admin» og «/admin/» om til
// «/admin/index.html» slik at lokal testing matcher produksjon. Kjører KUN under
// `npm run dev` og påvirker ikke det bygde nettstedet. Eksakt treff, så andre
// admin-URL-er (f.eks. /admin/config.yml) serveres uendret.
/** @type {import('astro').AstroIntegration} */
const adminDevFallback = {
  name: 'kl-admin-dev-fallback',
  hooks: {
    'astro:config:setup': ({ command, updateConfig }) => {
      if (command !== 'dev') return;
      updateConfig({
        vite: {
          plugins: [
            {
              name: 'kl-admin-index-rewrite',
              configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                  if (req.url === '/admin' || req.url === '/admin/') {
                    req.url = '/admin/index.html';
                  }
                  next();
                });
              },
            },
          ],
        },
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  // Bytt til ditt endelige domene når det er klart (brukes til SEO/sitemap).
  // Frem til da fungerer alt fint på *.pages.dev.
  site: 'https://klintskalni.pages.dev',
  i18n: {
    defaultLocale: defaultLang,
    locales: [...locales],
    routing: {
      // Gir eksplisitte språk-URLer: /en/, /no/, /lv/
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    adminDevFallback,
    sitemap({
      i18n: {
        defaultLocale: defaultLang,
        locales: Object.fromEntries(locales.map((l) => [l, l])),
      },
    }),
  ],
});
