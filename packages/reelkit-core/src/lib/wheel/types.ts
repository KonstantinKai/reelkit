export type WheelDirection = 'up' | 'down' | 'left' | 'right';

export interface WheelControllerConfig {
  /** Debounce duration in ms. Default: 200 */
  debounceMs?: number;
  /** Minimum delta threshold to trigger navigation. Default: 10 */
  deltaThreshold?: number;
}

export interface WheelControllerEvents {
  onWheel: (direction: WheelDirection, event: WheelEvent) => void;
}

export interface WheelController {
  attach(target?: Window | HTMLElement): void;
  detach(): void;
}
