// The npm packages reelkit actually publishes.
//
// The legal pages named every package by hand, and both went stale the moment
// the workspace grew past React — /privacy and /terms each described a
// four-package library long after twelve were on npm. One list, rendered in
// both places, is what keeps the next package from repeating that.
//
// publishedPackages.spec.ts holds this list against the workspace itself, so a
// thirteenth package fails a test instead of quietly going undocumented.

export interface PublishedPackage {
  /** Full npm name, as a consumer would install it. */
  name: string;
  /** One line, plain enough for a reader who has never used the library. */
  description: string;
}

export const publishedPackages: PublishedPackage[] = [
  {
    name: '@reelkit/core',
    description: 'Framework-agnostic slider engine',
  },
  {
    name: '@reelkit/stories-core',
    description: 'Framework-agnostic stories state machine and timer',
  },
  {
    name: '@reelkit/react',
    description: 'React bindings',
  },
  {
    name: '@reelkit/react-lightbox',
    description: 'Image and video gallery lightbox for React',
  },
  {
    name: '@reelkit/react-reel-player',
    description: 'Vertical-swipe video reel player for React',
  },
  {
    name: '@reelkit/react-stories-player',
    description: 'Stories player overlay for React',
  },
  {
    name: '@reelkit/vue',
    description: 'Vue 3 bindings',
  },
  {
    name: '@reelkit/vue-lightbox',
    description: 'Image and video gallery lightbox for Vue 3',
  },
  {
    name: '@reelkit/vue-reel-player',
    description: 'Vertical-swipe video reel player for Vue 3',
  },
  {
    name: '@reelkit/angular',
    description: 'Angular bindings',
  },
  {
    name: '@reelkit/angular-lightbox',
    description: 'Image and video gallery lightbox for Angular',
  },
  {
    name: '@reelkit/angular-reel-player',
    description: 'Vertical-swipe video reel player for Angular',
  },
];
