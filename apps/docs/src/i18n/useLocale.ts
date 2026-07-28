import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { readLocaleFromPath, withLocale, type Locale } from './locale';
import { messages, type Messages } from './messages';

/** Active locale, derived from the URL — there is no other source. */
export function useLocale(): Locale {
  return readLocaleFromPath(useLocation().pathname);
}

/** Chrome strings for the active locale. */
export function useMessages(): Messages {
  return messages[useLocale()];
}

/**
 * Rewrites an unprefixed path so it stays inside the active locale. Chrome
 * components keep writing the English path they already used; this keeps a
 * Chinese reader from being dropped back onto the English tree.
 */
export function useLocalePath(): (pathname: string) => string {
  const locale = useLocale();
  return useCallback(
    (pathname: string) => withLocale(locale, pathname),
    [locale],
  );
}
