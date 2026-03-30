import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fullscreenSignal } from '@reelkit/core';
import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  let mockElement: HTMLDivElement;
  let ref: { current: HTMLDivElement | null };

  beforeEach(() => {
    mockElement = document.createElement('div');
    ref = { current: mockElement };

    mockElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
    fullscreenSignal.value = false;
  });

  it('returns fullscreen signal as first element', () => {
    const { result } = renderHook(() => useFullscreen({ ref }));
    expect(result.current[0].value).toBe(false);
  });

  it('requests fullscreen on element', async () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[1]();
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('exits fullscreen', async () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: mockElement,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[2]();
    });

    expect(document.exitFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
  });

  it('does not request fullscreen when ref is null', async () => {
    const nullRef = { current: null };
    const { result } = renderHook(() => useFullscreen({ ref: nullRef }));

    await act(async () => {
      result.current[1]();
    });

    expect(mockElement.requestFullscreen).not.toHaveBeenCalled();
  });

  it('handles requestFullscreen error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    mockElement.requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error('Not allowed'));

    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[1]();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error attempting to enable full-screen mode'),
    );
  });

  it('exits fullscreen on unmount if active', async () => {
    const { result, unmount } = renderHook(() => useFullscreen({ ref }));

    // Enter fullscreen first
    await act(async () => {
      result.current[1]();
    });

    // Simulate browser entering fullscreen
    await act(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: mockElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    unmount();

    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('toggle requests when not fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[3]();
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('toggle exits when fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    // Enter fullscreen
    await act(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: mockElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    await act(async () => {
      result.current[3]();
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
  });
});
