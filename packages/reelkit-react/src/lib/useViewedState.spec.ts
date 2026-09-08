import { createFakeStorageAdapter } from '@reelkit/core/testing';
import { renderHook } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { urlIndexKey } from '@reelkit/core';
import { useViewedState } from './useViewedState';

describe('useViewedState', () => {
  it('loads what was stored once mounted', () => {
    const storage = createFakeStorageAdapter({ initial: '["2"]' });

    const { result } = renderHook(() =>
      useViewedState({
        storageKey: 'seen',
        storage: storage.adapter,
        ...urlIndexKey(() => 5),
      }),
    );

    expect(result.current.resolve('')).toBe(2);
  });

  it('keeps the same controller across rerenders', () => {
    const storage = createFakeStorageAdapter();

    const { result, rerender } = renderHook(() =>
      useViewedState({
        storageKey: 'seen',
        storage: storage.adapter,
        ...urlIndexKey(() => 5),
      }),
    );

    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });

  it('attaches on mount and stops following storage on unmount', () => {
    const storage = createFakeStorageAdapter();

    const { unmount } = renderHook(() =>
      useViewedState({
        storageKey: 'seen',
        storage: storage.adapter,
        ...urlIndexKey(() => 5),
      }),
    );

    expect(storage.listenerCount).toBe(1);

    unmount();
    expect(storage.listenerCount).toBe(0);
  });
});

/**
 * A snippet only reads as an example when it is tagged as one — untagged, it
 * renders as description prose and editor hover shows no example at all.
 */
describe('documentation', () => {
  const source = readFileSync(join(__dirname, 'useViewedState.ts'), 'utf8');

  it('gives useViewedState a tagged example', () => {
    const declared = source.search(/^export const useViewedState\b/m);
    expect(declared).toBeGreaterThan(-1);

    const doc = source.slice(0, declared).split('/**').pop() ?? '';
    expect(doc).toContain('@example');
  });

  it('tags every fenced snippet rather than leaving it loose in a description', () => {
    const fences = (source.match(/^ \* ```/gm) ?? []).length;
    const tags = (source.match(/@example/g) ?? []).length;

    expect(tags).toBe(fences / 2);
  });
});
