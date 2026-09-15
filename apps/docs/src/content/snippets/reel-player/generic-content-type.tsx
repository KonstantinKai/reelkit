import { ReelPlayerOverlay, type BaseContentItem } from '@reelkit/react-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  username: string;
}

const items: MyItem[] = [
  {
    id: '1',
    media: [{ id: 'v1', type: 'video', src: '/video.mp4', aspectRatio: 9/16 }],
    title: 'My Video',
    username: '@user',
  },
];

<ReelPlayerOverlay<MyItem>
  isOpen={isOpen}
  onClose={handleClose}
  content={items}
  renderSlideOverlay={(item) => (
    <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff' }}>
      <strong>{item.username}</strong>
      <p>{item.title}</p>
    </div>
  )}
/>
