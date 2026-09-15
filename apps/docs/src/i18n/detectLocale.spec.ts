import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  detectLocale,
  preferredLocale,
  type LocaleRequest,
} from './detectLocale';
import {
  kLocalePreferenceCookie,
  localePreferenceCookie,
  readLocalePreference,
} from './localePreference';
import { kDefaultLocale, kLocales, localePrefix } from './locale';

const browser =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';

const request = (overrides: Partial<LocaleRequest>): LocaleRequest => ({
  pathname: '/docs/ssr',
  search: '',
  acceptLanguage: null,
  cookie: null,
  userAgent: browser,
  ...overrides,
});

describe('preferred locale from Accept-Language', () => {
  it.each([
    ['uk', 'uk'],
    ['uk-UA,uk;q=0.9,en;q=0.8', 'uk'],
    ['zh-CN,zh;q=0.9', 'zh'],
    ['zh-Hant-TW', 'zh'],
    ['en-GB,uk;q=0.8', 'en'],
    ['de-DE,de;q=0.9,uk;q=0.5', 'uk'],
    ['de,fr;q=0.8', null],
    ['en;q=0.5,zh;q=0.9', 'zh'],
    ['uk;q=0,zh;q=0.4', 'zh'],
    ['*', null],
    ['*;q=1,uk;q=0.1', 'uk'],
    ['', null],
    [';;q=,,', null],
    ['uk;q=abc', null],
    ['uk;q=2', null],
  ])('reads %j as %j', (header, expected) => {
    expect(preferredLocale(header)).toBe(expected);
  });

  it('keeps the listed order between equal qualities', () => {
    expect(preferredLocale('zh;q=0.8,uk;q=0.8')).toBe('zh');
    expect(preferredLocale('uk;q=0.8,zh;q=0.8')).toBe('uk');
  });
});

describe('language redirect decision', () => {
  it('sends a browser that prefers another language to that locale', () => {
    expect(detectLocale(request({ acceptLanguage: 'uk-UA,uk;q=0.9' }))).toBe(
      '/uk/docs/ssr',
    );
    expect(
      detectLocale(request({ pathname: '/', acceptLanguage: 'zh-CN' })),
    ).toBe('/zh');
  });

  it('keeps the query string', () => {
    expect(
      detectLocale(
        request({ search: '?framework=vue', acceptLanguage: 'zh-CN' }),
      ),
    ).toBe('/zh/docs/ssr?framework=vue');
  });

  it('leaves a browser that prefers English, or nothing served, alone', () => {
    expect(detectLocale(request({ acceptLanguage: 'en-US,uk;q=0.8' }))).toBe(
      null,
    );
    expect(detectLocale(request({ acceptLanguage: 'de-DE' }))).toBe(null);
    expect(detectLocale(request({ acceptLanguage: null }))).toBe(null);
  });

  // The switcher writes the cookie on every choice, English included, and a
  // wrong guess must never outvote it.
  it('follows the language the reader picked over the browser', () => {
    expect(
      detectLocale(
        request({ acceptLanguage: 'uk', cookie: 'theme=dark; rk-locale=en' }),
      ),
    ).toBe(null);
    expect(
      detectLocale(request({ acceptLanguage: 'uk', cookie: 'rk-locale=zh' })),
    ).toBe(null);
  });

  it('ignores a remembered value the site does not serve', () => {
    expect(
      detectLocale(request({ acceptLanguage: 'uk', cookie: 'rk-locale=xx' })),
    ).toBe('/uk/docs/ssr');
  });

  it.each([
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'facebookexternalhit/1.1',
    'Slackbot-LinkExpanding 1.0',
    'curl/8.7.1',
    '',
  ])('never redirects an automated client: %j', (userAgent) => {
    expect(detectLocale(request({ acceptLanguage: 'uk', userAgent }))).toBe(
      null,
    );
  });

  // Prefixed pages are an explicit address for one language, and everything
  // outside the English page set is a file, a slash form or a missing page.
  it.each([
    '/uk/docs/ssr',
    '/zh',
    '/docs/ssr/',
    '/sitemap.xml',
    '/assets/app.js',
    '/docs/not-a-page',
  ])('never redirects %s', (pathname) => {
    expect(detectLocale(request({ pathname, acceptLanguage: 'uk' }))).toBe(
      null,
    );
  });

  it('redirects each translated locale to its own prefix', () => {
    for (const locale of kLocales) {
      if (locale === kDefaultLocale) continue;
      expect(
        detectLocale(request({ pathname: '/privacy', acceptLanguage: locale })),
      ).toBe(`${localePrefix(locale)}/privacy`);
    }
  });
});

describe('remembered language cookie', () => {
  it('round-trips every locale', () => {
    for (const locale of kLocales) {
      const assignment = localePreferenceCookie(locale);
      const pair = assignment.split(';')[0];
      expect(readLocalePreference(`a=1; ${pair}`)).toBe(locale);
    }
  });

  it('is scoped to the whole site for a year', () => {
    expect(localePreferenceCookie('uk')).toBe(
      `${kLocalePreferenceCookie}=uk; Path=/; Max-Age=31536000; SameSite=Lax; Secure`,
    );
  });
});

// The locale registry is the only list of languages. A hand-written language
// code in the edge code would miss the next locale added to the registry.
describe('edge code and the locale registry', () => {
  it('names no language code of its own', () => {
    const translated = kLocales.filter((locale) => locale !== kDefaultLocale);
    for (const file of [
      'detectLocale.ts',
      'localePreference.ts',
      '../worker/index.ts',
      '../worker/languageRedirect.ts',
    ]) {
      const source = readFileSync(join(import.meta.dirname, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      for (const locale of translated) {
        expect(source, `${file} names "${locale}"`).not.toMatch(
          new RegExp(`['"\`/]${locale}['"\`/-]`),
        );
      }
    }
  });
});
