import React from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';

const TOTAL_SLIDES = 10000;

// Generate color from index using HSL for nice variety
const getSlideColor = (index: number): string => {
  const hue = (index * 37) % 360; // Golden angle for good distribution
  return `hsl(${hue}, 70%, 65%)`;
};

// Generate slide content from index
const getSlideContent = (index: number) => ({
  title: `Slide ${index + 1}`,
  description:
    index === 0
      ? 'Swipe up or down to navigate'
      : `Item #${index + 1} of ${TOTAL_SLIDES.toLocaleString()}`,
});

function App() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sliderRef = React.useRef<ReelApi>(null);
  const [size, setSize] = React.useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [goToValue, setGoToValue] = React.useState('');

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
      <Reel
        count={TOTAL_SLIDES}
        size={size}
        direction="vertical"
        loop={false}
        useNavKeys={true}
        apiRef={sliderRef}
        afterChange={(index) => setActiveIndex(index)}
        itemBuilder={(index, _indexInRange, itemSize) => {
          const slide = getSlideContent(index);
          return (
            <div
              style={{
                width: itemSize[0],
                height: itemSize[1],
                backgroundColor: getSlideColor(index),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#000',
              }}
            >
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {slide.title}
              </h1>
              <p style={{ fontSize: '1.5rem', opacity: 0.7 }}>
                {slide.description}
              </p>
            </div>
          );
        }}
      >
        {/* Current position indicator */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            borderRadius: 20,
            fontSize: '0.9rem',
            zIndex: 10,
          }}
        >
          {(activeIndex + 1).toLocaleString()} / {TOTAL_SLIDES.toLocaleString()}
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

        {/* Go to index control */}
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 10,
          }}
        >
          <input
            type="number"
            min={1}
            max={TOTAL_SLIDES}
            value={goToValue}
            onChange={(e) => setGoToValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const index = parseInt(goToValue, 10) - 1;
                if (index >= 0 && index < TOTAL_SLIDES) {
                  sliderRef.current?.goTo(index, true);
                }
              }
            }}
            placeholder="Slide #"
            style={{
              padding: '12px 16px',
              fontSize: '1rem',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              width: 100,
              outline: 'none',
            }}
          />
          <button
            onClick={() => {
              const index = parseInt(goToValue, 10) - 1;
              if (index >= 0 && index < TOTAL_SLIDES) {
                sliderRef.current?.goTo(index, true);
              }
            }}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Go
          </button>
        </div>

        {/* Indicator */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          <ReelIndicator
            count={TOTAL_SLIDES}
            active={activeIndex}
            direction="vertical"
            visible={4}
            radius={4}
            gap={6}
            onDotClick={(index) => sliderRef.current?.goTo(index, true)}
          />
        </div>
      </Reel>
    </div>
  );
}

export default App;
