import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TOTAL_ITEMS = 10000;

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    title: `Item ${i + 1}`,
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
  }));

export function InfiniteListDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const [goToValue, setGoToValue] = useState('');

  const items = useMemo(() => generateItems(TOTAL_ITEMS), []);

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize([rect.width, rect.height]);
      apiRef.current?.adjust();
    }
  }, []);

  useEffect(() => {
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [updateSize]);

  const handleGoTo = () => {
    const index = parseInt(goToValue, 10) - 1;
    if (index >= 0 && index < TOTAL_ITEMS) {
      apiRef.current?.goTo(index, true);
    }
  };

  if (size[0] === 0 || size[1] === 0) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Reel
        count={items.length}
        size={size}
        direction="vertical"
        enableWheel={false}
        useNavKeys={false}
        apiRef={apiRef}
        afterChange={(index) => setCurrentIndex(index)}
        itemBuilder={(index, indexInRange, itemSize) => (
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
              style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.9rem)', opacity: 0.7 }}
            >
              index: {index} | range: {indexInRange}
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
          {(currentIndex + 1).toLocaleString()} / {TOTAL_ITEMS.toLocaleString()}
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
          <ReelIndicator
            count={items.length}
            active={currentIndex}
            direction="vertical"
            visible={4}
            radius={3}
            gap={4}
          />
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
          disabled={currentIndex === items.length - 1}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor:
              currentIndex === items.length - 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: currentIndex === items.length - 1 ? 0.3 : 1,
          }}
          aria-label="Next"
        >
          <ChevronDown size={16} />
        </button>
        <input
          type="number"
          min={1}
          max={TOTAL_ITEMS}
          value={goToValue}
          onChange={(e) => setGoToValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleGoTo();
          }}
          placeholder="Go to #"
          style={{
            width: 72,
            padding: '4px 8px',
            fontSize: '0.75rem',
            background: 'rgba(0,0,0,0.4)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            outline: 'none',
          }}
        />
        <button
          onClick={handleGoTo}
          style={{
            padding: '4px 10px',
            fontSize: '0.75rem',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Go
        </button>
      </div>
    </div>
  );
}
