import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

/**
 * Skip running effect for the first time
 */
const useDepsDidChangeEffect = (
  effect: EffectCallback,
  deps: DependencyList,
  effectFunction: typeof useEffect = useEffect,
): void => {
  const changeAmountRef = useRef(0);

  effectFunction(() => {
    if (changeAmountRef.current > 0) {
      effect();
      return;
    }

    changeAmountRef.current++;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useDepsDidChangeEffect;
