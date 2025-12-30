import { useCallback, KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { NavKey } from '@kdevsoft/one-item-slider-core';

export type UseNavKeyboardKeysFn = (
  key: NavKey,
  event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>
) => void;

export type UseNavKeyboardKeysResult = (
  event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>
) => void;

const NAV_KEY_CODES = new Map<string, NavKey>([
  ['ArrowUp', 'up'],
  ['ArrowRight', 'right'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['Escape', 'escape'],
]);

/**
 * Hook to handle navigation keyboard keys
 */
const useNavKeyboardKeys = (
  fn: UseNavKeyboardKeysFn,
  filter?: NavKey[]
): UseNavKeyboardKeysResult =>
  useCallback(
    (event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>) => {
      const key = NAV_KEY_CODES.get(event.key) ?? null;
      const effectiveFilter = filter ?? [];

      if (key !== null) {
        if (key === 'escape') {
          fn(key, event);
        }

        if (effectiveFilter.length > 0) {
          if (effectiveFilter.includes(key)) {
            fn(key, event);
          }
        } else {
          fn(key, event);
        }
      }
    },
    [fn, filter]
  );

export default useNavKeyboardKeys;
export type { NavKey };
