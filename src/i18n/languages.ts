// =============================================================================
//  SENTRAL SPRÅKLISTE  (jf. rapportens kap. 2.4 og 7.3)
// =============================================================================
//  Dette er det ENESTE stedet i koden du må endre for å legge til et nytt språk.
//
//  Slik legger du til f.eks. tysk:
//    1. Legg til en linje under:  de: 'Deutsch',
//    2. Kopier src/content/sections/en.md -> de.md      og oversett
//    3. Legg til 'de' i `locales` i public/admin/config.yml (Sveltia CMS)
//    4. Push. Ruting (/de/) og språkvelger kommer automatisk.
// =============================================================================

export const languages = {
  en: 'English',
  lv: 'Latviešu',
  no: 'Norsk',
} as const;

// Standardspråk for ukjente besøkende (rot-URL foreslår dette / nettleserspråk).
export const defaultLang = 'en';

export type Lang = keyof typeof languages;

export const locales = Object.keys(languages) as Lang[];

export function isLang(value: string): value is Lang {
  return value in languages;
}
