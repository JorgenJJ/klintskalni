// =============================================================================
//  Innholdsmodell (Astro Content Collections) – jf. rapportens kap. 2.3
// =============================================================================
//  Innholdet er fysisk skilt fra koden. All redigerbar tekst, alle
//  bildereferanser og all kontaktinfo bor i src/content/* – ikke i komponentene.
//  Skjemaene under validerer innholdet ved bygg, så feil oppdages tidlig.
// =============================================================================

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// --- Global konfig per språk: src/content/site/<lang>.json -------------------
const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/site' }),
  schema: z.object({
    houseName: z.string(),
    // Lenke til Airbnb-annonsen (primær CTA + kontaktkanal).
    airbnbUrl: z.string().url(),
    // Dedikert e-post (mailto). Tom string skjuler e-postknappen.
    email: z.string().default(''),
    // NB: Bilder (hero, galleri, og:image) er FELLES for alle språk og ligger i
    // src/data/media.json – kun alt-tekst oversettes (se sections/<lang>.md).
    // Kart (OpenStreetMap) – viser nærområde, ikke nøyaktig adresse (kap. 2.8).
    map: z.object({
      lat: z.number(),
      lon: z.number(),
      // Hvor stort utsnitt som vises (grader). Større = mer "nærområde".
      areaSpan: z.number().default(0.06),
      // Vis nål på nøyaktig punkt? Standard false = personvern (vis område).
      showMarker: z.boolean().default(false),
    }),
  }),
});

// --- Selve innholdsteksten per språk: src/content/sections/<lang>.md ---------
const sections = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/sections' }),
  schema: z.object({
    // Hero
    heroTitle: z.string(),
    heroTagline: z.string(),
    heroAlt: z.string().default(''),
    bookButtonLabel: z.string(),
    // Nøkkelpunkter (3–5 stk)
    keyPointsTitle: z.string().default(''),
    keyPoints: z
      .array(z.object({ icon: z.string().default('•'), label: z.string() }))
      .default([]),
    // Galleri (alt-tekst per bilde, parallelt med site.gallery)
    galleryTitle: z.string().default(''),
    galleryAlts: z.array(z.string()).default([]),
    // Lengre informasjonsdel (overskrift + markdown-brødtekst i filen)
    infoTitle: z.string().default(''),
    // Anmeldelser
    reviewsTitle: z.string().default(''),
    reviewsNote: z.string().default(''),
    reviewsLinkLabel: z.string().default(''),
    // Kart
    mapTitle: z.string().default(''),
    mapAreaLabel: z.string().default(''),
    mapLinkLabel: z.string().default(''),
    // Kontakt
    contactTitle: z.string().default(''),
    contactText: z.string().default(''),
    airbnbButtonLabel: z.string().default(''),
    emailButtonLabel: z.string().default(''),
    // SEO / deling per språk (kap. 3.1 F10)
    seoTitle: z.string(),
    seoDescription: z.string(),
    // Felles UI
    languageLabel: z.string().default('Language'),
    skipToContent: z.string().default('Skip to content'),
  }),
});

export const collections = { site, sections };
