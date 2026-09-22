import {
  defineComponent,
  h,
  type PropType,
  type VNode,
  type VNodeChild,
} from 'vue';
import {
  Observe,
  createSignal,
  hasRenderedNodes,
  toVueRef,
  type Subscribable,
} from '@reelkit/vue';
import {
  formatTimeAgo,
  getCardOffsets,
  getCardSize,
  getCarouselSlot,
  getPreviewSource,
  getRingPresentation,
  getSlideGroupIndexes,
  getSlotOffset,
  isCardShown,
  type StoryItem,
  type StoriesGroup,
} from '@reelkit/stories-core';
import type { GroupPreviewSlotScope } from './types';
import './StoriesCarousel.css';

/**
 * A group change in progress. `start` lays the cards out around the group
 * being left, with no transition; `run` moves them to their places around the
 * group being opened, which is what the cards animate across.
 *
 * @internal
 */
export interface CarouselSlide {
  /** Index of the group being left. */
  from: number;

  /** Index of the group being opened. */
  to: number;

  /**
   * `start` for the first frame, laid out around `from` with transitions off;
   * `run` once the cards are moving to their places around `to`.
   */
  phase: 'start' | 'run';
}

const _kCardRingSize = 52;

// Set on the element rather than bound as a property: `inert` is a boolean DOM
// property, and older Vue versions would write an empty string into it, which
// reads as false and leaves the frame interactive.
const makeInert = (element: unknown) => {
  (element as HTMLElement | null)?.setAttribute('inert', '');
};

const renderDefaultCard = (
  scope: GroupPreviewSlotScope,
  focusable: boolean,
  frame: VNode | null,
  failed: ReadonlySet<string>,
  onPreviewFailed: (source: string) => void,
): VNodeChild[] => {
  const { group, story, viewedCount, onOpen } = scope;

  // A picture that will not load is treated as no picture at all, so the card
  // falls back to the one drawn for a story with nothing to preview rather
  // than to the browser's broken-image mark.
  const candidate = getPreviewSource(story);
  const source = candidate && !failed.has(candidate) ? candidate : undefined;
  const ring = getRingPresentation({
    totalStories: group.stories.length,
    viewedCount,
    size: _kCardRingSize,
  });

  return [
    // Under the button, never inside it: a custom slide can hold buttons and
    // links of its own, and a control cannot sit inside another. The frame is
    // for a story with no picture of its own; one whose picture failed falls
    // back to the plain card, or the slide would paint it in whatever it
    // paints a story with media.
    candidate ? null : frame,
    h(
      'button',
      {
        type: 'button',
        class: 'rk-stories-card-button',
        'aria-label': `Open stories by ${group.author.name}`,
        tabindex: focusable ? 0 : -1,
        onClick: onOpen,
      },
      [
        source
          ? h('img', {
              class: 'rk-stories-card-image',
              src: source,
              alt: '',
              onError: () => onPreviewFailed(source),
            })
          : null,
        h('span', { class: 'rk-stories-card-scrim' }),
        h('span', { class: 'rk-stories-card-info' }, [
          h('span', { class: ring.className, style: ring.style }, [
            h('img', {
              class: 'rk-stories-ring-avatar',
              src: group.author.avatar,
              alt: '',
              width: ring.avatarSize,
              height: ring.avatarSize,
            }),
          ]),
          h('span', { class: 'rk-stories-card-name' }, group.author.name),
          story?.createdAt
            ? h(
                'span',
                { class: 'rk-stories-card-time' },
                formatTimeAgo(story.createdAt),
              )
            : null,
        ]),
      ],
    ),
  ];
};

/**
 * Side cards of the desktop carousel. At rest it draws the neighbouring
 * groups around the active story, which the player itself fills. During a
 * group change it also draws the groups at both ends in the center slot and
 * slides every card from its place around the old group to its place around
 * the new one. The overlay owns every value here; the carousel only draws the
 * cards and reports clicks and the end of a slide.
 *
 * @internal
 */
export const StoriesCarousel = defineComponent({
  name: 'RkStoriesCarousel',
  props: {
    /** Every group the player shows, in player order. */
    groups: {
      type: Array as PropType<StoriesGroup[]>,
      required: true as const,
    },

    /**
     * Group the player is on. At rest the cards are laid out around it; during
     * a slide `slide` decides the layout instead.
     */
    activeGroupIndex: { type: Number, required: true as const },

    /** The group change in progress, or `null` when the cards are at rest. */
    slide: {
      type: Object as PropType<CarouselSlide | null>,
      default: null,
    },

    /**
     * Player canvas size as `[width, height]`. Card size and every slot
     * position are derived from it, so the cards follow a window resize.
     */
    activeSize: {
      type: Array as unknown as PropType<[number, number]>,
      required: true as const,
    },

    /**
     * Story a group would open on, which is the one its card previews: the
     * stories controller's `getLastStoryIndex`, so a card matches what a click
     * on it opens.
     */
    storyIndexFor: {
      type: Function as PropType<(groupIndex: number) => number>,
      required: true as const,
    },

    /**
     * Signal holding the stories seen per author id, from the overlay's
     * `viewed` controller. The cards follow it by themselves, so a change
     * repaints them and nothing else.
     */
    viewedState: {
      type: Object as PropType<Subscribable<Map<string, number>>>,
      default: undefined,
    },

    /**
     * Replaces the content of every card: the `groupPreview` slot. The
     * carousel still positions, scales and slides the card around it.
     */
    renderGroupPreview: {
      type: Function as PropType<
        (scope: GroupPreviewSlotScope) => VNode[] | undefined
      >,
      default: undefined,
    },

    /**
     * Draws a story at the player's size: the `slide` slot. The default card
     * scales it down for a story with no poster or image. Not called for
     * videos: the player plays every video through one shared element.
     */
    renderFrame: {
      type: Function as PropType<
        (story: StoryItem, groupIndex: number) => VNodeChild
      >,
      default: undefined,
    },

    /** Called with a card's group index when the card is clicked. */
    onOpen: {
      type: Function as PropType<(groupIndex: number) => void>,
      required: true as const,
    },

    /**
     * Called when the card moving into the center finishes its transform
     * transition, so the overlay can show the player and start the timer.
     */
    onSlideEnd: {
      type: Function as PropType<() => void>,
      required: true as const,
    },
  },
  setup(props) {
    // Sources that would not load, bridged into a ref so a failure redraws
    // the cards. Kept by source rather than by group so a feed that grows or
    // reorders carries the answer with it.
    const failedSignal = createSignal<ReadonlySet<string>>(new Set());
    const failedPreviews = toVueRef(failedSignal);
    const onPreviewFailed = (source: string) => {
      if (failedSignal.value.has(source)) return;
      failedSignal.value = new Set(failedSignal.value).add(source);
    };

    const onTransitionEnd = (event: TransitionEvent, groupIndex: number) => {
      const slide = props.slide;
      if (
        slide?.phase === 'run' &&
        groupIndex === slide.to &&
        event.propertyName === 'transform' &&
        event.target === event.currentTarget
      ) {
        props.onSlideEnd();
      }
    };

    return () => {
      const { groups, activeGroupIndex, slide, activeSize } = props;
      const [cardWidth, cardHeight] = getCardSize(activeSize);
      const base = slide
        ? slide.phase === 'start'
          ? slide.from
          : slide.to
        : activeGroupIndex;
      const groupIndexes = slide
        ? getSlideGroupIndexes(slide.from, slide.to, groups.length)
        : getCardOffsets(activeGroupIndex, groups.length).map(
            (offset) => activeGroupIndex + offset,
          );

      // The story drawn by the consumer's slide slot at the player's size and
      // scaled to the card, for a story with no poster or image of its own,
      // like a text story on a gradient. Videos are left out: the player plays
      // every video through one shared element. The frame is a picture of the
      // story, nothing in it is for use, so it is inert: no focus, no clicks,
      // no screen reader.
      const cardFrame = (story: StoryItem | undefined, groupIndex: number) =>
        story && story.mediaType !== 'video' && props.renderFrame
          ? h(
              'span',
              {
                ref: makeInert,
                class: 'rk-stories-card-frame',
                'aria-hidden': 'true',
                style: { transform: `scale(${cardHeight / activeSize[1]})` },
              },
              [props.renderFrame(story, groupIndex)],
            )
          : null;

      const renderCard = (
        groupIndex: number,
        viewed: Map<string, number> | undefined,
      ) => {
        const group = groups[groupIndex];
        if (!group) return null;

        const offset = groupIndex - base;
        const visible = isCardShown(offset);
        const slot = getCarouselSlot(getSlotOffset(offset), activeSize);
        const scale = slot.height / cardHeight;
        const story = group.stories[props.storyIndexFor(groupIndex)];
        const scope: GroupPreviewSlotScope = {
          group,
          groupIndex,
          story,
          offset,
          viewedCount: viewed?.get(group.author.id) ?? 0,
          onOpen: () => props.onOpen(groupIndex),
        };

        // A slot that renders nothing for this card falls back to the default.
        const custom = props.renderGroupPreview?.(scope);

        return h(
          'div',
          {
            key: groupIndex,
            class: [
              'rk-stories-card',
              offset === 0 ? 'rk-stories-card--center' : '',
              visible ? '' : 'rk-stories-card--hidden',
            ],
            style: {
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              transform: `translate(-50%, -50%) translateX(${slot.x}px) scale(${scale})`,
            },
            onTransitionend: (event: TransitionEvent) =>
              onTransitionEnd(event, groupIndex),
          },
          custom && hasRenderedNodes(custom)
            ? custom
            : renderDefaultCard(
                scope,
                slide === null && visible,
                cardFrame(story, groupIndex),
                failedPreviews.value,
                onPreviewFailed,
              ),
        );
      };

      const viewedState = props.viewedState;

      return h(
        'div',
        {
          class: [
            'rk-stories-carousel',
            slide?.phase === 'start' ? 'rk-stories-carousel--instant' : '',
          ],
        },
        [
          // The cards follow the viewed signal on their own: a story being
          // marked seen repaints them, and neither this carousel nor the
          // player around it.
          h(
            Observe,
            { signals: viewedState ? [viewedState] : [] },
            {
              default: () =>
                groupIndexes.map((groupIndex) =>
                  renderCard(groupIndex, viewedState?.value),
                ),
            },
          ),
        ],
      );
    };
  },
});
