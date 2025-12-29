import { useRef, useState, useCallback, Dispatch, SetStateAction } from 'react';
import useMountedRef from './useMountedRef';
import useUnmount from './useUnmount';

/**
 * Helper hook that efficiently works with React.useState. Helpful when you need often call setState.
 *
 * For example: you need to change some state on page scrolling
 */
const useRafStateInternal = <S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] => {
  const frame = useRef(0);
  const [state, setState] = useState(initialState);
  const mountedRef = useMountedRef();

  const setRafState = useCallback((value: S | ((prevState: S) => S)) => {
    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      if (mountedRef.current) {
        setState(value);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useUnmount(() => {
    cancelAnimationFrame(frame.current);
  });

  return [state, setRafState];
};

export const useRafState = useRafStateInternal;

export default useRafState;
