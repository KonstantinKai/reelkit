import { ImageSlide } from '@reelkit/react-reel-player';

// Default usage
<ImageSlide src="/photo.jpg" size={[400, 700]} />

// Custom styles
<ImageSlide
  src="/photo.jpg"
  size={[400, 700]}
  className="my-image-slide"
  style={{ backgroundColor: '#1a1a1a', borderRadius: 12 }}
  imgStyle={{ objectFit: 'contain' }}
/>
