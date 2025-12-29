import { MutableRefObject, useRef } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
function useCallbackRef<F extends (...args: any[]) => any>(callback: F): MutableRefObject<F> {
  const ref = useRef<F>(null as unknown as F);
  ref.current = callback;
  return ref;
}

export { useCallbackRef };
