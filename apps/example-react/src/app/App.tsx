import React from 'react';
import { OneItemSlider, OneItemSliderIndicator, type OneItemSliderPublicApi } from '@kdevsoft/one-item-slider-react';

const SLIDES = [
  { id: 1, color: '#FF6B6B', title: 'Slide 1', description: 'Swipe up or down to navigate' },
  { id: 2, color: '#4ECDC4', title: 'Slide 2', description: 'Like TikTok!' },
  { id: 3, color: '#45B7D1', title: 'Slide 3', description: 'Smooth animations' },
  { id: 4, color: '#96CEB4', title: 'Slide 4', description: 'Touch or keyboard' },
  { id: 5, color: '#FFEAA7', title: 'Slide 5', description: 'Use arrow keys ↑↓' },
];

function App() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sliderRef = React.useRef<OneItemSliderPublicApi>(null);
  const [size, setSize] = React.useState<[number, number]>([window.innerWidth, window.innerHeight]);

  React.useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
      sliderRef.current?.adjust();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <OneItemSlider
        count={SLIDES.length}
        size={size}
        direction="vertical"
        loop={false}
        useNavKeys={true}
        apiRef={sliderRef}
        afterChange={(index) => setActiveIndex(index)}
        itemBuilder={(index, _indexInRange, itemSize) => (
          <div
            style={{
              width: itemSize[0],
              height: itemSize[1],
              backgroundColor: SLIDES[index].color,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#000',
            }}
          >
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{SLIDES[index].title}</h1>
            <p style={{ fontSize: '1.5rem', opacity: 0.7 }}>{SLIDES[index].description}</p>
          </div>
        )}
      >
        {/* Indicator overlay */}
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            zIndex: 10,
          }}
        >
          <OneItemSliderIndicator
            count={SLIDES.length}
            active={activeIndex}
            radius={4}
            visible={5}
            onDotClick={(index) => sliderRef.current?.goTo(index)}
          />
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 16,
            zIndex: 10,
          }}
        >
          <button
            onClick={() => sliderRef.current?.prev()}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            ↑ Previous
          </button>
          <button
            onClick={() => sliderRef.current?.next()}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Next ↓
          </button>
        </div>
      </OneItemSlider>
    </div>
  );
}

export default App;
