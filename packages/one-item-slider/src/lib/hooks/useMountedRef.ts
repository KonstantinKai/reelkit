import { MutableRefObject } from 'react';
import { useEffectiveRef } from './useEffectiveRef';
import useEffectOnce from './useEffectOnce';

const useMountedRef = (ref?: MutableRefObject<boolean>): MutableRefObject<boolean> => {
  const effectiveRef = useEffectiveRef({ ref, initial: false });

  useEffectOnce(() => {
    effectiveRef.current = true;
    return () => {
      effectiveRef.current = false;
    };
  });

  return effectiveRef;
};

export default useMountedRef;
