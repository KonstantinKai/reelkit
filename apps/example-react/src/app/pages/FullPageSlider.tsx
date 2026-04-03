import React from 'react';
import { Reel, ReelIndicator, useBodyLock, type ReelApi } from '@reelkit/react';

const TOTAL_SLIDES = 10000;
const NESTED_ITEM_COUNT = 10;
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
type IndicatorMode = 'auto' | 'controlled';

const INDICATOR_MODE_KEY = 'reelkit-fullpage-indicator-mode';
const NAV_KEYS_KEY = 'reelkit-fullpage-nav-keys';
const WHEEL_KEY = 'reelkit-fullpage-wheel';

function FullPageSlider() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const sliderRef = React.useRef<ReelApi>(null);
  const [sizeMode, setSizeMode] = React.useState<SizeMode>(
    () => (localStorage.getItem(SIZE_MODE_KEY) as SizeMode) || 'explicit',
  );
  const [indicatorMode, setIndicatorMode] = React.useState<IndicatorMode>(
    () => (localStorage.getItem(INDICATOR_MODE_KEY) as IndicatorMode) || 'auto',
  );
  const [navKeys, setNavKeys] = React.useState(
    () => localStorage.getItem(NAV_KEYS_KEY) !== 'false',
  );
  const [wheel, setWheel] = React.useState(
    () => localStorage.getItem(WHEEL_KEY) !== 'false',
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

  const toggleIndicatorMode = () => {
    const next = indicatorMode === 'auto' ? 'controlled' : 'auto';
    localStorage.setItem(INDICATOR_MODE_KEY, next);
    setIndicatorMode(next);
  };

  const toggleNavKeys = () => {
    const next = !navKeys;
    localStorage.setItem(NAV_KEYS_KEY, String(next));
    setNavKeys(next);
  };

  const toggleWheel = () => {
    const next = !wheel;
    localStorage.setItem(WHEEL_KEY, String(next));
    setWheel(next);
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
    <div
      style={{
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        overscrollBehavior: 'none',
      }}
    >
      <Reel
        count={TOTAL_SLIDES}
        {...(sizeMode === 'explicit' ? { size } : {})}
        direction="vertical"
        loop={false}
        enableNavKeys={navKeys}
        enableWheel={wheel}
        apiRef={sliderRef}
        afterChange={(index) => setActiveIndex(index)}
        style={
          sizeMode === 'auto' ? { width: '100%', height: '100%' } : undefined
        }
        itemBuilder={(index, _indexInRange, itemSize) => {
          const slide = getSlideContent(index);
          const isNested = index % 3 === 2;

          if (isNested) {
            return (
              <Reel
                count={NESTED_ITEM_COUNT}
                size={[itemSize[0], itemSize[1]]}
                direction="horizontal"
                loop
                enableNavKeys={navKeys}
                enableWheel={wheel}
                itemBuilder={(nestedIndex, _, nestedSize) => (
                  <div
                    style={{
                      width: nestedSize[0],
                      height: nestedSize[1],
                      backgroundColor: getSlideColor(
                        index * NESTED_ITEM_COUNT + nestedIndex,
                      ),
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#000',
                    }}
                  >
                    <h1 style={{ fontSize: '2.5rem', marginBottom: 8 }}>
                      Slide {index + 1}.{nestedIndex + 1}
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>
                      Swipe left or right
                    </p>
                  </div>
                )}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: 160,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                  }}
                >
                  <ReelIndicator
                    direction="horizontal"
                    visible={4}
                    radius={3}
                    gap={5}
                  />
                </div>
              </Reel>
            );
          }

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

        {/* Right-side toggles */}
        <div
          style={{
            position: 'absolute',
            top: 48,
            right: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 10,
          }}
        >
          <button
            onClick={toggleSizeMode}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              fontSize: '0.75rem',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            size:{' '}
            {sizeMode === 'explicit' ? `[${size[0]}, ${size[1]}]` : 'auto'}
          </button>
          <button
            onClick={toggleIndicatorMode}
            data-testid="indicator-mode-toggle"
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              fontSize: '0.75rem',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            indicator: {indicatorMode}
          </button>
          <button
            onClick={toggleNavKeys}
            style={{
              padding: '6px 12px',
              backgroundColor: navKeys
                ? 'rgba(0,0,0,0.5)'
                : 'rgba(255,0,0,0.4)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              fontSize: '0.75rem',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            navKeys: {navKeys ? 'on' : 'off'}
          </button>
          <button
            onClick={toggleWheel}
            style={{
              padding: '6px 12px',
              backgroundColor: wheel ? 'rgba(0,0,0,0.5)' : 'rgba(255,0,0,0.4)',
              color: '#fff',
              border: 'none',
              borderRadius: 20,
              fontSize: '0.75rem',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            wheel: {wheel ? 'on' : 'off'}
          </button>
        </div>

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
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onBlur={() => {
                window.scrollTo(0, 0);
                sliderRef.current?.adjust();
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
            direction="vertical"
            visible={4}
            radius={4}
            gap={6}
            onDotClick={(index) => sliderRef.current?.goTo(index, true)}
            {...(indicatorMode === 'controlled'
              ? { count: TOTAL_SLIDES, active: activeIndex }
              : {})}
          />
        </div>
      </Reel>
    </div>
  );
}

export default FullPageSlider;
