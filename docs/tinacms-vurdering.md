# Vurdering: migrere fra Sveltia CMS til TinaCMS

Status: vurdering, ikke vedtatt. Skrevet oktober 2026.

Spørsmålet: kan CMS-et på `/admin` byttes fra Sveltia til TinaCMS, hvor mye jobb
er det, hvordan bevares innholdet, hvilke risikoer finnes, og hvordan kan byttet
gjøres i én deploy?

## Kort konklusjon

**Mulig, men ikke anbefalt med dagens krav.** Innholdet kan bevares 100 %,
fordi Tina også er Git-basert og leser de samme `.md`/`.json`-filene. Jobben er
å skrive skjemaet på nytt, ikke å flytte data. Men Tina bryter med to av
prosjektets grunnprinsipper og fjerner den viktigste redaksjonelle funksjonen:

1. **AI-oversettingen forsvinner.** Tina har ingen «Translate»-knapp, ingen
   side-om-side-redigering av språk og ingen `i18n: duplicate`. Hele
   arbeidsflyten «skriv norsk, fyll engelsk og latvisk automatisk» må erstattes.
2. **Drift blir ikke lenger nøkkel- og tjenestefri.** Produksjon krever enten
   Tina Cloud (ekstern SaaS, `TINA_CLIENT_ID` + `TINA_TOKEN` som byggvariabler i
   Cloudflare) eller selvhosting (Node-backend + database som MongoDB/Redis +
   innloggingsløsning). Begge strider mot «ingen server, database eller nøkler».
3. **Tinas hovedfordel, visuell redigering, krever React** på siden i
   redigeringsmodus, mot regelen «ingen klient-rammeverk».

Uten visuell redigering er Tina i praksis «skjemaer i nettleseren», altså det
samme som Sveltia gir i dag, bare med mer avhengigheter. Anbefaling: bli på
Sveltia, med mindre det finnes et konkret behov som bare Tina dekker.

## Dagens oppsett (det som må gjenskapes)

- `public/admin/config.yml` (319 linjer): 7 collections, ca. 60 felt.
  - `sections`: én oppføring, `src/content/sections/{{locale}}.md`,
    `structure: multiple_files`, `default_locale: "no"`, fem `object`-grupper
    (`hero`, `about`, `houses`, `nearby`, `general`) + markdown-`body`.
  - `site`, `houses`, `nearby`, `media`, `contact`: enkeltfiler i `src/data/`.
  - `reviews`: `src/content/reviews/reviews.json`.
- Zod-skjema i `src/content.config.ts` validerer `sections` ved bygg; dette kan
  stå urørt (Astro leser fortsatt filene selv, Tina brukes bare til redigering).
- Bilder: `media_folder: src/images`, verdier lagres som `/src/images/x.avif`
  eller eldre `gallery/x.jpg`; `resolveImage` i `src/lib/images.ts` godtar begge.
- Innlogging: fine-grained PAT lagret i nettleseren. Ingen secrets i bygget.
- Redigering skjer i dag rett mot `main` (se commitene «Update Sideinnhold»).

## Hvor mye jobb

| Del | Innsats |
|---|---|
| `tina/config.ts`: 7 collections, ca. 60 felt, lister med `ui.itemProps`, select, validering (id-mønster, `http(s)://`) | 1–1,5 dag |
| Språkmodell: `sections` som én collection med tre dokumenter (`no.md`, `en.md`, `lv.md`); erstatte `i18n: duplicate` med byggsjekk | 0,5 dag |
| Bilder: Tina krever `mediaRoot` under `publicFolder`; sett `publicFolder: "src"`, `mediaRoot: "images"` (verdier blir `/images/x.avif`), utvide `resolveImage`, normalisere eksisterende stier | 0,5 dag |
| Bygg/deploy: devDeps `tinacms` + `@tinacms/cli`, `build: "tinacms build && astro build"`, `dev: "tinacms dev -c \"astro dev\""`, Tina Cloud-prosjekt, Cloudflare-variabler, `.gitignore` for generert admin | 0,5 dag |
| Rundturtest, diff av bygget, oppdatere README og CLAUDE.md | 1 dag |
| **Sum, kun skjemaredigering** | **ca. 3,5–4 dager** |
| Tillegg: visuell redigering (`@tinacms/astro`, React-øyer, Tina-klient i komponentene) | + 3–5 dager |
| Tillegg: erstatte AI-oversetting med eget skript (Mistral/DeepL-API kjørt lokalt) | + 1–2 dager |

## Hvordan innholdet bevares

- **Ingen datamigrering i egentlig forstand.** Tina leser og skriver de samme
  filene. Filstiene og feltnavnene beholdes (alle er camelCase, gyldige i Tina;
  alle JSON-filer har objekt som rot, som Tina krever).
- Markdown-body i `sections/*.md` mappes til `rich-text` med `isBody: true`.
  Tina parser og serialiserer markdown på nytt, så harde linjeskift kan bli
  slått sammen. Ingen synlig endring på siden, men gir støy i første diff.
- YAML-frontmatter skrives om av Tina (anførselstegn, rekkefølge). Zod-skjemaet
  validerer fortsatt ved bygg, så feil fanges før deploy.
- Bildestier normaliseres én gang til `/images/...` (et lite engangsskript i
  `houses.json` og `media.json`), og `resolveImage` godtar alle tre formene.
- Sikring: tagg `pre-tina` før byttet; Sveltia-oppsettet ligger i git-historikken.
- **Bevisbar bevaring:** bygg `dist/` før og etter, og `diff -r` på HTML-en.
  Kravet er null forskjell i generert HTML (bortsett fra eventuelle bildehasher
  hvis filer flyttes, noe planen unngår).

## Risikoer

| Risiko | Alvor | Tiltak |
|---|---|---|
| AI-oversetting og side-om-side forsvinner; latvisk og engelsk må oversettes manuelt | Høy | Eget lokalt oversettingsskript, eller godta manuell flyt |
| Språkene kan gli fra hverandre (`hero.title`, `houses.items[].id`, `nearby.items[].id`, rekkefølge på `galleryAlts`) fordi ingenting synkroniserer dem | Middels | Byggsjekk i stil med `assertProperNounsIntact` i `src/lib/nearby.ts` som feiler bygget ved avvik |
| Avhengighet av Tina Cloud (SaaS, indekserer innholdet, kan endre pris/gratisnivå; ca. 2 brukere gratis i dag, ikke bekreftet direkte mot tina.io) | Middels | Bekreft pris før start; Git er fortsatt sannhetskilden, så exit er mulig |
| Byggsecret (`TINA_TOKEN`) i Cloudflare; bygget feiler hvis Tina Cloud er nede eller tokenet tilbakekalles | Middels | Alternativt: kun lokal Tina (`tinacms dev`) og redigering via git, uten Tina Cloud i bygget |
| Bildeoppsett med `publicFolder: "src"` er en omvei fra Tinas standard (`public/`), og bildeforhåndsvisning i Tina kan bli feil | Middels | Test opplasting og forhåndsvisning på preview-URL før bytte |
| Tung avhengighet (React, GraphQL, CLI) i et repo som i dag har 3 avhengigheter; lengre bygg og flere oppdateringer | Lav–middels | Kun devDependencies; ingenting av dette sendes til besøkende |
| Sveltia-redigering mot `main` midt i byttet gir konflikter | Lav | Innholdsfrys under byttet |
| `public/admin/` kolliderer (Sveltia-filer og Tinas genererte admin) | Lav | Fjern Sveltia-filene i samme commit som Tina legges til |

Fordeler å veie mot: ingen PAT som utløper (innlogging via Tina-konto),
mer moderne grensesnitt, og visuell redigering hvis man aksepterer React.

## Plan for å bytte i én deploy

1. **Forberedelse (ingen effekt på produksjon)**
   - Bekreft Tina Cloud-pris og brukergrense. Opprett prosjekt, gi GitHub-appen
     tilgang til `jorgenjj/klintskalni`.
   - Ny gren `tina-migrering`. Bygg `dist/` fra `main` og lagre som referanse.
2. **Bygg Tina-oppsettet på grenen**
   - `tina/config.ts` med alle 7 collections, norske etiketter, samme
     `required`/`default` som i `config.yml`.
   - Utvid `resolveImage` (`src/lib/images.ts`) og normaliser bildestier.
   - Legg til språksynk-sjekk i bygget.
   - Oppdater `package.json`-skript, `.gitignore`, README og CLAUDE.md.
   - Fjern `public/admin/config.yml`, `public/admin/index.html` og
     `adminDevFallback` i `astro.config.mjs` (Tina serverer egen admin).
3. **Test på Cloudflare preview-URL**
   - Sett `TINA_CLIENT_ID`/`TINA_TOKEN` for preview-miljøet.
   - Åpne og lagre hvert dokument uten endringer; `git diff` skal være tom eller
     kun formatering. Rediger ett felt per collection, last opp ett bilde.
   - `npm run build` og `diff -r` mot referansen.
4. **Bytte (én deploy)**
   - Innholdsfrys: ingen redigering i Sveltia.
   - Merge `main` inn i grenen (fanger siste innholdscommits), kjør test 3 igjen.
   - Tagg `pre-tina` på `main`, sett variablene for produksjon, merge grenen.
   - Cloudflare bygger og publiserer: siden og `/admin` (nå Tina) går live samtidig.
5. **Etterkontroll og tilbakerulling**
   - Sjekk `/en/`, `/no/`, `/lv/` og `/admin`; gjør én testredigering.
   - Tilbakerulling: `git revert` av merge-commiten; Cloudflare publiserer
     Sveltia-versjonen igjen. Innholdsfilene er de samme, så ingenting går tapt.

## Kilder og forbehold

Tinas egne sider (tina.io) var ikke tilgjengelige da vurderingen ble skrevet, så
pris og brukergrense bygger på tredjepartsoversikter og bør bekreftes på
tina.io/pricing før en eventuell migrering. Relevante sider:

- Tina + Astro: https://tina.io/docs/frameworks/astro
- Flerspråk i Tina: https://tina.io/docs/guides/internationalization
- Selvhosting: https://tina.io/docs/self-hosted/overview
- Cloudflare: https://tina.io/docs/tinacloud/deployment-options/cloudflare-workers
