# CLAUDE.md — Klintskalni 1

Static, multilingual information site for the holiday property **Klintskalni 1**
near Tūja, Liepupe parish, Latvia: two rentable log homes on one seaside plot,
the House (`id: house`, sleeps 8) and the Cottage (`id: cottage`, sleeps 7).
Booking happens on Airbnb (one listing per home) or by email; the site itself is
informational only. Built with **Astro 5**, deployed as pure static files to
**Cloudflare Pages free tier**.

Hard constraints: **$0/month to run** (no server, database, paid API or keys),
**no tracking**, map shows the *area*, not the exact address (privacy:
`showMarker: false` by default).

Repo conventions: README, code comments, commit messages and CMS labels are in
**Norwegian**; keep it that way. Site languages: `/en/`, `/no/`, `/lv/`.

## Content style

- **No em dashes (—, U+2014) in any site text or content file.** This applies to
  `src/content/**` (all languages), `src/data/**`, `public/llms.txt`, and any
  user-visible strings in components (including alt text and ARIA labels). Use a
  colon, a comma, parentheses, or two sentences instead. The en dash (–) used as
  ordinary Norwegian punctuation in comments and labels is fine and separate.
- The hero header is just the property name ("Klintskalni 1"); the descriptive
  sentences live in `heroTagline`, not the `<h1>`.

## Architecture — the content/code split

One page per language from `src/pages/[lang]/index.astro`. Editable content
never lives in components:

- `src/content/sections/<lang>.md`: ALL translated text (frontmatter per section
  plus a markdown body for the "about" text). Schema-validated at build by
  `src/content.config.ts`.
- `src/data/*.json`: language-INDEPENDENT data, exactly one file per concern.
  `site.json` (property name plus map, validated in `src/lib/site.ts`),
  `houses.json` (per-home Airbnb URL, facts, card image, gallery),
  `media.json` (hero/OG image plus surroundings carousel), `contact.json` (email).
- `src/content/reviews/reviews.json`: curated Airbnb quotes (not translated).
- `src/i18n/languages.ts`: THE single language list; routing, pickers, sitemap
  and hreflang all derive from it.

Invariants to preserve:

- Images are shared across languages; only **alt texts** are translated.
  `galleryAlts` in `sections/<lang>.md` must stay in the same order as `gallery`
  in `media.json`.
- House text (sections) joins house data (houses.json) on `id`
  (`house` or `cottage`); the CMS constrains this with a select widget.
- Images are referenced by path relative to `src/images/`
  (`gallery/beach.jpg`); `src/lib/images.ts` also accepts Sveltia's
  `/src/images/...` form. Missing images render as nothing, never crash.
- Only tiny inline scripts, no client frameworks.

## CMS — Sveltia at /admin

Config: `public/admin/config.yml`. Production uses the GitHub backend with a
fine-grained PAT; locally, `npm run dev` plus `http://localhost:4321/admin` in a
Chromium browser offers "Work with Local Repository" (no config or proxy needed,
writes straight to the working tree).

"Sideinnhold" is ONE entry covering all locales (`{{locale}}` in the file path);
locales are edited side by side. Fields marked `i18n: duplicate` (e.g. house
`id`) sync automatically across languages. **Every field in that collection must
carry an `i18n` flag**: an unflagged field is hidden in non-default locales and
its translations get dropped on save.

## Commands

- `npm run dev`: dev server at http://localhost:4321 (Node 20.3+; 22/24 OK)
- `npm run build`: static build to `dist/`; content schemas validate here, so run
  it to verify content changes
- `npm run preview`: serve the built site

## Making changes

- **New language:** add to `languages.ts`, add the code to `locales:` in
  `config.yml`, copy `sections/en.md` to `<code>.md`, translate.
- **New page section:** extend the zod schema in `src/content.config.ts`, add the
  keys to all three `sections/*.md`, add the fields (with i18n flags) to
  `config.yml`, create the component in `src/components/`, mount it in
  `src/pages/[lang]/index.astro`. Language-independent data goes in a new
  `src/data/*.json` with its own CMS collection.
- Planned next section: "Nearby" (shops, restaurants, activities). See
  `docs/nearby-plan.md` before implementing.
