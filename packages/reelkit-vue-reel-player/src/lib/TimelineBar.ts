import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  type CSSProperties,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import { toVueRef, type Disposer } from '@reelkit/vue';
import { useTimelineState } from './useTimelineState';
import './TimelineBar.css';

/** Props accepted by the {@link TimelineBar} component. */
const timelineBarProps = {
  /** Extra class merged onto the bar root. */
  class: { type: String as PropType<string>, default: undefined },

  /** Inline styles merged onto the bar root. */
  style: {
    type: Object as PropType<CSSProperties>,
    default: () => ({}),
  },
};

/** Public props interface for the {@link TimelineBar} component. */
export type TimelineBarProps = ExtractPropTypes<typeof timelineBarProps>;

const formatTime = (seconds: number, duration: number): string => {
  if (!Number.isFinite(duration) || duration <= 0) return '';
  const clamped = Math.max(0, Math.min(seconds, duration));
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
};

/**
 * Default playback timeline bar for the Vue reel-player overlay.
 *
 * Reads state from the nearest `TimelineProvider` and renders a DOM track
 * with buffered segments, a progress fill, and a draggable cursor. Wires
 * pointer + keyboard scrubbing through `bindInteractions`.
 */
export const TimelineBar = defineComponent({
  name: 'RkTimelineBar',
  props: timelineBarProps,
  setup(props) {
    const controller = useTimelineState();
    let trackEl: HTMLDivElement | null = null;
    let disposeInteractions: Disposer | null = null;

    const duration = toVueRef(controller.duration);
    const currentTime = toVueRef(controller.currentTime);
    const progress = toVueRef(controller.progress);
    const buffered = toVueRef(controller.bufferedRanges);
    const scrubbing = toVueRef(controller.isScrubbing);

    onMounted(() => {
      if (trackEl) disposeInteractions = controller.bindInteractions(trackEl);
    });

    onBeforeUnmount(() => {
      disposeInteractions?.();
      disposeInteractions = null;
    });

    return () => {
      const rootClass = props.class
        ? `rk-reel-timeline ${props.class}`
        : 'rk-reel-timeline';
      const ariaMax = Number.isFinite(duration.value) ? duration.value : 0;

      return h(
        'div',
        {
          class: rootClass,
          style: props.style,
        },
        [
          h(
            'div',
            {
              ref: (el: unknown) => {
                trackEl = (el as HTMLDivElement | null) ?? null;
              },
              class: 'rk-reel-timeline-track',
              role: 'slider',
              'aria-label': 'Seek',
              'aria-valuemin': 0,
              'aria-valuemax': ariaMax,
              'aria-valuenow': currentTime.value,
              'aria-valuetext': formatTime(currentTime.value, duration.value),
              tabindex: 0,
              'data-scrubbing': scrubbing.value || undefined,
            },
            [
              ...buffered.value.map((range, i) =>
                h('div', {
                  key: i,
                  class: 'rk-reel-timeline-buffered',
                  style: {
                    left: `${range.start * 100}%`,
                    width: `${(range.end - range.start) * 100}%`,
                  },
                }),
              ),
              h('div', {
                class: 'rk-reel-timeline-fill',
                style: { width: `${progress.value * 100}%` },
              }),
              h('div', {
                class: 'rk-reel-timeline-cursor',
                style: { left: `${progress.value * 100}%` },
                'data-scrubbing': scrubbing.value || undefined,
              }),
            ],
          ),
        ],
      );
    };
  },
});

export default TimelineBar;
