import { VideoStorySlide } from '@reelkit/react-stories-player';

<VideoStorySlide
  src="/clip.mp4"
  poster="/clip-poster.jpg"
  groupIndex={0}
  storyIndex={2}
  activeGroupIndex={activeGroupSignal}
  activeStoryIndex={activeStorySignal}
  onDurationReady={(ms) => console.log('duration:', ms)}
  onPlaying={() => console.log('playing')}
  onWaiting={() => console.log('buffering')}
  onEnded={() => console.log('ended')}
  onError={() => console.log('error')}
/>
