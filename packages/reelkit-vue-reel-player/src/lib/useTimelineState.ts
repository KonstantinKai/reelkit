import { defineComponent, inject, provide, type InjectionKey } from 'vue';
import {
  createTimelineController,
  noop,
  type TimelineController,
} from '@reelkit/vue';
import { shared as sharedVideo } from './VideoSlide';

/**
 * Injection key for the current `TimelineController`.
 *
 * Each `<TimelineProvider>` creates its own controller; `useTimelineState()`
 * resolves to the nearest ancestor provider.
 */
export const RK_TIMELINE_KEY: InjectionKey<TimelineController> =
  Symbol('RK_TIMELINE_KEY');

/**
 * Context provider that owns a single `TimelineController` for the
 * lifetime of an open reel-player overlay. Coordinates video pause/resume
 * around user scrubbing: the shared video pauses on scrub start and
 * resumes on scrub end if it was playing before.
 */
export const TimelineProvider = defineComponent({
  name: 'TimelineProvider',
  setup(_, { slots }) {
    let wasPlaying = false;
    const controller = createTimelineController({
      onScrubStart: () => {
        const video = sharedVideo.getVideo();
        wasPlaying = !video.paused;
        if (!video.paused) video.pause();
      },
      onScrubEnd: () => {
        if (wasPlaying) {
          sharedVideo.getVideo().play().catch(noop);
        }
        wasPlaying = false;
      },
    });
    provide(RK_TIMELINE_KEY, controller);
    return () => slots['default']?.();
  },
});

/**
 * Composable for the nearest `TimelineController`. Throws outside a
 * `TimelineProvider`.
 */
export const useTimelineState = (): TimelineController => {
  const context = inject(RK_TIMELINE_KEY, null);
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
  inject(RK_TIMELINE_KEY, null);
