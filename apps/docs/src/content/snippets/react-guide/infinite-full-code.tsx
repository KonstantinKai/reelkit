import { useRef, useMemo, useState } from 'react';
import { Reel, ReelIndicator, type ReelApi } from '@reelkit/react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const TOTAL_ITEMS = 10000;

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    title: `Item ${i + 1}`,
    color: `hsl(${(i * 137.5) % 360}, 70%, 50%)`,
  }));

export default function InfiniteList() {
  const apiRef = useRef<ReelApi>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goToValue, setGoToValue] = useState('');

  const items = useMemo(() => generateItems(TOTAL_ITEMS), []);

  const handleGoTo = () => {
    const index = parseInt(goToValue, 10) - 1;
    if (index >= 0 && index < TOTAL_ITEMS) {
      apiRef.current?.goTo(index, true);
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
            }}
          >
            <h2>{items[index].title}</h2>
            <p>index: {index} | range: {indexInRange}</p>
          </div>
        )}
      >
        {/* Counter */}
        <div style={{ position: 'absolute', top: 12, left: '50%',
          transform: 'translateX(-50%)', padding: '4px 12px',
          background: 'rgba(0,0,0,0.4)', color: '#fff',
          borderRadius: 12, fontSize: '0.75rem', zIndex: 10 }}>
          {(currentIndex + 1).toLocaleString()} / {TOTAL_ITEMS.toLocaleString()}
        </div>

        {/* Indicator */}
        <div style={{ position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)', zIndex: 10 }}>
          <ReelIndicator
            direction="vertical"
            visible={4}
          />
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
          disabled={currentIndex === items.length - 1}>
          <ChevronDown size={16} />
        </button>
        <input
          type="number"
          min={1}
          max={TOTAL_ITEMS}
          value={goToValue}
          onChange={(e) => setGoToValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleGoTo(); }}
          placeholder="Go to #"
          style={{ width: 72, padding: '4px 8px', fontSize: '0.75rem',
            background: 'rgba(0,0,0,0.4)', color: '#fff',
            border: 'none', borderRadius: 6, outline: 'none' }}
        />
        <button onClick={handleGoTo}>Go</button>
      </div>
    </div>
  );
}
