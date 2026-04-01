import { clamp } from '@reelkit/core';
import type { SegmentState, VisibleWindow } from './types';

/**
 * Computes the status and fill percentage of each segment in a
 * segmented progress bar.
 */
export const getSegments = (
  totalStories: number,
  activeIndex: number,
  timerProgress: number,
): SegmentState[] => {
  const segments: SegmentState[] = [];

  for (let i = 0; i < totalStories; i++) {
    if (i < activeIndex) {
      segments.push({ status: 'completed', fillPercentage: 100 });
    } else if (i === activeIndex) {
      segments.push({
        status: 'active',
        fillPercentage: clamp(timerProgress * 100, 0, 100),
      });
    } else {
      segments.push({ status: 'upcoming', fillPercentage: 0 });
    }
  }

  return segments;
};

/**
 * Computes the visible sliding window of segments when the total
 * count exceeds what the container can display at the minimum width.
 * The active segment is always kept within the visible range.
 */
export const getVisibleWindow = (
  totalStories: number,
  activeIndex: number,
  timerProgress: number,
  containerWidth: number,
  minSegmentWidth = 4,
  gap = 2,
): VisibleWindow => {
  const allSegments = getSegments(totalStories, activeIndex, timerProgress);
  const maxVisible = Math.floor(
    (containerWidth + gap) / (minSegmentWidth + gap),
  );

  if (totalStories <= maxVisible) {
    return {
      startIndex: 0,
      endIndex: totalStories - 1,
      segments: allSegments,
    };
  }

  // Keep active segment near the left (~20% from left edge) so most
  // of the visible window shows upcoming segments. Completed segments
  // slide off the left edge as the user advances.
  const leftBias = Math.max(1, Math.floor(maxVisible * 0.2));
  let startIndex = activeIndex - leftBias;

  if (startIndex < 0) {
    startIndex = 0;
  } else if (startIndex + maxVisible > totalStories) {
    startIndex = totalStories - maxVisible;
  }

  const endIndex = startIndex + maxVisible - 1;

  return {
    startIndex,
    endIndex,
    segments: allSegments.slice(startIndex, endIndex + 1),
  };
};
