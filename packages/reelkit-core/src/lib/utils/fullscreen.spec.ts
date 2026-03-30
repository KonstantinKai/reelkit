import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
} from './fullscreen';

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    configurable: true,
  });
});

describe('fullscreenSignal', () => {
  it('returns false when no element is fullscreen', () => {
    expect(fullscreenSignal.value).toBe(false);
  });

  it('updates on fullscreenchange when observed', () => {
    const listener = vi.fn();
    const dispose = fullscreenSignal.observe(listener);

    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(fullscreenSignal.value).toBe(true);
    expect(listener).toHaveBeenCalled();

    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(fullscreenSignal.value).toBe(false);
    dispose();
  });

  it('subscribes to DOM events only when first observer is added', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    const dispose = fullscreenSignal.observe(vi.fn());

    expect(addSpy).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function),
      undefined,
    );

    dispose();
  });

  it('unsubscribes from DOM events when last observer is removed', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const dispose = fullscreenSignal.observe(vi.fn());
    dispose();

    expect(removeSpy).toHaveBeenCalledWith(
      'fullscreenchange',
      expect.any(Function),
      undefined,
    );
  });

  it('shares subscription across multiple observers', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');

    const dispose1 = fullscreenSignal.observe(vi.fn());
    const dispose2 = fullscreenSignal.observe(vi.fn());

    const calls = addSpy.mock.calls.filter(
      ([name]) => name === 'fullscreenchange',
    );
    expect(calls).toHaveLength(1);

    dispose1();
    dispose2();
  });

  it('keeps subscription when partial dispose', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const listener = vi.fn();

    const dispose1 = fullscreenSignal.observe(vi.fn());
    const dispose2 = fullscreenSignal.observe(listener);

    dispose1();

    const removeCalls = removeSpy.mock.calls.filter(
      ([name]) => name === 'fullscreenchange',
    );
    expect(removeCalls).toHaveLength(0);

    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true,
    });
    document.dispatchEvent(new Event('fullscreenchange'));

    expect(listener).toHaveBeenCalled();
    dispose2();
  });
});

describe('requestFullscreen', () => {
  it('calls element.requestFullscreen when available', async () => {
    const el = document.createElement('div');
    el.requestFullscreen = vi.fn().mockResolvedValue(undefined);

    await requestFullscreen(el);

    expect(el.requestFullscreen).toHaveBeenCalled();
  });

  it('resolves when no API is available', async () => {
    const el = document.createElement('div');
    delete (el as unknown as Record<string, unknown>)['requestFullscreen'];

    await expect(requestFullscreen(el)).resolves.toBeUndefined();
  });
});

describe('exitFullscreen', () => {
  it('calls document.exitFullscreen when in fullscreen', async () => {
    const original = document.exitFullscreen;
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true,
    });

    await exitFullscreen();

    expect(document.exitFullscreen).toHaveBeenCalled();
    document.exitFullscreen = original;
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      configurable: true,
    });
  });

  it('skips exitFullscreen when not in fullscreen', async () => {
    const original = document.exitFullscreen;
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    await exitFullscreen();

    expect(document.exitFullscreen).not.toHaveBeenCalled();
    document.exitFullscreen = original;
  });
});
