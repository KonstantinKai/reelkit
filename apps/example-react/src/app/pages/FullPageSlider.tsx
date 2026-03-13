import React from 'react';
import { Reel, ReelIndicator, useBodyLock, type ReelApi } from '@reelkit/react';

const TOTAL_SLIDES = 10000;
const SIZE_MODE_KEY = 'reelkit-fullpage-size-mode';

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

type SizeMode = 'explicit' | 'auto';

function FullPageSlider() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sliderRef = React.useRef<ReelApi>(null);
  const [sizeMode, setSizeMode] = React.useState<SizeMode>(
    () => (localStorage.getItem(SIZE_MODE_KEY) as SizeMode) || 'explicit',
  );
  const [size, setSize] = React.useState<[number, number]>([
    window.innerWidth,
    window.innerHeight,
  ]);
  const [goToValue, setGoToValue] = React.useState('');

  // Lock body scroll to prevent browser chrome movement on mobile
  useBodyLock(true);

  const toggleSizeMode = () => {
    const next = sizeMode === 'explicit' ? 'auto' : 'explicit';
    localStorage.setItem(SIZE_MODE_KEY, next);
    setSizeMode(next);
  };

  React.useEffect(() => {
    if (sizeMode !== 'explicit') return;

    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
      sliderRef.current?.adjust();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sizeMode]);

  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <Reel
        count={TOTAL_SLIDES}
        {...(sizeMode === 'explicit' ? { size } : {})}
        direction="vertical"
        loop={false}
        useNavKeys={true}
        enableWheel={true}
        apiRef={sliderRef}
        afterChange={(index) => setActiveIndex(index)}
        style={
          sizeMode === 'auto' ? { width: '100%', height: '100%' } : undefined
        }
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
            top: 48,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 14px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            borderRadius: 20,
            fontSize: '0.8rem',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {(activeIndex + 1).toLocaleString()} / {TOTAL_SLIDES.toLocaleString()}
        </div>

        {/* Size mode toggle */}
        <button
          onClick={toggleSizeMode}
          style={{
            position: 'absolute',
            top: 48,
            right: 40,
            padding: '6px 12px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: '#fff',
            border: 'none',
            borderRadius: 20,
            fontSize: '0.75rem',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          size: {sizeMode === 'explicit' ? `[${size[0]}, ${size[1]}]` : 'auto'}
        </button>

        {/* Bottom controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            zIndex: 10,
          }}
        >
          {/* Go to index control */}
          <div style={{ display: 'flex', gap: 8 }}>
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
                padding: '10px 14px',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                width: 90,
                outline: 'none',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
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
                padding: '10px 20px',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              Go
            </button>
          </div>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => sliderRef.current?.prev()}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              ↑ Previous
            </button>
            <button
              onClick={() => sliderRef.current?.next()}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              Next ↓
            </button>
          </div>
        </div>

        {/* Indicator */}
        <div
          style={{
            position: 'absolute',
            right: 12,
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

export default FullPageSlider;
