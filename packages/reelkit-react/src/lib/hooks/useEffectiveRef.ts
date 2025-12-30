import { MutableRefObject, useRef } from 'react';

/**
 * Returns provided ref or creates internal one.
 */
export const useEffectiveRef = <T>(ref?: MutableRefObject<T | null>): MutableRefObject<T | null> => {
  const internalRef = useRef<T | null>(null);
  return ref ?? internalRef;
};
