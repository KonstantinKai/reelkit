import {
  createComputed,
  createViewedStateController,
  twoAxisViewedTracking,
  urlStableIdTwoAxisKey,
  type Dispose,
  type StorageAdapter,
  type Subscribable,
  type TwoAxisIdentity,
  type TwoAxisPosition,
  type UrlKey,
  type ViewedStateController,
} from '@reelkit/core';
import type { StoriesGroup, StoryItem } from './types';

/**
 * Configuration for {@link createStoriesViewedStateController}.
 *
 * `storageKey`, `key` and `storage` are read once, when the controller is
 * created, like the store underneath. A controller cannot be pointed at other
 * storage afterwards: create another one. In React that means remounting the
 * component that owns it, with a `key`.
 *
 * @typeParam T - Story item type.
 * @typeParam Id - Identity the `key` spells into a stored entry. Only matters
 * when `key` is given.
 */
export interface StoriesViewedStateControllerConfig<
  T extends StoryItem = StoryItem,
  Id extends TwoAxisIdentity<unknown, unknown> = TwoAxisIdentity<
    string,
    string
  >,
> {
  /** Storage key the entries are written under, for example `stories-seen`. */
  storageKey: string;

  /**
   * How a position is spelled in storage, in place of the default. Pass the
   * key the URL controller uses and a stored entry reads exactly like the
   * parameter of a shared link.
   *
   * @default stable ids: `<author.id>.<story.id>`, which survives the feed
   * being reordered. A feed that carries the same author id twice resolves
   * only the first of those groups; give such a feed a key of its own.
   */
  key?: UrlKey<Id, TwoAxisPosition>;

  /**
   * Where the entries are kept. A custom adapter is also how a seen store of
   * your own, a server's for instance, plugs in.
   *
   * @default localStorage
   */
  storage?: StorageAdapter;

  /**
   * How long a group's entry stays remembered after it was last recorded, in
   * milliseconds. Each group expires on its own clock, and recording it again
   * restarts that clock. Age is judged whenever storage is read or written.
   *
   * @default undefined — remembered until forgotten explicitly
   */
  ttlMs?: number;

  /**
   * How many groups to keep. Past it, the group recorded longest ago is
   * dropped on the next write, so a viewer who has seen thousands of authors
   * keeps a payload the size of the ones they still visit.
   *
   * @default undefined — every group kept
   */
  maxTracks?: number;

  /**
   * Reads the current groups. A getter, called every time the groups are
   * needed, so a feed that pages in more of them only has to return them.
   * Return the same array while the feed is unchanged: the counts are kept for
   * as long as it comes back.
   *
   * The player and the ring list receive `groups` as a prop of their own, and
   * nothing ties the two together. A getter that keeps returning the first
   * array miscounts every group loaded after it, silently. Where the groups
   * live in a plain variable that is replaced on render, read them through
   * something that stays current, like a ref.
   */
  groups: () => StoriesGroup<T>[];
}

/**
 * What a stories player needs to remember what a viewer has seen: ring counts,
 * where each group resumes, and the recorder, over storage that survives a
 * reload. The ring list and the player take it as their `viewed` prop.
 */
export interface StoriesViewedStateController {
  /**
   * How many stories each group has been seen through, keyed by author id —
   * what the rings are drawn from — as a signal. Recomputed whenever the store
   * publishes or the groups array is replaced; between those, reads return the
   * same map. Empty before {@link StoriesViewedStateController.attach}.
   *
   * A replaced feed is picked up the next time the value is read; the signal
   * does not notify for that alone, since whatever draws the groups is
   * re-rendering with them already.
   */
  readonly viewedState: Subscribable<Map<string, number>>;

  /** The store underneath, for whatever this does not cover. */
  readonly controller: ViewedStateController<TwoAxisPosition>;

  /**
   * Which story a group should open on: the first one not yet seen, or the
   * first story of all when the group has been watched to the end. A group
   * nothing is stored for opens at its start.
   */
  resumeStoryIndex: (groupIndex: number) => number;

  /**
   * Records a story as seen. The player calls it for every story shown; call
   * it yourself only from a player of your own.
   */
  markViewed: (groupIndex: number, storyIndex: number) => void;

  /** Forgets everything seen, here and in storage. */
  forget: () => void;

  /**
   * Reads storage and starts following changes made by other tabs. Nothing is
   * read before this, so a server render and the first browser render agree:
   * nothing seen yet. Call it once the component is mounted.
   *
   * Counted: a ring list and a player both attach, either can unmount first,
   * and the store stays attached until the last of them lets go. The player
   * components call this themselves when given the controller. Call it by hand
   * only where they cannot do it in time, which is a player mounted at the
   * moment it opens: it chooses the opening story while it first renders,
   * before any effect of its own has run.
   *
   * @returns Lets go of this attachment. Calling it again does nothing.
   */
  attach: () => Dispose;
}

/**
 * Creates everything a stories feed needs to remember what was seen, from one
 * call. Framework-agnostic: create it once where the feed lives, then hand it
 * to the ring list and the player, which attach it and follow it themselves.
 *
 * It composes {@link createViewedStateController} with the stable-id two-axis
 * key and two-axis tracking. Reach for those directly when this does not fit.
 *
 * @typeParam T - Story item type.
 * @typeParam Id - Identity the `key` spells into a stored entry.
 * @param config - See {@link StoriesViewedStateControllerConfig}.
 * @returns The controller, inert until {@link StoriesViewedStateController.attach}.
 *
 * @example React
 * ```tsx
 * const [viewed] = useState(() =>
 *   createStoriesViewedStateController({
 *     storageKey: 'stories-seen',
 *     groups: () => groupsRef.current,
 *   }),
 * );
 *
 * <StoriesRingList groups={groups} viewed={viewed} onSelect={open} />
 * <StoriesOverlay groups={groups} viewed={viewed} isOpen={isOpen} onClose={close} />
 * ```
 *
 * @example Vue
 * ```ts
 * const viewed = createStoriesViewedStateController({
 *   storageKey: 'stories-seen',
 *   groups: () => groups.value,
 * });
 * ```
 *
 * @example Angular
 * ```ts
 * readonly viewed = createStoriesViewedStateController({
 *   storageKey: 'stories-seen',
 *   groups: () => this.groups(),
 * });
 * ```
 */
export const createStoriesViewedStateController = <
  T extends StoryItem = StoryItem,
  Id extends TwoAxisIdentity<unknown, unknown> = TwoAxisIdentity<
    string,
    string
  >,
>(
  config: StoriesViewedStateControllerConfig<T, Id>,
): StoriesViewedStateController => {
  const { groups } = config;

  const key = (config.key ??
    urlStableIdTwoAxisKey({
      outerItems: () => groups().map((group) => ({ id: group.author.id })),
      innerItems: (outer) =>
        groups().find((group) => group.author.id === outer.id)?.stories ?? [],
    })) as UrlKey<Id, TwoAxisPosition>;

  const controller = createViewedStateController<Id, TwoAxisPosition>({
    storageKey: config.storageKey,
    storage: config.storage,
    ttlMs: config.ttlMs,
    maxTracks: config.maxTracks,
    ...key,
    ...twoAxisViewedTracking,
  });

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

    for (const track of controller.entries.value.keys()) {
      const position = controller.resolve(track);
      if (position === null) continue;

      const held = reached.get(position.outer);
      reached.set(
        position.outer,
        held === undefined ? position.inner : Math.max(held, position.inner),
      );
    }

    return reached;
  };

  /**
   * How many stories of a group have been seen, never more than it holds. The
   * store names the furthest story reached, so this is that story's position,
   * not a tally of views: opening the third story straight away counts three.
   */
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
    const currentEntries = controller.entries.value;
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

  const viewedCounts = () => {
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
  };

  let attachments = 0;
  let detach: Dispose | null = null;

  return {
    viewedState: createComputed(viewedCounts, () => [controller.entries]),
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
      controller.record({ outer: groupIndex, inner: storyIndex }),
    forget: () => controller.forget(),
    controller,
    attach: () => {
      attachments += 1;
      if (attachments === 1) detach = controller.attach();

      let released = false;
      return () => {
        if (released) return;
        released = true;
        attachments -= 1;
        if (attachments === 0) {
          detach?.();
          detach = null;
        }
      };
    },
  };
};
