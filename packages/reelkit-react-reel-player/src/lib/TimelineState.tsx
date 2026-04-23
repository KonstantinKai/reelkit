import {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
  type FC,
} from 'react';
import {
  createTimelineController,
  noop,
  type TimelineController,
  type TimelineControllerConfig,
} from '@reelkit/react';
import { shared as sharedVideo } from './VideoSlide';

/** @internal */
export const TimelineContext = createContext<TimelineController | null>(null);

interface TimelineProviderProps {
  children: ReactNode;

  /** Forwards to {@link createTimelineController} (e.g. `keyboardStepSeconds`). */
  config?: Omit<
    TimelineControllerConfig,
    'onScrubStart' | 'onScrubEnd' | 'onSeek'
  >;
}

/**
 * Context provider that owns a single {@link TimelineController} for the
 * lifetime of an open reel-player overlay. Coordinates video pause/resume
 * around user scrubbing: the video pauses on scrub start and resumes on
 * scrub end if it was playing before.
 */
export const TimelineProvider: FC<TimelineProviderProps> = ({
  children,
  config,
}) => {
  const wasPlayingRef = useRef(false);
  const controller = useState<TimelineController>(() =>
    createTimelineController({
      ...config,
      onScrubStart: () => {
        const video = sharedVideo.getVideo();
        wasPlayingRef.current = !video.paused;
        if (!video.paused) video.pause();
      },
      onScrubEnd: () => {
        if (wasPlayingRef.current) {
          sharedVideo.getVideo().play().catch(noop);
        }
        wasPlayingRef.current = false;
      },
    }),
  )[0];

  return (
    <TimelineContext.Provider value={controller}>
      {children}
    </TimelineContext.Provider>
  );
};

/**
 * Hook to access the {@link TimelineController} from the nearest
 * {@link TimelineProvider}. Throws outside a provider.
 */
export const useTimelineState = (): TimelineController => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineState must be used within TimelineProvider');
  }
  return context;
};

/**
 * Optional variant: returns `null` when no provider is present. Used by
 * components (e.g. `VideoSlide`) that may render outside the overlay.
 */
export const useTimelineStateOptional = (): TimelineController | null =>
  useContext(TimelineContext);
