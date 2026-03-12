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
    category: 'Getting Started',
    keywords: ['start', 'quick', 'setup', 'guide'],
  },
  {
    title: 'Installation',
    path: '/docs/installation',
    category: 'Getting Started',
    keywords: ['npm', 'yarn', 'pnpm', 'bundle', 'size', 'peer'],
  },
  {
    title: 'SSR',
    path: '/docs/ssr',
    category: 'Getting Started',
    keywords: ['ssr', 'server', 'rendering', 'nextjs', 'remix', 'hydration'],
  },
  {
    title: 'Core',
    path: '/docs/api/core',
    category: 'API Reference',
    keywords: [
      'controller',
      'signal',
      'gesture',
      'keyboard',
      'wheel',
      'create',
    ],
  },
  {
    title: 'React',
    path: '/docs/api/react',
    category: 'API Reference',
    keywords: ['reel', 'component', 'hook', 'indicator', 'useRef'],
  },
  {
    title: 'React Reel Player',
    path: '/docs/api/react-reel-player',
    category: 'API Reference',
    keywords: ['video', 'fullscreen', 'overlay', 'tiktok', 'instagram'],
  },
  {
    title: 'React Lightbox',
    path: '/docs/api/react-lightbox',
    category: 'API Reference',
    keywords: ['image', 'gallery', 'preview', 'lightbox', 'photo'],
  },
  {
    title: 'Basic Slider',
    path: '/docs/examples/basic',
    category: 'Examples',
    keywords: ['simple', 'demo', 'vertical', 'horizontal'],
  },
  {
    title: 'Infinite List',
    path: '/docs/examples/infinite',
    category: 'Examples',
    keywords: ['10000', 'virtualization', 'performance', 'large'],
  },
  {
    title: 'Reel Player',
    path: '/docs/examples/reel-player',
    category: 'Examples',
    keywords: ['video', 'instagram', 'tiktok', 'stories', 'feed'],
  },
  {
    title: 'Lightbox',
    path: '/docs/examples/lightbox',
    category: 'Examples',
    keywords: ['image', 'gallery', 'photo', 'zoom'],
  },
];

export const navItems = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', path: '/docs/getting-started' },
      { label: 'Installation', path: '/docs/installation' },
      { label: 'SSR', path: '/docs/ssr' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'Core', path: '/docs/api/core' },
      { label: 'React', path: '/docs/api/react' },
      { label: 'React Reel Player', path: '/docs/api/react-reel-player' },
      { label: 'React Lightbox', path: '/docs/api/react-lightbox' },
      { label: 'Vue', path: '/docs/api/vue', comingSoon: true },
    ],
  },
  {
    title: 'Examples',
    items: [
      { label: 'Basic Slider', path: '/docs/examples/basic' },
      { label: 'Infinite List', path: '/docs/examples/infinite' },
      { label: 'Reel Player', path: '/docs/examples/reel-player' },
      { label: 'Lightbox', path: '/docs/examples/lightbox' },
    ],
  },
] as const;
