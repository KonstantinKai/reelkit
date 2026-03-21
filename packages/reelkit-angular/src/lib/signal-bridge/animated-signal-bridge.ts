import {
  signal,
  type Signal,
  type WritableSignal,
  type DestroyRef,
  type NgZone,
  type ChangeDetectorRef,
} from '@angular/core';
import { animate, reaction, type AnimatedValue } from '@reelkit/core';
import type { Subscribable } from '@reelkit/core';

/**
 * Bridges a core `Subscribable<AnimatedValue>` into an Angular `Signal<number>`
 * that is driven by a RAF-based animation loop.
 *
 * The animation loop runs outside Angular's zone (via `NgZone.runOutsideAngular`)
 * to avoid triggering unnecessary change-detection cycles on every frame.
 * `ChangeDetectorRef.markForCheck()` is called once per frame so that
 * OnPush components update correctly.
 *
 * @param source      - Core animated-value signal to bridge.
 * @param zone        - Angular NgZone for running outside the zone.
 * @param cdRef       - ChangeDetectorRef to mark the view dirty per frame.
 * @param destroyRef  - Cleaned up automatically on destroy.
 * @returns A read-only Angular signal with the current interpolated pixel value.
 */
export function animatedSignalBridge(
  source: Subscribable<AnimatedValue>,
  zone: NgZone,
  cdRef: ChangeDetectorRef,
  destroyRef: DestroyRef,
): Signal<number> {
  const animatedSignal: WritableSignal<number> = signal<number>(
    source.value.value,
  );
  const state = createAnimationState();

  registerDestroyHandlers(state, destroyRef);
  startReactionOutsideZone(
    source,
    animatedSignal,
    state,
    zone,
    cdRef,
    destroyRef,
  );

  return animatedSignal.asReadonly();
}

interface AnimationState {
  cancelAnimation: (() => void) | null;
  pendingDone: (() => void) | undefined;
  destroyed: boolean;
}

function createAnimationState(): AnimationState {
  return { cancelAnimation: null, pendingDone: undefined, destroyed: false };
}

function registerDestroyHandlers(
  state: AnimationState,
  destroyRef: DestroyRef,
): void {
  destroyRef.onDestroy(() => {
    state.destroyed = true;
    state.cancelAnimation?.();
    state.cancelAnimation = null;
    // Resolve any pending animation promise so that callers of goTo()/next()/prev()
    // always receive a settled Promise even if the component is destroyed while an
    // animation is in flight.  Without this, the deferred created in
    // sliderController would hang forever because the RAF cancel above prevents
    // onComplete from firing.
    const pendingDone = state.pendingDone;
    state.pendingDone = undefined;
    pendingDone?.();
  });
}

function startReactionOutsideZone(
  source: Subscribable<AnimatedValue>,
  animatedSignal: WritableSignal<number>,
  state: AnimationState,
  zone: NgZone,
  cdRef: ChangeDetectorRef,
  destroyRef: DestroyRef,
): void {
  zone.runOutsideAngular(() => {
    const dispose = reaction(
      () => [source],
      () => applyAnimatedValue(source, animatedSignal, state, cdRef),
    );
    destroyRef.onDestroy(dispose);
  });
}

function applyAnimatedValue(
  source: Subscribable<AnimatedValue>,
  animatedSignal: WritableSignal<number>,
  state: AnimationState,
  cdRef: ChangeDetectorRef,
): void {
  const { value, duration, done } = source.value;
  cancelInProgressAnimation(state);

  if (duration > 0) {
    startAnimatedTransition(
      animatedSignal,
      state,
      value,
      duration,
      done,
      cdRef,
    );
  } else {
    applyInstantTransition(animatedSignal, state, value, cdRef);
  }
}

function cancelInProgressAnimation(state: AnimationState): void {
  if (!state.cancelAnimation) return;

  state.cancelAnimation();
  state.cancelAnimation = null;

  const previousDone = state.pendingDone;
  if (previousDone) {
    state.pendingDone = undefined;
    setTimeout(previousDone, 0);
  }
}

function startAnimatedTransition(
  animatedSignal: WritableSignal<number>,
  state: AnimationState,
  targetValue: number,
  duration: number,
  done: (() => void) | undefined,
  cdRef: ChangeDetectorRef,
): void {
  state.pendingDone = done;
  state.cancelAnimation = animate({
    from: animatedSignal(),
    to: targetValue,
    duration,
    onUpdate: (frameValue) => {
      animatedSignal.set(frameValue);
      if (!state.destroyed) {
        cdRef.detectChanges();
      }
    },
    onComplete: () => {
      state.cancelAnimation = null;
      state.pendingDone = undefined;
      setTimeout(() => done?.(), 0);
    },
  });
}

function applyInstantTransition(
  animatedSignal: WritableSignal<number>,
  state: AnimationState,
  targetValue: number,
  cdRef: ChangeDetectorRef,
): void {
  state.pendingDone = undefined;
  animatedSignal.set(targetValue);
  if (!state.destroyed) {
    cdRef.detectChanges();
  }
}
