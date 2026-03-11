import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useBodyLock } from './useBodyLock';

describe('useBodyLock', () => {
  let originalOverflow: string;
  let originalPaddingRight: string;

  beforeEach(() => {
    // Store original values
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    // Reset body styles
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  afterEach(() => {
    // Restore mocks
    vi.restoreAllMocks();
    // Restore original values
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  });

  it('sets body overflow to hidden when locked=true', () => {
    renderHook(() => useBodyLock(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('does nothing when locked=false', () => {
    document.body.style.overflow = 'auto';

    renderHook(() => useBodyLock(false));

    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores original overflow on unmount', () => {
    document.body.style.overflow = 'auto';

    const { unmount } = renderHook(() => useBodyLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores original paddingRight on unmount', () => {
    document.body.style.paddingRight = '10px';

    const { unmount } = renderHook(() => useBodyLock(true));

    unmount();

    expect(document.body.style.paddingRight).toBe('10px');
  });

  it('handles toggle from locked to unlocked', () => {
    const { rerender } = renderHook(({ locked }) => useBodyLock(locked), {
      initialProps: { locked: true },
    });

    expect(document.body.style.overflow).toBe('hidden');

    rerender({ locked: false });

    // After rerender with false, cleanup runs and restores original
    expect(document.body.style.overflow).toBe('');
  });

  it('handles toggle from unlocked to locked', () => {
    const { rerender } = renderHook(({ locked }) => useBodyLock(locked), {
      initialProps: { locked: false },
    });

    expect(document.body.style.overflow).toBe('');

    rerender({ locked: true });

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('sets paddingRight based on scrollbar width calculation', () => {
    // In jsdom, innerWidth and clientWidth are typically equal (no scrollbar)
    // So paddingRight should remain empty or be set to '0px' equivalent
    renderHook(() => useBodyLock(true));

    // The hook calculates: window.innerWidth - document.documentElement.clientWidth
    // and only sets paddingRight if the result is > 0
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      expect(document.body.style.paddingRight).toBe(`${scrollbarWidth}px`);
    } else {
      expect(document.body.style.paddingRight).toBe('');
    }
  });
});
