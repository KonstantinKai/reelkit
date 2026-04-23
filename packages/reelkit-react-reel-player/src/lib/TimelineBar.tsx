import React, { useRef, useEffect, type CSSProperties } from 'react';
import { Observe } from '@reelkit/react';
import { useTimelineState } from './TimelineState';
import './TimelineBar.css';

/**
 * Props for {@link TimelineBar}.
 */
export interface TimelineBarProps {
  /** Extra class merged onto the bar root. */
  className?: string;

  /** Inline styles merged onto the bar root. */
  style?: CSSProperties;
}

/**
 * Default playback timeline bar for the reel player overlay.
 *
 * Reads state from the nearest {@link TimelineProvider} and renders a DOM
 * track with buffered segments, a progress fill, and a draggable cursor.
 * Wires pointer + keyboard scrubbing through
 * {@link TimelineController.bindInteractions}.
 *
 * @remarks
 * Positioned absolutely at the bottom of the overlay. Theme via the
 * `--rk-reel-timeline-*` CSS custom properties.
 */
const TimelineBar: React.FC<TimelineBarProps> = ({ className, style }) => {
  const controller = useTimelineState();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    return controller.bindInteractions(el);
  }, [controller]);

  return (
    <div
      className={
        className ? `rk-reel-timeline ${className}` : 'rk-reel-timeline'
      }
      style={style}
    >
      <Observe
        signals={[
          controller.duration,
          controller.currentTime,
          controller.isScrubbing,
        ]}
      >
        {() => {
          const duration = controller.duration.value;
          const currentTime = controller.currentTime.value;
          const scrubbing = controller.isScrubbing.value;

          return (
            <div
              ref={trackRef}
              className="rk-reel-timeline-track"
              role="slider"
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Number.isFinite(duration) ? duration : 0}
              aria-valuenow={currentTime}
              aria-valuetext={formatTime(currentTime, duration)}
              tabIndex={0}
              data-scrubbing={scrubbing || undefined}
            >
              <Observe signals={[controller.bufferedRanges]}>
                {() => (
                  <>
                    {controller.bufferedRanges.value.map((range, i) => (
                      <div
                        key={i}
                        className="rk-reel-timeline-buffered"
                        style={{
                          left: `${range.start * 100}%`,
                          width: `${(range.end - range.start) * 100}%`,
                        }}
                      />
                    ))}
                  </>
                )}
              </Observe>
              <Observe signals={[controller.progress, controller.isScrubbing]}>
                {() => {
                  const progress = controller.progress.value;
                  const innerScrubbing = controller.isScrubbing.value;
                  return (
                    <>
                      <div
                        className="rk-reel-timeline-fill"
                        style={{ width: `${progress * 100}%` }}
                      />
                      <div
                        className="rk-reel-timeline-cursor"
                        style={{ left: `${progress * 100}%` }}
                        data-scrubbing={innerScrubbing || undefined}
                      />
                    </>
                  );
                }}
              </Observe>
            </div>
          );
        }}
      </Observe>
    </div>
  );
};

const formatTime = (seconds: number, duration: number): string => {
  if (!Number.isFinite(duration) || duration <= 0) return '';
  const clamp = Math.max(0, Math.min(seconds, duration));
  const m = Math.floor(clamp / 60);
  const s = Math.floor(clamp % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
};

export default TimelineBar;
