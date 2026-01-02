// Components
export { default as Reel } from './lib/Reel.svelte';
export { default as ReelIndicator } from './lib/ReelIndicator.svelte';

// Re-export core types
export type {
  SliderDirection,
  SliderConfig,
  RangeExtractor,
  NavKey,
  GestureControllerConfig,
  GestureControllerEvents,
} from '@reelkit/core';
