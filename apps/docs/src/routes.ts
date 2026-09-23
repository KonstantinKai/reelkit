import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';
import { kDefaultLocale, kLocales, type Locale } from './i18n/locale';
import { kSitePages } from './content/manifest';
import { pageFile } from './content/sitePages';

/**
 * One route per page in the manifest, for one locale. Every translated tree
 * mirrors the English one under its own prefix, so this is the only place a
 * route is declared. Route ids default to the module path, which already
 * differs per locale; the not-found page is the one module every locale
 * shares, so it takes an explicit id.
 */
function localeRoutes(locale: Locale) {
  const routes = kSitePages.map((page) => {
    const file = pageFile(page, locale);
    // A shared module resolves to the same file in every locale, so the id it
    // would default to is already taken by the locale routed before it.
    if (page.shared) {
      const options = { id: `${locale}-${page.module}` };
      return page.path === ''
        ? index(file, options)
        : route(page.path, file, options);
    }
    return page.path === '' ? index(file) : route(page.path, file);
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
