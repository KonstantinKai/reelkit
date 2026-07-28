import { createFakeUrlAdapter } from '@reelkit/core/testing';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { urlIndexKey, indexCodec, type UrlLocator } from '@reelkit/core';
import { useOverlayUrlState } from './useOverlayUrlState';

describe('useOverlayUrlState', () => {
  it('opens at the index the parameter names, bounded by the index locator', () => {
    const { adapter } = createFakeUrlAdapter('?photo=1');

    const { result } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter,
        ...urlIndexKey(() => 3),
      }),
    );

    expect(result.current.position.value).toBe(1);
  });

  it('drops a parameter past the live count and heals the url', () => {
    const { adapter } = createFakeUrlAdapter('?photo=99');

    const { result } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter,
        ...urlIndexKey(() => 3),
      }),
    );

    expect(result.current.position.value).toBeNull();
    expect(adapter.read()).toBe('');
  });

  it('attaches on mount and detaches the adapter listener on unmount', () => {
    const fake = createFakeUrlAdapter('?photo=0');

    const { unmount } = renderHook(() =>
      useOverlayUrlState({
        param: 'photo',
        adapter: fake.adapter,
        ...urlIndexKey(() => 1),
      }),
    );

    expect(fake.listenerCount).toBe(1);

    unmount();

    expect(fake.listenerCount).toBe(0);
  });

  it('passes the supplied locator through to the controller as-is', () => {
    const { adapter } = createFakeUrlAdapter('?photo=1');
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

    expect(result.current.position.value).toBe(2);
  });
});
