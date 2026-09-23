import type { Locale } from './locale';
import { en } from './home/en';
import { es } from './home/es';
import { hi } from './home/hi';
import { ja } from './home/ja';
import { pt } from './home/pt';
import { uk } from './home/uk';
import { zh } from './home/zh';

/**
 * The landing page, keyed by the section a reader sees rather than flatly,
 * so a translator has the surrounding context while working.
 *
 * Product names — ReelKit, React, Angular, Vue, and the package labels
 * beside each binding — are absent on purpose: they stay English in every
 * locale, so they live in the component instead.
 */
export interface HomeMessages {
  meta: { title: string; description: string };
  hero: {
    /** The tagline is one sentence with its middle clause emphasised. */
    taglineLead: string;
    taglineHighlight: string;
    taglineTail: string;
    subtitle: string;
    getStarted: string;
    demoCaption: string;
  };
  virtualization: {
    eyebrow: string;
    headingLead: string;
    headingHighlight: string;
    intro: string;
    /** The three numbered steps, in the order they are walked through. */
    steps: readonly { title: string; description: string }[];
    footnote: string;
  };
  features: {
    heading: string;
    subheading: string;
    /**
     * The three stat cards. `stat` is a numeral and stays as written; the
     * gzip figure inside the second `description` is rewritten by
     * `scripts/update-sizes.mjs`, so that key keeps its name.
     */
    highlights: readonly {
      stat: string;
      unit: string;
      title: string;
      description: string;
    }[];
    /** The compact row beneath the cards — label only, no prose. */
    more: readonly string[];
  };
  why: {
    heading: string;
    reelTerm: string;
    reelBody: string;
    kitTerm: string;
    kitBody: string;
  };
  api: { heading: string; subheading: string };
  packages: {
    heading: string;
    subheading: string;
    coreBadge: string;
    coreDescription: string;
    /** One line per binding, in the order the tree renders them. */
    bindings: { react: string; angular: string; vue: string };
  };
  cta: { heading: string; body: string; readDocs: string };
}

export const homeMessages: Record<Locale, HomeMessages> = {
  en,
  zh,
  uk,
  pt,
  ja,
  hi,
  es,
};
