import { beforeEach, describe, expect, it } from 'vitest';
import {
  readFrameworkFromUrl,
  stripFrameworkFromUrl,
  setFramework,
  frameworkSignal,
} from './frameworkSignal';

const pushUrl = (search: string) => {
  window.history.replaceState(null, '', `/docs/react/guide${search}`);
};

describe('readFrameworkFromUrl', () => {
  beforeEach(() => {
    pushUrl('');
    localStorage.clear();
  });

  it('returns the framework when a valid value is present', () => {
    pushUrl('?framework=vue');
    expect(readFrameworkFromUrl()).toBe('vue');
  });

  it('returns null when the param is missing', () => {
    expect(readFrameworkFromUrl()).toBeNull();
  });

  it('returns null for invalid values (V3)', () => {
    pushUrl('?framework=svelte');
    expect(readFrameworkFromUrl()).toBeNull();
  });

  it('returns null in a non-browser environment (V4)', () => {
    const realWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
    });
    try {
      expect(readFrameworkFromUrl()).toBeNull();
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: realWindow,
      });
    }
  });
});

describe('stripFrameworkFromUrl', () => {
  beforeEach(() => {
    pushUrl('');
  });

  it('removes the framework param via replaceState (V6)', () => {
    pushUrl('?framework=angular&other=keep');
    stripFrameworkFromUrl();
    expect(window.location.search).toBe('?other=keep');
  });

  it('is a no-op when the param is absent', () => {
    pushUrl('?other=keep');
    stripFrameworkFromUrl();
    expect(window.location.search).toBe('?other=keep');
  });
});

describe('framework precedence (V5)', () => {
  it('setFramework writes to the signal and localStorage', () => {
    localStorage.clear();
    setFramework('vue');
    expect(frameworkSignal.value).toBe('vue');
    expect(localStorage.getItem('reelkit-docs-framework')).toBe('vue');
  });
});
