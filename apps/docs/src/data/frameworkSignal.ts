import { createSignal } from '@reelkit/core';

export type Framework = 'react' | 'angular';

const _kStorageKey = 'reelkit-docs-framework';

/** Bi-directional route pairs: [react path, angular path] */
export const frameworkRoutePairs: [string, string][] = [
  ['/docs/react/guide', '/docs/angular/guide'],
  ['/docs/react/api', '/docs/angular/api'],
  ['/docs/reel-player', '/docs/angular-reel-player'],
  ['/docs/lightbox', '/docs/angular-lightbox'],
  ['/docs/stories-player', '/docs/angular-stories-player'],
];

function readStored(): Framework {
  if (typeof window === 'undefined') return 'react';
  const stored = localStorage.getItem(_kStorageKey);
  return stored === 'angular' ? 'angular' : 'react';
}

export const frameworkSignal = createSignal<Framework>(readStored());

export function setFramework(fw: Framework): void {
  frameworkSignal.value = fw;
  localStorage.setItem(_kStorageKey, fw);
}
