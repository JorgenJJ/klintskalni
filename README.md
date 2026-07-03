# Klintskalni — feriehus-nettside

Enkel, flerspråklig og vedlikeholdsvennlig informasjonsside for eiendommen
Klintskalni, som har **to separate feriehus** (det store og det lille huset) på
samme tomt. Hvert hus har sin egen Airbnb-annonse; begge kan leies sammen ved
direkte kontakt. Bygget som en **statisk side med [Astro](https://astro.build)**
etter kravspesifikasjonen i prosjektrapporten.

- **Flerspråklig:** engelsk, norsk, latvisk (`/en/`, `/no/`, `/lv/`) – enkelt å utvide.
- **Redigerbart uten kode:** all tekst, alle bilder og kontaktinfo bor i innholdsfiler.
- **$0 i drift:** ment for Cloudflare Pages gratis-tier; ingen server eller database.
- **Personvernvennlig:** ingen sporing, ingen API-nøkler, kart via OpenStreetMap.

---

## Kom i gang lokalt

```bash
npm install
npm run placeholders   # lager midlertidige plassholder-bilder (kjør én gang)
npm run dev            # start utviklingsserver på http://localhost:4321
```

Bygg for produksjon: `npm run build` (resultatet havner i `dist/`).
Forhåndsvis bygget: `npm run preview`.

---

## ✅ Hva DU må gjøre selv for at siden skal fungere

Koden og strukturen er ferdig. Disse stegene krever dine egne kontoer/verdier
og kan ikke gjøres for deg:

1. **Anmeldelser.** `src/content/reviews/reviews.json` inneholder de ekte,
   utvalgte anmeldelsene fra Airbnb (Adam og Knut). Legg til eller fjern
   sitater ved behov (fornavn, kilde, dato). `reviewsNote` i `sections/*.md`
   står på «★ 5,0».

2. **E-post.** I `src/content/site/en.json`, `no.json`, `lv.json`: bytt `email`
   til din dedikerte adresse (eller sett `""` for å skjule e-postknappen).

3. **Bytt ut / suppler bildene.** Legg dine egne foto i `src/images/hero/` og
   `src/images/gallery/`. Hus-bildene pekes på i `src/data/houses.json`;
   eiendoms-/omgivelsesbildene (hero + galleri «Omgivelsene») i
   **`src/data/media.json`** (felles for alle språk). Oppdater alt-tekstene i
   `sections/*.md` (samme rekkefølge som `gallery`). Tips: nedskaler til
   ~2000 px lengste side – Astro lager resten av størrelsene.

4. **Finjuster kartet.** `site/*.json` under `map` er satt til Liepupe-/Tūja-kysten
   (`lat 57.5105`, `lon 24.3405`). Juster `lat`/`lon` om nålen/utsnittet bør flyttes.
   Standard viser *området*, ikke nøyaktig adresse (`showMarker: false`).

5. **Koble GitHub → Cloudflare Pages** (publisering). Se egen seksjon under.

6. **Sett opp Sveltia CMS-innlogging** hvis du vil redigere i nettleseren på `/admin`.
   Se egen seksjon under. (Helt valgfritt – du kan redigere filene direkte i GitHub.)

7. **(Senere) eget domene + delingsbilde-URL.** Når domenet er klart, bytt
   `site:` i `astro.config.mjs` og `Sitemap:`-linjen i `public/robots.txt` til
   ditt domene.

Alt annet (i18n-ruting, bildeoptimalisering, SEO-tagger, sitemap, design) er ferdig.

---

## Koble til Cloudflare Pages (gratis hosting)

Gjøres én gang i Cloudflare-dashbordet (ingen GitHub Actions nødvendig):

1. Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Velg dette repoet og grenen du vil publisere fra (f.eks. `main`).
3. Bygginnstillinger (Cloudflare gjenkjenner Astro automatisk):
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Trykk **Save and Deploy**. Siden publiseres på `https://<prosjekt>.pages.dev`.

Etterpå trigger hver `git push` til den grenen automatisk nytt bygg. Pull
requests får egne forhåndsvisnings-URLer. Eget domene kobles på med få klikk
under **Custom domains** når du er klar.

> Merk: plassholder-bildene er committet slik at det første bygget i Cloudflare
> lykkes. `npm run placeholders` trengs bare lokalt.

---

## Redigere innhold

### Direkte i GitHub (enklest, ingen oppsett)
Åpne riktig fil, klikk blyantikonet, rediger, «Commit». Siden bygges om automatisk.

| Hva | Fil |
|-----|-----|
| All tekst (hero, husene, omgivelser, kontakt, SEO, alt-tekst) | `src/content/sections/<språk>.md` |
| **Husenes Airbnb-lenke + bilde** (felles, store/lille) | `src/data/houses.json` |
| **Eiendoms-/omgivelsesbilder** (hero, galleri) – felles | `src/data/media.json` |
| Eiendomsnavn, e-post, kartposisjon | `src/content/site/<språk>.json` |
| Lengre «om eiendommen»-tekst | brødteksten nederst i `sections/<språk>.md` |
| Anmeldelser | `src/content/reviews/reviews.json` (under nøkkelen `reviews`) |

> **To hus, delt eiendom.** Hvert hus har egne detaljer og egen Airbnb-lenke.
> Bilde + lenke per hus ligger i `src/data/houses.json`; den oversatte teksten
> (navn, beskrivelse, nøkkelpunkter) ligger under `houses:` i `sections/<språk>.md`
> og kobles sammen via `id` (`large` / `small`).
>
> **Bilder er felles for alle språk.** Bytt et bilde ett sted; kun **alt-tekstene**
> oversettes. `galleryAlts` må stå i **samme rekkefølge** som `gallery` i `media.json`.

### Via Sveltia CMS på `/admin` (skjema i nettleser)
1. Opprett et **fine-grained Personal Access Token (PAT)** på GitHub:
   *Settings → Developer settings → Fine-grained tokens.*
   - Begrens til **kun dette repoet**.
   - Gi tilgang **Contents: Read and write**.
   - Sett en utløpsdato (forny ved behov – sett en kalenderpåminnelse).
2. I `public/admin/config.yml`: kontroller at `repo:` og `branch:` stemmer
   (står nå som `jorgenjj/klintskalni` / `main`).
3. Gå til `https://dittdomene/admin`, lim inn tokenet ved innlogging.
   Tokenet lagres **kun lokalt i nettleseren** – det committes aldri.

---

## Legge til et nytt språk (uten kodeendring i komponentene)

1. Legg språket til i den sentrale lista i `src/i18n/languages.ts`, f.eks. `de: 'Deutsch'`.
2. Kopier `src/content/site/en.json` → `de.json` og oversett.
3. Kopier `src/content/sections/en.md` → `de.md` og oversett.
4. (Valgfritt) legg språket til i `public/admin/config.yml` for Sveltia.
5. Push. Ruting `/de/` og språkvelger kommer automatisk.

---

## Prosjektstruktur

```
src/
├── content/
│   ├── site/        # global konfig per språk (Airbnb-lenke, e-post, bilder, kart)
│   ├── sections/    # all synlig tekst per språk (+ "om huset"-brødtekst)
│   └── reviews/     # kuraterte anmeldelser
├── images/          # bilder (optimaliseres ved bygg av Astro)
├── components/      # gjenbrukbare seksjoner (Hero, Galleri, Kart, Kontakt …)
├── i18n/            # språkliste (languages.ts) + hjelpefunksjoner
├── layouts/         # sidemal med SEO/Open Graph/hreflang
└── pages/           # ruting (rot-redirect + /[lang]/)
public/
├── admin/           # Sveltia CMS (index.html + config.yml) → /admin
├── favicon.svg, robots.txt
scripts/
└── generate-placeholders.mjs   # lager midlertidige bilder
```

## Vedlikehold

- **Rull tilbake en feil:** «Revert» commiten i GitHub, eller rull tilbake til en
  tidligere deploy i Cloudflare med ett klikk.
- **Avhengigheter:** oppdater et par ganger i året (`npm update`); slå gjerne på
  Dependabot i GitHub.
- **Backup:** hele siden *er* repoet. Ingen database å sikkerhetskopiere.
