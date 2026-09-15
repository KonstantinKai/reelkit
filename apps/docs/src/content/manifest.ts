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
   * Docs page authored as a content file, at `content/<locale>/<content>.mdx`
   * in every locale, English included.
   */
  content?: string;

  /**
   * Page with its own layout, at `pages/<module>` in English and
   * `pages/<locale>/<module>` in every other locale. Set for the pages that
   * are not docs prose: the home page, the legal pages and the changelog.
   */
  module?: string;

  /**
   * How the sitemap lists the page. A page without it is still routed and
   * prerendered, it is only left out of the sitemap.
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
    content: 'docs/getting-started',
    sitemap: monthly('0.9'),
  },
  {
    path: 'docs/installation',
    content: 'docs/installation',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/ssr',
    content: 'docs/ssr',
    sitemap: monthly('0.6'),
  },
  {
    path: 'docs/core/guide',
    content: 'docs/core/guide',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/core/api',
    content: 'docs/core/api',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/stories-core',
    content: 'docs/stories-core',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/react/guide',
    content: 'docs/react/guide',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/react/api',
    content: 'docs/react/api',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/reel-player',
    content: 'docs/reel-player',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/lightbox',
    content: 'docs/lightbox',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/stories-player',
    content: 'docs/stories-player',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue/guide',
    content: 'docs/vue/guide',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue/api',
    content: 'docs/vue/api',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/vue-reel-player',
    content: 'docs/vue-reel-player',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue-lightbox',
    content: 'docs/vue-lightbox',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/vue-stories-player',
    content: 'docs/vue-stories-player',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular/guide',
    content: 'docs/angular/guide',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular/api',
    content: 'docs/angular/api',
    sitemap: monthly('0.7'),
  },
  {
    path: 'docs/angular-reel-player',
    content: 'docs/angular-reel-player',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular-lightbox',
    content: 'docs/angular-lightbox',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/angular-stories-player',
    content: 'docs/angular-stories-player',
    sitemap: monthly('0.8'),
  },
  {
    path: 'docs/troubleshooting',
    content: 'docs/troubleshooting',
    sitemap: monthly('0.5'),
  },
  {
    path: 'docs/llms',
    content: 'docs/llms',
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
