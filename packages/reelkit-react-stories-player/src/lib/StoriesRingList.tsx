import type { FC } from 'react';
import type { StoriesGroup } from '@reelkit/stories-core';
import { StoriesRing } from './StoriesRing';
import './StoriesRingList.css';

/** Props for the {@link StoriesRingList} component. */
export interface StoriesRingListProps {
  /** Ordered list of story groups to display. */
  groups: StoriesGroup[];

  /** Map of author ID to viewed story count. */
  viewedState: Map<string, number>;

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
  viewedState,
  onSelect,
  ringSize = 64,
}) => (
  <div className="rk-stories-ring-list">
    {groups.map((group, index) => (
      <div key={group.author.id} className="rk-stories-ring-list-item">
        <StoriesRing
          author={group.author}
          totalStories={group.stories.length}
          viewedCount={viewedState.get(group.author.id) ?? 0}
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
  </div>
);
