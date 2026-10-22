import type { Framework } from './frameworkSignal';

/*
 * Measured package sizes shown on the installation page. They live here
 * rather than in the page so every locale shows the same numbers and
 * `scripts/update-sizes.mjs` has a single place to rewrite them.
 */

export interface BundleSize {
  name: string;
  js: string;
  gzip: string;
  css: string;
  cssGzip: string;
  framework?: Framework;
}

export const kBundleSizes: BundleSize[] = [
  {
    name: '@reelkit/core',
    js: '29.8 kB',
    gzip: '11.2 kB',
    css: '-',
    cssGzip: '-',
  },
  {
    name: '@reelkit/react',
    js: '13.8 kB',
    gzip: '4.9 kB',
    css: '-',
    cssGzip: '-',
    framework: 'react',
  },
  {
    name: '@reelkit/react-reel-player',
    js: '17.1 kB',
    gzip: '5.4 kB',
    css: '9.7 kB',
    cssGzip: '2.1 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/react-lightbox',
    js: '12.7 kB',
    gzip: '4.1 kB',
    css: '7.9 kB',
    cssGzip: '1.6 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/react-stories-player',
    js: '25.3 kB',
    gzip: '7.5 kB',
    css: '9.9 kB',
    cssGzip: '2.1 kB',
    framework: 'react',
  },
  {
    name: '@reelkit/angular',
    js: '70.2 kB',
    gzip: '15.8 kB',
    css: '-',
    cssGzip: '-',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-reel-player',
    js: '148.1 kB',
    gzip: '24.4 kB',
    css: '15.0 kB',
    cssGzip: '3.5 kB',
    framework: 'angular',
  },
  {
    name: '@reelkit/angular-lightbox',
    js: '113.6 kB',
    gzip: '19.1 kB',
    css: '10.2 kB',
    cssGzip: '2.2 kB',
    framework: 'angular',
  },
  {
    name: '@reelkit/vue',
    js: '15.3 kB',
    gzip: '5.2 kB',
    css: '-',
    cssGzip: '-',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-reel-player',
    js: '21.0 kB',
    gzip: '6.2 kB',
    css: '9.7 kB',
    cssGzip: '2.1 kB',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-lightbox',
    js: '18.2 kB',
    gzip: '4.9 kB',
    css: '7.0 kB',
    cssGzip: '1.4 kB',
    framework: 'vue',
  },
  {
    name: '@reelkit/vue-stories-player',
    js: '25.4 kB',
    gzip: '7.9 kB',
    css: '9.9 kB',
    cssGzip: '2.1 kB',
    framework: 'vue',
  },
];

export interface LibraryWeight {
  name: string;
  gzip: string;
  virtualization: boolean | 'plugin';
}

/** ReelKit against other carousel libraries, in the order the page lists them. */
export const kLibraryComparison: LibraryWeight[] = [
  {
    name: 'ReelKit (core + react)',
    gzip: '16.1 kB',
    virtualization: true,
  },
  {
    name: 'ReelKit (core + angular)',
    gzip: '27.0 kB',
    virtualization: true,
  },
  {
    name: 'ReelKit (core + vue)',
    gzip: '16.4 kB',
    virtualization: true,
  },
  {
    name: 'Swiper',
    gzip: '~25 kB',
    virtualization: 'plugin',
  },
  {
    name: 'Embla Carousel',
    gzip: '~7 kB',
    virtualization: false,
  },
  {
    name: 'keen-slider',
    gzip: '~6 kB',
    virtualization: false,
  },
];
