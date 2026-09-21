import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  shallowRef,
  type ExtractPropTypes,
  type PropType,
} from 'vue';
import { createDisposableList, reaction, type Signal } from '@reelkit/vue';
import { createCanvasProgressRenderer } from '@reelkit/stories-core';

/** Props accepted by the {@link CanvasProgressBar} component. */
const canvasProgressBarProps = {
  /** Total number of stories (segments) in the current group. */
  totalStories: { type: Number, required: true as const },

  /** Active story index signal. */
  activeIndex: {
    type: Object as PropType<Signal<number>>,
    required: true as const,
  },

  /** Timer progress signal, from 0 to 1. */
  progress: {
    type: Object as PropType<Signal<number>>,
    required: true as const,
  },

  /**
   * Gap in pixels between segments.
   *
   * @default 2
   */
  gap: { type: Number, default: undefined },

  /**
   * Bar height in pixels.
   *
   * @default 2
   */
  barHeight: { type: Number, default: undefined },

  /**
   * Minimum width in pixels for each segment before the sliding window kicks in.
   *
   * @default 8
   */
  minSegmentWidth: { type: Number, default: undefined },

  /** Background color of unfilled segments. */
  bgColor: { type: String, default: undefined },

  /** Fill color of completed and active segments. */
  fillColor: { type: String, default: undefined },
};

/** Public props interface for the {@link CanvasProgressBar} component. */
export type CanvasProgressBarProps = ExtractPropTypes<
  typeof canvasProgressBarProps
>;

/**
 * Canvas-rendered segmented progress bar for Instagram-style stories.
 *
 * Thin Vue wrapper around the framework-agnostic
 * `createCanvasProgressRenderer` from `@reelkit/stories-core`. It draws every
 * animation frame straight from the signals, so the timer never re-renders a
 * component.
 */
export const CanvasProgressBar = defineComponent({
  name: 'CanvasProgressBar',
  props: canvasProgressBarProps,
  setup(props) {
    const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
    const renderer = createCanvasProgressRenderer({
      gap: props.gap,
      barHeight: props.barHeight,
      minSegmentWidth: props.minSegmentWidth,
      bgColor: props.bgColor,
      fillColor: props.fillColor,
    });
    const disposables = createDisposableList();
    let frame = 0;

    onMounted(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      renderer.attach(canvas);

      const draw = () =>
        renderer.draw(
          props.totalStories,
          props.activeIndex.value,
          props.progress.value,
        );

      const loop = () => {
        draw();
        frame = requestAnimationFrame(loop);
      };

      disposables.push(
        reaction(() => [props.activeIndex], draw),
        () => cancelAnimationFrame(frame),
        renderer.dispose,
      );

      frame = requestAnimationFrame(loop);
    });

    onUnmounted(disposables.dispose);

    return () =>
      h('div', { class: 'rk-stories-progress-bar' }, [
        h('canvas', { ref: canvasRef }),
      ]);
  },
});
