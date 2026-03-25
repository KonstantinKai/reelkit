import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimerController } from './timerController';

describe('createTimerController', () => {
  let now = 0;
  let frameCallbacks: (() => void)[] = [];

  beforeEach(() => {
    now = 0;
    frameCallbacks = [];
    vi.spyOn(performance, 'now').mockReturnValue(0);
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
      frameCallbacks.push(cb);
      return frameCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const stepFrame = (deltaMs: number) => {
    now += deltaMs;
    vi.spyOn(performance, 'now').mockReturnValue(now);
    const callbacks = [...frameCallbacks];
    frameCallbacks = [];
    callbacks.forEach((cb) => cb());
  };

  it('progresses from 0 to 1 over duration', () => {
    const timer = createTimerController({ duration: 1000 });

    timer.start();
    expect(timer.progress.value).toBe(0);

    stepFrame(500);
    expect(timer.progress.value).toBeCloseTo(0.5);

    stepFrame(500);
    expect(timer.progress.value).toBe(1);
    expect(timer.isRunning.value).toBe(false);
  });

  it('fires onComplete when progress reaches 1', () => {
    const onComplete = vi.fn();
    const timer = createTimerController({ duration: 1000, onComplete });

    timer.start();
    stepFrame(1000);

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pause freezes progress, resume continues', () => {
    const timer = createTimerController({ duration: 1000 });

    timer.start();
    stepFrame(300);
    expect(timer.progress.value).toBeCloseTo(0.3);

    timer.pause();
    expect(timer.isRunning.value).toBe(false);

    // Advance time — should not affect progress
    now += 500;
    vi.spyOn(performance, 'now').mockReturnValue(now);

    timer.resume();
    stepFrame(200);
    // Total elapsed: 300 + 200 = 500
    expect(timer.progress.value).toBeCloseTo(0.5);
  });

  it('reset sets progress to 0', () => {
    const timer = createTimerController({ duration: 1000 });

    timer.start();
    stepFrame(500);
    expect(timer.progress.value).toBeCloseTo(0.5);

    timer.reset();
    expect(timer.progress.value).toBe(0);
    expect(timer.isRunning.value).toBe(false);
  });

  it('start with custom duration overrides default', () => {
    const onComplete = vi.fn();
    const timer = createTimerController({ duration: 1000, onComplete });

    timer.start(500);
    stepFrame(500);
    expect(timer.progress.value).toBe(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
