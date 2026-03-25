import { describe, it, expect, vi, afterEach } from 'vitest';
import { prefersReducedMotion } from './reducedMotion';

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when user prefers reduced motion', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    });

    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when user does not prefer reduced motion', () => {
    vi.stubGlobal('window', {
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    });

    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns false when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);

    expect(prefersReducedMotion()).toBe(false);
  });
});
