import type { TwoAxisPosition, ViewedStateController } from '@reelkit/core';
import type { StoriesGroup, StoryItem } from './types';

/**
 * The stories view of a {@link ViewedStateController}: what a ring should show, where a
 * group should open, and how a viewed story is recorded.
 */
export interface StoriesViewedState {
  /**
   * How many stories each group has been seen through, keyed by author id —
   * the shape `StoriesRingList` takes as its `viewedState`.
   *
   * Computed from the controller on every call rather than cached, so a group that
   * pages in, moves, or gains a story is counted as it stands now.
   */
  viewedCounts(): Map<string, number>;

  /**
   * Which story a group should open on: the first one not yet seen, or the
   * first story of all when the group has been watched to the end. A group
   * nothing is stored for opens at its start.
   */
  resumeStoryIndex(groupIndex: number): number;

  /** Records a story as seen. */
  markViewed(groupIndex: number, storyIndex: number): void;
}

/**
 * Reads and writes a {@link ViewedStateController} in the terms a stories player uses —
 * groups, authors, and story indexes — leaving the controller itself unaware of any
 * of them.
 *
 * The controller holds one entry per group, naming the furthest story reached, so a
 * count is that story's position rather than a tally of individual views. An
 * identity-addressed key therefore keeps a group's place across the feed being
 * reordered, while a story removed from the middle of a group shortens its
 * count and lights its ring again — the same self-healing a shared link gets.
 *
 * @typeParam T - The story type the groups carry.
 * @param viewed - Controller built from the same key the URL uses, tracked per group.
 * @param groups - Reads the current groups. A getter, so a feed that pages in
 * after setup is measured at call time.
 * @returns The ring counts, resume position, and view recorder.
 *
 * @example Wire a ring list and a player to what has been seen
 * ```ts
 * const seen = createViewedStateController({
 *   storageKey: 'stories-seen',
 *   ...urlStableIdTwoAxisKey({ outerItems, innerItems }),
 *   ...twoAxisViewedTracking,
 * });
 * seen.attach();
 *
 * const viewed = createStoriesViewedState(seen, () => groups);
 *
 * viewed.viewedCounts(); // → Map { 'user_42' => 2 } — the ring's `viewedState`
 * viewed.resumeStoryIndex(0); // → 2, the first story not yet seen
 * viewed.markViewed(0, 2); // wire this to `onStoryViewed`
 * ```
 */
export const createStoriesViewedState = <T extends StoryItem = StoryItem>(
  viewed: ViewedStateController<TwoAxisPosition>,
  groups: () => StoriesGroup<T>[],
): StoriesViewedState => {
  /**
   * How many stories of `groupIndex` have been seen. Two entries can point at
   * one group — a feed with a repeated author, or a position key whose groups
   * moved — so the furthest of them wins rather than whichever came last.
   */
  const countOf = (groupIndex: number, storyCount: number): number => {
    let count = 0;

    for (const track of viewed.entries.value.keys()) {
      const position = viewed.resolve(track);
      if (position === null || position.outer !== groupIndex) continue;
      count = Math.max(count, Math.min(position.inner + 1, storyCount));
    }

    return count;
  };

  return {
    viewedCounts: () => {
      const counts = new Map<string, number>();

      groups().forEach((group, index) => {
        const count = countOf(index, group.stories.length);
        if (count > 0) counts.set(group.author.id, count);
      });

      return counts;
    },

    resumeStoryIndex: (groupIndex) => {
      const group = groups()[groupIndex];
      if (!group) return 0;

      const count = countOf(groupIndex, group.stories.length);
      return count >= group.stories.length ? 0 : count;
    },

    markViewed: (groupIndex, storyIndex) =>
      viewed.record({ outer: groupIndex, inner: storyIndex }),
  };
};
