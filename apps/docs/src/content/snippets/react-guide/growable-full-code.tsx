import { useRef, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const BATCH_SIZE = 20;
const MAX_ITEMS = 200;
const LOAD_THRESHOLD = 3;

const generateItems = (startIndex: number, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const index = startIndex + i;
    return {
      title: `Item ${index + 1}`,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
    };
  });

export default function GrowableList() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [items, setItems] = useState(() => generateItems(0, BATCH_SIZE));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);

  const handleAfterChange = (index: number) => {
    setCurrentIndex(index);
    if (
      index >= items.length - LOAD_THRESHOLD &&
      items.length < MAX_ITEMS &&
      !loadingRef.current
    ) {
      loadingRef.current = true;
      setIsLoadingMore(true);
      setTimeout(() => {
        setItems((prev) => [...prev, ...generateItems(prev.length, BATCH_SIZE)]);
        setIsLoadingMore(false);
        loadingRef.current = false;
      }, 1000);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Reel
        count={items.length}
        style={{ width: '100%', height: '100%' }}
        direction="vertical"
        enableWheel
        apiRef={apiRef}
        afterChange={handleAfterChange}
        itemBuilder={(index, _indexInRange, itemSize) => (
          <div
            style={{
              width: itemSize[0],
              height: itemSize[1],
              background: items[index].color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <h2>{items[index].title}</h2>
            <p>batch: {Math.floor(index / BATCH_SIZE) + 1}</p>
          </div>
        )}
      >
        {/* Counter */}
        <div style={{ position: 'absolute', top: 12, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: 'rgba(0,0,0,0.4)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 10 }}>
          {currentIndex + 1} / {items.length}
          {items.length < MAX_ITEMS && ' (growing)'}
        </div>

        {/* Indicator */}
        <div style={{ position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', zIndex: 10 }}>
          <ReelIndicator direction="vertical" visible={4} />
        </div>
      </Reel>

      {/* Controls */}
      <div style={{ position: 'absolute', bottom: 12, left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: 6,
        alignItems: 'center', zIndex: 10 }}>
        <button onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}>
          <ChevronUp size={16} />
        </button>
        <button onClick={() => apiRef.current?.next()}
          disabled={currentIndex === items.length - 1 && !isLoadingMore}>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Loading overlay */}
      {isLoadingMore && (
        <div style={{ position: 'absolute', bottom: 52, left: '50%',
          transform: 'translateX(-50%)', padding: '6px 16px',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 20 }}>
          Loading more...
        </div>
      )}
    </div>
  );
}
