import { ImageStorySlide } from '@reelkit/react-stories-player';

<ImageStorySlide
  src="/photo.jpg"
  aspectRatio={9 / 16}
  onLoad={() => console.log('loaded')}
  onError={() => console.log('failed')}
/>
