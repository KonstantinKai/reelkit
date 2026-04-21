import { defineComponent, h, type ExtractPropTypes, type PropType } from 'vue';

/** Props accepted by the {@link ImageSlide} component. */
const imageSlideProps = {
  /** URL of the image to display. */
  src: { type: String, required: true as const },

  /** `[width, height]` of the slide in pixels. */
  size: {
    type: Array as unknown as PropType<[number, number]>,
    required: true as const,
  },

  /** Called when the image loads successfully. */
  onReady: { type: Function as PropType<() => void>, default: undefined },

  /** Called when the image fails to load. */
  onError: { type: Function as PropType<() => void>, default: undefined },
};

/** Public props interface for the {@link ImageSlide} component. */
export type ImageSlideProps = ExtractPropTypes<typeof imageSlideProps>;

/**
 * Renders a single image slide with `object-fit: cover` and lazy loading.
 *
 * Can be used standalone inside a `slide` / `nestedSlide` slot to build
 * custom image slides with your own styles.
 */
export const ImageSlide = defineComponent({
  name: 'RkImageSlide',
  props: imageSlideProps,
  setup(props) {
    return () =>
      h(
        'div',
        {
          style: {
            width: `${props.size[0]}px`,
            height: `${props.size[1]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            overflow: 'hidden',
          },
        },
        [
          h('img', {
            alt: '',
            loading: 'lazy',
            src: props.src,
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            },
            onLoad: () => props.onReady?.(),
            onError: (e: Event) => {
              (e.target as HTMLImageElement).style.display = 'none';
              props.onError?.();
            },
          }),
        ],
      );
  },
});

export default ImageSlide;
