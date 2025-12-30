import { MutableRefObject, useRef, useEffect } from 'react';

/**
 * Returns a ref that is true when component is mounted, false when unmounted.
 */
const useMountedRef = (): MutableRefObject<boolean> => {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return mountedRef;
};

export default useMountedRef;
