// Web Components
export { ReelSlider } from './lib/ReelSlider';
export { ReelIndicator } from './lib/ReelIndicator';

// Types
export type { ItemBuilder, ReelSliderEvents } from './lib/ReelSlider';

// Re-export core types that are commonly used
export type { SliderDirection, RangeExtractor } from '@reelkit/core';

// Side effect: register custom elements when module is imported
import './lib/ReelSlider';
import './lib/ReelIndicator';
