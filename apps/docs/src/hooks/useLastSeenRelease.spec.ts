import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLastSeenRelease } from './useLastSeenRelease';

const _kStorageKey = 'rk-docs:whats-new:last-seen';

describe('useLastSeenRelease', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds lastSeen silently on first visit', () => {
    const { result } = renderHook(() => useLastSeenRelease('@pkg/a@1.0.0'));
    expect(result.current.lastSeen).toBe('@pkg/a@1.0.0');
    expect(localStorage.getItem(_kStorageKey)).toBe('@pkg/a@1.0.0');
  });

  it('returns the stored id when present', () => {
    localStorage.setItem(_kStorageKey, '@pkg/a@0.9.0');
    const { result } = renderHook(() => useLastSeenRelease('@pkg/a@1.0.0'));
    expect(result.current.lastSeen).toBe('@pkg/a@0.9.0');
    expect(localStorage.getItem(_kStorageKey)).toBe('@pkg/a@0.9.0');
  });

  it('markSeen persists the newest id and updates state', () => {
    localStorage.setItem(_kStorageKey, '@pkg/a@0.9.0');
    const { result } = renderHook(() => useLastSeenRelease('@pkg/a@1.0.0'));
    act(() => {
      result.current.markSeen();
    });
    expect(result.current.lastSeen).toBe('@pkg/a@1.0.0');
    expect(localStorage.getItem(_kStorageKey)).toBe('@pkg/a@1.0.0');
  });

  it('does not seed or persist when newestId is null', () => {
    const { result } = renderHook(() => useLastSeenRelease(null));
    expect(result.current.lastSeen).toBeNull();
    expect(localStorage.getItem(_kStorageKey)).toBeNull();
    act(() => {
      result.current.markSeen();
    });
    expect(localStorage.getItem(_kStorageKey)).toBeNull();
  });
});
