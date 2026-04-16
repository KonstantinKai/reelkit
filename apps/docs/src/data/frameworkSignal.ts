import { createSignal } from '@reelkit/core';

const _kStorageKey = 'reelkit-docs-framework';

export const kFrameworks = ['react', 'angular', 'vue'] as const;
export type Framework = (typeof kFrameworks)[number];

/** Route equivalents across frameworks: [react, angular, vue] */
export const frameworkRoutePairs: [string, string, string][] = [
  ['/docs/react/guide', '/docs/angular/guide', '/docs/vue/guide'],
  ['/docs/react/api', '/docs/angular/api', '/docs/vue/api'],
  ['/docs/reel-player', '/docs/angular-reel-player', '/docs/vue-reel-player'],
  ['/docs/lightbox', '/docs/angular-lightbox', '/docs/vue-lightbox'],
  [
    '/docs/stories-player',
    '/docs/angular-stories-player',
    '/docs/vue-stories-player',
  ],
];

function readStored(): Framework {
  if (typeof window === 'undefined') return 'react';
  const stored = localStorage.getItem(_kStorageKey);
  return kFrameworks.includes(stored as Framework)
    ? (stored as Framework)
    : 'react';
}

export const frameworkSignal = createSignal<Framework>(readStored());

export function setFramework(fw: Framework): void {
  frameworkSignal.value = fw;
  localStorage.setItem(_kStorageKey, fw);
}

export function renderFramework<T>(
  cases: Partial<Record<Framework, () => T>>,
): T | null {
  return cases[frameworkSignal.value]?.() ?? null;
}
