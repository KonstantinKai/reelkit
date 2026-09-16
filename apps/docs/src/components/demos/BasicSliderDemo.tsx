/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useCallback, useEffect } from 'react';
import {
  createSignal,
  Observe,
  reaction,
  Reel,
  ReelIndicator,
  type ReelApi,
} from '@reelkit/react';
import { cdnUrl } from '@reelkit/example-data';
import heroSlide1 from '../../assets/demo/slide-1.webp?url';
import heroSlide2 from '../../assets/demo/slide-2.webp?url';
import heroSlide3 from '../../assets/demo/slide-3.webp?url';
import heroSlide4 from '../../assets/demo/slide-4.webp?url';
import heroSlide5 from '../../assets/demo/slide-5.webp?url';
import heroSlide6 from '../../assets/demo/slide-6.webp?url';
import heroSlide7 from '../../assets/demo/slide-7.webp?url';
import {
  ChevronUp,
  ChevronDown,
  Zap,
  Hand,
  Layers,
  Keyboard,
  Monitor,
  Gauge,
  Link2,
} from 'lucide-react';

const slides = [
  {
    icon: Zap,
    title: 'Virtualized',
    subtitle: 'Only 3 slides in DOM',
    image: cdnUrl('samples/images/image-07.jpg'),
    heroImage: heroSlide1,
  },
  {
    icon: Hand,
    title: 'Touch First',
    subtitle: 'Native swipe gestures',
    image: cdnUrl('samples/images/image-02.jpg'),
    heroImage: heroSlide2,
  },
  {
    icon: Layers,
    title: 'Zero Deps',
    subtitle: 'Tiny bundle size',
    image: cdnUrl('samples/images/image-03.jpg'),
    heroImage: heroSlide3,
  },
  {
    icon: Keyboard,
    title: 'Keyboard Nav',
    subtitle: 'Full a11y support',
    image: cdnUrl('samples/images/image-09.jpg'),
    heroImage: heroSlide4,
  },
  {
    icon: Monitor,
    title: 'SSR Ready',
    subtitle: 'Works everywhere',
    image: cdnUrl('samples/images/image-05.jpg'),
    heroImage: heroSlide5,
  },
  {
    icon: Gauge,
    title: '60fps',
    subtitle: 'Smooth animations',
    image: cdnUrl('samples/images/image-06.jpg'),
    heroImage: heroSlide6,
  },
  {
    icon: Link2,
    title: 'Shareable URL State',
    subtitle: 'Deep-link & back to close',
    image: cdnUrl('samples/images/image-08.jpg'),
    heroImage: heroSlide7,
  },
];

const AUTO_ADVANCE_MS = 3000;

/**
 * Preload for the first hero slide, for the home page's route `links`. The
 * browser starts the download from the HTML head, before any script runs.
 */
export const heroSlidePreloadLinks = () => [
  { rel: 'preload', as: 'image', href: heroSlide1, fetchpriority: 'high' },
];

// React 18 does not know `fetchPriority` and drops it, so the lowercase
// attribute is passed through as a plain HTML attribute.
const highFetchPriority = { fetchpriority: 'high' } as Record<string, string>;

interface SlideProps {
  slide: (typeof slides)[number];
  /** Use the small WebP made for the home page phone frame. */
  hero: boolean;
  /** The first slide the page shows: fetched early, never lazily. */
  priority: boolean;
  width: number | string;
  height: number | string;
}

function Slide({ slide, hero, priority, width, height }: SlideProps) {
  const Icon = slide.icon;
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        userSelect: 'none',
        gap: 6,
        overflow: 'hidden',
      }}
    >
      {/* A real image rather than a CSS background, so the browser finds it
          in the HTML and can count it as the page's largest paint. */}
      <img
        src={hero ? slide.heroImage : slide.image}
        alt=""
        width={390}
        height={690}
        decoding="async"
        {...(priority ? highFetchPriority : { loading: 'lazy' })}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {/* Dark scrim so the icon and labels stay legible over any image. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(160deg, rgba(15,23,42,0.45), rgba(15,23,42,0.7))',
        }}
      />
      <Icon
        size={32}
        strokeWidth={1.5}
        style={{ opacity: 0.9, position: 'relative' }}
      />
      <h2
        style={{
          position: 'relative',
          fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          textAlign: 'center',
          padding: '0 16px',
        }}
      >
        {slide.title}
      </h2>
      <p
        style={{
          position: 'relative',
          fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
          opacity: 0.6,
          textAlign: 'center',
        }}
      >
        {slide.subtitle}
      </p>
    </div>
  );
}

export function BasicSliderDemo({ priority = false }: { priority?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReelApi>(null);
  const [{ currentIndex, size, manualSteps }] = useState(() => ({
    currentIndex: createSignal(0),
    size: createSignal<[number, number]>([0, 0]),
    // Bumped by the arrow buttons: a slide the reader picked gets the full
    // interval instead of whatever was left of the previous one.
    manualSteps: createSignal(0),
  }));

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const [width, height] = size.value;
      if (rect.width !== width || rect.height !== height) {
        size.value = [rect.width, rect.height];
      }
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

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const restart = () => {
      clearInterval(timer);
      const [width, height] = size.value;
      if (width === 0 || height === 0) return;
      timer = setInterval(() => apiRef.current?.next(), AUTO_ADVANCE_MS);
    };
    restart();
    const dispose = reaction(() => [size, manualSteps], restart);
    return () => {
      dispose();
      clearInterval(timer);
    };
  }, []);

  const step = (direction: 'prev' | 'next') => {
    apiRef.current?.[direction]();
    manualSteps.value += 1;
  };

  const renderDemo = () => {
    // Until the frame is measured — including the prerendered HTML — the first
    // slide stands in for the slider in the same box, so the page shows it at
    // once and nothing moves when the slider takes over.
    if (size.value[0] === 0 || size.value[1] === 0) {
      return (
        <div ref={containerRef} className="w-full h-full">
          <Slide
            slide={slides[0]}
            hero={priority}
            priority={priority}
            width="100%"
            height="100%"
          />
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full h-full relative">
        <Reel
          count={slides.length}
          size={size.value}
          direction="vertical"
          loop
          enableWheel={false}
          enableNavKeys={false}
          apiRef={apiRef}
          afterChange={(index) => (currentIndex.value = index)}
          style={{ pointerEvents: 'none' }}
          itemBuilder={(index, _indexInRange, itemSize) => (
            <Slide
              slide={slides[index]}
              hero={priority}
              priority={priority && index === 0}
              width={itemSize[0]}
              height={itemSize[1]}
            />
          )}
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
            <Observe signals={[currentIndex]}>
              {() => (
                <>
                  {currentIndex.value + 1} / {slides.length}
                </>
              )}
            </Observe>
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
            onClick={() => step('prev')}
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
            onClick={() => step('next')}
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
  };

  return <Observe signals={[size]}>{renderDemo}</Observe>;
}
