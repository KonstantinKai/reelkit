import { createSignal } from '@reelkit/core';

const _kStorageKey = 'rk-docs:framework';
const _kLegacyStorageKey = 'reelkit-docs-framework';

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

const _kUrlParam = 'framework';

function readStored(): Framework {
  if (typeof window === 'undefined') return 'react';
  try {
    let stored = window.localStorage.getItem(_kStorageKey);
    if (stored === null) {
      const legacy = window.localStorage.getItem(_kLegacyStorageKey);
      if (legacy !== null) {
        window.localStorage.setItem(_kStorageKey, legacy);
        window.localStorage.removeItem(_kLegacyStorageKey);
        stored = legacy;
      }
    }
    return kFrameworks.includes(stored as Framework)
      ? (stored as Framework)
      : 'react';
  } catch {
    // opaque-origin docs pages + sandboxed iframes throw here
    return 'react';
  }
}

/**
 * Read `?framework=<fw>` from the current URL. Returns `null` when no param,
 * invalid value, or non-browser environment (SSR-safe).
 */
export function readFrameworkFromUrl(): Framework | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get(_kUrlParam);
  return kFrameworks.includes(raw as Framework) ? (raw as Framework) : null;
}

/**
 * Module evaluation runs both during SSR (default = 'react') and on the
 * client. To avoid hydration mismatches when the user has a different
 * framework persisted, we always initialise to the SSR-default and then
 * sync from storage / URL on the client via {@link syncFrameworkFromClient}
 * (called from `Layout` once mounted).
 */
function initialFramework(): Framework {
  return 'react';
}

export const frameworkSignal = createSignal<Framework>(initialFramework());

/**
 * Sync the signal with storage + URL after the first client render. Called
 * from `Layout`'s `useEffect`. Skips if URL/storage matches the current
 * value (most users) so we avoid a redundant set + listener fanout.
 */
export function syncFrameworkFromClient(): void {
  if (typeof window === 'undefined') return;
  const fw = readFrameworkFromUrl() ?? readStored();
  if (fw !== frameworkSignal.value) {
    frameworkSignal.value = fw;
  }
}

export function setFramework(fw: Framework): void {
  frameworkSignal.value = fw;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(_kStorageKey, fw);
  } catch {
    // opaque-origin docs pages + sandboxed iframes throw here
  }
}

/**
 * Remove `?framework=` from the current URL via `history.replaceState`.
 * Safe no-op in non-browser environments.
 */
export function stripFrameworkFromUrl(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(_kUrlParam)) return;
  url.searchParams.delete(_kUrlParam);
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function renderFramework<T>(
  cases: Partial<Record<Framework, () => T>>,
  framework?: Framework,
): T | null {
  const fw = framework ?? frameworkSignal.value;
  return cases[fw]?.() ?? null;
}
