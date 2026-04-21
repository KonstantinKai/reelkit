import { defineComponent, h, type ExtractPropTypes, type PropType } from 'vue';
import { Heart } from 'lucide-vue-next';

/**
 * Formats a like count into a compact human-readable string.
 *
 * - >= 1,000,000 → "1.2M"
 * - >= 1,000 → "4.5K"
 * - < 1,000 → raw number as string
 */
function formatLikes(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(count);
}

/** Props accepted by the {@link SlideOverlay} component. */
const slideOverlayProps = {
  /** Author info. Renders an avatar image and display name. */
  author: {
    type: Object as PropType<{ name: string; avatar: string }>,
    default: undefined,
  },

  /** Description text. Clamped to 2 lines via CSS. */
  description: { type: String, default: undefined },

  /** Like count. Formatted compactly (e.g. 1.2K, 3.5M). */
  likes: { type: Number, default: undefined },
};

/** Public props interface for the {@link SlideOverlay} component. */
export type SlideOverlayProps = ExtractPropTypes<typeof slideOverlayProps>;

/**
 * Instagram/TikTok-style gradient overlay displayed at the bottom of each slide.
 *
 * Shows author avatar + name, a short description (2-line clamp), and a
 * like count with a heart icon. Renders nothing when all props are omitted.
 */
export const SlideOverlay = defineComponent({
  name: 'RkSlideOverlay',
  props: slideOverlayProps,
  setup(props) {
    return () => {
      if (!props.author && !props.description && props.likes == null) {
        return null;
      }

      const children = [] as ReturnType<typeof h>[];

      if (props.author) {
        children.push(
          h('div', { class: 'rk-reel-slide-overlay-author' }, [
            h('img', {
              class: 'rk-reel-slide-overlay-avatar',
              src: props.author.avatar,
              alt: props.author.name,
            }),
            h(
              'span',
              { class: 'rk-reel-slide-overlay-name' },
              props.author.name,
            ),
          ]),
        );
      }

      if (props.description) {
        children.push(
          h(
            'p',
            { class: 'rk-reel-slide-overlay-description' },
            props.description,
          ),
        );
      }

      if (props.likes != null) {
        children.push(
          h('div', { class: 'rk-reel-slide-overlay-likes' }, [
            h(Heart, { size: 16 }),
            h('span', formatLikes(props.likes)),
          ]),
        );
      }

      return h('div', { class: 'rk-reel-slide-overlay' }, children);
    };
  },
});

export default SlideOverlay;
