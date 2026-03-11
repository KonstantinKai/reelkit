import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function BasicExample() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">Basic Slider</h1>
      <p className="docs-description">
        A simple vertical slider with navigation controls and indicators.
      </p>

      <section className="docs-section">
        <h2>Overview</h2>
        <p>
          This example demonstrates the fundamental usage of reelkit components
          to create a basic vertical slider with touch, keyboard, and button navigation.
        </p>
        <ul>
          <li>Touch/swipe gestures with momentum</li>
          <li>Keyboard navigation (Arrow keys, Home, End)</li>
          <li>Instagram-style indicators</li>
          <li>Navigation buttons via apiRef</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>Code</h2>
        <CodeBlock
          title="BasicSlider.tsx"
          code={`import { useRef, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const slides = [
  { id: 1, title: 'Welcome', color: '#6366f1' },
  { id: 2, title: 'Features', color: '#8b5cf6' },
  { id: 3, title: 'Pricing', color: '#ec4899' },
  { id: 4, title: 'Contact', color: '#14b8a6' },
];

export default function BasicSlider() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <Reel
        count={slides.length}
        size={[window.innerWidth, window.innerHeight]}
        direction="vertical"
        enableWheel
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index) => (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: slides[index].color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {slides[index].title}
          </div>
        )}
      >
        <ReelIndicator count={slides.length} />
      </Reel>

      {/* Navigation buttons */}
      <div className="nav-buttons">
        <button
          onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}
          aria-label="Previous slide"
        >
          <ChevronUp />
        </button>
        <button
          onClick={() => apiRef.current?.next()}
          disabled={currentIndex === slides.length - 1}
          aria-label="Next slide"
        >
          <ChevronDown />
        </button>
      </div>
    </div>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Styles</h2>
        <CodeBlock
          title="BasicSlider.css"
          lang="css"
          code={`.nav-buttons {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.nav-buttons button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-buttons button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.nav-buttons button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Key Points</h2>
        <ul>
          <li>
            <strong>size prop</strong> - Must specify [width, height] for the slider container
          </li>
          <li>
            <strong>itemBuilder</strong> - Receives index and returns the slide content
          </li>
          <li>
            <strong>apiRef</strong> - Access controller methods for navigation
          </li>
          <li>
            <strong>afterChange</strong> - Track current index for UI updates
          </li>
        </ul>
      </section>
    </div>
  );
}
