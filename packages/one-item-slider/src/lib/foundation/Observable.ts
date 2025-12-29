/**
 * Action type passed to delegateInSyncSeries method
 */
export type ObserverAction<T> = (observer: T) => void;

/**
 * A ObservableMixin implements Observer pattern functionality
 */
export class ObservableMixin<T> {
  private _observersWritable: Set<T> | undefined;

  private get _observers(): Set<T> {
    return (this._observersWritable ??= new Set());
  }

  private get _reversedObservers(): Set<T> {
    return new Set([...this._observers].reverse());
  }

  get hasObservers(): boolean {
    return this._observers.size > 0;
  }

  addObserver(observer: T): void {
    this._observers.add(observer);
  }

  removeObserver(observer: T): void {
    this._observers.delete(observer);
  }

  observe(observer: T): () => void {
    this.addObserver(observer);
    return () => {
      this.removeObserver(observer);
    };
  }

  /**
   * Runs passed action on every observer
   */
  delegateInSyncSeries(action: ObserverAction<T>, loopInReverse?: boolean): void {
    loopInReverse ??= false;
    const observers = loopInReverse ? this._reversedObservers : this._observers;

    for (const observer of observers) {
      action(observer);
    }
  }

  /**
   * Unsubscribes from all observers
   */
  clearObservers(): void {
    this._observers.clear();
  }
}
