import { z } from 'astro/zod';
import siteData from '../data/site.json';

// =============================================================================
//  FELLES nettstedsinnstillinger – src/data/site.json
// =============================================================================
//  Eiendomsnavn og kartposisjon er identiske på alle språk og bor derfor i ÉN
//  fil (tidligere lå de duplisert i src/content/site/<lang>.json – å flytte
//  kartet betydde tre like endringer). Oversettbar tekst ligger fortsatt i
//  src/content/sections/<lang>.md. Skjemaet under validerer ved bygg, så feil
//  oppdages tidlig – samme prinsipp som i src/content.config.ts.

const siteSchema = z.object({
  houseName: z.string(),
  // Kart (OpenStreetMap) – viser nærområde, ikke nøyaktig adresse (kap. 2.8).
  map: z.object({
    lat: z.number(),
    lon: z.number(),
    // Hvor stort utsnitt som vises (grader). Større = mer «nærområde».
    areaSpan: z.number().default(0.06),
    // Vis nål på nøyaktig punkt? Standard false = personvern (vis område).
    showMarker: z.boolean().default(false),
  }),
});

export const site = siteSchema.parse(siteData);
