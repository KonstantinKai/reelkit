import { useRef, useState } from 'react';
import { Observe, createSignal } from '@reelkit/react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';
import { posts, thumbnailOf } from './api';

export default function GridToPlayer() {
  const [{ open, startIndex, lastViewed }] = useState(() => ({
    open: createSignal(false),
    startIndex: createSignal(0),
    lastViewed: createSignal(0),
  }));
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);

  const openAt = (index: number) => {
    startIndex.value = index;
    lastViewed.value = index;
    open.value = true;
  };

  const close = () => {
    open.value = false;
    // As it unmounts, the player hands focus back to the thumbnail that opened
    // it. Wait one task for that, then move focus on to the post the viewer
    // stopped at, scrolled into view, so they continue from there.
    setTimeout(() => {
      const thumbnail = thumbnails.current[lastViewed.value];
      thumbnail?.scrollIntoView({ block: 'nearest' });
      thumbnail?.focus({ preventScroll: true });
    });
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: 8 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}
      >
        {posts.map((post, index) => (
          <button
            key={post.id}
            ref={(element) => {
              thumbnails.current[index] = element;
            }}
            type="button"
            aria-label={`Open ${post.description}`}
            onClick={() => openAt(index)}
            style={{
              aspectRatio: '3 / 4',
              padding: 0,
              border: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#1e293b',
            }}
          >
            <img
              src={thumbnailOf(post)}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ))}
      </div>

      <Observe signals={[open]}>
        {() => (
          <ReelPlayerOverlay
            isOpen={open.value}
            content={posts}
            initialIndex={startIndex.value}
            onSlideChange={(index) => (lastViewed.value = index)}
            onClose={close}
          />
        )}
      </Observe>
    </div>
  );
}
