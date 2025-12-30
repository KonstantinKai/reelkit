import { useEffect, useRef } from 'react';

/**
 * Runs callback on component unmount.
 */
const useUnmount = (fn: () => void): void => {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
};

export default useUnmount;
