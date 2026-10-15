import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSlideshowController } from './slideshowController';

describe('createSlideshowController', () => {
  let now = 0;
  let nextFrameId = 0;
  let frames = new Map<number, () => void>();

  beforeEach(() => {
    now = 0;
    nextFrameId = 0;
    frames = new Map();
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => {
      frames.set(++nextFrameId, callback);
      return nextFrameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    setPageHidden(false);
  });

  const elapse = (milliseconds: number) => {
    now += milliseconds;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback());
  };

  const setPageHidden = (hidden: boolean) => {
    Object.defineProperty(document, 'visibilityState', {
      value: hidden ? 'hidden' : 'visible',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  };

  const createPlaying = (interval = 1000) => {
    const onAdvance = vi.fn();
    const slideshow = createSlideshowController({ interval, onAdvance });
    slideshow.setSlide('image');
    slideshow.play();
    return { slideshow, onAdvance };
  };

  it('stays off until play is called', () => {
    const onAdvance = vi.fn();
    const slideshow = createSlideshowController({ interval: 1000, onAdvance });
    slideshow.setSlide('image');
    slideshow.ready();

    elapse(5000);

    expect(slideshow.isPlaying.value).toBe(false);
    expect(onAdvance).not.toHaveBeenCalled();
    slideshow.dispose();
  });

  it('counts an image interval from the moment it is ready, not from the slide change', () => {
    const { slideshow, onAdvance } = createPlaying();

    elapse(5000);
    expect(onAdvance).not.toHaveBeenCalled();

    slideshow.ready();
    elapse(999);
    expect(onAdvance).not.toHaveBeenCalled();
    elapse(1);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('reports progress through the active image', () => {
    const { slideshow } = createPlaying();
    slideshow.ready();

    elapse(250);

    expect(slideshow.progress.value).toBeCloseTo(0.25);
    slideshow.dispose();
  });

  it('starts again from zero when a new slide becomes active', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.ready();
    elapse(800);

    slideshow.setSlide('image');
    expect(slideshow.progress.value).toBe(0);
    slideshow.ready();
    elapse(800);
    expect(onAdvance).not.toHaveBeenCalled();
    elapse(200);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('runs no interval on a video and advances when it ends', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.setSlide('video');
    slideshow.ready();

    elapse(10_000);
    expect(onAdvance).not.toHaveBeenCalled();

    slideshow.ended();
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('ignores an end reported by an image slide', () => {
    const { slideshow, onAdvance } = createPlaying();

    slideshow.ended();

    expect(onAdvance).not.toHaveBeenCalled();
    slideshow.dispose();
  });

  it('freezes on a hold and continues from the same progress on release', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.ready();
    elapse(600);

    slideshow.hold('hover');
    elapse(5000);
    expect(onAdvance).not.toHaveBeenCalled();
    expect(slideshow.progress.value).toBeCloseTo(0.6);

    slideshow.release('hover');
    elapse(399);
    expect(onAdvance).not.toHaveBeenCalled();
    elapse(1);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('keeps running only once every hold is released', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.ready();
    slideshow.hold('hover');
    slideshow.hold('drag');

    slideshow.release('drag');
    elapse(2000);
    expect(onAdvance).not.toHaveBeenCalled();

    slideshow.release('hover');
    elapse(1000);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('advances a video that ended during a hold once the hold is released', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.setSlide('video');
    slideshow.hold('hover');

    slideshow.ended();
    expect(onAdvance).not.toHaveBeenCalled();

    slideshow.release('hover');
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('waits while the page is hidden and continues when it is shown', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.ready();
    elapse(500);

    setPageHidden(true);
    elapse(5000);
    expect(onAdvance).not.toHaveBeenCalled();

    setPageHidden(false);
    elapse(500);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('pauses with its progress and plays on from it', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.ready();
    elapse(700);

    slideshow.toggle();
    expect(slideshow.isPlaying.value).toBe(false);
    elapse(5000);
    expect(onAdvance).not.toHaveBeenCalled();

    slideshow.toggle();
    expect(slideshow.isPlaying.value).toBe(true);
    elapse(300);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('holds back a video end while paused and advances on play', () => {
    const { slideshow, onAdvance } = createPlaying();
    slideshow.setSlide('video');
    slideshow.pause();

    slideshow.ended();
    expect(onAdvance).not.toHaveBeenCalled();

    slideshow.play();
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('uses a changed interval from the next image', () => {
    const { slideshow, onAdvance } = createPlaying(1000);
    slideshow.setInterval(3000);
    slideshow.setSlide('image');
    slideshow.ready();

    elapse(2999);
    expect(onAdvance).not.toHaveBeenCalled();
    elapse(1);
    expect(onAdvance).toHaveBeenCalledTimes(1);
    slideshow.dispose();
  });

  it('stops listening for page visibility and stops the clock on dispose', () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { slideshow, onAdvance } = createPlaying();
    slideshow.ready();

    slideshow.dispose();
    elapse(5000);

    expect(onAdvance).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
      undefined,
    );
  });

  it('can be created without a document, as during server rendering', () => {
    vi.stubGlobal('document', undefined);

    const slideshow = createSlideshowController({
      interval: 1000,
      onAdvance: vi.fn(),
    });

    expect(() => slideshow.dispose()).not.toThrow();
  });
});
