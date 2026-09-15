import { detectLocale } from '../i18n/detectLocale';
import type { PageRoute } from './index';

/**
 * The answer to an English page request depends on these request headers, so
 * any cache in between has to key on them too.
 */
export const kLanguageVary = 'Accept-Language, Cookie';

/**
 * Sends a first-time reader of an English page to the locale their browser
 * prefers. Temporary and uncached: the English page stays the address search
 * engines index, and the next request is decided afresh. No cookie is set, so
 * a wrong guess is undone by one choice in the language switcher.
 */
export const languageRedirect: PageRoute = (request) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const url = new URL(request.url);
  const target = detectLocale({
    pathname: url.pathname,
    search: url.search,
    acceptLanguage: request.headers.get('accept-language'),
    cookie: request.headers.get('cookie'),
    userAgent: request.headers.get('user-agent'),
  });
  if (!target) return null;
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      Vary: kLanguageVary,
      'Cache-Control': 'private, no-store',
    },
  });
};

/**
 * The English page served as built, marked as varying by language so a cache
 * never hands it to a reader who should have been redirected.
 */
export function varyByLanguage(response: Response): Response {
  if (response.headers.get('Vary') === kLanguageVary) return response;
  const marked = new Response(response.body, response);
  const vary = marked.headers.get('Vary');
  marked.headers.set(
    'Vary',
    vary ? `${vary}, ${kLanguageVary}` : kLanguageVary,
  );
  return marked;
}
