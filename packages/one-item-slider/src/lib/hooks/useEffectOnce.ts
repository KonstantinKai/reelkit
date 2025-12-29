import { useEffect, EffectCallback } from 'react';

/**
 * Helper hook that runs effect function only once. Similar to `componentDidMount` for react class component
 */
const useEffectOnce = (effect: EffectCallback, effectFunction: typeof useEffect = useEffect): void => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  effectFunction(effect, []);
};

export default useEffectOnce;
