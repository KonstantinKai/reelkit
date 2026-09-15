import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/react-reel-player';

<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  renderSlide={({ item, size, isActive, slideKey, onVideoRef }) => {
    const media = item.media[0];
    if (media.type === 'image') {
      return (
        <ImageSlide
          src={media.src}
          size={size}
          imgStyle={{ objectFit: 'contain' }}
          style={{ backgroundColor: '#111' }}
        />
      );
    }
    if (media.type === 'video') {
      return (
        <VideoSlide
          src={media.src}
          poster={media.poster}
          aspectRatio={media.aspectRatio}
          size={size}
          isActive={isActive}
          slideKey={slideKey}
          onVideoRef={onVideoRef}
          style={{ borderRadius: 16 }}
        />
      );
    }
    return null; // fallback to default
  }}
/>
