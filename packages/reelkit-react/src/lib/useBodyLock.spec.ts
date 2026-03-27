import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useBodyLock } from './useBodyLock';

describe('useBodyLock', () => {
  const saved = {} as Pick<
    CSSStyleDeclaration,
    | 'overflow'
    | 'paddingRight'
    | 'overscrollBehavior'
    | 'position'
    | 'top'
    | 'width'
  >;

  beforeEach(() => {
    const { style } = document.body;
    saved.overflow = style.overflow;
    saved.paddingRight = style.paddingRight;
    saved.overscrollBehavior = style.overscrollBehavior;
    saved.position = style.position;
    saved.top = style.top;
    saved.width = style.width;

    style.overflow = '';
    style.paddingRight = '';
    style.overscrollBehavior = '';
    style.position = '';
    style.top = '';
    style.width = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const { style } = document.body;
    style.overflow = saved.overflow;
    style.paddingRight = saved.paddingRight;
    style.overscrollBehavior = saved.overscrollBehavior;
    style.position = saved.position;
    style.top = saved.top;
    style.width = saved.width;
  });

  it('sets body overflow to hidden when locked', () => {
    renderHook(() => useBodyLock(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('sets position fixed when locked', () => {
    renderHook(() => useBodyLock(true));
    expect(document.body.style.position).toBe('fixed');
  });

  it('sets width 100% when locked', () => {
    renderHook(() => useBodyLock(true));
    expect(document.body.style.width).toBe('100%');
  });

  it('sets overscrollBehavior none when locked', () => {
    renderHook(() => useBodyLock(true));
    expect(document.body.style.overscrollBehavior).toBe('none');
  });

  it('does nothing when locked=false', () => {
    document.body.style.overflow = 'auto';
    renderHook(() => useBodyLock(false));
    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores all styles on unmount', () => {
    document.body.style.overflow = 'auto';
    document.body.style.position = 'relative';
    document.body.style.paddingRight = '10px';

    const { unmount } = renderHook(() => useBodyLock(true));
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
    expect(document.body.style.position).toBe('relative');
    expect(document.body.style.paddingRight).toBe('10px');
  });

  it('restores scroll position on unmount', () => {
    const scrollToSpy = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(vi.fn());

    const { unmount } = renderHook(() => useBodyLock(true));
    unmount();

    expect(scrollToSpy).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('toggles from locked to unlocked', () => {
    const { rerender } = renderHook(({ locked }) => useBodyLock(locked), {
      initialProps: { locked: true },
    });

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: false });

    expect(document.body.style.overflow).toBe('');
    expect(document.body.style.position).toBe('');
  });

  it('toggles from unlocked to locked', () => {
    const { rerender } = renderHook(({ locked }) => useBodyLock(locked), {
      initialProps: { locked: false },
    });

    expect(document.body.style.overflow).toBe('');

    rerender({ locked: true });

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.body.style.position).toBe('fixed');
  });

  it('sets paddingRight based on scrollbar width', () => {
    renderHook(() => useBodyLock(true));

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      expect(document.body.style.paddingRight).toBe(`${scrollbarWidth}px`);
    } else {
      expect(document.body.style.paddingRight).toBe('');
    }
  });
});
