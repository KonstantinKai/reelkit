import { Listenable, ListenableListener } from './Listenable';

export class ValueNotifier<T> extends Listenable {
  constructor(initial: T) {
    super();
    this._value = initial;
  }

  private _value: T;

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if (value !== this._value) {
      this._value = value;
      this.notifyListeners();
    }
  }

  changeWithManualNotifier(value: T): () => void {
    if (value !== this._value) {
      this._value = value;
      return () => this.notifyListeners();
    }

    return () => undefined;
  }
}

export const makeValueNotifier = <T>(initial: T): ValueNotifier<T> => new ValueNotifier(initial);

export class ComputedValueNotifier<T> extends Listenable {
  constructor(get: () => T, deps: () => Listenable[]) {
    super();

    this._get = get;
    this._deps = deps;
  }

  private _get: () => T;

  private _deps: () => Listenable[];

  private _depsDisposer: (() => void) | null = null;

  get value(): T {
    return this._get();
  }

  private _listenDepsIfNeed(): void {
    if (this._depsDisposer === null) {
      const observer = (): void => this.notifyListeners();
      const dispose = notifiersReaction(() => this._deps(), observer);
      this._depsDisposer = () => {
        dispose();
        this._depsDisposer = null;
      };
    }
  }

  override addListener(listener: ListenableListener): void {
    this._listenDepsIfNeed();
    super.addListener(listener);
  }

  override removeListener(listener: ListenableListener): void {
    super.removeListener(listener);

    if (!this.hasListeners && typeof this._depsDisposer === 'function') {
      this._depsDisposer();
    }
  }
}

export const makeComputedValueNotifier = <T>(
  get: () => T,
  deps: () => ValueNotifier<unknown>[],
): ComputedValueNotifier<T> => new ComputedValueNotifier(get, deps);

export const notifiersReaction = (deps: () => Listenable[], effect: () => void): (() => void) => {
  const disposers = deps().map((dep) => dep.observe(effect));
  return () => {
    disposers.forEach((dispose) => dispose());
  };
};
