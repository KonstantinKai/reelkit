import React, { useState, useMemo } from 'react';
import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
  type ContentItem,
  type NavigationRenderProps,
} from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';
import { generateContent } from '../components/reel-player/mockContent';

type DemoType =
  | 'default-overlay'
  | 'custom-overlay'
  | 'custom-controls'
  | 'custom-slide'
  | 'custom-nested-nav'
  | null;

const DEMOS: {
  id: DemoType & string;

  title: string;

  description: string;
}[] = [
  {
    id: 'default-overlay',
    title: 'Default Slide Overlay',
    description:
      'Built-in overlay showing author, description, and likes. No extra props needed.',
  },
  {
    id: 'custom-overlay',
    title: 'Custom Slide Overlay',
    description:
      'Uses renderSlideOverlay to replace the default overlay with a custom branded UI.',
  },
  {
    id: 'custom-controls',
    title: 'Custom Controls',
    description:
      'Uses renderControls with CloseButton + SoundButton sub-components and a custom Share button. Slide overlay is hidden via renderSlideOverlay={() => null}.',
  },
  {
    id: 'custom-slide',
    title: 'Custom Slide (renderSlide)',
    description:
      'Uses renderSlide to inject a CTA card on the last slide. Other slides fall back to default.',
  },
  {
    id: 'custom-nested-nav',
    title: 'Custom Nested Navigation',
    description:
      'Uses renderNestedNavigation to replace the default left/right arrows inside multi-media slides with custom pill-shaped buttons.',
  },
];

const CONTENT_COUNT = 10;

// Content sorted with multi-media items first (for nested nav demo)
function getMultiMediaFirstContent(count: number): ContentItem[] {
  const all = generateContent(count + 20);
  const multi = all.filter((c) => c.media.length > 1);
  const single = all.filter((c) => c.media.length === 1);
  return [...multi, ...single].slice(0, count);
}

function ReelPlayerCustomPage() {
  const [activeDemo, setActiveDemo] = useState<DemoType>(null);
  const content = useMemo(() => generateContent(CONTENT_COUNT), []);
  const nestedNavContent = useMemo(
    () => getMultiMediaFirstContent(CONTENT_COUNT),
    [],
  );

  const closePlayer = () => setActiveDemo(null);

  return (
    <div
      style={{
        minHeight: '100vh',
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
          Custom Reel Player
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 32,
          }}
        >
          Demonstrates render prop customization: overlays, controls, and custom
          slides.
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

      {/* Demo 1: Default SlideOverlay */}
      {activeDemo === 'default-overlay' && (
        <ReelPlayerOverlay
          isOpen
          onClose={closePlayer}
          content={content}
          initialIndex={0}
        />
      )}

      {/* Demo 2: Custom Slide Overlay */}
      {activeDemo === 'custom-overlay' && (
        <ReelPlayerOverlay
          isOpen
          onClose={closePlayer}
          content={content}
          initialIndex={0}
          renderSlideOverlay={(item: ContentItem) => (
            <div
              className="custom-overlay"
              data-testid="custom-overlay"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '48px 16px 16px',
                background:
                  'linear-gradient(transparent, rgba(100, 50, 200, 0.8))',
                color: '#fff',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {item.author.name}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {item.description}
              </div>
            </div>
          )}
        />
      )}

      {/* Demo 3: Custom Controls */}
      {activeDemo === 'custom-controls' && (
        <ReelPlayerOverlay
          isOpen
          onClose={closePlayer}
          content={content}
          initialIndex={0}
          renderSlideOverlay={() => null}
          renderControls={({ onClose }) => (
            <>
              <CloseButton onClick={onClose} />
              <SoundButton />
              <button
                data-testid="custom-share-btn"
                onClick={() => {
                  /* no-op for demo */
                }}
                style={{
                  position: 'absolute',
                  bottom: 64,
                  right: 16,
                  zIndex: 10,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
                aria-label="Share"
              >
                ↗
              </button>
            </>
          )}
        />
      )}

      {/* Demo 4: Custom Slide (CTA on last) */}
      {activeDemo === 'custom-slide' && (
        <ReelPlayerOverlay
          isOpen
          onClose={closePlayer}
          content={content}
          initialIndex={0}
          renderSlide={({ index, size }) => {
            if (index === content.length - 1) {
              return (
                <div
                  data-testid="cta-slide"
                  style={{
                    width: size[0],
                    height: size[1],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: 24, marginBottom: 12 }}>
                      Follow for more!
                    </h2>
                    <button
                      style={{
                        padding: '12px 32px',
                        borderRadius: 24,
                        border: '2px solid #fff',
                        backgroundColor: 'transparent',
                        color: '#fff',
                        fontSize: 16,
                        cursor: 'pointer',
                      }}
                    >
                      Subscribe
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
      )}

      {/* Demo 5: Custom Nested Navigation */}
      {activeDemo === 'custom-nested-nav' && (
        <ReelPlayerOverlay
          isOpen
          onClose={closePlayer}
          content={nestedNavContent}
          initialIndex={0}
          renderNestedNavigation={({
            onPrev,
            onNext,
            activeIndex,
            count,
          }: NavigationRenderProps) => (
            <div
              data-testid="custom-nested-nav"
              style={{
                position: 'absolute',
                bottom: 48,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 8,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <button
                data-testid="custom-nested-prev"
                onClick={onPrev}
                disabled={activeIndex === 0}
                aria-label="Previous"
                style={{
                  pointerEvents: 'auto',
                  padding: '6px 16px',
                  borderRadius: 16,
                  border: 'none',
                  backgroundColor:
                    activeIndex === 0
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.8)',
                  color: activeIndex === 0 ? '#999' : '#000',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: activeIndex === 0 ? 'default' : 'pointer',
                }}
              >
                Prev
              </button>
              <span
                data-testid="custom-nested-counter"
                style={{
                  pointerEvents: 'auto',
                  padding: '6px 12px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {activeIndex + 1} / {count}
              </span>
              <button
                data-testid="custom-nested-next"
                onClick={onNext}
                disabled={activeIndex === count - 1}
                aria-label="Next"
                style={{
                  pointerEvents: 'auto',
                  padding: '6px 16px',
                  borderRadius: 16,
                  border: 'none',
                  backgroundColor:
                    activeIndex === count - 1
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.8)',
                  color: activeIndex === count - 1 ? '#999' : '#000',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: activeIndex === count - 1 ? 'default' : 'pointer',
                }}
              >
                Next
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}

export default ReelPlayerCustomPage;
