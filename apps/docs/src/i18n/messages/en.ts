import type { Messages } from '../messages';

export const en: Messages = {
  header: {
    docs: 'Docs',
    search: 'Search',
    githubLabel: 'ReelKit on GitHub',
    themeLabel: 'Toggle theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    menuLabel: 'Toggle navigation',
    languageLabel: 'Change language',
  },
  nav: {
    sections: {
      overview: 'Overview',
      core: 'Core',
      react: 'React',
      angular: 'Angular',
      vue: 'Vue',
      components: 'Components',
      resources: 'Resources',
    },
    items: {
      gettingStarted: 'Getting Started',
      installation: 'Installation',
      ssr: 'SSR',
      guide: 'Guide',
      apiReference: 'API Reference',
      storiesCore: 'Stories Core',
      reelPlayer: 'Reel Player',
      lightbox: 'Lightbox',
      storiesPlayer: 'Stories Player',
      troubleshooting: 'Troubleshooting',
      llms: 'AI / LLM Integration',
      changelog: "What's New?",
    },
    comingSoon: 'Soon',
  },
  footer: {
    tagline:
      'Headless, virtualized, zero-dependency slider engine. Build TikTok/Reels-style feeds with 60fps gestures and only 3 DOM nodes.',
    documentation: 'Documentation',
    gettingStarted: 'Getting Started',
    installation: 'Installation',
    examples: 'Examples',
    community: 'Community',
    rights: (year) => `© ${year} ReelKit. All rights reserved.`,
    privacy: 'Privacy',
    terms: 'Terms',
  },
  search: {
    placeholder: 'Search documentation...',
    empty: (query) => `No results found for “${query}”`,
    pagesGroup: (category) => `Pages · ${category}`,
    sectionsGroup: (page) => `${page} · Sections`,
    navigate: 'navigate',
    open: 'open',
    close: 'close',
  },
  whatsNew: {
    title: 'What’s new',
    since: (count) =>
      count === 1
        ? '1 new release since your last visit'
        : `${count} new releases since your last visit`,
    more: (count) => `+${count} more ${count === 1 ? 'release' : 'releases'}`,
    dismiss: 'Dismiss',
    viewFull: 'View full changelog',
    close: 'Close',
    closeOverlay: "Close what's new dialog",
  },
  nextSteps: {
    title: 'Next Steps',
  },
  notFound: {
    title: 'Page not found',
    description: "The page you're looking for doesn't exist or has been moved.",
    home: 'Home',
    docs: 'Docs',
  },
};
