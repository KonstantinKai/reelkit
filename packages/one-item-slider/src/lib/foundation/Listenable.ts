import { ObservableMixin } from './Observable';

export type ListenableListener = () => void;

interface ListenableObserver {
  onChanged(): void;
}

export abstract class Listenable {
  private _manager = new ObservableMixin<ListenableObserver>();
  private _observersListenerMap = new WeakMap<ListenableListener, ListenableObserver>();

  protected get hasListeners(): boolean {
    return this._manager.hasObservers;
  }

  addListener(listener: ListenableListener): void {
    const observer: ListenableObserver = { onChanged: listener };
    this._observersListenerMap.set(listener, observer);
    this._manager.addObserver(observer);
  }

  removeListener(listener: ListenableListener): void {
    const observer = this._observersListenerMap.get(listener);
    if (observer) {
      this._observersListenerMap.delete(listener);
      this._manager.removeObserver(observer);
    }
  }

  observe(listener: ListenableListener): () => void {
    this.addListener(listener);
    return () => {
      this.removeListener(listener);
    };
  }

  notifyListeners(): void {
    this._manager.delegateInSyncSeries((observer) => observer.onChanged());
  }
}
