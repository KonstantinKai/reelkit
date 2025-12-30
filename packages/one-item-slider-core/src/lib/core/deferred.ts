export interface Deferred<T = void> {
  promise: Promise<T>;
  resolve: (value?: T) => void;
}

export const createDeferred = <T = void>(): Deferred<T> => {
  let resolve!: (value?: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res as (value?: T) => void;
  });
  return { promise, resolve };
};
