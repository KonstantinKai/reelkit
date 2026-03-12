import { observeDomEvent } from '../utils/observeDomEvent';
import type {
  WheelDirection,
  WheelControllerConfig,
  WheelControllerEvents,
  WheelController,
} from './types';

const DEFAULT_DEBOUNCE_MS = 200;
const DEFAULT_DELTA_THRESHOLD = 10;

/**
 * Creates a mouse wheel navigation controller that translates scroll events
 * into directional navigation callbacks. Returns a {@link WheelController}
 * following the factory-function pattern.
 *
 * The controller uses a trailing debounce strategy: scroll events are collected
 * and only the final direction is forwarded after a configurable quiet period
 * (`debounceMs`, default 200 ms). This prevents multiple rapid slide changes
 * from a single physical scroll gesture.
 *
 * A delta threshold filters out minor or accidental scroll movements. Only
 * wheel events whose absolute `deltaX` or `deltaY` meets the threshold are
 * considered. Vertical scroll is preferred when both axes exceed the threshold.
 *
 * All qualifying wheel events call `preventDefault()` to suppress default
 * page scrolling while the controller is attached.
 *
 * @param config - Optional configuration (debounce interval in ms, delta threshold).
 * @param events - Event callbacks; `onWheel` is invoked with the resolved {@link WheelDirection} and the original `WheelEvent`.
 * @returns A {@link WheelController} with `attach` and `detach` lifecycle methods.
 */
export const createWheelController = (
  config: WheelControllerConfig = {},
  events: WheelControllerEvents,
): WheelController => {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    deltaThreshold = DEFAULT_DELTA_THRESHOLD,
  } = config;

  let dispose: (() => void) | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingDirection: WheelDirection | null = null;
  let lastEvent: WheelEvent | null = null;

  const handleWheel = (event: WheelEvent) => {
    // Determine direction based on delta
    let direction: WheelDirection | null = null;

    // Prefer vertical scroll
    if (Math.abs(event.deltaY) >= deltaThreshold) {
      direction = event.deltaY > 0 ? 'down' : 'up';
    } else if (Math.abs(event.deltaX) >= deltaThreshold) {
      direction = event.deltaX > 0 ? 'right' : 'left';
    }

    if (direction === null) return;

    // Prevent page scroll
    event.preventDefault();

    // Store the direction and event for later
    pendingDirection = direction;
    lastEvent = event;

    // Clear existing timer and start new one (trailing debounce)
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      if (pendingDirection && lastEvent) {
        events.onWheel(pendingDirection, lastEvent);
        pendingDirection = null;
        lastEvent = null;
      }
      debounceTimer = null;
    }, debounceMs);
  };

  return {
    attach(target: Window | HTMLElement = window) {
      if (dispose) {
        dispose();
      }
      // Use passive: false to allow preventDefault
      dispose = observeDomEvent(target, 'wheel', handleWheel, {
        passive: false,
      });
    },
    detach() {
      if (dispose) {
        dispose();
        dispose = null;
      }
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      pendingDirection = null;
      lastEvent = null;
    },
  };
};
