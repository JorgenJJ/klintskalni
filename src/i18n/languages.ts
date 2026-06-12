// =============================================================================
//  SENTRAL SPRÅKLISTE  (jf. rapportens kap. 2.4 og 7.3)
// =============================================================================
//  Dette er det ENESTE stedet i koden du må endre for å legge til et nytt språk.
//
//  Slik legger du til f.eks. tysk:
//    1. Legg til en linje under:  de: 'Deutsch',
//    2. Kopier src/content/site/en.json  ->  de.json   og oversett
//    3. Kopier src/content/sections/en.md -> de.md      og oversett
//    4. (Valgfritt) legg språket til i admin/config.yml for Sveltia CMS
//    5. Push. Ruting (/de/) og språkvelger kommer automatisk.
// =============================================================================

export const languages = {
  en: 'English',
  no: 'Norsk',
  lv: 'Latviešu',
} as const;

// Standardspråk for ukjente besøkende (rot-URL foreslår dette / nettleserspråk).
export const defaultLang = 'en';

export type Lang = keyof typeof languages;

export const locales = Object.keys(languages) as Lang[];

export function isLang(value: string): value is Lang {
  return value in languages;
}
