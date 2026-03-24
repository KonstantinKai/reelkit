import { ChangeDetectorRef, DestroyRef, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createSignal } from '@reelkit/core';
import type { AnimatedValue } from '@reelkit/core';
import { animatedSignalBridge } from './animated-signal-bridge';

function makeDestroyRef(): { destroyRef: DestroyRef; destroy: () => void } {
  const callbacks: Array<() => void> = [];
  const destroyRef = {
    onDestroy(fn: () => void) {
      callbacks.push(fn);
      return () => {
        /* noop */
      };
    },
  } as unknown as DestroyRef;
  return {
    destroyRef,
    destroy: () => callbacks.forEach((fn) => fn()),
  };
}

function makeCdRef(): {
  cdRef: ChangeDetectorRef;
  detectChangesCalls: number[];
} {
  const state = { detectChangesCalls: [] as number[] };
  const cdRef = {
    detectChanges: () => state.detectChangesCalls.push(Date.now()),
  } as unknown as ChangeDetectorRef;
  return { cdRef, detectChangesCalls: state.detectChangesCalls };
}

/**
 * A minimal NgZone stub where `runOutsideAngular` runs the callback
 * synchronously (no actual zone involvement needed for unit tests).
 */
function makeZone(): NgZone {
  return {
    runOutsideAngular<T>(fn: () => T): T {
      return fn();
    },
  } as unknown as NgZone;
}

function makeAnimatedValue(
  value: number,
  duration: number,
  done?: () => void,
): AnimatedValue {
  return { value, duration, done };
}

describe('animatedSignalBridge', () => {
  beforeEach(() => {
    // Use fake timers so setTimeout inside the bridge is controllable.
    jest.useFakeTimers();
    // Keep requestAnimationFrame calls synchronous and controllable.
    jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(performance.now());
      return 0;
    });
    jest.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {
      /* noop */
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('initialises the signal with the source AnimatedValue.value', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(100, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      const sig = animatedSignalBridge(source, zone, cdRef, destroyRef);

      expect(sig()).toBe(100);
    });
  });

  it('returns a read-only signal (no set method exposed)', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      const sig = animatedSignalBridge(source, zone, cdRef, destroyRef);

      expect(typeof (sig as any)['set']).not.toBe('function');
    });
  });

  it('applies instant update (duration = 0) and schedules a detectChanges', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef, detectChangesCalls } = makeCdRef();
      const zone = makeZone();

      const sig = animatedSignalBridge(source, zone, cdRef, destroyRef);
      expect(sig()).toBe(0);

      source.value = makeAnimatedValue(50, 0);
      expect(sig()).toBe(50);

      expect(detectChangesCalls.length).toBeGreaterThan(0);
    });
  });

  it('starts an animation when duration > 0 and calls detectChanges on each frame', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef, detectChangesCalls } = makeCdRef();
      const zone = makeZone();

      const sig = animatedSignalBridge(source, zone, cdRef, destroyRef);

      // Mock rAF so multiple frames are simulated sequentially.
      let rafCbs: FrameRequestCallback[] = [];
      (globalThis.requestAnimationFrame as jest.Mock).mockImplementation(
        (cb) => {
          rafCbs.push(cb);
          return rafCbs.length;
        },
      );

      source.value = makeAnimatedValue(200, 300);

      // Simulate several frames at 0 ms, 150 ms and 350 ms (past duration).
      if (rafCbs.length > 0) {
        rafCbs[0](0);
        rafCbs = [];
      }
      if (rafCbs.length > 0) {
        rafCbs[0](150);
        rafCbs = [];
      }
      if (rafCbs.length > 0) {
        rafCbs[0](350);
      }

      expect(detectChangesCalls.length).toBeGreaterThan(0);
    });
  });

  it('reaches the target value after animation completes', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      // Collect rAF callbacks to drive manually.
      const rafQueue: Array<FrameRequestCallback> = [];
      (globalThis.requestAnimationFrame as jest.Mock).mockImplementation(
        (cb) => {
          rafQueue.push(cb);
          return rafQueue.length;
        },
      );

      const sig = animatedSignalBridge(source, zone, cdRef, destroyRef);

      source.value = makeAnimatedValue(300, 300);

      // Drive animation past its end.
      let t = 0;
      while (rafQueue.length > 0) {
        const cb = rafQueue.shift()!;
        cb(t);
        t += 400; // Advance beyond duration on first frame.
      }

      expect(sig()).toBe(300);
    });
  });

  it('cancels previous animation when a new value arrives', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      const cancelSpy = jest.spyOn(globalThis, 'cancelAnimationFrame');

      const rafQueue: Array<FrameRequestCallback> = [];
      let rafIdCounter = 1;
      (globalThis.requestAnimationFrame as jest.Mock).mockImplementation(
        (cb) => {
          rafQueue.push(cb);
          return rafIdCounter++;
        },
      );

      animatedSignalBridge(source, zone, cdRef, destroyRef);

      // Start first animation.
      source.value = makeAnimatedValue(100, 300);
      // Advance one frame so the rAF is in flight.
      if (rafQueue.length > 0) rafQueue.shift()!(0);

      // Start a second animation before the first completes.
      source.value = makeAnimatedValue(200, 300);

      // The first animation should have been cancelled.
      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  it('calls the done callback after animation completes', () => {
    TestBed.runInInjectionContext(() => {
      const done = jest.fn();
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      const rafQueue: Array<FrameRequestCallback> = [];
      (globalThis.requestAnimationFrame as jest.Mock).mockImplementation(
        (cb) => {
          rafQueue.push(cb);
          return rafQueue.length;
        },
      );

      animatedSignalBridge(source, zone, cdRef, destroyRef);
      source.value = makeAnimatedValue(100, 300, done);

      let t = 0;
      while (rafQueue.length > 0) {
        const cb = rafQueue.shift()!;
        cb(t);
        t += 400;
      }

      // done is called via setTimeout(done, 0) after onComplete.
      jest.runAllTimers();
      expect(done).toHaveBeenCalledTimes(1);
    });
  });

  it('stops updating the signal after destroy', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef, destroy } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      const sig = animatedSignalBridge(source, zone, cdRef, destroyRef);
      expect(sig()).toBe(0);

      destroy();

      source.value = makeAnimatedValue(999, 0);
      // After destroy the reaction is disposed so the signal no longer reacts.
      expect(sig()).toBe(0);
    });
  });

  it('resolves pending done callback when destroyed mid-animation (no hanging Promise)', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef, destroy } = makeDestroyRef();
      const { cdRef } = makeCdRef();
      const zone = makeZone();

      // Hold rAF callbacks so the animation stays in-flight.
      const rafQueue: Array<FrameRequestCallback> = [];
      (globalThis.requestAnimationFrame as jest.Mock).mockImplementation(
        (cb) => {
          rafQueue.push(cb);
          return rafQueue.length;
        },
      );

      animatedSignalBridge(source, zone, cdRef, destroyRef);

      const done = jest.fn();
      // Start an animated transition with a done callback (mirrors sliderController deferred).
      source.value = makeAnimatedValue(100, 300, done);

      // Confirm animation is in-flight (RAF not yet completed).
      expect(rafQueue.length).toBeGreaterThan(0);
      expect(done).not.toHaveBeenCalled();

      // Destroy while animation is in progress.
      destroy();

      // done must be called synchronously during destroy so the Promise settles.
      expect(done).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call detectChanges after destroy (destroyed flag check)', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal<AnimatedValue>(makeAnimatedValue(0, 0));
      const { destroyRef, destroy } = makeDestroyRef();
      const { cdRef, detectChangesCalls } = makeCdRef();
      const zone = makeZone();

      const rafQueue: Array<FrameRequestCallback> = [];
      (globalThis.requestAnimationFrame as jest.Mock).mockImplementation(
        (cb) => {
          rafQueue.push(cb);
          return rafQueue.length;
        },
      );

      animatedSignalBridge(source, zone, cdRef, destroyRef);

      source.value = makeAnimatedValue(50, 0);
      const countBefore = detectChangesCalls.length;

      destroy();

      // Fire the pending rAF after destroy — detectChanges must NOT be called.
      while (rafQueue.length > 0) {
        rafQueue.shift()!(performance.now());
      }

      expect(detectChangesCalls.length).toBe(countBefore);
    });
  });
});
