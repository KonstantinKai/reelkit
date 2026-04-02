import { observeDomEvent } from '../utils/observeDomEvent';
import type {
  NavKey,
  KeyboardControllerConfig,
  KeyboardControllerEvents,
  KeyboardController,
} from './types';

const _kNavKeyCodes: Record<string, NavKey | undefined> = {
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  ArrowLeft: 'left',
};

/**
 * Creates a keyboard navigation controller that listens for arrow key
 * presses and translates them into navigation callbacks. Returns
 * a {@link KeyboardController} following the factory-function pattern.
 *
 * Arrow keys are mapped to directional nav keys (`up`, `down`, `left`, `right`).
 * An optional key filter restricts which directions are forwarded. When
 * `throttleMs` is set, repeated key presses within that interval are ignored,
 * preventing rapid-fire navigation during held-down keys.
 *
 * @param config - Optional configuration (key filter list, throttle interval in ms).
 * @param events - Event callbacks; `onKeyPress` is invoked with the mapped {@link NavKey} and the original `KeyboardEvent`.
 * @returns A {@link KeyboardController} with `attach` and `detach` lifecycle methods.
 */
export const createKeyboardController = (
  config: KeyboardControllerConfig = {},
  events: KeyboardControllerEvents,
): KeyboardController => {
  const { filter = [], throttleMs = 0 } = config;

  let dispose: (() => void) | null = null;
  let lastKeyPressTime = 0;

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = _kNavKeyCodes[event.key] ?? null;
    if (key === null) return;

    if (throttleMs > 0) {
      const now = Date.now();
      if (now - lastKeyPressTime < throttleMs) {
        return;
      }
      lastKeyPressTime = now;
    }

    if (filter.length === 0 || filter.includes(key)) {
      events.onKeyPress(key, event);
    }
  };

  return {
    attach(target: Window | HTMLElement = window) {
      dispose?.();
      dispose = observeDomEvent(target, 'keydown', handleKeyDown);
    },
    detach() {
      dispose?.();
      dispose = null;
    },
  };
};
