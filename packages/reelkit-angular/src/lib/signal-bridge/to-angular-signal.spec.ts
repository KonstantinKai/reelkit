import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createSignal } from '@reelkit/core';
import type { Subscribable } from '@reelkit/core';
import { toAngularSignal } from './to-angular-signal';

/**
 * Minimal DestroyRef stub that captures the onDestroy callback so tests can
 * trigger it manually.
 */
function makeDestroyRef(): { destroyRef: DestroyRef; destroy: () => void } {
  let destroyFn: (() => void) | undefined;
  const destroyRef = {
    onDestroy(fn: () => void) {
      destroyFn = fn;
      return () => {
        /* noop */
      };
    },
  } as unknown as DestroyRef;
  return {
    destroyRef,
    destroy: () => destroyFn?.(),
  };
}

describe('toAngularSignal', () => {
  it('initialises the Angular signal with the current source value', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal(42);
      const { destroyRef } = makeDestroyRef();

      const sig = toAngularSignal(source, destroyRef);

      expect(sig()).toBe(42);
    });
  });

  it('updates the Angular signal when the source value changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal(0);
      const { destroyRef } = makeDestroyRef();

      const sig = toAngularSignal(source, destroyRef);
      expect(sig()).toBe(0);

      source.value = 99;
      expect(sig()).toBe(99);
    });
  });

  it('tracks multiple sequential source changes', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal('a');
      const { destroyRef } = makeDestroyRef();

      const sig = toAngularSignal(source, destroyRef);

      source.value = 'b';
      expect(sig()).toBe('b');

      source.value = 'c';
      expect(sig()).toBe('c');
    });
  });

  it('disposes the subscription when DestroyRef fires', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal(1);
      const { destroyRef, destroy } = makeDestroyRef();

      const sig = toAngularSignal(source, destroyRef);
      expect(sig()).toBe(1);

      destroy();

      // After destroy the Angular signal must not update anymore.
      source.value = 999;
      expect(sig()).toBe(1);
    });
  });

  it('returns a read-only signal (no set method)', () => {
    TestBed.runInInjectionContext(() => {
      const source = createSignal(7);
      const { destroyRef } = makeDestroyRef();

      const sig = toAngularSignal(source, destroyRef);

      expect(
        typeof (sig as unknown as Record<string, unknown>)['set'],
      ).not.toBe('function');
    });
  });

  it('works with a custom Subscribable that is not a createSignal', () => {
    TestBed.runInInjectionContext(() => {
      let listener: (() => void) | undefined;
      let currentValue = 10;

      const customSource: Subscribable<number> = {
        get value() {
          return currentValue;
        },
        observe(fn: () => void) {
          listener = fn;
          return () => {
            listener = undefined;
          };
        },
      };

      const { destroyRef } = makeDestroyRef();
      const sig = toAngularSignal(customSource, destroyRef);
      expect(sig()).toBe(10);

      currentValue = 20;
      listener?.();
      expect(sig()).toBe(20);
    });
  });

  it('handles non-primitive value types (arrays)', () => {
    TestBed.runInInjectionContext(() => {
      const initial: number[] = [1, 2, 3];
      const source = createSignal<number[]>(initial);
      const { destroyRef } = makeDestroyRef();

      const sig = toAngularSignal(source, destroyRef);
      expect(sig()).toEqual([1, 2, 3]);

      const next: number[] = [4, 5, 6];
      source.value = next;
      expect(sig()).toBe(next);
    });
  });
});
