# Plan: «I nærheten»-seksjon (butikker, restauranter og aktiviteter)

> **Status: KUN PLAN – ikke implementert.** Dokumentet beskriver hvordan
> seksjonen skal bygges slik at den følger arkitekturen i resten av siden:
> felles data ett sted, oversettbar tekst per språk, alt redigerbart i CMS-et.

## Mål

Gi gjester en oversikt over hva som finnes rundt Klintskalni 1: nærmeste
matbutikk, restauranter/kafeer, og aktiviteter (strand, turstier, severdigheter
som Veczemju klintis, osv.) – med avstand og lenke. Seksjonen skal:

- kreve **minimalt vedlikehold på tvers av språk** (avstander, lenker og
  kategorisering skrives ETT sted; kun navn/beskrivelser oversettes),
- være **redigerbar uten kode** via Sveltia CMS,
- holde **$0-prinsippet**: ingen API-er eller eksterne tjenester – bare
  statisk innhold og vanlige lenker (f.eks. til Google Maps/OpenStreetMap).

## Innholdsmodell (samme mønster som husene)

Strukturell data og oversatt tekst kobles på `id`, akkurat som
`houses.json` ↔ `sections/<lang>.md` i dag.

### 1. Felles data – ny fil `src/data/nearby.json`

```json
{
  "places": [
    {
      "id": "tuja-shop",
      "category": "shop",
      "distanceKm": 2.1,
      "url": "https://maps.app.goo.gl/..."
    },
    {
      "id": "veczemju-klintis",
      "category": "activity",
      "distanceKm": 4.5,
      "url": "https://..."
    }
  ]
}
```

- `id`: liten-bokstavs slug (`^[a-z0-9-]+$`), kobler mot teksten per språk.
- `category`: fast liste – `shop` | `restaurant` | `activity` (select i CMS-et;
  utvides ved behov, f.eks. `beach`).
- `distanceKm`: tall, formateres per språk i komponenten (`1,2 km` / `1.2 km`)
  med `toLocaleString(lang)`.
- `url`: valgfri ekstern lenke (Google Maps, eget nettsted).
- **Ingen bilder i første versjon** – ikonet per kategori holder. Det unngår
  jakt på rettighetsklarerte bilder og holder seksjonen lett. Kan utvides
  senere med et valgfritt `image`-felt (samme mønster som husene).

### 2. Oversatt tekst – nye nøkler i `src/content/sections/<lang>.md`

```yaml
nearbyTitle: "I nærheten"
nearbyIntro: "Kort intro (valgfri)."
nearbyCategoryLabels:
  shop: "Butikker"
  restaurant: "Mat og drikke"
  activity: "Aktiviteter og severdigheter"
nearbyPlaces:
  - id: "tuja-shop"
    name: "Matbutikk i Tūja"
    description: "Dagligvarer, åpent hele uka." # valgfri
```

- Kategorietikettene oversettes ÉN gang per språk – ikke per sted.
- Stedsnavn er ofte egennavn; med Sveltias side-om-side-redigering og
  kopier/oversett-knapper er det ett klikk å gjenbruke dem på tvers av språk.

### 3. Skjema – `src/content.config.ts`

Alle nye felter får `.default(...)` slik at eksisterende innhold bygger videre
uten endring før seksjonen tas i bruk (seksjonen skjules når lista er tom):

```ts
nearbyTitle: z.string().default(''),
nearbyIntro: z.string().default(''),
nearbyCategoryLabels: z.record(z.string()).default({}),
nearbyPlaces: z
  .array(z.object({ id: z.string(), name: z.string(), description: z.string().default('') }))
  .default([]),
```

Vurder samtidig å zod-validere `nearby.json` i `src/lib/` (samme mønster som
`src/lib/site.ts`) slik at slug-/kategorifeil oppdages ved bygg.

## CMS – `public/admin/config.yml`

1. **Ny collection «Nærområdet (avstand + lenker)»** for `src/data/nearby.json`:
   liste med `id` (string, pattern-validert), `category`
   (select: shop/restaurant/activity), `distanceKm` (number), `url` (string,
   valgfri).
2. **Nye felter i «Sideinnhold»** (husk: ALLE felter må ha i18n-flagg):
   - `nearbyTitle`, `nearbyIntro`: `i18n: true`
   - `nearbyCategoryLabels` (object med shop/restaurant/activity): `i18n: true`
   - `nearbyPlaces` (list): `i18n: true`, med `id` som `i18n: duplicate`
     (holdes automatisk lik i alle språk – samme grep som hus-ID-en).

## Komponent og plassering

- Ny `src/components/Nearby.astro`:
  - grupperer stedene per kategori (rekkefølge: shop → restaurant → activity),
    kategorier uten steder skjules; hele seksjonen skjules når lista er tom
    (samme mønster som karusellen),
  - kompakte rader/kort: kategori-ikon (emoji/inline-SVG), navn, valgfri
    beskrivelse, avstands-chip («~2,1 km»), ekstern lenke med
    `target="_blank" rel="noopener noreferrer"` (som Airbnb-knappene),
  - gjenbruker `.container`, `.section-title`, kort-stil (`--surface`,
    `--border`, `--radius`, `--shadow`) fra `global.css`; `id="nearby"` +
    `aria-label` som de andre seksjonene. Ingen ny klient-JS.
- Monteres i `src/pages/[lang]/index.astro` **rett etter `<Map …/>`** (hører
  tematisk til «Området») og før `<Contact …/>`. Data slås sammen i
  frontmatter på samme måte som `houses` (join på `id`, hopp over steder uten
  oversatt navn).

## SEO (valgfritt, i samme slengen)

- Stedsnavnene i ren tekst er SEO-verdien i seg selv (lokale søkeord: Tūja,
  Liepupe, Veczemju klintis …). Ingen endring i strukturerte data er nødvendig;
  eventuelt kan `LodgingBusiness.amenityFeature` utvides.
- Legg de viktigste stedene til i `public/llms.txt` under en ny «Nearby»-liste.

## Gjennomføring (sjekkliste)

1. `src/data/nearby.json` med de faktiske stedene (se åpne spørsmål).
2. Zod-oppdatering i `src/content.config.ts` (+ evt. `src/lib/nearby.ts`).
3. Nye nøkler i `sections/en.md`, `no.md`, `lv.md`.
4. `src/components/Nearby.astro` + montering i `[lang]/index.astro`.
5. CMS-felter i `public/admin/config.yml` (begge stedene, med i18n-flagg).
6. Oppdater README-tabellen «Redigere innhold» + `public/llms.txt`.
7. Verifiser: `npm run build` (skjema validerer), og CMS-et lokalt via
   «Work with Local Repository» (åpne «Sideinnhold» og «Nærområdet»).

Estimert omfang: ~6 filer endret + 2 nye. Ingen avhengigheter, ingen ny JS.

## Åpne spørsmål (avklar før implementering)

1. **Hvilke steder?** Trenger navn + reell avstand for butikk(er),
   restaurant(er)/kafé(er) og 3–6 aktiviteter. (Airbnb-annonsene og lokalkunnskap
   er beste kilde.)
2. **Avstand**: langs vei/gange (anbefalt – det gjestene faktisk kjører/går)
   eller luftlinje? Og fra porten eller stranda?
3. **Lenkepolicy**: Google Maps-lenker (enkelt, men Google), OpenStreetMap
   (mest i tråd med personvernprofilen), eller stedets egen nettside der den
   finnes?
4. **Kategorilista**: holder shop/restaurant/activity, eller ønskes egen
   `beach`-kategori?
5. **Bilder per sted** i en senere versjon – ja/nei?
