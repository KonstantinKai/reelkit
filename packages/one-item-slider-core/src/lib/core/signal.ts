export type Listener = () => void;
export type Dispose = () => void;

/** Base interface for anything that can be observed */
export interface Subscribable<T = unknown> {
  get value(): T;
  observe(listener: Listener): Dispose;
}

export interface Signal<T> extends Subscribable<T> {
  set value(v: T);
  /** Change value without auto-notify, returns notify function */
  changeWithManualNotifier(value: T): Listener;
}

export interface ComputedSignal<T> extends Subscribable<T> {}

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
        notify();
      }
    },
    observe(listener: Listener): Dispose {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    changeWithManualNotifier(v: T): Listener {
      if (v !== value) {
        value = v;
        return notify;
      }
      return () => undefined;
    },
  };
};

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

export const reaction = (
  deps: () => Subscribable[],
  effect: Listener,
): Dispose => {
  const disposers = deps().map((dep) => dep.observe(effect));
  return () => disposers.forEach((d) => d());
};
