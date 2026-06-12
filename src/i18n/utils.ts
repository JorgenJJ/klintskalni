import { getCollection, getEntry } from 'astro:content';
import { defaultLang, type Lang, languages } from './languages';

/** Bygg en språk-prefikset URL, f.eks. localizedPath('no', '#contact'). */
export function localizedPath(lang: Lang, path = ''): string {
  const clean = path.replace(/^\//, '');
  return `/${lang}/${clean}`;
}

/** Hent global site-konfig for et språk (faller tilbake til standardspråk). */
export async function getSite(lang: Lang) {
  const entry = (await getEntry('site', lang)) ?? (await getEntry('site', defaultLang));
  if (!entry) throw new Error(`Mangler site-konfig for «${lang}» og «${defaultLang}».`);
  return entry.data;
}

/** Hent seksjonsinnhold (tekst) for et språk, inkl. rendret markdown-brødtekst. */
export async function getSection(lang: Lang) {
  const entry = (await getEntry('sections', lang)) ?? (await getEntry('sections', defaultLang));
  if (!entry) throw new Error(`Mangler seksjonsinnhold for «${lang}» og «${defaultLang}».`);
  return entry;
}

/** Alle språk som faktisk har innhold – brukes til ruting og språkvelger. */
export async function getAvailableLangs(): Promise<Lang[]> {
  const entries = await getCollection('site');
  const present = new Set(entries.map((e) => e.id));
  return (Object.keys(languages) as Lang[]).filter((l) => present.has(l));
}
