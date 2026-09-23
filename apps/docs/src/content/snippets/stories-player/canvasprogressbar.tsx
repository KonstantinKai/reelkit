import { CanvasProgressBar } from '@reelkit/react-stories-player';

<CanvasProgressBar
  totalStories={group.stories.length}
  activeIndex={activeIndexSignal}
  progress={progressSignal}
  minSegmentWidth={8}
  gap={2}
  barHeight={2}
  // A bar that is not live draws only when its signals change, with no
  // animation loop: enough for a group that is not playing.
  live={isActiveGroup}
/>
