import {
  LightboxOverlay,
  useVideoSlideRenderer,
  type LightboxItem,
} from '@reelkit/react-lightbox';
import '@reelkit/react-lightbox/styles.css';

const items: LightboxItem[] = [
  { src: '/photo.jpg', title: 'Photo' },
  {
    src: '/clip.mp4',
    type: 'video',
    poster: '/clip-thumb.jpg',
    title: 'Video Clip',
  },
];

function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const isOpen = index !== null;
  const { renderSlide, renderControls, SoundProvider } =
    useVideoSlideRenderer(items);

  return (
    <SoundProvider>
      {/* thumbnails… */}
      <LightboxOverlay
        isOpen={isOpen}
        images={items}
        initialIndex={index ?? 0}
        onClose={() => setIndex(null)}
        renderSlide={renderSlide}
        renderControls={renderControls}
      />
    </SoundProvider>
  );
}
