/* eslint-disable @typescript-eslint/no-explicit-any */

type FnWrappedResult<F extends (...args: any[]) => any> = [result: ReturnType<F> | null, error: unknown | null];

export class FnExtender<F extends (...args: any[]) => any> {
  constructor(fn: F) {
    this._fn = fn;
  }

  private _fn: F;

  runWrapped(...args: Parameters<F>): FnWrappedResult<F> {
    try {
      return [this._fn(...args), null];
    } catch (error) {
      return [null, error];
    }
  }
}
