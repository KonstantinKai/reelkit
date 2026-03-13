/** A callback with no arguments or return value, used as a signal observer. */
export type Listener = () => void;

/** A cleanup function that removes a subscription or disposes a resource. */
export type Dispose = () => void;

/**
 * Base interface for any observable reactive value. Provides read-only
 * access to the current value and a way to subscribe to changes.
 *
 * @typeParam T - The type of the observed value.
 */
export interface Subscribable<T = unknown> {
  /** The current value. */
  get value(): T;

  /**
   * Registers a listener that is called whenever the value changes.
   *
   * @param listener - Callback invoked on each value change.
   * @returns A dispose function that removes the listener.
   */
  observe(listener: Listener): Dispose;
}

/**
 * A writable reactive signal. Setting `value` automatically notifies
 * all observers. Use {@link batch} to group multiple signal updates
 * and defer notifications until all changes are applied.
 *
 * @typeParam T - The type of the stored value.
 */
export interface Signal<T> extends Subscribable<T> {
  /** Sets a new value and notifies observers if it changed. */
  set value(v: T);
}

/**
 * A read-only computed signal that derives its value from other signals.
 * Automatically recomputes when its dependencies change.
 *
 * @typeParam T - The type of the computed value.
 */
export interface ComputedSignal<T> extends Subscribable<T> {}

/**
 * Creates a writable reactive signal with the given initial value.
 * Observers are notified whenever the value changes (by reference equality).
 *
 * @typeParam T - The type of the stored value.
 * @param initial - The initial value of the signal.
 * @returns A new {@link Signal} instance.
 *
 * @example
 * ```ts
 * const count = createSignal(0);
 * count.observe(() => console.log(count.value));
 * count.value = 1; // logs: 1
 * ```
 */
// Batching infrastructure
let batchDepth = 0;
const pendingNotifiers = new Set<Listener>();

/**
 * Groups multiple signal updates into a single notification pass.
 * Observers are not called until the outermost `batch` callback completes,
 * ensuring they always see a consistent state. Supports nesting.
 *
 * @param fn - A function that performs one or more signal writes.
 *
 * @example
 * ```ts
 * const a = createSignal(1);
 * const b = createSignal(2);
 * batch(() => {
 *   a.value = 10;
 *   b.value = 20;
 * }); // observers fire once, seeing both updates
 * ```
 */
export const batch = (fn: () => void): void => {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const notifiers = [...pendingNotifiers];
      pendingNotifiers.clear();
      notifiers.forEach((notify) => notify());
    }
  }
};

export const createSignal = <T>(initial: T): Signal<T> => {
  let value = initial;
  const listeners = new Set<Listener>();

  const notify = () => listeners.forEach((fn) => fn());

  return {
    get value() {
      return value;
    },
    set value(v: T) {
      if (v !== value) {
        value = v;
        if (batchDepth > 0) {
          pendingNotifiers.add(notify);
        } else {
          notify();
        }
      }
    },
    observe(listener: Listener): Dispose {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

/**
 * Creates a read-only computed signal that lazily subscribes to its
 * dependencies. The getter is re-evaluated each time a dependency
 * notifies, and observers of this computed are notified in turn.
 *
 * Subscriptions to upstream dependencies are established only when
 * the first observer is added, and cleaned up when the last observer
 * is removed — so unused computeds have zero overhead.
 *
 * @typeParam T - The type of the computed value.
 * @param getter - Function that computes the derived value.
 * @param deps - Factory returning the subscribable dependencies to track.
 * @returns A new {@link ComputedSignal} instance.
 *
 * @example
 * ```ts
 * const index = createSignal(2);
 * const doubled = createComputed(() => index.value * 2, () => [index]);
 * doubled.observe(() => console.log(doubled.value));
 * index.value = 5; // logs: 10
 * ```
 */
export const createComputed = <T>(
  getter: () => T,
  deps: () => Subscribable[],
): ComputedSignal<T> => {
  let depsDisposer: Dispose | null = null;
  const listeners = new Set<Listener>();

  const notify = () => listeners.forEach((fn) => fn());

  const subscribeToDeps = () => {
    if (depsDisposer === null) {
      const disposers = deps().map((dep) => dep.observe(notify));
      depsDisposer = () => {
        disposers.forEach((d) => d());
        depsDisposer = null;
      };
    }
  };

  return {
    get value() {
      return getter();
    },
    observe(listener: Listener): Dispose {
      subscribeToDeps();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && depsDisposer) {
          depsDisposer();
        }
      };
    },
  };
};

/**
 * Creates a reactive side effect that runs whenever any of the given
 * dependencies change. Subscriptions are established immediately.
 *
 * @param deps - Factory returning the subscribable dependencies to track.
 * @param effect - Callback invoked when any dependency notifies.
 * @returns A dispose function that removes all subscriptions.
 *
 * @example
 * ```ts
 * const index = createSignal(0);
 * const dispose = reaction(() => [index], () => {
 *   console.log('Index changed to', index.value);
 * });
 * index.value = 3; // logs: "Index changed to 3"
 * dispose(); // stops observing
 * ```
 */
export const reaction = (
  deps: () => Subscribable[],
  effect: Listener,
): Dispose => {
  const disposers = deps().map((dep) => dep.observe(effect));
  return () => disposers.forEach((d) => d());
};
