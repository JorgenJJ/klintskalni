# Plan: «I nærheten»-seksjon (butikker, restauranter og aktiviteter)

> **Status: IMPLEMENTERT.** Dokumentet beskriver hvorfor seksjonen ser ut som
> den gjør: felles data ett sted, oversettbar tekst per språk, alt redigerbart i
> CMS-et. Se «Avvik fra planen» nederst for de stedene den ferdige løsningen
> bevisst gjør noe annet enn skissen under, og hvorfor.

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

Frontmatteret er gruppert (`hero:`, `about:`, `houses:`, `general:`), og hver
gruppe tilsvarer én sammenleggbar `object`-gruppe i CMS-et. «I nærheten» er en
egen seksjon med sin egen liste, så den bør bli en femte toppnøkkel `nearby:`
(plassert etter `houses:`) framfor å blandes inn i `general:`:

```yaml
nearby:
  title: "I nærheten"
  intro: "Kort intro (valgfri)."
  categoryLabels:
    shop: "Butikker"
    restaurant: "Mat og drikke"
    activity: "Aktiviteter og severdigheter"
  items:
    - id: "tuja-shop"
      description: "Dagligvarer, åpent hele uka." # valgfri
```

- Kategorietikettene oversettes ÉN gang per språk – ikke per sted.
- **Stedsnavnet ligger IKKE her.** Det var opprinnelig planlagt her, men et felt
  med `i18n: true` blir skrevet om av «Translate»-knappen, og Sveltia har ingen
  måte å unnta ett felt fra AI-oversetting på: `i18n` tar bare `true`, `false`
  og `duplicate`. Navnet ligger derfor i `nearby.json`, som hører til en
  collection uten `i18n` og som oversetteren aldri ser. Se «Avvik fra planen».

### 3. Skjema – `src/content.config.ts`

Alle nye felter får `.default(...)` slik at eksisterende innhold bygger videre
uten endring før seksjonen tas i bruk (seksjonen skjules når lista er tom):

```ts
nearby: z
  .object({
    title: z.string().default(''),
    intro: z.string().default(''),
    categoryLabels: z
      .object({
        shop: z.string().default(''),
        restaurant: z.string().default(''),
        activity: z.string().default(''),
      })
      .default({}),
    items: z
      .array(z.object({ id: z.string(), description: z.string().max(140).default('') }))
      .default([]),
  })
  .default({}),
```

`nearby.json` zod-valideres i `src/lib/nearby.ts` (samme mønster som
`src/lib/site.ts`), slik at slug-, kategori- og lenkefeil oppdages ved bygg.
Samme fil har koblingen `buildNearbyGroups()` og en vakt mot at diakritiske tegn
faller bort i oversatt tekst.

## CMS – `public/admin/config.yml`

1. **Ny collection «Nærområdet (steder, avstand og lenker)»** for
   `src/data/nearby.json`: liste med `id` (string, pattern-validert), `name`
   (egennavn), `area` (valgfritt), `category` (select:
   shop/restaurant/activity), `distanceKm` (number), `url` (string, valgfri).
   Collectionen har **ingen `i18n`-nøkkel** – det er nettopp derfor navnene ikke
   kan maskinoversettes.
2. **Ny gruppe «I nærheten»** i «Sideinnhold»: ett `object`-felt `nearby` med
   `i18n: true`, plassert etter «Husbeskrivelser» (husk: ALLE felter må ha
   i18n-flagg):
   - `title`, `intro`: `i18n: true`
   - `categoryLabels` (object med shop/restaurant/activity): `i18n: true`
   - `items` (list): `i18n: true`, med `id` som `i18n: duplicate`
     (holdes automatisk lik i alle språk – samme grep som hus-ID-en).

## Komponent og plassering

- Ny `src/components/Nearby.astro`:
  - grupperer stedene per kategori (rekkefølge: shop → restaurant → activity),
    kategorier uten steder skjules; hele seksjonen skjules når lista er tom
    (samme mønster som karusellen),
  - kompakte kort: navn, valgfritt område, valgfri beskrivelse, avstands-chip
    («~2,1 km»), ekstern lenke med `target="_blank" rel="noopener noreferrer"`
    (som Airbnb-knappene). Ingen kategori-ikoner: kategorioverskriften sier
    allerede hva lista er, så emojiene ble bare støy,
  - gjenbruker `.container`, `.section-title`, kort-stil (`--surface`,
    `--border`, `--radius`, `--shadow`) fra `global.css`; `id="nearby"` +
    `aria-label` som de andre seksjonene. Ingen ny klient-JS.
- Monteres i `src/pages/[lang]/index.astro` **mellom `<Carousel …/>` og
  `<Reviews …/>`**: den følger naturlig etter omgivelsesbildene, og kommer før
  anmeldelsene og kartet. Koblingen ligger i `buildNearbyGroups()` i
  `src/lib/nearby.ts`, ikke inline i frontmatteret som for `houses` – da kan en
  eventuell egen rute senere gjenbruke den.

### Hvorfor seksjon og ikke egen rute?

Vurdert og valgt bort. En `/[lang]/nearby/`-rute krever mer enn den ser ut til:

- `Layout.astro` bygger canonical, hreflang og `og:url` med `localizedPath(lang)`,
  altså alltid språkets forside. På en underside ville canonical pekt vekk fra
  sida selv.
- `LanguagePicker.astro` og språklenkene i footeren gjør det samme: å bytte språk
  fra `/no/nearby/` ville havnet på `/en/`, ikke `/en/nearby/`.
- Skript-et som gjenoppretter scrollposisjon ved språkbytte lagrer en ren
  pikselverdi uten å vite hvilken side den kom fra.
- Det finnes **ingen navigasjon** på siden: headeren inneholder bare
  språkvelgeren. En rute ingen kan klikke seg til måtte fått en meny først.

De tre første feiler dessuten stille, ikke ved bygg. Med 6–10 korte punkter er
tre nesten like tynne URL-er heller ingen SEO-gevinst.

Seksjonen er likevel bygget slik at en senere flytting er billig: all markup
ligger i `Nearby.astro` med et selvstendig prop-grensesnitt, koblingen ligger i
`src/lib/nearby.ts`, og `id="nearby"` gjør `/no/#nearby` til et stabilt anker.
**Vurder rute på nytt hvis lista passerer ~15 steder, eller hvis hvert sted skal
ha bilde.**

## SEO (valgfritt, i samme slengen)

- Stedsnavnene i ren tekst er SEO-verdien i seg selv (lokale søkeord: Tūja,
  Liepupe, Veczemju klintis …).
- **Ingen endring i strukturerte data.** Forslaget om å utvide
  `LodgingBusiness.amenityFeature` er bevisst droppet: de oppføringene beskriver
  eiendommens EGNE fasiliteter (strandtilgang, badstue, parkering). Butikker og
  severdigheter i nærheten er ikke fasiliteter ved utleieobjektet, og å legge ut
  `Place`-markup for virksomheter man ikke eier er i strid med retningslinjene
  for strukturerte data.
- De viktigste stedene ligger i `public/llms.txt` under «Nearby».

## Avklarte spørsmål

1. **Hvilke steder?** Ikke avklart ennå. `nearby.json` inneholder foreløpig tre
   oppføringer, to av dem tydelig merket `PLACEHOLDER`. **Erstatt dem med
   virkelige navn, avstander og lenker før neste publisering.**
2. **Avstand:** langs vei fra eiendommen. Vises med `~` foran, og formateres per
   språk (`2,1 km` på norsk og latvisk, `2.1 km` på engelsk).
3. **Lenkepolicy:** Google Maps. Lenk til selve stedet – **aldri** en kjørerute
   fra Klintskalni 1, som ville røpet nøyaktig adresse og undergravd
   `showMarker: false` i `site.json`. En ren lenke laster ikke noe skript, så
   $0- og sporingsfri-kravene holder.
4. **Kategorilista:** `shop` / `restaurant` / `activity`. Ingen `beach`-kategori:
   stranda er eiendommens egen, med direkte tilgang, ikke et sted i nærheten.
   NB: lista finnes tre steder (`src/lib/nearby.ts`, `src/content.config.ts`,
   `public/admin/config.yml`) og må endres alle tre stedene samtidig.
5. **Bilder per sted:** nei. Det ville krevd rettighetsklarering, og hvert bilde
   trenger alt-tekst – som er oversatt tekst, og dermed ville dratt stedsnavn
   tilbake inn i feltene AI-oversettingen skriver om.

## Avvik fra planen

Den ferdige løsningen avviker bevisst fra skissen over på fem punkter:

1. **Stedsnavnet ligger i `src/data/nearby.json`, ikke i `sections/<lang>.md`.**
   Dette er det viktigste avviket. Sveltias «Translate» skriver om alle felt med
   `i18n: true`, og feltnivå-`i18n` har bare verdiene `true`, `false` og
   `duplicate` – det finnes ingen «oversett ikke dette feltet». Et navnefelt i
   sections ville derfor blitt maskinoversatt, mest sannsynlig ved at
   diakritiske tegn faller bort (Tūja → Tuja) eller at latvisk bøyer navnet
   (Tūja → Tūjā). Løsningen er strukturell: collectionen for `nearby.json` har
   ingen `i18n`-nøkkel, så oversetteren når den ikke. Kategorioverskriften
   fungerer dessuten som den generiske beskrivelsen, så «Matbutikk i Tūja» er
   unødvendig – «Rimi» under «Butikker» leser bedre og gir mindre å oversette.
2. **`categoryLabels` er et eksplisitt `z.object`, ikke `z.record`.** Et record
   svelger en skrivefeil (`shopp:`) i stillhet; objektet fanger den ved bygg.
3. **Lista i sections heter `items`, ikke `places`.** Det matcher `houses.items`
   og skiller den fra `places` i `nearby.json`, som er andre data (navn, ikke
   beskrivelser).
4. **Ingen endring i strukturerte data** (se SEO over).
5. **Koblingen ligger i `src/lib/nearby.ts`**, ikke inline i `index.astro`.

Samtidig ble `hero.title` satt til `i18n: duplicate`: eiendomsnavnet er et
egennavn og hadde ingen grunn til å være eksponert for «Translate».
