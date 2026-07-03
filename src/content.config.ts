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
    // NB: E-post er FELLES for alle språk og ligger i src/data/contact.json.
    // NB: Airbnb-lenkene ligger per hus i src/data/houses.json.
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
    // Hero-knappen ruller ned til de to husene (intern anker), ikke Airbnb.
    heroCtaLabel: z.string(),
    // De to husene – tekst per språk. Bilde + Airbnb-lenke ligger felles i
    // src/data/houses.json og kobles på via `id` (house/cottage).
    // housesTitle brukes kun som skjult seksjonsetikett (skjermlesere).
    housesTitle: z.string().default(''),
    houses: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          tagline: z.string().default(''),
          keyPoints: z
            .array(z.object({ icon: z.string().default('•'), label: z.string() }))
            .default([]),
          description: z.string().default(''),
          bookLabel: z.string(),
          imageAlt: z.string().default(''),
        }),
      )
      .default([]),
    // Knapp + modal for bildegalleri per hus
    photosButtonLabel: z.string().default('Se bilder'),
    closeLabel: z.string().default('Lukk'),
    // Galleri «Omgivelsene» (alt-tekst per bilde, parallelt med media.gallery)
    galleryTitle: z.string().default(''),
    galleryAlts: z.array(z.string()).default([]),
    // Lengre informasjonsdel (overskrift + markdown-brødtekst i filen)
    infoTitle: z.string().default(''),
    // Linje nederst i «Om»: «du kan også booke på e-post:» (e-post lenkes på)
    infoEmailNote: z.string().default(''),
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
