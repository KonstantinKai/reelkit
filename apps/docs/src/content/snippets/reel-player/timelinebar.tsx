import { TimelineBar } from '@reelkit/react-reel-player';

// Inside renderTimeline — wrap or augment the default bar:
<ReelPlayerOverlay
  renderTimeline={({ defaultContent }) => (
    <>
      <MyTimecode />
      {defaultContent}
    </>
  )}
/>

// Or render standalone inside a custom TimelineProvider tree:
<TimelineBar className="my-timeline" />
