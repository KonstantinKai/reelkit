'use client';

import { useState, useEffect, useRef } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import type { FeedItem } from './page';

// Default size for SSR — matches common mobile viewport.
// Updated to actual viewport on client mount.
const DEFAULT_SIZE: [number, number] = [390, 844];

export function Feed({ items }: { items: FeedItem[] }) {
  const [size, setSize] = useState<[number, number]>(DEFAULT_SIZE);
  const [activeIndex, setActiveIndex] = useState(0);
  const apiRef = useRef<ReelApi>(null);

  useEffect(() => {
    const update = () => setSize([window.innerWidth, window.innerHeight]);

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <Reel
      count={items.length}
      size={size}
      direction="vertical"
      enableWheel
      apiRef={apiRef}
      afterChange={(index) => setActiveIndex(index)}
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
          count={items.length}
          active={activeIndex}
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
