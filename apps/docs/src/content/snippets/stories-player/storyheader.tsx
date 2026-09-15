import { StoryHeader } from '@reelkit/react-stories-player';

<StoryHeader
  author={{ id: '1', name: 'Alice', avatar: '/avatar.jpg', verified: true }}
  createdAt={new Date(Date.now() - 3600_000)}
  onClose={handleClose}
  isPaused={false}
  onTogglePause={togglePause}
  isMuted={true}
  onToggleSound={toggleSound}
  isVideo={true}
  isLoading={false}
/>
