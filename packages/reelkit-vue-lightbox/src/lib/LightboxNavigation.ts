import { defineComponent, Fragment, h } from 'vue';
import type { ExtractPropTypes, PropType } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

/**
 * Props for {@link LightboxNavigation}.
 */
export const lightboxNavigationProps = {
  /** Zero-based index of the currently active slide. */
  activeIndex: { type: Number, required: true as const },

  /** Total number of items. */
  count: { type: Number, required: true as const },

  /**
   * When `true`, both arrows always render regardless of edges (the
   * caller is responsible for disabled-state styling). Default hides
   * the prev arrow at the first slide and the next arrow at the last
   * slide.
   *
   * @default false
   */
  loop: { type: Boolean, default: false },

  /** Navigate to the previous slide. */
  onPrev: {
    type: Function as PropType<() => void>,
    required: true as const,
  },

  /** Navigate to the next slide. */
  onNext: {
    type: Function as PropType<() => void>,
    required: true as const,
  },
} as const;

export type LightboxNavigationProps = ExtractPropTypes<
  typeof lightboxNavigationProps
>;

/**
 * Default prev/next navigation arrows. The parent overlay decides when
 * to mount this component (e.g. desktop-only and when `count > 1`).
 */
export const LightboxNavigation = defineComponent({
  name: 'LightboxNavigation',
  props: lightboxNavigationProps,
  setup(props) {
    return () => {
      const prevVisible = props.loop || props.activeIndex > 0;
      const nextVisible = props.loop || props.activeIndex < props.count - 1;

      return h(Fragment, null, [
        prevVisible
          ? h(
              'button',
              {
                class: 'rk-lightbox-nav rk-lightbox-nav-prev',
                title: 'Previous',
                'aria-label': 'Previous slide',
                onClick: props.onPrev,
              },
              [h(ChevronLeft, { size: 32 })],
            )
          : null,
        nextVisible
          ? h(
              'button',
              {
                class: 'rk-lightbox-nav rk-lightbox-nav-next',
                title: 'Next',
                'aria-label': 'Next slide',
                onClick: props.onNext,
              },
              [h(ChevronRight, { size: 32 })],
            )
          : null,
      ]);
    };
  },
});
