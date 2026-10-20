import { useState } from 'react';
import { Observe, createSignal } from '@reelkit/react';
import { LightboxOverlay } from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';
import { photos } from './api';

// Counted from when each photo has loaded, so a slow one is never skipped.
const kSlideshowIntervalMs = 3000;

export default function GallerySlideshow() {
  const [{ openAt }] = useState(() => ({
    openAt: createSignal<number | null>(null),
  }));

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 8 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            aria-label={`Open ${photo.title}`}
            onClick={() => (openAt.value = index)}
            style={{
              aspectRatio: '1',
              padding: 0,
              border: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#1e293b',
            }}
          >
            <img
              src={photo.src}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      <Observe signals={[openAt]}>
        {() => (
          <LightboxOverlay
            isOpen={openAt.value !== null}
            images={photos}
            initialIndex={openAt.value ?? 0}
            onClose={() => (openAt.value = null)}
            // The default bar gains a play and pause button and a download
            // button once these are on.
            autoAdvance
            autoAdvanceInterval={kSlideshowIntervalMs}
            showDownload
          />
        )}
      </Observe>
    </div>
  );
}
