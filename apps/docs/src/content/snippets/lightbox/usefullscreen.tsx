import { useRef } from 'react';
import { useFullscreen } from '@reelkit/react';

function CustomLightbox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, requestFullscreen, exitFullscreen, toggleFullscreen] =
    useFullscreen({ ref: containerRef });

  return (
    <div ref={containerRef}>
      <button onClick={toggleFullscreen}>
        {isFullscreen.value ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}
