import { useState, useCallback } from 'react';
import {
  LightboxOverlay,
  CloseButton,
  Counter,
  FullscreenButton,
  type LightboxItem,
  type NavigationRenderProps,
} from '@reelkit/react-lightbox';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/react-lightbox/styles.css';

type DemoType =
  | 'custom-info'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-navigation'
  | 'custom-loading-error'
  | 'theming'
  | null;

const DEMOS: { id: DemoType & string; title: string; description: string }[] = [
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
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses renderLoading and renderError to replace default spinner and error icon with custom UI. Includes a broken image to demonstrate error state.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the lightbox by overriding --rk-lightbox-* CSS custom properties in a stylesheet. No component code changes.',
  },
];

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest.',
  },
  {
    src: cdnUrl('samples/images/image-07.jpg'),
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
        minHeight: '100dvh',
        backgroundColor: '#111',
        padding: '56px 16px 16px',
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

      {/* Demo 1: Custom Info */}
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
          activeIndex,
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
              <Counter currentIndex={activeIndex} count={count} />
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
              <CloseButton onClick={onClose} style={{ position: 'static' }} />
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
        renderSlide={({ index, size, onReady }) => {
          // Only customize the last slide
          if (index !== sampleImages.length - 1) return null;
          onReady();
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
        renderControls={({ onClose, isFullscreen, onToggleFullscreen }) => (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              zIndex: 10,
            }}
          >
            <FullscreenButton
              isFullscreen={isFullscreen}
              onToggle={onToggleFullscreen}
            />
            <CloseButton onClick={onClose} style={{ position: 'static' }} />
          </div>
        )}
      />

      {/* Demo 6: Custom Loading / Error */}
      <LightboxOverlay
        isOpen={activeDemo === 'custom-loading-error'}
        images={[
          ...sampleImages.slice(0, 2),
          {
            src: 'https://broken.invalid/does-not-exist.jpg',
            title: 'Broken Image',
            description: 'This image fails to load — shows custom error UI.',
          },
          ...sampleImages.slice(2, 4),
        ]}
        initialIndex={initialIndex}
        onClose={closePlayer}
        renderLoading={({ activeIndex }) => (
          <div
            style={{
              position: 'absolute',
              top: 22,
              right: 72,
              zIndex: 10,
              color: '#fff',
              fontSize: 12,
              background: 'rgba(0,0,0,0.6)',
              padding: '4px 12px',
              borderRadius: 12,
            }}
          >
            Loading slide {activeIndex + 1}...
          </div>
        )}
        renderError={({ activeIndex }) => (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              color: '#ff6b6b',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontSize: 14 }}>
              Slide {activeIndex + 1} failed to load
            </div>
          </div>
        )}
      />

      {/* Demo 7: Themed via CSS Tokens */}
      {activeDemo === 'theming' && (
        <>
          <style>{`
            .rk-lightbox-container {
              --rk-lightbox-overlay-bg: #0f172a;
              --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
              --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
              --rk-lightbox-nav-size: 56px;
              --rk-lightbox-counter-bg: rgba(99, 102, 241, 0.65);
              --rk-lightbox-info-bg: linear-gradient(
                transparent,
                rgba(99, 102, 241, 0.55) 60%,
                rgba(168, 85, 247, 0.85)
              );
            }
          `}</style>
          <LightboxOverlay
            isOpen
            images={sampleImages}
            initialIndex={initialIndex}
            onClose={closePlayer}
          />
        </>
      )}
    </div>
  );
}

export default ImagePreviewCustomPage;
