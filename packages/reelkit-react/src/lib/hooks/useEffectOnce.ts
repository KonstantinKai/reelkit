import { useEffect, EffectCallback } from 'react';

/**
 * Runs effect only once on mount. Similar to componentDidMount.
 */
const useEffectOnce = (effect: EffectCallback): void => {
  useEffect(effect, []);
};

export default useEffectOnce;
