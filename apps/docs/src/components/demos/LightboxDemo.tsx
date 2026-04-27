import { useState } from 'react';
import {
  LightboxOverlay,
  Counter,
  CloseButton,
  FullscreenButton,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';
import { cdnUrl } from '@reelkit/example-data';

const SAMPLE_IMAGES: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky',
    width: 1000,
    height: 1600,
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest',
    width: 1600,
    height: 900,
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore',
    width: 900,
    height: 1400,
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-06.jpg'),
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea',
    width: 1600,
    height: 1067,
  },
];

export function LightboxDemo() {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <div className="w-full h-full overflow-auto p-4 bg-slate-50 dark:bg-slate-900">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
        }}
      >
        {SAMPLE_IMAGES.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className="bg-slate-200 dark:bg-slate-800"
            style={{
              position: 'relative',
              aspectRatio: '4 / 3',
              borderRadius: 8,
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
            />
            {img.title && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '16px 6px 4px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                {img.title}
              </div>
            )}
          </button>
        ))}
      </div>

      <LightboxOverlay
        isOpen={index !== null}
        images={SAMPLE_IMAGES}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderControls={({
          onClose,
          activeIndex,
          count,
          isFullscreen,
          onToggleFullscreen,
        }) => (
          <>
            <div className="rk-lightbox-controls-left">
              <Counter currentIndex={activeIndex} count={count} />
              <FullscreenButton
                isFullscreen={isFullscreen}
                onToggle={onToggleFullscreen}
              />
            </div>
            <CloseButton onClick={onClose} />
          </>
        )}
      />
    </div>
  );
}
