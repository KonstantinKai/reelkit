import { defineComponent, h, type ExtractPropTypes, type PropType } from 'vue';
import { Observe } from '@reelkit/vue';
import type {
  StoriesGroup,
  StoriesViewedStateController,
} from '@reelkit/stories-core';
import { StoriesRing } from './StoriesRing';
import { useAttachViewedState } from './useAttachViewedState';
import './StoriesRingList.css';

/** Props accepted by the {@link StoriesRingList} component. */
const storiesRingListProps = {
  /** Ordered list of story groups to display. */
  groups: {
    type: Array as PropType<StoriesGroup[]>,
    required: true as const,
  },

  /**
   * What the viewer has seen, from `createStoriesViewedStateController`. The
   * rings follow it by themselves: a story marked seen repaints them and
   * nothing else, and the list reads the store while it is mounted. Without it
   * every ring shows the unwatched gradient. Hand the same controller to the
   * player.
   */
  viewed: {
    type: Object as PropType<StoriesViewedStateController>,
    default: undefined,
  },

  /**
   * Diameter for each ring in pixels.
   *
   * @default 64
   */
  ringSize: { type: Number, default: 64 },
};

/** Public props interface for the {@link StoriesRingList} component. */
export type StoriesRingListProps = ExtractPropTypes<
  typeof storiesRingListProps
>;

/**
 * Horizontal scrollable row of {@link StoriesRing} components.
 *
 * Renders one ring per story group with the author's name truncated below,
 * and emits `select` with the group index when a ring is pressed. Scroll is
 * handled natively via `overflow-x: auto` with hidden scrollbars.
 */
export const StoriesRingList = defineComponent({
  name: 'StoriesRingList',
  props: storiesRingListProps,
  emits: {
    select: (_groupIndex: number) => true,
  },
  setup(props, { emit }) {
    useAttachViewedState(() => props.viewed);

    const renderRings = () => {
      const counts = props.viewed?.viewedState.value;
      return props.groups.map((group, index) =>
        h('div', { key: group.author.id, class: 'rk-stories-ring-list-item' }, [
          h(StoriesRing, {
            author: group.author,
            totalStories: group.stories.length,
            viewedCount: counts?.get(group.author.id) ?? 0,
            size: props.ringSize,
            onClick: () => emit('select', index),
          }),
          h(
            'span',
            {
              class: 'rk-stories-ring-list-name',
              style: { maxWidth: `${props.ringSize}px` },
            },
            group.author.name,
          ),
        ]),
      );
    };

    return () =>
      h('div', { class: 'rk-stories-ring-list' }, [
        h(
          Observe,
          { signals: props.viewed ? [props.viewed.viewedState] : [] },
          { default: renderRings },
        ),
      ]);
  },
});
