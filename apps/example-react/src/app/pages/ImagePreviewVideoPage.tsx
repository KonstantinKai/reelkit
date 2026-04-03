import { useState, useCallback } from 'react';
import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
  type TransitionType,
} from '@reelkit/react-lightbox';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/react-lightbox/styles.css';
import './ImagePreviewPage.css';

const _kTransitions: TransitionType[] = ['slide', 'fade', 'zoom-in'];

const sampleItems: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    description: 'A beautiful mountain river flowing through the forest.',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/videos/video-01.mp4'),
    type: 'video',
    poster: cdnUrl('samples/videos/video-poster-01.jpg'),
    title: 'For Bigger Blazes',
    description: 'Sample video demonstrating video support in the lightbox.',
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Foggy Forest',
    description: 'Misty morning in the dense forest.',
    width: 1600,
    height: 900,
  },
  {
    src: cdnUrl('samples/videos/video-02.mp4'),
    type: 'video',
    poster: cdnUrl('samples/videos/video-poster-02.jpg'),
    title: 'For Bigger Escapes',
    description: 'Another sample video showcasing the opt-in video feature.',
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
    src: cdnUrl('samples/images/image-09.jpg'),
    title: 'Puppy Portrait',
    description: 'An adorable puppy looking at the camera with curious eyes.',
    width: 900,
    height: 1350,
  },
];

function ImagePreviewVideoPage() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<TransitionType>('slide');

  const { renderSlide, renderControls, SoundProvider } =
    useVideoSlideRenderer(sampleItems);

  const handleImageClick = useCallback((index: number) => {
    setPreviewIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  return (
    <div className="image-gallery-page">
      <div className="gallery-header">
        <h1>Mixed Gallery (Images + Video)</h1>
        <p>
          Click on any item to open the lightbox. Video items use the opt-in{' '}
          <code>useVideoSlideRenderer</code> hook.
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
      </div>

      <div className="gallery-grid">
        {sampleItems.map((item, index) => (
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
            <img
              src={item.type === 'video' ? item.poster : item.src}
              alt={item.title || `Item ${index + 1}`}
              loading="lazy"
            />
            <div className="gallery-item-overlay">
              {item.type === 'video' && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.9)',
                    marginRight: 8,
                    verticalAlign: 'middle',
                  }}
                >
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="#000">
                    <path d="M0 0l14 8-14 8z" />
                  </svg>
                </span>
              )}
              {item.title && (
                <span className="gallery-item-title">{item.title}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <SoundProvider>
        <LightboxOverlay
          isOpen={previewIndex !== null}
          images={sampleItems}
          initialIndex={previewIndex ?? 0}
          onClose={handleClose}
          transition={transition}
          renderSlide={renderSlide}
          renderControls={renderControls}
        />
      </SoundProvider>
    </div>
  );
}

export default ImagePreviewVideoPage;
