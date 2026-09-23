import { defineComponent, h, type ExtractPropTypes, type PropType } from 'vue';
import { X, Pause, Play, Volume2, VolumeX } from 'lucide-vue-next';
import { formatTimeAgo, type AuthorInfo } from '@reelkit/stories-core';
import './StoryHeader.css';

/** Props accepted by the {@link StoryHeader} component. */
const storyHeaderProps = {
  /** Author information (avatar, name, verified status). */
  author: { type: Object as PropType<AuthorInfo>, required: true as const },

  /** When the story was created. Used to display a relative time string. */
  createdAt: {
    type: [String, Date] as PropType<string | Date>,
    default: undefined,
  },

  /** Whether the story is currently paused. Controls the pause and play icon. */
  isPaused: { type: Boolean, default: false },

  /** Picks which sound icon is drawn; the header mutes nothing itself. */
  isMuted: { type: Boolean, default: false },

  /** Whether the current story is a video (shows the sound toggle). */
  isVideo: { type: Boolean, default: false },

  /** Whether content is loading (shows a spinner). */
  isLoading: { type: Boolean, default: false },

  /** Whether content failed to load. Hides the spinner when true. */
  isError: { type: Boolean, default: false },

  /**
   * Whether the header is visible. When false, the header fades out.
   *
   * @default true
   */
  visible: { type: Boolean, default: true },

  /** Required — the close button is always drawn, so it always needs a home. */
  onClose: { type: Function as PropType<() => void>, required: true as const },

  /** Left out, the pause button is not drawn at all. */
  onTogglePause: { type: Function as PropType<() => void>, default: undefined },

  /** The sound button needs both this and `isVideo`; either missing hides it. */
  onToggleSound: { type: Function as PropType<() => void>, default: undefined },
};

/** Public props interface for the {@link StoryHeader} component. */
export type StoryHeaderProps = ExtractPropTypes<typeof storyHeaderProps>;

/** Inline SVG for the verified badge (blue checkmark circle). */
const renderVerifiedBadge = () =>
  h(
    'svg',
    {
      class: 'rk-stories-header-verified',
      width: 14,
      height: 14,
      viewBox: '0 0 24 24',
      fill: 'none',
    },
    [
      h('circle', { cx: 12, cy: 12, r: 12, fill: '#3897F0' }),
      h('path', {
        d: 'M9.5 12.5L11 14L15 10',
        stroke: '#fff',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ],
  );

/**
 * Default header for a stories player slide.
 *
 * Renders the author avatar, name, optional verified badge, relative
 * timestamp, and a close button. Supports an opacity transition for
 * show and hide (for example when paused with `hideUiOnPause`).
 */
export const StoryHeader = defineComponent({
  name: 'StoryHeader',
  props: storyHeaderProps,
  setup(props) {
    return () =>
      h(
        'div',
        {
          class: [
            'rk-stories-header',
            props.visible ? '' : 'rk-stories-header--hidden',
          ],
        },
        [
          h('img', {
            class: 'rk-stories-header-avatar',
            src: props.author.avatar,
            alt: props.author.name,
          }),
          h('span', { class: 'rk-stories-header-name' }, props.author.name),
          props.author.verified ? renderVerifiedBadge() : null,
          props.createdAt
            ? h(
                'span',
                { class: 'rk-stories-header-time' },
                formatTimeAgo(props.createdAt),
              )
            : null,
          h('div', { class: 'rk-stories-header-actions' }, [
            props.isLoading && !props.isError
              ? h('div', { class: 'rk-stories-header-spinner' })
              : null,
            props.isVideo && props.onToggleSound
              ? h(
                  'button',
                  {
                    class: 'rk-stories-header-btn',
                    onClick: () => props.onToggleSound?.(),
                    'aria-label': props.isMuted ? 'Unmute' : 'Mute',
                  },
                  [h(props.isMuted ? VolumeX : Volume2, { size: 20 })],
                )
              : null,
            props.onTogglePause
              ? h(
                  'button',
                  {
                    class:
                      'rk-stories-header-btn rk-stories-header-btn--desktop',
                    onClick: () => props.onTogglePause?.(),
                    'aria-label': props.isPaused ? 'Play' : 'Pause',
                  },
                  [h(props.isPaused ? Play : Pause, { size: 20 })],
                )
              : null,
            h(
              'button',
              {
                class: 'rk-stories-header-btn',
                onClick: () => props.onClose(),
                'aria-label': 'Close',
              },
              [h(X, { size: 24 })],
            ),
          ]),
        ],
      );
  },
});
