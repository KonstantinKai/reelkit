import { useRef, useState, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const slides = [
  { title: 'Welcome', subtitle: 'Swipe or use controls', color: '#6366f1' },
  { title: 'Features', subtitle: 'Touch, keyboard & wheel', color: '#8b5cf6' },
  { title: 'Pricing', subtitle: 'Flexible plans', color: '#ec4899' },
  { title: 'Contact', subtitle: 'Get in touch', color: '#14b8a6' },
];

export function BasicSliderDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [size, setSize] = useState<[number, number]>([0, 0]);

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize([rect.width, rect.height]);
      apiRef.current?.adjust();
    }
  }, []);

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [updateSize]);

  if (size[0] === 0 || size[1] === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Reel
        count={slides.length}
        size={size}
        direction="vertical"
        enableWheel={false}
        useNavKeys={false}
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index, _indexInRange, itemSize) => (
          <div
            style={{
              width: itemSize[0],
              height: itemSize[1],
              background: `linear-gradient(135deg, ${slides[index].color}, ${slides[index].color}dd)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              userSelect: 'none',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              {slides[index].title}
            </h2>
            <p
              style={{
                fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                opacity: 0.7,
              }}
            >
              {slides[index].subtitle}
            </p>
          </div>
        )}
      >
        {/* Counter */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 12px',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            borderRadius: 12,
            fontSize: '0.75rem',
            zIndex: 10,
          }}
        >
          {currentIndex + 1} / {slides.length}
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
            count={slides.length}
            active={currentIndex}
            direction="vertical"
            radius={3}
            gap={4}
          />
        </div>
      </Reel>

      {/* Navigation buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === 0 ? 0.3 : 1,
            transition: 'opacity 0.2s',
          }}
          aria-label="Previous slide"
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={() => apiRef.current?.next()}
          disabled={currentIndex === slides.length - 1}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor:
              currentIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === slides.length - 1 ? 0.3 : 1,
            transition: 'opacity 0.2s',
          }}
          aria-label="Next slide"
        >
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
}
