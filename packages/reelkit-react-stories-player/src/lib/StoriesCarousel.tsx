import type { CSSProperties, ReactNode, TransitionEvent } from 'react';
import { Observe, type Subscribable } from '@reelkit/react';
import {
  formatTimeAgo,
  getCardOffsets,
  getCardSize,
  getCarouselSlot,
  getRingPresentation,
  getSlideGroupIndexes,
  getSlotOffset,
  isCardShown,
  type StoryItem,
  type StoriesGroup,
} from '@reelkit/stories-core';
import type { GroupPreviewRenderProps } from './types';
import './StoriesCarousel.css';

/**
 * A group change in progress. `start` lays the cards out around the group
 * being left, with no transition; `run` moves them to their places around the
 * group being opened, which is what the cards animate across.
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

/**
 * Props for the desktop carousel `StoriesOverlay` draws behind the player when
 * `desktopLayout` is `'carousel'`. The overlay owns every value here; the
 * carousel only draws the cards and reports clicks and the end of a slide.
 *
 * @typeParam T - Story item type.
 */
export interface StoriesCarouselProps<T extends StoryItem = StoryItem> {
  /** Every group the player shows, in player order. */
  groups: StoriesGroup<T>[];

  /**
   * Group the player is on. At rest the cards are laid out around it; during a
   * slide `slide` decides the layout instead.
   */
  activeGroupIndex: number;

  /** The group change in progress, or `null` when the cards are at rest. */
  slide: CarouselSlide | null;

  /**
   * Player canvas size as `[width, height]`. Card size and every slot position
   * are derived from it, so the cards follow a window resize.
   */
  activeSize: [number, number];

  /**
   * Signal holding the stories seen per author id, from the overlay's `viewed`
   * controller. A card whose group is watched to the end draws the muted ring;
   * without it every ring shows the unwatched gradient. The cards follow the
   * signal by themselves, so a change repaints them and nothing else.
   */
  viewedState?: Subscribable<Map<string, number>>;

  /**
   * Story a group would open on, which is the one its card previews. The
   * overlay passes the stories controller's `getLastStoryIndex`, so a card
   * matches what a click on it opens.
   */
  storyIndexFor: (groupIndex: number) => number;

  /**
   * Replaces the content of every card. The carousel still positions, scales
   * and slides the card around it.
   */
  renderGroupPreview?: (props: GroupPreviewRenderProps<T>) => ReactNode;

  /**
   * Draws a story at the player's size; the overlay passes its `renderSlide`.
   * The default card scales the result down for a story with no poster or
   * image. A custom `renderGroupPreview` draws its own preview from `story`
   * instead. Not called for videos: the player plays every video through one
   * shared element.
   */
  renderFrame?: (story: T, groupIndex: number) => ReactNode;

  /** Called with a card's group index when the card is clicked. */
  onOpen: (groupIndex: number) => void;

  /**
   * Called when the card moving into the center finishes its transform
   * transition, so the overlay can show the player and start the timer.
   */
  onSlideEnd: () => void;
}

const _kCardRingSize = 52;

/**
 * The cards themselves, drawn under an `Observe` on the viewed signal. A story
 * being marked seen re-renders this component alone: the carousel around it,
 * and the player that renders the carousel, take no part.
 */
function CarouselCards({
  groupIndexes,
  viewedState,
  renderCard,
}: {
  /** Groups to draw a card for, in group order. */
  groupIndexes: number[];

  /** Signal holding the stories seen per author id, when the player has one. */
  viewedState: Subscribable<Map<string, number>> | undefined;

  /** Draws the card of one group from the viewed map as it is right now. */
  renderCard: (
    groupIndex: number,
    viewed: Map<string, number> | undefined,
  ) => ReactNode;
}) {
  return (
    <Observe signals={viewedState ? [viewedState] : []}>
      {() => (
        <>
          {groupIndexes.map((groupIndex) =>
            renderCard(groupIndex, viewedState?.value),
          )}
        </>
      )}
    </Observe>
  );
}

// Set on the element rather than through the `inert` prop: React 18 does not
// know the prop and React 19 reads it as a boolean, so the same markup would
// mean different things under each.
const makeInert = (element: HTMLElement | null) => {
  element?.setAttribute('inert', '');
};

/** Image a card shows: the video poster, the image itself, or none. */
const previewSource = (story: StoryItem | undefined) =>
  story?.poster ?? (story?.mediaType === 'image' ? story.src : undefined);

function DefaultCard<T extends StoryItem>({
  group,
  story,
  viewedCount,
  focusable,
  renderFrame,
  onOpen,
}: GroupPreviewRenderProps<T> & {
  focusable: boolean;
  renderFrame: () => ReactNode;
}) {
  const source = previewSource(story);
  const ring = getRingPresentation({
    totalStories: group.stories.length,
    viewedCount,
    size: _kCardRingSize,
  });

  return (
    <>
      {/* Under the button, never inside it: a custom slide can hold buttons
          and links of its own, and a control cannot sit inside another. */}
      {source ? null : renderFrame()}
      <button
        type="button"
        className="rk-stories-card-button"
        aria-label={`Open stories by ${group.author.name}`}
        tabIndex={focusable ? 0 : -1}
        onClick={onOpen}
      >
        {source ? (
          <img className="rk-stories-card-image" src={source} alt="" />
        ) : null}
        <span className="rk-stories-card-scrim" />
        <span className="rk-stories-card-info">
          <span className={ring.className} style={ring.style as CSSProperties}>
            <img
              className="rk-stories-ring-avatar"
              src={group.author.avatar}
              alt=""
              width={ring.avatarSize}
              height={ring.avatarSize}
            />
          </span>
          <span className="rk-stories-card-name">{group.author.name}</span>
          {story?.createdAt ? (
            <span className="rk-stories-card-time">
              {formatTimeAgo(story.createdAt)}
            </span>
          ) : null}
        </span>
      </button>
    </>
  );
}

/**
 * Side cards of the desktop carousel. At rest it draws the neighbouring
 * groups around the active story, which the player itself fills. During a
 * group change it also draws the groups at both ends in the center slot and
 * slides every card from its place around the old group to its place around
 * the new one.
 */
export function StoriesCarousel<T extends StoryItem = StoryItem>({
  groups,
  activeGroupIndex,
  slide,
  activeSize,
  storyIndexFor,
  viewedState,
  renderGroupPreview,
  renderFrame,
  onOpen,
  onSlideEnd,
}: StoriesCarouselProps<T>) {
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

  // The story drawn by the consumer's slide renderer at the player's size and
  // scaled to the card, for a story with no poster or image of its own, like a
  // text story on a gradient. Videos are left out: the player plays every video
  // through one shared element. The frame is a picture of the story, nothing
  // in it is for use, so it is inert: no focus, no clicks, no screen reader.
  const cardFrame = (story: T | undefined, groupIndex: number) =>
    story && story.mediaType !== 'video' && renderFrame ? (
      <span
        ref={makeInert}
        className="rk-stories-card-frame"
        aria-hidden="true"
        style={{ transform: `scale(${cardHeight / activeSize[1]})` }}
      >
        {renderFrame(story, groupIndex)}
      </span>
    ) : null;

  const onTransitionEnd = (
    event: TransitionEvent<HTMLDivElement>,
    groupIndex: number,
  ) => {
    if (
      slide?.phase === 'run' &&
      groupIndex === slide.to &&
      event.propertyName === 'transform' &&
      event.target === event.currentTarget
    ) {
      onSlideEnd();
    }
  };

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
    const story = group.stories[storyIndexFor(groupIndex)];
    const previewProps: GroupPreviewRenderProps<T> = {
      group,
      groupIndex,
      story,
      offset,
      viewedCount: viewed?.get(group.author.id) ?? 0,
      onOpen: () => onOpen(groupIndex),
    };

    return (
      <div
        key={groupIndex}
        className={`rk-stories-card${offset === 0 ? ' rk-stories-card--center' : ''}${visible ? '' : ' rk-stories-card--hidden'}`}
        style={{
          width: cardWidth,
          height: cardHeight,
          transform: `translate(-50%, -50%) translateX(${slot.x}px) scale(${scale})`,
        }}
        onTransitionEnd={(event) => onTransitionEnd(event, groupIndex)}
      >
        {renderGroupPreview ? (
          renderGroupPreview(previewProps)
        ) : (
          <DefaultCard
            {...previewProps}
            focusable={slide === null && visible}
            renderFrame={() => cardFrame(story, groupIndex)}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className={`rk-stories-carousel${slide?.phase === 'start' ? ' rk-stories-carousel--instant' : ''}`}
    >
      <CarouselCards
        groupIndexes={groupIndexes}
        viewedState={viewedState}
        renderCard={renderCard}
      />
    </div>
  );
}
