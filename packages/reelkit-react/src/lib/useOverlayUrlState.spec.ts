import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  indexKey,
  indexCodec,
  type UrlAdapter,
  type UrlLocator,
} from '@reelkit/core';
import { useOverlayUrlState } from './useOverlayUrlState';

/**
 * In-memory history stand-in. `listeners` is exposed so a test can assert the
 * controller detaches on unmount.
 */
const createFakeAdapter = (initialSearch = '') => {
  let search = initialSearch;
  const listeners = new Set<() => void>();
  const adapter: UrlAdapter = {
    read: () => search,
    getState: () => null,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    push: (to) => {
      search = to;
      listeners.forEach((l) => l());
    },
    replace: (to) => {
      search = to;
    },
    goBack: () => undefined,
  };
  return { adapter, listeners };
};

describe('useOverlayUrlState', () => {
  it('opens at the index the parameter names, bounded by the index locator', () => {
    const { adapter } = createFakeAdapter('?photo=1');

    const { result } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter,
        ...indexKey(() => 3),
      }),
    );

    expect(result.current.index.value).toBe(1);
  });

  it('drops a parameter past the live count and heals the url', () => {
    const { adapter } = createFakeAdapter('?photo=99');

    const { result } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter,
        ...indexKey(() => 3),
      }),
    );

    expect(result.current.index.value).toBeNull();
    expect(adapter.read()).toBe('');
  });

  it('attaches on mount and detaches the adapter listener on unmount', () => {
    const { adapter, listeners } = createFakeAdapter('?photo=0');

    const { unmount } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter,
        ...indexKey(() => 1),
      }),
    );

    expect(listeners.size).toBe(1);

    unmount();

    expect(listeners.size).toBe(0);
  });

  it('passes the supplied locator through to the controller as-is', () => {
    const { adapter } = createFakeAdapter('?photo=1');
    // A locator that maps an id to a fixed slot proves the hook wraps nothing —
    // the controller resolves through exactly what was handed in.
    const locator: UrlLocator<number> = {
      locate: () => 2,
      identify: (index) => index,
    };

    const { result } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter,
        codec: indexCodec,
        locator,
      }),
    );

    expect(result.current.index.value).toBe(2);
  });
});
