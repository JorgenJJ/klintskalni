import { z } from 'astro/zod';
import nearbyData from '../data/nearby.json';

// =============================================================================
//  «I nærheten» – FELLES stedsdata: src/data/nearby.json
// =============================================================================
//  Stedsnavnene er EGENNAVN (Tūja, Veczemju klintis, Salacgrīva …) og ligger her
//  BEVISST: fila hører til en CMS-collection UTEN i18n, og «Translate»-knappen i
//  Sveltia når kun collections som har i18n. Navnene kan derfor ikke bli
//  maskinoversatt, miste diakritiske tegn (Tūja → Tuja) eller bli bøyd på
//  latvisk. Kun kategorinavn og en valgfri kort beskrivelse oversettes, og de
//  ligger i src/content/sections/<lang>.md. Samme koblingsmønster som husene:
//  felles data + tekst per språk, koblet på `id`.
//
//  NB: kategorilista finnes tre steder og må holdes i takt:
//      denne fila, `nearby.categoryLabels` i src/content.config.ts
//      og select-widgeten i public/admin/config.yml.

export const CATEGORIES = ['shop', 'restaurant', 'activity'] as const;
export type Category = (typeof CATEGORIES)[number];

const placeSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'id: kun små bokstaver, tall og bindestrek'),
  // Egennavn. Skrives ÉN gang, brukes på alle språk.
  name: z.string().min(1, 'Stedet må ha et navn'),
  // Valgfritt område, f.eks. «Salacgrīva». Også et egennavn.
  area: z.string().default(''),
  category: z.enum(CATEGORIES),
  distanceKm: z.number().nonnegative(),
  // Valgfri lenke. Vi bruker `refine` framfor z.string().url() for å kunne gi
  // en norsk feilmelding når noen limer inn en adresse uten http(s).
  url: z
    .string()
    .default('')
    .refine(
      (u) => u === '' || /^https?:\/\//.test(u),
      'Lenken må starte med http:// eller https://',
    ),
});

export const nearby = z
  .object({ places: z.array(placeSchema).default([]) })
  .parse(nearbyData);

// Duplikate id-er ville koblet feil beskrivelse til feil sted – stopp bygget.
{
  const seen = new Set<string>();
  for (const place of nearby.places) {
    if (seen.has(place.id)) {
      throw new Error(`Duplikat id i src/data/nearby.json: «${place.id}»`);
    }
    seen.add(place.id);
  }
}

export interface NearbyItem {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  url: string;
  description: string;
}

export interface NearbyGroup {
  category: Category;
  label: string;
  items: NearbyItem[];
}

/**
 * Slår sammen felles stedsdata (nearby.json) med oversatt tekst (sections) via
 * `id`, grupperer per kategori og sorterer nærmest først. Kategorier uten
 * steder droppes, slik at komponenten kan skjule seg selv når lista er tom.
 * Steder uten oversatt beskrivelse vises fint uten – navnet er jo felles.
 *
 * Ligger her, ikke i frontmatteret til index.astro, slik at en eventuell egen
 * «I nærheten»-rute senere kan gjenbruke koblingen uten å kopiere den.
 */
export function buildNearbyGroups(
  labels: Partial<Record<Category, string>>,
  texts: { id: string; description?: string }[],
): NearbyGroup[] {
  const byId = new Map(texts.map((t) => [t.id, t]));

  return CATEGORIES.map((category) => ({
    category,
    label: labels[category] ?? '',
    items: nearby.places
      .filter((place) => place.category === category)
      // Array.sort er stabil, så steder med lik avstand beholder JSON-rekkefølgen.
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((place) => ({
        ...place,
        description: byId.get(place.id)?.description ?? '',
      })),
  })).filter((group) => group.items.length > 0);
}

/** Egennavn som aldri skal dukke opp forvansket i oversatt tekst. */
export const protectedNames = nearby.places
  .flatMap((place) => [place.name, place.area])
  .filter(Boolean);

const stripDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Fanger den vanligste feilen fra AI-oversetting: at diakritiske tegn faller
 * bort («Tūja» → «Tuja», «Salacgrīva» → «Salacgriva»). Lista over beskyttede
 * navn kommer fra nearby.json, så den vedlikeholder seg selv.
 *
 * Dekker også feltene som MÅ være oversatt og likevel inneholder stedsnavn
 * (kart-områdenavn og SEO-tekstene) – de kan ikke flyttes ut av sections.
 */
export function assertProperNounsIntact(names: string[], texts: string[]): void {
  for (const name of names) {
    const bare = stripDiacritics(name);
    if (bare === name) continue; // navnet har ingen diakritiske tegn å miste
    for (const text of texts) {
      if (text.includes(bare) && !text.includes(name)) {
        throw new Error(
          `«${bare}» ser ut som «${name}» uten diakritiske tegn. ` +
            'Sannsynligvis AI-oversetting. Rett teksten, eller flytt navnet ' +
            'til src/data/nearby.json.',
        );
      }
    }
  }
}
