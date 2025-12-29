# @kdevsoft/one-item-slider

A headless, TikTok-style vertical slider component for React. Supports touch gestures, keyboard navigation, and smooth animations.

## Features

- Headless design - bring your own styles
- Touch gestures (swipe up/down or left/right)
- Keyboard navigation (arrow keys)
- Smooth bezier-eased animations
- Loop mode support
- Indicator component included
- TypeScript support
- No MUI or other UI framework dependencies

## Installation

```bash
npm install @kdevsoft/one-item-slider
```

## Usage

```tsx
import { OneItemSlider, OneItemSliderIndicator } from '@kdevsoft/one-item-slider';

function App() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <OneItemSlider
      count={5}
      size={[window.innerWidth, window.innerHeight]}
      direction="vertical"
      afterChange={(index) => setActiveIndex(index)}
      itemBuilder={(index) => (
        <div style={{ width: '100%', height: '100%' }}>
          Slide {index + 1}
        </div>
      )}
    >
      <OneItemSliderIndicator
        count={5}
        active={activeIndex}
      />
    </OneItemSlider>
  );
}
```

## API

### OneItemSlider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | required | Number of slides |
| size | [width, height] | required | Container dimensions |
| itemBuilder | (index, indexInRange, size) => ReactElement | required | Render function for slides |
| direction | 'horizontal' \| 'vertical' | 'vertical' | Slide direction |
| initialIndex | number | 0 | Starting slide index |
| loop | boolean | false | Enable infinite loop |
| swipeDistanceFactor | number | 0.12 | Swipe threshold (0-1) |
| transitionDuration | number | 300 | Animation duration in ms |
| useNavKeys | boolean | true | Enable keyboard navigation |
| apiRef | ref | - | Ref to access public API |
| afterChange | (index) => void | - | Callback after slide change |
| beforeChange | (index, nextIndex) => void | - | Callback before slide change |

### OneItemSliderIndicator Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| count | number | required | Total number of slides |
| active | number | required | Currently active slide index |
| radius | number | 3 | Dot radius in pixels |
| visible | number | 3 | Number of visible dots |
| renderDot | (props) => ReactElement | - | Custom dot renderer |

### Public API (via apiRef)

```typescript
interface OneItemSliderPublicApi {
  next: () => void;      // Go to next slide
  prev: () => void;      // Go to previous slide
  adjust: () => void;    // Recalculate positions (call on resize)
  observe: () => void;   // Start observing gestures
  unobserve: () => void; // Stop observing gestures
}
```

## Development

```bash
# Install dependencies
npm install

# Build the library
npx nx build one-item-slider

# Run the example app
npx nx serve example
```

## License

MIT
