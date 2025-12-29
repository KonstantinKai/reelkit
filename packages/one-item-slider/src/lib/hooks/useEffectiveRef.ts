import { MutableRefObject, useRef } from 'react';

export interface UseEffectiveRefProps<T> {
  ref?: MutableRefObject<T | null>;
  initial?: T;
}

export const useEffectiveRef = <T>(props?: UseEffectiveRefProps<T>): MutableRefObject<T | null> => {
  const internalRef = useRef<T>(props?.initial ?? null);
  const effectiveRef = props?.ref ?? internalRef;
  return effectiveRef;
};
