import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useFullscreen from './useFullscreen';

describe('useFullscreen', () => {
  let mockElement: HTMLDivElement;
  let ref: { current: HTMLDivElement | null };

  beforeEach(() => {
    mockElement = document.createElement('div');
    ref = { current: mockElement };

    // Mock requestFullscreen on element
    mockElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock exitFullscreen on document
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock fullscreenElement
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial state as not fullscreen', () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    const [isFullscreen] = result.current;
    expect(isFullscreen).toBe(false);
  });

  it('requests fullscreen on element', async () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[1](); // requestFullscreen
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it('exits fullscreen', async () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[2](); // exitFullscreen
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('listens for fullscreenchange event', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    renderHook(() => useFullscreen({ ref }));

    expect(addSpy).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function),
    );
  });

  it('removes listeners on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useFullscreen({ ref }));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function),
    );
  });

  it('updates state on fullscreenchange event', async () => {
    const { result } = renderHook(() => useFullscreen({ ref }));

    // Simulate entering fullscreen
    await act(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: mockElement,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current[0]).toBe(true);

    // Simulate exiting fullscreen
    await act(async () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    expect(result.current[0]).toBe(false);
  });

  it('does not request fullscreen when ref is null', async () => {
    const nullRef = { current: null };
    const { result } = renderHook(() => useFullscreen({ ref: nullRef }));

    await act(async () => {
      result.current[1](); // requestFullscreen
    });

    // Should not throw, element.requestFullscreen should not be called
    expect(mockElement.requestFullscreen).not.toHaveBeenCalled();
  });

  it('handles requestFullscreen error gracefully', async () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockElement.requestFullscreen = vi.fn().mockRejectedValue(
      new Error('Not allowed'),
    );

    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[1]();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error attempting to enable full-screen mode'),
    );
  });

  it('exits fullscreen on unmount if active', async () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: mockElement,
      writable: true,
      configurable: true,
    });

    const { unmount } = renderHook(() => useFullscreen({ ref }));

    unmount();

    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('calls exitFullscreen first if already fullscreen when requesting', async () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: mockElement,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useFullscreen({ ref }));

    await act(async () => {
      result.current[1]();
    });

    expect(document.exitFullscreen).toHaveBeenCalled();
    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });
});
