import { defineComponent, h, type ExtractPropTypes, type PropType } from 'vue';

/** Props accepted by the {@link ImageStorySlide} component. */
const imageStorySlideProps = {
  /** Drawn cover-fit, so a source of any shape fills the story canvas. */
  src: { type: String, required: true as const },

  /** Width over height. Reserves the box before the image arrives. */
  aspectRatio: { type: Number, default: undefined },

  /** The player starts the auto-advance timer on this, not on mount. */
  onLoad: { type: Function as PropType<() => void>, default: undefined },

  /** A broken image is hidden rather than shown; the player takes it from here. */
  onError: { type: Function as PropType<() => void>, default: undefined },
};

/** Public props interface for the {@link ImageStorySlide} component. */
export type ImageStorySlideProps = ExtractPropTypes<
  typeof imageStorySlideProps
>;

/**
 * Renders a single image story slide with cover-fit sizing. A broken image is
 * hidden and reported through `onError`.
 */
export const ImageStorySlide = defineComponent({
  name: 'ImageStorySlide',
  props: imageStorySlideProps,
  setup(props) {
    return () =>
      h('img', {
        src: props.src,
        alt: '',
        draggable: false,
        class: 'rk-stories-image',
        onLoad: () => props.onLoad?.(),
        onError: (event: Event) => {
          (event.target as HTMLImageElement).style.display = 'none';
          props.onError?.();
        },
        style: props.aspectRatio
          ? { aspectRatio: `${props.aspectRatio}` }
          : undefined,
      });
  },
});
