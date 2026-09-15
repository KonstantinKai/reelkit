import { CanvasProgressBar } from '@reelkit/react-stories-player';

<CanvasProgressBar
  totalStories={group.stories.length}
  activeIndex={activeIndexSignal}
  progress={progressSignal}
  minSegmentWidth={8}
  gap={2}
  barHeight={2}
/>
