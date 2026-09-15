import { useState } from 'react';
import {
  LightboxOverlay,
  flipTransition,
  lightboxFadeTransition,
  lightboxZoomTransition,
  slideTransition,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import type { TransitionTransformFn } from '@reelkit/react';
import '@reelkit/react-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest',
    width: 1600,
    height: 1000,
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky',
    width: 1000,
    height: 1600,
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest',
    width: 1600,
    height: 900,
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore',
    width: 900,
    height: 1400,
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Autumn Path',
    description: 'A winding path through the autumn forest',
    width: 1600,
    height: 1067,
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea',
    width: 1600,
    height: 1067,
  },
];

const transitions: { label: string; fn: TransitionTransformFn }[] = [
  { label: 'slide', fn: slideTransition },
  { label: 'fade', fn: lightboxFadeTransition },
  { label: 'flip', fn: flipTransition },
  { label: 'zoom-in', fn: lightboxZoomTransition },
];

export default function App() {
  const [index, setIndex] = useState<number | null>(null);
  const [transitionFn, setTransitionFn] = useState<TransitionTransformFn>(
    () => slideTransition,
  );

  return (
    <div style={{ padding: 16, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Transition picker */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {transitions.map((t) => (
          <button
            key={t.label}
            onClick={() => setTransitionFn(() => t.fn)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              background: transitionFn === t.fn ? '#6366f1' : '#e2e8f0',
              color: transitionFn === t.fn ? '#fff' : '#334155',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              position: 'relative', aspectRatio: '4 / 3', borderRadius: 8,
              overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer',
              background: '#e2e8f0',
            }}
          >
            <img
              src={img.src}
              alt={img.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </button>
        ))}
      </div>
      <LightboxOverlay
        isOpen={index !== null}
        images={images}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        transitionFn={transitionFn}
      />
    </div>
  );
}
