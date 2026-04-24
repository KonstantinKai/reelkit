import { defineComponent, h, ref } from 'vue';
import type { ExtractPropTypes, PropType } from 'vue';

/**
 * Props for {@link ImageSlide}. Extracted so consumers can build
 * typed wrappers via `ExtractPropTypes<typeof imageSlideProps>`.
 */
export const imageSlideProps = {
  /** Source URL of the image. */
  src: {
    type: String,
    required: true as const,
  },

  /** `alt` text for the `<img>` element. */
  alt: {
    type: String,
    required: true as const,
  },

  /**
   * Whether this slide is currently active. Active slides load eagerly;
   * neighbours load lazily so offscreen images never block first paint.
   */
  isActive: {
    type: Boolean,
    required: true as const,
  },

  /** Fired when the image finishes loading. */
  onReady: {
    type: Function as PropType<() => void>,
    required: true as const,
  },

  /** Fired when the image fails to load. */
  onLoadError: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type ImageSlideProps = ExtractPropTypes<typeof imageSlideProps>;

/**
 * Default image renderer used by `<LightboxOverlay>` when the active
 * item has `type === 'image'` (or `type` is omitted) and no custom
 * `slide` slot is provided.
 */
export const ImageSlide = defineComponent({
  name: 'ImageSlide',
  props: imageSlideProps,
  setup(props) {
    const hidden = ref(false);

    const onLoad = () => {
      hidden.value = false;
      props.onReady();
    };

    const onError = () => {
      hidden.value = true;
      props.onLoadError();
    };

    return () =>
      h('img', {
        class: 'rk-lightbox-img',
        src: props.src,
        alt: props.alt,
        draggable: false,
        loading: props.isActive ? 'eager' : 'lazy',
        style: hidden.value ? { display: 'none' } : undefined,
        onLoad,
        onError,
      });
  },
});
