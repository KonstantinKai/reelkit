import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fitAspectRatio,
  getViewportSize,
  isMobileWidth,
  isTouchDevice,
  observeViewportSize,
} from './viewportSize';

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
  });
};

const withoutWindow = (run: () => void) => {
  vi.stubGlobal('window', undefined);
  try {
    run();
  } finally {
    vi.unstubAllGlobals();
  }
};

describe('getViewportSize', () => {
  it('reads the window size', () => {
    setViewport(1024, 768);
    expect(getViewportSize()).toEqual([1024, 768]);
  });

  it('is [0, 0] without a window, as during server rendering', () => {
    withoutWindow(() => expect(getViewportSize()).toEqual([0, 0]));
  });
});

describe('observeViewportSize', () => {
  afterEach(() => setViewport(1024, 768));

  it('reports the new size on a window resize', () => {
    setViewport(1024, 768);
    const callback = vi.fn();
    const dispose = observeViewportSize(callback);

    setViewport(800, 600);
    window.dispatchEvent(new Event('resize'));

    expect(callback).toHaveBeenCalledWith([800, 600]);
    dispose();
  });

  it('reports a resize event that leaves the size unchanged', () => {
    // Device emulation can switch to a touch device of the same size, and the
    // lightbox re-checks touch input on that event.
    setViewport(1024, 768);
    const callback = vi.fn();
    const dispose = observeViewportSize(callback);

    window.dispatchEvent(new Event('resize'));

    expect(callback).toHaveBeenCalledWith([1024, 768]);
    dispose();
  });

  it('stops listening once disposed', () => {
    setViewport(1024, 768);
    const callback = vi.fn();
    const dispose = observeViewportSize(callback);

    dispose();
    setViewport(800, 600);
    window.dispatchEvent(new Event('resize'));

    expect(callback).not.toHaveBeenCalled();
  });

  it('does nothing without a window, as during server rendering', () => {
    withoutWindow(() => {
      const dispose = observeViewportSize(vi.fn());
      expect(() => dispose()).not.toThrow();
    });
  });
});

describe('isMobileWidth', () => {
  it('counts 768px and narrower as a phone', () => {
    expect(isMobileWidth(767)).toBe(true);
    expect(isMobileWidth(768)).toBe(true);
    expect(isMobileWidth(769)).toBe(false);
  });
});

describe('fitAspectRatio', () => {
  it('fills a phone screen whatever the ratio', () => {
    expect(fitAspectRatio([375, 812], 9 / 16)).toEqual([375, 812]);
    expect(fitAspectRatio([768, 1024], 9 / 16)).toEqual([768, 1024]);
  });

  it('takes the full height at the ratio on a desktop', () => {
    expect(fitAspectRatio([1024, 768], 9 / 16)).toEqual([432, 768]);
    expect(fitAspectRatio([1024, 768], 0.75)).toEqual([576, 768]);
  });

  it('narrows to the window width when the height-fit would overflow', () => {
    expect(fitAspectRatio([1024, 768], 16 / 9)).toEqual([1024, 576]);
  });

  it('uses 9/16 when no ratio is given', () => {
    expect(fitAspectRatio([1024, 768])).toEqual([432, 768]);
  });

  it('falls back to 9/16 for a ratio that would break the layout', () => {
    for (const ratio of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(fitAspectRatio([1024, 768], ratio)).toEqual([432, 768]);
    }
  });
});

describe('isTouchDevice', () => {
  // jsdom puts `ontouchstart` on every window, so each case supplies its own.
  const stubDevice = (
    windowShape: Record<string, unknown>,
    maxTouchPoints: number,
  ) => {
    vi.stubGlobal('window', windowShape);
    vi.stubGlobal('navigator', { maxTouchPoints });
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false for a pointer-only device', () => {
    stubDevice({}, 0);
    expect(isTouchDevice()).toBe(false);
  });

  it('is true when the window takes touch events', () => {
    stubDevice({ ontouchstart: null }, 0);
    expect(isTouchDevice()).toBe(true);
  });

  it('is true when the device reports touch points', () => {
    stubDevice({}, 5);
    expect(isTouchDevice()).toBe(true);
  });

  it('is false without a window, as during server rendering', () => {
    withoutWindow(() => expect(isTouchDevice()).toBe(false));
  });
});
