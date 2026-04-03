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

export function GrowableListDemo() {
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
        setItems((prev) => [
          ...prev,
          ...generateItems(prev.length, BATCH_SIZE),
        ]);
        setIsLoadingMore(false);
        loadingRef.current = false;
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full relative">
      <Reel
        count={items.length}
        style={{ width: '100%', height: '100%' }}
        direction="vertical"
        enableWheel={false}
        enableNavKeys={false}
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
              userSelect: 'none',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(1.3rem, 3.5vw, 2rem)',
                fontWeight: 700,
                marginBottom: 4,
                letterSpacing: '-0.02em',
              }}
            >
              {items[index].title}
            </h2>
            <p
              style={{
                fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)',
                opacity: 0.7,
              }}
            >
              index: {index} | batch: {Math.floor(index / BATCH_SIZE) + 1}
            </p>
          </div>
        )}
      >
        {/* Counter */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 12px',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            borderRadius: 12,
            fontSize: '0.75rem',
            zIndex: 10,
          }}
        >
          {currentIndex + 1} / {items.length}
          {items.length < MAX_ITEMS && ' (growing)'}
        </div>

        {/* Indicator */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }}
        >
          <ReelIndicator direction="vertical" visible={4} radius={3} gap={4} />
        </div>
      </Reel>

      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => apiRef.current?.prev()}
          disabled={currentIndex === 0}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === 0 ? 0.3 : 1,
          }}
          aria-label="Previous"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => apiRef.current?.next()}
          disabled={currentIndex === items.length - 1 && !isLoadingMore}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor:
              currentIndex === items.length - 1 && !isLoadingMore
                ? 'not-allowed'
                : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity:
              currentIndex === items.length - 1 && !isLoadingMore ? 0.3 : 1,
          }}
          aria-label="Next"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Loading overlay */}
      {isLoadingMore && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-white"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        >
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.25"
            />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Loading more...
        </div>
      )}
    </div>
  );
}
