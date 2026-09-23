import { defineComponent, h, type ExtractPropTypes, type PropType } from 'vue';
import { getRingPresentation, type AuthorInfo } from '@reelkit/stories-core';
import './StoriesRing.css';

/** Props accepted by the {@link StoriesRing} component. */
const storiesRingProps = {
  /** Only the avatar and the name are drawn; nothing keys on the id here. */
  author: { type: Object as PropType<AuthorInfo>, required: true as const },

  /** A group of 0 draws no ring at all, just the avatar. */
  totalStories: { type: Number, required: true as const },

  /** Short of `totalStories` keeps the gradient; reaching it mutes the ring. */
  viewedCount: { type: Number, required: true as const },

  /**
   * Outer ring diameter in pixels.
   *
   * @default 68
   */
  size: { type: Number, default: 68 },

  /**
   * Gradient colors for a group with stories left to watch.
   *
   * @default Instagram gradient
   */
  gradientColors: { type: Array as PropType<string[]>, default: undefined },

  /**
   * Color for a fully watched group.
   *
   * @default 'rgba(255,255,255,0.25)'
   */
  viewedColor: { type: String, default: undefined },
};

/** Public props interface for the {@link StoriesRing} component. */
export type StoriesRingProps = ExtractPropTypes<typeof storiesRingProps>;

/**
 * Circular avatar with a gradient ring. The ring has two states: a group with
 * anything left to watch gets the rotating Instagram gradient, a fully watched
 * one gets a flat muted ring. Progress within a group is not shown here — the
 * progress bar inside the player carries that. Emits `click` when pressed.
 */
export const StoriesRing = defineComponent({
  name: 'StoriesRing',
  props: storiesRingProps,
  emits: {
    click: () => true,
  },
  setup(props, { emit }) {
    return () => {
      const { avatarSize, className, style } = getRingPresentation({
        totalStories: props.totalStories,
        viewedCount: props.viewedCount,
        size: props.size,
        gradientColors: props.gradientColors,
        viewedColor: props.viewedColor,
      });

      return h(
        'div',
        {
          class: className,
          style,
          role: 'button',
          tabindex: 0,
          'aria-label': `${props.author.name}'s stories`,
          onClick: () => emit('click'),
          onKeydown: (event: KeyboardEvent) => {
            // A native button opens on Enter and Space; this one has to be told.
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            emit('click');
          },
        },
        [
          h('img', {
            class: 'rk-stories-ring-avatar',
            src: props.author.avatar,
            alt: props.author.name,
            width: avatarSize,
            height: avatarSize,
          }),
        ],
      );
    };
  },
});
