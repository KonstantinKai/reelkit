import { useLayoutEffect, useEffect } from 'react';

export const useIsomorphLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
