import { useRef, useEffect } from 'react';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';
import { Observe } from '@reelkit/react';

function CustomTimelineBar({ timelineState }) {
  const trackRef = useRef(null);
  useEffect(() => {
    if (!trackRef.current) return;
    // Pointer + keyboard scrub wiring, same as the built-in bar.
    return timelineState.bindInteractions(trackRef.current);
  }, [timelineState]);

  return (
    <div className="rk-reel-timeline" style={{ padding: '0 16px' }}>
      <Observe signals={[timelineState.progress, timelineState.currentTime]}>
        {() => (
          <div
            ref={trackRef}
            role="slider"
            aria-valuenow={timelineState.currentTime.value}
            style={{ height: 6, background: 'rgba(255,255,255,0.2)' }}
          >
            <div style={{
              width: `${timelineState.progress.value * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #ec4899)',
            }} />
          </div>
        )}
      </Observe>
    </div>
  );
}

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  timeline="always"
  renderTimeline={({ timelineState }) => (
    <CustomTimelineBar timelineState={timelineState} />
  )}
/>
