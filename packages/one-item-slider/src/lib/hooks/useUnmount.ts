import { useCallbackRef } from './useCallbackRef';
import useEffectOnce from './useEffectOnce';

/**
 * Helper hook that runs `fn` when component did unmount. Similar to `componentWillUnmount` for react class component
 */
const useUnmount = (fn: () => void): void => {
  const fnRef = useCallbackRef(fn);
  useEffectOnce(() => fnRef.current);
};

export default useUnmount;
