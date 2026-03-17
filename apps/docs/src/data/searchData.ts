export interface SearchItem {
  title: string;

  path: string;

  category: string;

  keywords: string[];
}

export const searchItems: SearchItem[] = [
  {
    title: 'Introduction',
    path: '/docs/getting-started',
    category: 'Overview',
    keywords: ['start', 'quick', 'setup', 'guide'],
  },
  {
    title: 'Installation',
    path: '/docs/installation',
    category: 'Overview',
    keywords: ['npm', 'yarn', 'pnpm', 'bundle', 'size', 'peer'],
  },
  {
    title: 'SSR',
    path: '/docs/ssr',
    category: 'Overview',
    keywords: ['ssr', 'server', 'rendering', 'nextjs', 'remix', 'hydration'],
  },
  {
    title: 'Core Guide',
    path: '/docs/core/guide',
    category: 'Core',
    keywords: [
      'controller',
      'signal',
      'gesture',
      'keyboard',
      'wheel',
      'create',
      'architecture',
      'virtualization',
    ],
  },
  {
    title: 'Core API Reference',
    path: '/docs/core/api',
    category: 'Core',
    keywords: ['config', 'callbacks', 'methods', 'state', 'range', 'extractor'],
  },
  {
    title: 'React Guide',
    path: '/docs/react/guide',
    category: 'React',
    keywords: [
      'reel',
      'component',
      'itemBuilder',
      'indicator',
      'demo',
      'basic',
      'infinite',
      'tutorial',
    ],
  },
  {
    title: 'React API Reference',
    path: '/docs/react/api',
    category: 'React',
    keywords: ['reel', 'props', 'hook', 'indicator', 'useRef', 'apiRef'],
  },
  {
    title: 'Reel Player',
    path: '/docs/reel-player',
    category: 'Components',
    keywords: [
      'video',
      'fullscreen',
      'overlay',
      'tiktok',
      'instagram',
      'reels',
      'player',
    ],
  },
  {
    title: 'Lightbox',
    path: '/docs/lightbox',
    category: 'Components',
    keywords: [
      'image',
      'gallery',
      'preview',
      'lightbox',
      'photo',
      'fullscreen',
      'video',
      'sound',
      'mute',
    ],
  },
];

export const navItems = [
  {
    title: 'Overview',
    items: [
      { label: 'Getting Started', path: '/docs/getting-started' },
      { label: 'Installation', path: '/docs/installation' },
      { label: 'SSR', path: '/docs/ssr' },
    ],
  },
  {
    title: 'Core',
    items: [
      { label: 'Guide', path: '/docs/core/guide' },
      { label: 'API Reference', path: '/docs/core/api' },
    ],
  },
  {
    title: 'React',
    items: [
      { label: 'Guide', path: '/docs/react/guide' },
      { label: 'API Reference', path: '/docs/react/api' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Reel Player', path: '/docs/reel-player' },
      { label: 'Lightbox', path: '/docs/lightbox' },
    ],
  },
] as const;
