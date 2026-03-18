'use client';

import { useRef } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import type { FeedItem } from './page';

export function Feed({ items }: { items: FeedItem[] }) {
  const apiRef = useRef<ReelApi>(null);

  return (
    <Reel
      count={items.length}
      style={{ width: '100vw', height: '100vh' }}
      direction="vertical"
      enableWheel
      apiRef={apiRef}
      itemBuilder={(index, _indexInRange, itemSize) => (
        <div
          style={{
            width: itemSize[0],
            height: itemSize[1],
            backgroundColor: items[index].color,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>
            {items[index].title}
          </h2>
          <p style={{ opacity: 0.7, marginTop: 8 }}>
            Item {index + 1} of {items.length}
          </p>
        </div>
      )}
    >
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
        }}
      >
        <ReelIndicator
          direction="vertical"
          visible={5}
          radius={4}
          gap={6}
          onDotClick={(i) => apiRef.current?.goTo(i, true)}
        />
      </div>
    </Reel>
  );
}
