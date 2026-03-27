import { abs } from '../utils/number';
import { timeout } from '../utils/timeout';
import { createDisposableList } from '../utils/disposable';
import { observeDomEvent } from '../utils/observeDomEvent';
import type {
  WheelDirection,
  WheelControllerConfig,
  WheelControllerEvents,
  WheelController,
} from './types';

const _kDefaultDebounceMs = 200;
const _kDefaultDeltaThreshold = 10;

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
    debounceMs = _kDefaultDebounceMs,
    deltaThreshold = _kDefaultDeltaThreshold,
  } = config;

  const disposables = createDisposableList();
  let pendingDirection: WheelDirection | null = null;
  let lastEvent: WheelEvent | null = null;

  const flush = timeout(() => {
    if (pendingDirection && lastEvent) {
      events.onWheel(pendingDirection, lastEvent);
      pendingDirection = null;
      lastEvent = null;
    }
  }, debounceMs);

  const handleWheel = (event: WheelEvent) => {
    let direction: WheelDirection | null = null;

    if (abs(event.deltaY) >= deltaThreshold) {
      direction = event.deltaY > 0 ? 'down' : 'up';
    } else if (abs(event.deltaX) >= deltaThreshold) {
      direction = event.deltaX > 0 ? 'right' : 'left';
    }

    if (direction === null) return;

    event.preventDefault();

    pendingDirection = direction;
    lastEvent = event;
    flush.cancel();
    flush();
  };

  return {
    attach(target: Window | HTMLElement = window) {
      disposables.dispose();
      disposables.push(
        observeDomEvent(target, 'wheel', handleWheel, { passive: false }),
        flush.cancel,
        () => {
          pendingDirection = null;
          lastEvent = null;
        },
      );
    },
    detach: disposables.dispose,
  };
};
