/**
 * Every page the site serves, in sidebar order. Routes for every locale, the
 * sitemap and the prerender list are all derived from this list together
 * with the locale registry, so adding a page or a language touches no route
 * block and no sitemap entry by hand.
 *
 * This module imports nothing: the Vite config and the React Router config
 * read it before the app bundle exists.
 */

export type ChangeFrequency = 'weekly' | 'monthly';

export interface SitePage {
  /** Route path without a locale prefix or a leading slash; empty for home. */
  path: string;

  /**
   * Page module at `pages/<module>` in English and `pages/<locale>/<module>`
   * in every other locale. It is the page body wherever no content file has
   * replaced it yet; where one has, it stays mounted at `<path>-legacy` so
   * the two can be compared side by side until the move is finished.
   */
  module?: string;

  /** Content file at `content/<locale>/<content>.mdx`, English included. */
  content?: string;

  /**
   * Locales whose content file already exists, while a page is part way
   * through the move. Absent means every locale has one.
   */
  contentLocales?: readonly string[];

  /**
   * How the sitemap lists the page. A page without it is still routed, but
   * neither listed nor prerendered — the static host serves it through the
   * single-page fallback instead.
   */
  sitemap?: { changefreq: ChangeFrequency; priority: string };
}

const monthly = (priority: string) =>
  ({ changefreq: 'monthly', priority }) as const;

export const kSitePages: readonly SitePage[] = [
  {
    path: '',
    module: 'Home.tsx',
    sitemap: { changefreq: 'weekly', priority: '1.0' },
  },
  {
    path: 'docs/getting-started',
    module: 'docs/GettingStarted.tsx',
    sitemap: monthly('0.9'),
  },
  {
    path: 'docs/installation',
    module: 'docs/Installation.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/ssr',
    content: 'docs/ssr',
    contentLocales: ['en', 'uk'],
    module: 'docs/SSR.tsx',
    sitemap: monthly('0.6'),
  },
  {
    path: 'docs/core/guide',
    module: 'docs/core/Guide.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/core/api',
    module: 'docs/core/Api.tsx',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/stories-core',
    module: 'docs/StoriesCore.tsx',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/react/guide',
    module: 'docs/react/Guide.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/react/api',
    module: 'docs/react/Api.tsx',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/reel-player',
    module: 'docs/ReelPlayer.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/lightbox',
    module: 'docs/Lightbox.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/stories-player',
    module: 'docs/StoriesPlayer.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue/guide',
    module: 'docs/vue/Guide.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue/api',
    module: 'docs/vue/Api.tsx',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/vue-reel-player',
    module: 'docs/VueReelPlayer.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue-lightbox',
    module: 'docs/VueLightbox.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue-stories-player',
    module: 'docs/VueStoriesPlayer.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular/guide',
    module: 'docs/angular/Guide.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular/api',
    module: 'docs/angular/Api.tsx',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/angular-reel-player',
    module: 'docs/AngularReelPlayer.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular-lightbox',
    module: 'docs/AngularLightbox.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular-stories-player',
    module: 'docs/AngularStoriesPlayer.tsx',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/troubleshooting',
    module: 'docs/Troubleshooting.tsx',
    sitemap: monthly('0.5'),
  },
  {
    path: 'docs/llms',
    module: 'docs/Llms.tsx',
    sitemap: monthly('0.5'),
  },
  {
    path: 'docs/changelog',
    module: 'docs/Changelog.tsx',
    sitemap: { changefreq: 'weekly', priority: '0.6' },
  },
  { path: 'privacy', module: 'Privacy.tsx' },
  { path: 'terms', module: 'Terms.tsx' },
];
