import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';
import { kDefaultLocale, kLocales, type Locale } from './i18n/locale';
import { kSitePages } from './content/manifest';
import { pageFiles } from './content/sitePages';

/**
 * One route per page in the manifest, for one locale. Every translated tree
 * mirrors the English one under its own prefix, so this is the only place a
 * route is declared. Route ids default to the module path, which already
 * differs per locale; the not-found page is the one module every locale
 * shares, so it takes an explicit id.
 */
function localeRoutes(locale: Locale) {
  const routes = kSitePages.flatMap((page) => {
    const files = pageFiles(page, locale);
    const main =
      page.path === '' ? index(files.main) : route(page.path, files.main);
    return files.legacy
      ? [main, route(`${page.path}-legacy`, files.legacy)]
      : [main];
  });
  return locale === kDefaultLocale
    ? routes
    : [
        ...routes,
        route('*', 'pages/NotFound.tsx', { id: `${locale}-not-found` }),
      ];
}

export default [
  layout('components/layout/Layout.tsx', [
    ...localeRoutes(kDefaultLocale),
    ...kLocales
      .filter((locale) => locale !== kDefaultLocale)
      .flatMap((locale) => prefix(locale, localeRoutes(locale))),
    route('*', 'pages/NotFound.tsx'),
  ]),
] satisfies RouteConfig;
