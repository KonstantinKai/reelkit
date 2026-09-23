import type { HomeMessages } from '../home';

export const en: HomeMessages = {
  meta: {
    title: 'ReelKit — Headless Virtualized Slider Engine for React',
    description:
      'Zero-dependency virtualized slider engine. Build TikTok/Reels-style vertical feeds with 60fps gestures and only three slides in the DOM.',
  },
  hero: {
    taglineLead: 'Single-item slider for',
    taglineHighlight: 'TikTok/Instagram Reels-style',
    taglineTail: 'experiences',
    subtitle:
      'Framework-agnostic, virtualized, touch-first. Built for vertical video feeds, story viewers, and fullscreen galleries.',
    getStarted: 'Get Started',
    demoCaption: 'Live demo — use the arrows',
  },
  virtualization: {
    eyebrow: 'How it works',
    headingLead: 'A whole feed.',
    headingHighlight: 'Just three slides.',
    intro:
      'Your feed can hold thousands of items. Reel keeps only the current slide and its immediate neighbors mounted.',
    steps: [
      {
        title: 'Keep the next swipe ready',
        description:
          'The current slide fills the viewport. One neighbor waits above, another below.',
      },
      {
        title: 'Move through the feed',
        description:
          'Swipe up for the next item, or down for the previous one. The mounted slides move together.',
      },
      {
        title: 'Update only what changed',
        description:
          'Once the slide settles, the item that left the range is removed and the new neighbor is mounted. Shared items stay in place.',
      },
    ],
    footnote:
      'At either end of a non-looping feed, only two slides are needed. Watch the mounted count change as the demo reaches the edges.',
  },
  features: {
    heading: 'Built for performance',
    subheading: 'Virtualized rendering, zero dependencies, 60fps transitions',
    highlights: [
      {
        stat: '3',
        unit: 'in DOM',
        title: 'Virtualized',
        description:
          'Handle 10,000+ items. Only 3 slides rendered at any time.',
      },
      {
        stat: '0',
        unit: 'deps',
        title: 'Zero Dependencies',
        description: 'No runtime dependencies. Core is ~10.1 kB gzipped.',
      },
      {
        stat: '60',
        unit: 'fps',
        title: 'Touch First',
        description: 'Native swipe gestures with momentum and snap points.',
      },
    ],
    more: [
      'Performant',
      'Keyboard Navigation',
      'Framework Agnostic',
      'TypeScript First',
      'Headless + Styled',
      'Ready-made Components',
      'Shareable URL State',
    ],
  },
  why: {
    heading: 'Why "ReelKit"?',
    reelTerm: 'Reel',
    reelBody:
      '— vertical video feeds like Instagram Reels and TikTok. One piece of content at a time, swipe to advance.',
    kitTerm: 'Kit',
    kitBody:
      '— a modular set of packages. Use the headless core for full control, framework bindings for quick setup, or ready-made overlays for video players and image galleries.',
  },
  api: {
    heading: 'Simple API',
    subheading: 'Get started with just a few lines of code',
  },
  packages: {
    heading: 'Available Packages',
    subheading: 'A modular ecosystem — pick what you need',
    coreBadge: 'Core',
    coreDescription:
      'Framework-agnostic slider engine — virtualization, gestures, keyboard, wheel, signals. Zero dependencies.',
    bindings: {
      react: 'Components, hooks, and signal bridges',
      angular: 'Standalone components with signal-based reactivity',
      vue: 'Components and composables for Vue 3',
    },
  },
  cta: {
    heading: 'Ready to get started?',
    body: 'Check out the documentation and examples to build your first slider.',
    readDocs: 'Read the Docs',
  },
};
