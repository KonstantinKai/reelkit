type ResolverParameter<T> = T | PromiseLike<T>;
type Resolver<T> = (value?: ResolverParameter<T>) => void;
type Rejecter = (error: unknown) => void;

/**
 * Provides a cancellation mechanism for Completer
 */
export class CompleterCancelException extends Error {
  readonly name: string = 'CompleterCancelException';

  constructor(reason?: string) {
    super(reason ?? '');
    Object.setPrototypeOf(this, CompleterCancelException.prototype);
  }
}

/**
 * A way to produce Promise objects and to complete them later with a value or error.
 */
export class Completer<R = void> {
  private _promise: Promise<R>;
  private _resolver: Resolver<R> | null = null;
  private _rejecter: Rejecter | null = null;
  private _completed: boolean = false;

  constructor() {
    this._promise = new Promise(this._assigner).finally(() => {
      this._completed = true;
    });
  }

  private _assigner = (resolve: Resolver<R>, reject: Rejecter): void => {
    this._resolver = (value?: ResolverParameter<R>) => resolve(value as R);
    this._rejecter = (error: unknown) => reject(error);
  };

  /**
   * Checks that a promise is completed
   */
  get isCompleted(): boolean {
    return this._completed;
  }

  get promise(): Promise<R> {
    return this._promise;
  }

  /**
   * Complete with value
   */
  complete(value?: ResolverParameter<R>): void {
    if (!this._completed && this._resolver) {
      this._resolver(value);
    }
  }

  /**
   * Rejects with error
   */
  completeError(error: unknown): void {
    if (!this._completed && this._rejecter) {
      this._rejecter(error);
    }
  }

  /**
   * Cancel promise by rejecting with CompleterCancelException
   */
  cancel(reason?: string): void {
    if (!this._completed && this._rejecter) {
      this._rejecter(new CompleterCancelException(reason));
    }
  }
}
