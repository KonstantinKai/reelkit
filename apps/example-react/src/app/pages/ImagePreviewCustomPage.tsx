import { useState, useCallback } from 'react';
import {
  LightboxOverlay,
  CloseButton,
  Counter,
  FullscreenButton,
  useFullscreen,
  type LightboxItem,
  type NavigationRenderProps,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

type DemoType =
  | 'default-info'
  | 'custom-info'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-navigation'
  | null;

const DEMOS: { id: DemoType & string; title: string; description: string }[] = [
  {
    id: 'default-info',
    title: 'Default Info Overlay',
    description:
      'Built-in info overlay showing title and description. No extra props needed.',
  },
  {
    id: 'custom-info',
    title: 'Custom Info Overlay',
    description:
      'Uses renderInfo to replace the default title/description with a custom styled overlay.',
  },
  {
    id: 'custom-controls',
    title: 'Custom Controls',
    description:
      'Uses renderControls with CloseButton + Counter + FullscreenButton sub-components and a custom Download button.',
  },
  {
    id: 'custom-slide',
    title: 'Custom Slide (renderSlide)',
    description:
      'Uses renderSlide to inject a CTA card on the last slide. Other slides fall back to default.',
  },
  {
    id: 'custom-navigation',
    title: 'Custom Navigation',
    description:
      'Uses renderNavigation to replace the default prev/next arrows with pill-shaped buttons and a counter.',
  },
];

const sampleImages: LightboxItem[] = [
  {
    src: 'https://picsum.photos/id/1015/1600/1000',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
  },
  {
    src: 'https://picsum.photos/id/1016/1000/1600',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
  },
  {
    src: 'https://picsum.photos/id/1018/1600/900',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
  },
  {
    src: 'https://picsum.photos/id/1019/900/1400',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
  },
  {
    src: 'https://picsum.photos/id/1020/1600/1067',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest.',
  },
  {
    src: 'https://picsum.photos/id/1022/1600/1067',
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the sea.',
  },
];

const pillBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  borderRadius: 20,
  border: 'none',
  backgroundColor: 'rgba(255,255,255,0.15)',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.85rem',
  backdropFilter: 'blur(8px)',
};

function CustomNavigationDemo({
  onPrev,
  onNext,
  activeIndex,
  count,
}: NavigationRenderProps) {
  return (
    <div
      data-testid="custom-nav"
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
      }}
    >
      <button
        data-testid="custom-nav-prev"
        onClick={onPrev}
        disabled={activeIndex === 0}
        style={{
          ...pillBtn,
          opacity: activeIndex === 0 ? 0.3 : 1,
        }}
      >
        Prev
      </button>
      <span
        data-testid="custom-nav-counter"
        style={{ color: '#fff', fontSize: '0.85rem' }}
      >
        {activeIndex + 1} / {count}
      </span>
      <button
        data-testid="custom-nav-next"
        onClick={onNext}
        disabled={activeIndex === count - 1}
        style={{
          ...pillBtn,
          opacity: activeIndex === count - 1 ? 0.3 : 1,
        }}
      >
        Next
      </button>
    </div>
  );
}

function ImagePreviewCustomPage() {
  const [activeDemo, setActiveDemo] = useState<DemoType>(null);
  const [initialIndex] = useState(0);

  const closePlayer = useCallback(() => setActiveDemo(null), []);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#111',
        padding: '80px 16px 16px',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          Custom Lightbox
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 32,
          }}
        >
          Demonstrates render prop customization: info overlays, controls,
          navigation, and custom slides.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {DEMOS.map((demo) => (
            <div
              key={demo.id}
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <h2
                style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 500 }}
              >
                {demo.title}
              </h2>
              <p
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {demo.description}
              </p>
              <button
                data-testid={`demo-${demo.id}-open`}
                onClick={() => setActiveDemo(demo.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                }}
              >
                Open Demo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Demo 1: Default Info */}
      <LightboxOverlay
        isOpen={activeDemo === 'default-info'}
        images={sampleImages}
        initialIndex={initialIndex}
        onClose={closePlayer}
      />

      {/* Demo 2: Custom Info */}
      <LightboxOverlay
        isOpen={activeDemo === 'custom-info'}
        images={sampleImages}
        initialIndex={initialIndex}
        onClose={closePlayer}
        renderInfo={({ item }) => (
          <div
            data-testid="custom-info"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 20px',
              background: 'linear-gradient(transparent, rgba(99,102,241,0.8))',
              color: '#fff',
              zIndex: 10,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>
              {item.title}
            </div>
            {item.description && (
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: 4 }}>
                {item.description}
              </div>
            )}
          </div>
        )}
      />

      {/* Demo 3: Custom Controls */}
      <LightboxOverlay
        isOpen={activeDemo === 'custom-controls'}
        images={sampleImages}
        initialIndex={initialIndex}
        onClose={closePlayer}
        renderInfo={() => null}
        renderControls={({
          onClose,
          currentIndex,
          count,
          isFullscreen,
          onToggleFullscreen,
        }) => (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Counter currentIndex={currentIndex} count={count} />
              <FullscreenButton
                isFullscreen={isFullscreen}
                onToggle={onToggleFullscreen}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                data-testid="custom-download-btn"
                onClick={() => {
                  /* download logic */
                }}
                style={{
                  ...pillBtn,
                  fontSize: '0.75rem',
                }}
              >
                Download
              </button>
              <CloseButton onClick={onClose} />
            </div>
          </div>
        )}
      />

      {/* Demo 4: Custom Slide */}
      <LightboxOverlay
        isOpen={activeDemo === 'custom-slide'}
        images={sampleImages}
        initialIndex={initialIndex}
        onClose={closePlayer}
        renderSlide={(item, index, size) => {
          // Only customize the last slide
          if (index !== sampleImages.length - 1) return null;
          return (
            <div
              data-testid="cta-slide"
              style={{
                width: size[0],
                height: size[1],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#111',
                color: '#fff',
                gap: 16,
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                View all photos
              </h2>
              <p style={{ opacity: 0.6 }}>
                You&apos;ve reached the end of the gallery
              </p>
              <button
                style={{
                  ...pillBtn,
                  backgroundColor: '#6366f1',
                  padding: '12px 24px',
                }}
              >
                Browse Gallery
              </button>
            </div>
          );
        }}
      />

      {/* Demo 5: Custom Navigation */}
      <LightboxOverlay
        isOpen={activeDemo === 'custom-navigation'}
        images={sampleImages}
        initialIndex={initialIndex}
        onClose={closePlayer}
        renderNavigation={(props) => <CustomNavigationDemo {...props} />}
      />
    </div>
  );
}

export default ImagePreviewCustomPage;
