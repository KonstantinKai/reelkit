import { useCallback, KeyboardEvent as ReactKeyboardEvent } from 'react';

type UseNavKeyboardKey =
  | 'up'
  | 'right'
  | 'down'
  | 'left'
  /**
   * Special case for Modal components which can handle Escape button press
   */
  | 'escape';

type UseNavKeyboardKeysFn = (key: UseNavKeyboardKey, event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>) => void;
type UseNavKeyboardKeysResult = (event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>) => void;

const _kNavKeyCodes = new Map<string, UseNavKeyboardKey>([
  ['ArrowUp', 'up'],
  ['ArrowRight', 'right'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['Escape', 'escape'],
]);

/**
 * Note: if you will put callback from this hook to Dialog.onKeyDown prop please close it manually
 * `fn` fires permanently for Escape key
 *
 * @param fn Handler that called when event has fired
 * @param filter
 */
const useNavKeyboardKeys = (fn: UseNavKeyboardKeysFn, filter?: UseNavKeyboardKey[]): UseNavKeyboardKeysResult =>
  useCallback(
    (event: KeyboardEvent | ReactKeyboardEvent<HTMLElement>) => {
      if (process.env.NODE_ENV !== 'production') {
        if (event.type !== 'keydown') {
          console.warn('You can use this hook only with "keydown" event');
        }
      }
      const key = _kNavKeyCodes.get(event.key) ?? null;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );

export default useNavKeyboardKeys;
export type { UseNavKeyboardKey, UseNavKeyboardKeysFn };
