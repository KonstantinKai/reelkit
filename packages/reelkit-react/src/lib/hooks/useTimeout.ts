/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react';
import { timeout, type TimeoutFn } from '@reelkit/core';
import useUnmount from './useUnmount';

type UseTimeoutCallback = (...args: any[]) => void;
export type UseTimeoutResult = [useTimeoutCallback: UseTimeoutCallback, cancel: () => void];

const useTimeout = (fn: UseTimeoutCallback, ms: number): UseTimeoutResult => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [wrapped] = useState(() => timeout((...args) => fnRef.current(...args), ms));

  useUnmount(wrapped.cancel);

  return [wrapped, wrapped.cancel];
};

export { useTimeout, timeout };
export default useTimeout;
