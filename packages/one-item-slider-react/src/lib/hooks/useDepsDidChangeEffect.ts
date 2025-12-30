import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

/**
 * Runs effect only when deps change, skipping the initial mount.
 */
const useDepsDidChangeEffect = (effect: EffectCallback, deps: DependencyList): void => {
  const didMountRef = useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      return effect();
    }
    didMountRef.current = true;
    return () => {
      didMountRef.current = false;
    };
  }, deps);
};

export default useDepsDidChangeEffect;
