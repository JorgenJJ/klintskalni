// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sentral i18n-konfig. Vil du legge til et nytt språk, gjør du det i
// src/i18n/languages.ts (én liste) og kopierer innholdsfilene – se README.
import { locales, defaultLang } from './src/i18n/languages.ts';

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
    sitemap({
      i18n: {
        defaultLocale: defaultLang,
        locales: Object.fromEntries(locales.map((l) => [l, l])),
      },
    }),
  ],
});
