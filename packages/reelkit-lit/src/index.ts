// Import components for side effects (registers custom elements)
import './lib/reel-slider';
import './lib/reel-indicator';

// Components
export { ReelSlider } from './lib/reel-slider';
export { ReelIndicator } from './lib/reel-indicator';

// Types
export type {
  ReelSliderConfig,
  ReelIndicatorConfig,
  SliderDirection,
  RangeExtractor,
} from './lib/types';
