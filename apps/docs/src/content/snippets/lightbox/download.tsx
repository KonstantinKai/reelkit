import { LightboxOverlay, type LightboxItem } from '@reelkit/react-lightbox';

const images: LightboxItem[] = [
  {
    src: 'https://cdn.example.com/beach-1600.jpg',
    // Save the original rather than the resized preview
    downloadUrl: 'https://cdn.example.com/beach-original.jpg',
    downloadName: 'beach.jpg',
  },
];

<LightboxOverlay
  isOpen={index !== null}
  images={images}
  initialIndex={index ?? 0}
  onClose={() => setIndex(null)}
  showDownload
/>;
