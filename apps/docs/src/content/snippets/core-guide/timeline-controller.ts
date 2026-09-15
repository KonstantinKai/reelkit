import { createTimelineController } from '@reelkit/core';

const timeline = createTimelineController({
  onScrubStart: () => video.pause(),
  onScrubEnd: () => video.play(),
});

timeline.attach(video);
const dispose = timeline.bindInteractions(trackEl);

// Render: read signals and update DOM
timeline.progress.observe(() => {
  fillEl.style.width = `${timeline.progress.value * 100}%`;
});

// Cleanup
dispose();
timeline.detach();
