import { useState, useCallback } from 'react';
import { ImageOff } from 'lucide-react';
import {
  LightboxOverlay,
  type LightboxItem,
  type TransitionType,
} from '@reelkit/react-lightbox';
import type { SwipeToCloseDirection } from '@reelkit/react';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/react-lightbox/styles.css';
import './ImagePreviewPage.css';

const _kTransitions: TransitionType[] = ['slide', 'fade', 'flip', 'zoom-in'];
const _kSwipeDirections: SwipeToCloseDirection[] = ['up', 'down'];

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description:
      'A beautiful mountain river flowing through the forest. The water is crystal clear and reflects the surrounding trees.',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Snowy Peaks',
    description: 'Majestic snow-capped mountains reaching for the sky.',
    width: 1000,
    height: 1600,
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description:
      'Misty morning in the dense forest. The sun rays pierce through the fog creating a magical atmosphere.',
    width: 1600,
    height: 900,
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Ocean Waves',
    description: 'Powerful ocean waves crashing against the rocky shore.',
    width: 900,
    height: 1400,
  },
  {
    src: 'https://broken.invalid/does-not-exist.jpg',
    title: 'Broken Image',
    description:
      'This image intentionally fails to demonstrate error handling.',
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Autumn Path',
    description:
      'A winding path through the autumn forest covered in golden leaves.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-06.jpg'),
    title: 'Sunset Silhouette',
    width: 1200,
    height: 1800,
  },
  {
    src: cdnUrl('samples/images/image-07.jpg'),
    title: 'Coastal Cliffs',
    description: 'Dramatic coastal cliffs overlooking the deep blue sea.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-08.jpg'),
    title: 'Desert Dunes',
    description:
      'Rolling sand dunes stretching to the horizon under the scorching sun.',
    width: 1920,
    height: 1280,
  },
  {
    src: cdnUrl('samples/images/image-09.jpg'),
    title: 'Puppy Portrait',
    description: 'An adorable puppy looking at the camera with curious eyes.',
    width: 900,
    height: 1350,
  },
  {
    src: cdnUrl('samples/images/image-10.jpg'),
    title: 'Northern Lights',
    description: 'The magical aurora borealis dancing across the night sky.',
    width: 1600,
    height: 1067,
  },
  {
    src: cdnUrl('samples/images/image-11.jpg'),
    title: 'City Lights',
    description: 'Urban skyline glittering at night.',
    width: 1080,
    height: 1620,
  },
  {
    src: cdnUrl('samples/images/image-12.jpg'),
    title: 'Waterfall',
    description: 'A thundering waterfall cascading down the rocky cliff.',
    width: 1600,
    height: 1067,
  },
];

const GalleryThumb: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          gap: 4,
          backgroundColor: '#1a1a1a',
        }}
      >
        <ImageOff size={28} strokeWidth={1.5} />
        <span style={{ fontSize: 10 }}>Error</span>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setError(true)} />
  );
};

function ImagePreviewPage() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<TransitionType>('slide');
  const [swipeDirection, setSwipeDirection] =
    useState<SwipeToCloseDirection>('up');

  const handleImageClick = useCallback((index: number) => {
    setPreviewIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  return (
    <div className="image-gallery-page">
      <div className="gallery-header">
        <h1>Image Gallery</h1>
        <p>
          Click on any image to open the preview. Use arrow keys or swipe to
          navigate.
        </p>
        <div className="transition-selector">
          <span>Transition:</span>
          {_kTransitions.map((t) => (
            <button
              key={t}
              className={`transition-btn ${transition === t ? 'active' : ''}`}
              onClick={() => setTransition(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="transition-selector">
          <span>Swipe-to-close:</span>
          {_kSwipeDirections.map((d) => (
            <button
              key={d}
              className={`transition-btn ${swipeDirection === d ? 'active' : ''}`}
              onClick={() => setSwipeDirection(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="gallery-grid">
        {sampleImages.map((image, index) => (
          <div
            key={index}
            className="gallery-item"
            onClick={() => handleImageClick(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleImageClick(index);
              }
            }}
          >
            <GalleryThumb
              src={image.src}
              alt={image.title || `Image ${index + 1}`}
            />
            <div className="gallery-item-overlay">
              {image.title && (
                <span className="gallery-item-title">{image.title}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <LightboxOverlay
        isOpen={previewIndex !== null}
        images={sampleImages}
        initialIndex={previewIndex ?? 0}
        onClose={handleClose}
        transition={transition}
        swipeToCloseDirection={swipeDirection}
      />
    </div>
  );
}

export default ImagePreviewPage;
