import { useState } from 'react';
import {
  LightboxOverlay,
  Counter,
  CloseButton,
  FullscreenButton,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';
import { useTheme } from '../../context/ThemeContext';

const SAMPLE_IMAGES: LightboxItem[] = [
  {
    src: 'https://picsum.photos/id/1015/1600/1000',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
  {
    src: 'https://picsum.photos/id/1016/1000/1600',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky',
    width: 1000,
    height: 1600,
  },
  {
    src: 'https://picsum.photos/id/1018/1600/900',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest',
    width: 1600,
    height: 900,
  },
  {
    src: 'https://picsum.photos/id/1019/900/1400',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore',
    width: 900,
    height: 1400,
  },
  {
    src: 'https://picsum.photos/id/1020/1600/1067',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest',
    width: 1600,
    height: 1067,
  },
  {
    src: 'https://picsum.photos/id/1022/1600/1067',
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea',
    width: 1600,
    height: 1067,
  },
];

export function LightboxDemo() {
  const [index, setIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="w-full h-full overflow-auto p-4"
      style={{ background: isDark ? '#0f172a' : '#f8fafc' }}
    >
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
            style={{
              position: 'relative',
              aspectRatio: '4 / 3',
              borderRadius: 8,
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: isDark ? '#1e293b' : '#e2e8f0',
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
