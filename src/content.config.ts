// =============================================================================
//  Innholdsmodell (Astro Content Collections) – jf. rapportens kap. 2.3
// =============================================================================
//  Innholdet er fysisk skilt fra koden. All oversatt tekst bor i
//  src/content/sections/<lang>.md og valideres her ved bygg.
//
//  FELLES (språkuavhengig) innhold bor i src/data/*.json – ett sted per ting:
//    site.json    – eiendomsnavn + kart (valideres i src/lib/site.ts)
//    houses.json  – Airbnb-lenke, bilder og fakta per hus
//    media.json   – hero-, delings- og karusellbilder
//    contact.json – felles e-postadresse
// =============================================================================

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

export const collections = { sections };
