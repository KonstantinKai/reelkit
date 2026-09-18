import type { FC } from 'react';
import { Observe } from '@reelkit/react';
import type {
  StoriesGroup,
  StoriesViewedStateController,
} from '@reelkit/stories-core';
import { StoriesRing } from './StoriesRing';
import { useAttachViewedState } from './useAttachViewedState';
import './StoriesRingList.css';

/** Props for the {@link StoriesRingList} component. */
export interface StoriesRingListProps {
  /** Ordered list of story groups to display. */
  groups: StoriesGroup[];

  /**
   * What the viewer has seen, from `createStoriesViewedStateController`. The rings
   * follow it by themselves: a story marked seen repaints them and nothing
   * else, and the list reads the store while it is mounted. Without it every
   * ring shows the unwatched gradient. Hand the same controller to the player.
   */
  viewed?: StoriesViewedStateController;

  /**
   * Diameter for each ring in pixels.
   * @default 64
   */
  ringSize?: number;

  /** Callback fired when a ring is selected, with the group index. */
  onSelect: (groupIndex: number) => void;
}

/**
 * Horizontal scrollable row of {@link StoriesRing} components.
 *
 * Renders one ring per story group with the author's name truncated below.
 * Scroll is handled natively via `overflow-x: auto` with hidden scrollbars.
 */
export const StoriesRingList: FC<StoriesRingListProps> = ({
  groups,
  viewed,
  onSelect,
  ringSize = 64,
}) => {
  useAttachViewedState(viewed);

  return (
    <div className="rk-stories-ring-list">
      <Observe signals={viewed ? [viewed.viewedState] : []}>
        {() => {
          const counts = viewed?.viewedState.value;
          return (
            <>
              {groups.map((group, index) => (
                <div
                  key={group.author.id}
                  className="rk-stories-ring-list-item"
                >
                  <StoriesRing
                    author={group.author}
                    totalStories={group.stories.length}
                    viewedCount={counts?.get(group.author.id) ?? 0}
                    size={ringSize}
                    onClick={() => onSelect(index)}
                  />
                  <span
                    className="rk-stories-ring-list-name"
                    style={{ maxWidth: ringSize }}
                  >
                    {group.author.name}
                  </span>
                </div>
              ))}
            </>
          );
        }}
      </Observe>
    </div>
  );
};
