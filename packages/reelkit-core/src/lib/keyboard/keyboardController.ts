import { observeDomEvent } from '../utils/observeDomEvent';
import type { NavKey, KeyboardControllerConfig, KeyboardControllerEvents, KeyboardController } from './types';

const NAV_KEY_CODES = new Map<string, NavKey>([
  ['ArrowUp', 'up'],
  ['ArrowRight', 'right'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['Escape', 'escape'],
]);

export const createKeyboardController = (
  config: KeyboardControllerConfig = {},
  events: KeyboardControllerEvents
): KeyboardController => {
  const { filter = [], throttleMs = 0 } = config;

  let dispose: (() => void) | null = null;
  let lastKeyPressTime = 0;

  const handleKeyDown = (event: KeyboardEvent) => {
    const key = NAV_KEY_CODES.get(event.key) ?? null;
    if (key === null) return;

    // Apply throttling if configured
    if (throttleMs > 0) {
      const now = Date.now();
      if (now - lastKeyPressTime < throttleMs) {
        return;
      }
      lastKeyPressTime = now;
    }

    // Always allow escape
    if (key === 'escape') {
      events.onKeyPress(key, event);
      return;
    }

    // Check filter
    if (filter.length === 0 || filter.includes(key)) {
      events.onKeyPress(key, event);
    }
  };

  return {
    attach(target: Window | HTMLElement = window) {
      if (dispose) {
        dispose();
      }
      dispose = observeDomEvent(target, 'keydown', handleKeyDown);
    },
    detach() {
      if (dispose) {
        dispose();
        dispose = null;
      }
    },
  };
};
