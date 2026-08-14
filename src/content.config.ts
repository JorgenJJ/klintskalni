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
//    nearby.json  – steder i nærområdet (valideres i src/lib/nearby.ts)
// =============================================================================

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// --- Selve innholdsteksten per språk: src/content/sections/<lang>.md ---------
//  Feltene er samlet i fire grupper som speiler gruppene i CMS-et
//  (public/admin/config.yml): hero, about, houses og general. Selve «Om»-
//  brødteksten er markdown-body-en i filen, og kan derfor ikke ligge inne i
//  `about` – Decap/Sveltia støtter bare body på toppnivå.
const sections = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/sections' }),
  schema: z.object({
    // Overskrift og introduksjon. Knappen ruller ned til de to husene
    // (internt anker), den går ikke til Airbnb.
    hero: z.object({
      title: z.string(),
      tagline: z.string(),
      alt: z.string().default(''),
      ctaLabel: z.string(),
    }),
    // Om Klintskalni: overskrift + linja «du kan også booke på e-post:»
    // (e-posten lenkes på av komponenten). Brødteksten er filens body.
    about: z
      .object({
        title: z.string().default(''),
        emailNote: z.string().default(''),
      })
      .default({}),
    // Husbeskrivelser – tekst per språk. Bilde + Airbnb-lenke ligger felles i
    // src/data/houses.json og kobles på via `id` (house/cottage).
    // `title` brukes kun som skjult seksjonsetikett (skjermlesere).
    houses: z
      .object({
        title: z.string().default(''),
        items: z
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
        // Knapp + modal for bildegalleriet per hus
        photosButtonLabel: z.string().default('Se bilder'),
        closeLabel: z.string().default('Lukk'),
        // Pilknappene i stor bildevisning (forrige/neste)
        prevImageLabel: z.string().default('Forrige bilde'),
        nextImageLabel: z.string().default('Neste bilde'),
      })
      .default({}),
    // «I nærheten»: NAVN, kategori, avstand og lenke ligger i src/data/nearby.json
    // (en CMS-collection UTEN i18n) nettopp fordi «Translate»-knappen skriver om
    // ALLE i18n-felt. Her ligger kun oversettbar tekst, koblet på `id`.
    // Alt har .default(...), så bygget går fint før nøklene finnes i sections/*.md.
    nearby: z
      .object({
        title: z.string().default(''),
        intro: z.string().default(''),
        // Lenketeksten nederst i hvert kort («Åpne i Google Maps»). Oversettes
        // ÉN gang per språk, ikke per sted.
        linkLabel: z.string().default(''),
        // Eksplisitt objekt, ikke z.record: et record svelger en skrivefeil
        // (`shopp:`) i stillhet, mens objektet fanger den ved bygg.
        // Kategorilista finnes også i src/lib/nearby.ts og public/admin/config.yml.
        categoryLabels: z
          .object({
            shop: z.string().default(''),
            restaurant: z.string().default(''),
            activity: z.string().default(''),
          })
          .default({}),
        items: z
          .array(
            z.object({
              id: z.string(),
              // Kort, generisk setning. Stedsnavn hører IKKE hjemme her – de
              // ville blitt maskinoversatt. Grensa gjør det tungvint å skrive
              // en lang tekst full av egennavn.
              description: z.string().max(140).default(''),
            }),
          )
          .default([]),
      })
      .default({}),
    // Titler og annen tekst: galleri, anmeldelser, kart, kontakt, SEO og UI.
    // Ingen `.default()` her: gruppa inneholder SEO-feltene, som må finnes.
    general: z.object({
      // Galleri «Omgivelsene» (alt-tekst per bilde, parallelt med media.gallery)
      galleryTitle: z.string().default(''),
      galleryAlts: z.array(z.string()).default([]),
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
      // Kun etikett for innholdsmenyen (skjermlesere). Selve punktene i menyen
      // gjenbruker seksjonstitlene, så de trenger ingen egne nøkler.
      tocLabel: z.string().default('Contents'),
    }),
  }),
});

export const collections = { sections };
