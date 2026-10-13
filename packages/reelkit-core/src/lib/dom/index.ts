export { observeDomEvent } from './observeDomEvent';
export { observeElementSize } from './observeElementSize';
export {
  getViewportSize,
  observeViewportSize,
  isMobileWidth,
  fitAspectRatio,
  isTouchDevice,
} from './viewportSize';

export {
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
} from './fullscreen';

export { createBodyLock, sharedBodyLock, type BodyLock } from './bodyLock';

export {
  captureFocusForReturn,
  createFocusTrap,
  getFocusableElements,
} from './focus';
