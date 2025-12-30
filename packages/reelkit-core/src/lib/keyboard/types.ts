export type NavKey = 'up' | 'right' | 'down' | 'left' | 'escape';

export interface KeyboardControllerConfig {
  /** Keys to listen for. If empty, all nav keys are accepted. */
  filter?: NavKey[];
  /** Throttle duration in ms. If 0, no throttling. */
  throttleMs?: number;
}

export interface KeyboardControllerEvents {
  onKeyPress: (key: NavKey, event: KeyboardEvent) => void;
}

export interface KeyboardController {
  attach(target?: Window | HTMLElement): void;
  detach(): void;
}
