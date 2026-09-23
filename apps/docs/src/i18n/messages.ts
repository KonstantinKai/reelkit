import type { Locale } from './locale';
import { en } from './messages/en';
import { es } from './messages/es';
import { hi } from './messages/hi';
import { ja } from './messages/ja';
import { pt } from './messages/pt';
import { uk } from './messages/uk';
import { zh } from './messages/zh';

/**
 * Every user-facing string rendered by the shared chrome — header, sidebar,
 * footer, command palette, dialogs and the not-found page — plus the landing
 * page, whose copy is short labels inside a fixed layout rather than prose.
 *
 * Long-form docs prose is still not routed through here; each locale gets its
 * own page file so translators edit readable markup instead of key soup. The
 * landing page was the exception that proved costly: it was copied per locale
 * and the copies fell behind, losing a whole demo section in every language
 * but English before anyone noticed.
 */
export interface Messages {
  header: {
    docs: string;
    search: string;
    githubLabel: string;
    themeLabel: string;
    /** Names of the three theme choices, used in the control's label. */
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    menuLabel: string;
    languageLabel: string;
  };
  nav: {
    sections: {
      overview: string;
      core: string;
      react: string;
      angular: string;
      vue: string;
      components: string;
      resources: string;
    };
    items: {
      gettingStarted: string;
      installation: string;
      ssr: string;
      guide: string;
      apiReference: string;
      storiesCore: string;
      reelPlayer: string;
      lightbox: string;
      storiesPlayer: string;
      troubleshooting: string;
      llms: string;
      changelog: string;
    };
    comingSoon: string;
  };
  footer: {
    tagline: string;
    documentation: string;
    gettingStarted: string;
    installation: string;
    examples: string;
    community: string;
    rights: (year: number) => string;
    privacy: string;
    terms: string;
  };
  search: {
    placeholder: string;
    empty: (query: string) => string;
    pagesGroup: (category: string) => string;
    sectionsGroup: (page: string) => string;
    navigate: string;
    open: string;
    close: string;
  };
  whatsNew: {
    title: string;
    since: (count: number) => string;
    more: (count: number) => string;
    dismiss: string;
    viewFull: string;
    close: string;
    closeOverlay: string;
  };
  nextSteps: {
    title: string;
  };
  notFound: {
    title: string;
    description: string;
    home: string;
    docs: string;
  };
}

export const messages: Record<Locale, Messages> = {
  en,
  zh,
  uk,
  pt,
  ja,
  hi,
  es,
};
