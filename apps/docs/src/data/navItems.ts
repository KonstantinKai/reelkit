import type { Framework } from './frameworkSignal';
import type { Messages } from '../i18n/messages';

// The sidebar is on every docs page, so its navigation lives apart from the
// search index, which only the command palette needs and loads when opened.

export type NavSectionKey = keyof Messages['nav']['sections'];
export type NavItemKey = keyof Messages['nav']['items'];

export interface NavItem {
  /** Looked up in the locale dictionary to produce the visible label. */
  key: NavItemKey;
  path: string;
  framework?: Framework;
  comingSoon?: boolean;
}

export interface NavSection {
  /** Looked up in the locale dictionary to produce the visible heading. */
  key: NavSectionKey;
  items: NavItem[];
  framework?: Framework;
}

export const navItems: NavSection[] = [
  {
    key: 'overview',
    items: [
      { key: 'gettingStarted', path: '/docs/getting-started' },
      { key: 'installation', path: '/docs/installation' },
      { key: 'ssr', path: '/docs/ssr' },
    ],
  },
  {
    key: 'core',
    items: [
      { key: 'guide', path: '/docs/core/guide' },
      { key: 'apiReference', path: '/docs/core/api' },
      { key: 'storiesCore', path: '/docs/stories-core' },
    ],
  },
  {
    key: 'react',
    framework: 'react',
    items: [
      { key: 'guide', path: '/docs/react/guide' },
      { key: 'apiReference', path: '/docs/react/api' },
    ],
  },
  {
    key: 'angular',
    framework: 'angular',
    items: [
      { key: 'guide', path: '/docs/angular/guide' },
      { key: 'apiReference', path: '/docs/angular/api' },
    ],
  },
  {
    key: 'vue',
    framework: 'vue',
    items: [
      { key: 'guide', path: '/docs/vue/guide' },
      { key: 'apiReference', path: '/docs/vue/api' },
    ],
  },
  {
    key: 'components',
    items: [
      {
        key: 'reelPlayer',
        path: '/docs/reel-player',
        framework: 'react',
      },
      { key: 'lightbox', path: '/docs/lightbox', framework: 'react' },
      {
        key: 'reelPlayer',
        path: '/docs/angular-reel-player',
        framework: 'angular',
      },
      {
        key: 'lightbox',
        path: '/docs/angular-lightbox',
        framework: 'angular',
      },
      {
        key: 'storiesPlayer',
        path: '/docs/stories-player',
        framework: 'react',
      },
      {
        key: 'storiesPlayer',
        path: '/docs/angular-stories-player',
        framework: 'angular',
        comingSoon: true,
      },
      {
        key: 'reelPlayer',
        path: '/docs/vue-reel-player',
        framework: 'vue',
      },
      {
        key: 'lightbox',
        path: '/docs/vue-lightbox',
        framework: 'vue',
      },
      {
        key: 'storiesPlayer',
        path: '/docs/vue-stories-player',
        framework: 'vue',
        comingSoon: true,
      },
    ],
  },
  {
    key: 'resources',
    items: [
      { key: 'troubleshooting', path: '/docs/troubleshooting' },
      { key: 'llms', path: '/docs/llms' },
      { key: 'changelog', path: '/docs/changelog' },
    ],
  },
];
