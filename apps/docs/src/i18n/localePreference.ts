import { kLocales, type Locale } from './locale';

/**
 * The language a reader picked with the language switcher, remembered so the
 * edge never second-guesses it. Only an explicit choice writes it; a guess
 * from the browser's language never does.
 */
export const kLocalePreferenceCookie = 'rk-locale';

const _kOneYearSeconds = 60 * 60 * 24 * 365;

/** `document.cookie` assignment that remembers a chosen language for a year. */
export function localePreferenceCookie(locale: Locale): string {
  return `${kLocalePreferenceCookie}=${locale}; Path=/; Max-Age=${_kOneYearSeconds}; SameSite=Lax; Secure`;
}

/**
 * The remembered language in a `Cookie` header, or `null` when there is none
 * or it names a language the site does not serve.
 */
export function readLocalePreference(
  cookieHeader: string | null,
): Locale | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...value] = part.trim().split('=');
    if (name !== kLocalePreferenceCookie) continue;
    const locale = value.join('=').trim();
    return (kLocales as readonly string[]).includes(locale)
      ? (locale as Locale)
      : null;
  }
  return null;
}
