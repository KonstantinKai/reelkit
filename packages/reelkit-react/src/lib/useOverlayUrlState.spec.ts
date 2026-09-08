import { createFakeUrlAdapter } from '@reelkit/core/testing';
import { renderHook, act } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
  urlIndexKey,
  urlStableIdKey,
  indexCodec,
  type UrlCodec,
  type UrlLocator,
} from '@reelkit/core';
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

describe('useOverlayUrlState across rerenders', () => {
  const flush = () => new Promise((done) => setTimeout(done, 0));

  it('bounds a lookup by the count of the latest render, not the first', () => {
    const fake = createFakeUrlAdapter('', { notifyOnPush: false });
    const { result, rerender } = renderHook(
      ({ count }: { count: number }) =>
        useOverlayUrlState({
          param: 'photo',
          adapter: fake.adapter,
          ...urlIndexKey(() => count),
        }),
      { initialProps: { count: 1 } },
    );
    const first = result.current;

    rerender({ count: 3 });

    // A link opened after the gallery grew must resolve against the new size.
    act(() => {
      fake.adapter.push('?photo=2');
      fake.fireUrlChange({ kind: 'push' });
    });

    expect(result.current).toBe(first);
    expect(result.current.position.value).toBe(2);
    expect(fake.listenerCount).toBe(1);
  });

  it('locates and identifies through the latest items after a reorder and a removal', () => {
    const fake = createFakeUrlAdapter('', { notifyOnPush: false });
    const { result, rerender } = renderHook(
      ({ items }: { items: Array<{ id: string }> }) =>
        useOverlayUrlState({
          param: 'photo',
          adapter: fake.adapter,
          ...urlStableIdKey({ items: () => items }),
        }),
      {
        initialProps: {
          items: [{ id: 'alpha' }, { id: 'bravo' }, { id: 'charlie' }],
        },
      },
    );

    rerender({ items: [{ id: 'charlie' }, { id: 'alpha' }] });

    act(() => {
      fake.adapter.push('?photo=charlie');
      fake.fireUrlChange({ kind: 'push' });
    });
    expect(result.current.position.value).toBe(0);

    act(() => result.current.set(1));
    expect(fake.adapter.read()).toBe('?photo=alpha');

    act(() => result.current.set(null));
    act(() => {
      fake.adapter.push('?photo=bravo');
      fake.fireUrlChange({ kind: 'push' });
    });
    expect(result.current.position.value).toBeNull();
  });

  it('encodes through the codec of the latest render', () => {
    const fake = createFakeUrlAdapter('', { notifyOnPush: false });
    const upper: UrlCodec<string> = {
      decode: (raw) => raw.toLowerCase(),
      encode: (id) => id.toUpperCase(),
    };
    const plain: UrlCodec<string> = {
      decode: (raw) => raw,
      encode: (id) => id,
    };
    const locator: UrlLocator<string> = {
      locate: (id) => (id === 'alpha' ? 0 : null),
      identify: () => 'alpha',
    };
    const { result, rerender } = renderHook(
      ({ codec }: { codec: UrlCodec<string> }) =>
        useOverlayUrlState({
          param: 'photo',
          adapter: fake.adapter,
          codec,
          locator,
        }),
      { initialProps: { codec: plain } },
    );

    rerender({ codec: upper });

    act(() => result.current.set(0));
    expect(fake.adapter.read()).toBe('?photo=ALPHA');
  });

  it('uses an asynchronous fallback added after the first render, and stops once it is removed', async () => {
    const fake = createFakeUrlAdapter('', { notifyOnPush: false });
    const locateAsync = vi.fn(async () => 4);
    const { result, rerender } = renderHook(
      ({ paged }: { paged: boolean }) =>
        useOverlayUrlState({
          param: 'photo',
          adapter: fake.adapter,
          ...urlIndexKey(() => 2, paged ? locateAsync : undefined),
        }),
      { initialProps: { paged: false } },
    );

    act(() => {
      fake.adapter.push('?photo=4');
      fake.fireUrlChange({ kind: 'push' });
    });
    expect(fake.adapter.read()).toBe('');
    expect(locateAsync).not.toHaveBeenCalled();

    rerender({ paged: true });

    act(() => {
      fake.adapter.push('?photo=4');
      fake.fireUrlChange({ kind: 'push' });
    });
    await act(flush);
    expect(locateAsync).toHaveBeenCalledTimes(1);
    // Bounded by the count of the latest render, the answer still heals out.
    expect(result.current.position.value).toBeNull();

    rerender({ paged: false });

    act(() => {
      fake.adapter.push('?photo=4');
      fake.fireUrlChange({ kind: 'push' });
    });
    await act(flush);
    expect(locateAsync).toHaveBeenCalledTimes(1);
  });

  it('keeps one attached listener and a usable controller through StrictMode double effects', () => {
    const fake = createFakeUrlAdapter('?photo=1');
    const { result, unmount } = renderHook(
      () =>
        useOverlayUrlState({
          param: 'photo',
          adapter: fake.adapter,
          ...urlIndexKey(() => 3),
        }),
      { wrapper: StrictMode },
    );

    expect(fake.listenerCount).toBe(1);
    expect(result.current.position.value).toBe(1);

    act(() => result.current.set(null));
    expect(result.current.position.value).toBeNull();
    expect(fake.adapter.read()).toBe('');

    unmount();
    expect(fake.listenerCount).toBe(0);
  });
});
