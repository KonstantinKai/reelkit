/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useCallbackRef } from './useCallbackRef';
import useUnmount from './useUnmount';

type UseTimeoutCallback = (...args: any[]) => void;

export type UseTimeoutResult = [useTimeoutCallback: UseTimeoutCallback, cancel: () => void];

const useTimeout = (fn: UseTimeoutCallback, ms: number): UseTimeoutResult => {
  const fnRef = useCallbackRef(fn);
  const [wrapped] = useState(() => timeout((...args) => fnRef.current(...args), ms));

  useUnmount(wrapped.cancel);

  return [wrapped, wrapped.cancel];
};

/**
 * @param callback function
 * @param timeout delay in milliseconds
 * @default 0
 */
const timeout = <F extends (...args: any[]) => any>(callback: F, timeoutMs = 0): F & { cancel: () => void; fn: F } => {
  let id = -1;

  const cancel = (): void => {
    if (id === -1) return;
    clearTimeout(id);
    id = -1;
  };

  const enhanced = (...args: Parameters<F>): void => {
    id = setTimeout(() => callback(...args), timeoutMs) as unknown as number;
  };

  enhanced.cancel = cancel;
  enhanced.fn = callback;

  return enhanced as F & { cancel: () => void; fn: F };
};

export { useTimeout, timeout };

export default useTimeout;
