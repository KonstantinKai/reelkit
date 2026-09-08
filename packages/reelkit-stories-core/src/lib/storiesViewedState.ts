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
   * Recomputed whenever the store publishes or the groups array is replaced,
   * so a group that pages in, moves, or gains a story is counted as it stands
   * now. Between those, calls return the same Map, so a memoized ring list
   * can skip its render.
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
 * after setup is measured at call time. Replace the array when the feed
 * changes rather than mutating it in place: results are reused while the same
 * array comes back, and an in-place mutation is the one change that cannot be
 * seen.
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
   * Furthest story reached in each group, keyed by group index. Every stored
   * entry is placed once — resolving runs the whole key cycle, so asking per
   * group would repeat that work for every group in the feed.
   *
   * Two entries can point at one group — a feed with a repeated author, or a
   * position key whose groups moved — so the furthest of them wins rather than
   * whichever came last.
   */
  const furthestByGroup = (): Map<number, number> => {
    const reached = new Map<number, number>();

    for (const track of viewed.entries.value.keys()) {
      const position = viewed.resolve(track);
      if (position === null) continue;

      const held = reached.get(position.outer);
      reached.set(
        position.outer,
        held === undefined ? position.inner : Math.max(held, position.inner),
      );
    }

    return reached;
  };

  /** How many stories of a group have been seen, never more than it holds. */
  const countOf = (
    reached: Map<number, number>,
    groupIndex: number,
    storyCount: number,
  ): number => {
    const inner = reached.get(groupIndex);
    return inner === undefined ? 0 : Math.min(inner + 1, storyCount);
  };

  /**
   * The last resolve, kept while nothing it was computed from has been
   * replaced. The store publishes a fresh Map on every change and a feed
   * replaces its array when it pages in or reorders, so identity is the whole
   * invalidation test: no clock, no counter. A ring list and an overlay both
   * ask during one render, and the overlay asks once per group it shows, so
   * without this each of those would walk every stored entry again.
   */
  let last: {
    entries: ReadonlyMap<string, string>;
    groups: StoriesGroup<T>[];
    reached: Map<number, number>;
    counts: Map<string, number> | null;
  } | null = null;

  const resolved = (currentGroups: StoriesGroup<T>[]) => {
    const currentEntries = viewed.entries.value;
    if (
      last !== null &&
      last.entries === currentEntries &&
      last.groups === currentGroups
    ) {
      return last;
    }

    last = {
      entries: currentEntries,
      groups: currentGroups,
      reached: furthestByGroup(),
      counts: null,
    };
    return last;
  };

  return {
    viewedCounts: () => {
      const current = resolved(groups());
      if (current.counts !== null) return current.counts;

      const counts = new Map<string, number>();
      current.groups.forEach((group, index) => {
        const count = countOf(current.reached, index, group.stories.length);
        if (count === 0) return;

        // A feed can carry the same author twice. The ring is drawn once per
        // author, so it reports the furthest of their groups.
        const held = counts.get(group.author.id);
        counts.set(
          group.author.id,
          held === undefined ? count : Math.max(held, count),
        );
      });

      current.counts = counts;
      return counts;
    },

    resumeStoryIndex: (groupIndex) => {
      const currentGroups = groups();
      const group = currentGroups[groupIndex];
      if (!group) return 0;

      const count = countOf(
        resolved(currentGroups).reached,
        groupIndex,
        group.stories.length,
      );
      return count >= group.stories.length ? 0 : count;
    },

    markViewed: (groupIndex, storyIndex) =>
      viewed.record({ outer: groupIndex, inner: storyIndex }),
  };
};
