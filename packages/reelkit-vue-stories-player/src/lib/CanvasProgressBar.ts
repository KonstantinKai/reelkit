import {
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
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

  /**
   * Whether the bar redraws on every animation frame to follow a running
   * timer. A bar that is not live draws only when its signals change or its
   * container resizes, which is all a bar showing a paused group needs.
   *
   * @default true
   */
  live: { type: Boolean, default: true },
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
    let drawing = createDisposableList();
    let attached = false;

    const draw = () =>
      renderer.draw(
        props.totalStories,
        props.activeIndex.value,
        props.progress.value,
      );

    // Called on mount and again whenever the bar is handed other signals,
    // another story count or a different `live`, so a still bar never keeps
    // drawing from the signals it was first given.
    const startDrawing = () => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      drawing.dispose();
      drawing = createDisposableList();

      if (props.live) {
        let frame = 0;
        const loop = () => {
          draw();
          frame = requestAnimationFrame(loop);
        };
        drawing.push(
          reaction(() => [props.activeIndex], draw),
          () => cancelAnimationFrame(frame),
        );
        frame = requestAnimationFrame(loop);
        return;
      }

      // Resizing the canvas clears it. This observer is created after the
      // renderer's own, and observers are notified in the order they were
      // created, so the bar is repainted after the renderer has measured.
      const resizeObserver = new ResizeObserver(draw);
      if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
      drawing.push(
        reaction(() => [props.activeIndex, props.progress], draw),
        () => resizeObserver.disconnect(),
      );
      draw();
    };

    watch(
      () => [props.activeIndex, props.progress, props.totalStories, props.live],
      () => {
        if (attached) startDrawing();
      },
    );

    onMounted(() => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      renderer.attach(canvas);
      attached = true;
      startDrawing();
    });

    onUnmounted(() => {
      drawing.dispose();
      renderer.dispose();
    });

    return () =>
      h('div', { class: 'rk-stories-progress-bar' }, [
        h('canvas', { ref: canvasRef }),
      ]);
  },
});
