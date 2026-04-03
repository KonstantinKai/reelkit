import { useRef, useState, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import {
  ChevronUp,
  ChevronDown,
  Zap,
  Hand,
  Layers,
  Keyboard,
  Monitor,
  Gauge,
} from 'lucide-react';

const slides = [
  {
    icon: Zap,
    title: 'Virtualized',
    subtitle: 'Only 3 slides in DOM',
    color: '#6366f1',
  },
  {
    icon: Hand,
    title: 'Touch First',
    subtitle: 'Native swipe gestures',
    color: '#8b5cf6',
  },
  {
    icon: Layers,
    title: 'Zero Deps',
    subtitle: 'Tiny bundle size',
    color: '#7c3aed',
  },
  {
    icon: Keyboard,
    title: 'Keyboard Nav',
    subtitle: 'Full a11y support',
    color: '#ec4899',
  },
  {
    icon: Monitor,
    title: 'SSR Ready',
    subtitle: 'Works everywhere',
    color: '#14b8a6',
  },
  {
    icon: Gauge,
    title: '60fps',
    subtitle: 'Smooth animations',
    color: '#f59e0b',
  },
];

const AUTO_ADVANCE_MS = 3000;

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

  // Auto-advance timer
  useEffect(() => {
    if (size[0] === 0 || size[1] === 0) return;
    const id = setInterval(() => apiRef.current?.next(), AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [size]);

  if (size[0] === 0 || size[1] === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Reel
        count={slides.length}
        size={size}
        direction="vertical"
        loop
        enableWheel={false}
        enableNavKeys={false}
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        style={{ pointerEvents: 'none' }}
        itemBuilder={(index, _indexInRange, itemSize) => {
          const slide = slides[index];
          const Icon = slide.icon;
          return (
            <div
              style={{
                width: itemSize[0],
                height: itemSize[1],
                background: `linear-gradient(160deg, ${slide.color}, ${slide.color}aa)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                userSelect: 'none',
                gap: 6,
              }}
            >
              <Icon size={32} strokeWidth={1.5} style={{ opacity: 0.9 }} />
              <h2
                style={{
                  fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {slide.title}
              </h2>
              <p
                style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                  opacity: 0.6,
                }}
              >
                {slide.subtitle}
              </p>
            </div>
          );
        }}
      >
        {/* Counter */}
        <div
          style={{
            position: 'absolute',
            top: 28,
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
          <ReelIndicator direction="vertical" radius={3} gap={4} />
        </div>
      </Reel>

      {/* Navigation buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => apiRef.current?.prev()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Previous slide"
        >
          <ChevronUp size={18} />
        </button>
        <button
          onClick={() => apiRef.current?.next()}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Next slide"
        >
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
}
