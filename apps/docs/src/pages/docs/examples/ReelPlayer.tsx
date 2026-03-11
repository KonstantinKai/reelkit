import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function ReelPlayerExample() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">Reel Player</h1>
      <p className="docs-description">
        A full-featured Instagram/TikTok-style video player using{' '}
        <code>@reelkit/react-reel-player</code>.
      </p>

      <section className="docs-section">
        <h2>Installation</h2>
        <CodeBlock
          lang="bash"
          code={`npm install @reelkit/react-reel-player`}
        />
      </section>

      <section className="docs-section">
        <h2>Basic Usage</h2>
        <CodeBlock
          title="App.tsx"
          code={`import { useState } from 'react';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/react-reel-player';
import '@reelkit/react-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: 'https://example.com/video.mp4',
      poster: 'https://example.com/poster.jpg',
      aspectRatio: 9 / 16,
    }],
    author: { name: 'John Doe', avatar: 'https://example.com/avatar.jpg' },
    likes: 1234,
    description: 'Amazing video!',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: 'https://example.com/photo.jpg',
      aspectRatio: 4 / 5,
    }],
    author: { name: 'Jane Smith', avatar: 'https://example.com/avatar2.jpg' },
    likes: 5678,
    description: 'Beautiful sunset',
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openPlayer = (index: number) => {
    setInitialIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {content.map((item, index) => (
          <div
            key={item.id}
            onClick={() => openPlayer(index)}
            style={{ aspectRatio: '9/16', cursor: 'pointer' }}
          >
            <img
              src={item.media[0].poster || item.media[0].src}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* Player Overlay */}
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={initialIndex}
      />
    </>
  );
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Features</h2>
        <ul>
          <li><strong>Vertical swipe navigation</strong> — Touch, mouse drag, keyboard, wheel</li>
          <li><strong>Video autoplay</strong> — Videos play automatically when visible</li>
          <li><strong>Sound toggle</strong> — Global mute/unmute with iOS sound continuity</li>
          <li><strong>Multi-media posts</strong> — Horizontal nested slider for carousels</li>
          <li><strong>Video position memory</strong> — Resumes where you left off</li>
          <li><strong>Frame capture</strong> — Seamless poster transitions</li>
          <li><strong>Desktop navigation</strong> — Arrow buttons on desktop</li>
          <li><strong>Responsive</strong> — Adapts to screen size</li>
        </ul>
      </section>

      <section className="docs-section">
        <h2>Multi-Media Posts</h2>
        <p>
          Posts with multiple media items automatically show a horizontal nested slider
          with Instagram-style indicator dots:
        </p>
        <CodeBlock
          code={`const multiMediaPost: ContentItem = {
  id: '3',
  media: [
    { id: 'img1', type: 'image', src: '/photo1.jpg', aspectRatio: 4 / 5 },
    { id: 'v1', type: 'video', src: '/clip.mp4', poster: '/thumb.jpg', aspectRatio: 9 / 16 },
    { id: 'img2', type: 'image', src: '/photo2.jpg', aspectRatio: 1 },
  ],
  author: { name: 'Travel Blogger', avatar: '/avatar.jpg' },
  likes: 10000,
  description: 'My trip to Japan',
};`}
        />
      </section>

      <section className="docs-section">
        <h2>Customization</h2>
        <p>
          The player accepts props that are proxied to the underlying Reel component:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={handleClose}
  content={content}
  // Reel props
  loop={true}
  transitionDuration={400}
  swipeDistanceFactor={0.15}
  enableWheel={false}
  // Callbacks
  onSlideChange={(index) => console.log('Slide:', index)}
  apiRef={reelApiRef}
/>`}
        />

        <h3>Available Props</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>loop</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>transitionDuration</code></td>
              <td><code>number</code></td>
              <td><code>300</code></td>
            </tr>
            <tr>
              <td><code>swipeDistanceFactor</code></td>
              <td><code>number</code></td>
              <td><code>0.12</code></td>
            </tr>
            <tr>
              <td><code>useNavKeys</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>enableWheel</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>wheelDebounceMs</code></td>
              <td><code>number</code></td>
              <td><code>200</code></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Keyboard Shortcuts</h2>
        <table className="api-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>ArrowUp</code></td>
              <td>Previous slide</td>
            </tr>
            <tr>
              <td><code>ArrowDown</code></td>
              <td>Next slide</td>
            </tr>
            <tr>
              <td><code>ArrowLeft</code></td>
              <td>Previous media (in carousel)</td>
            </tr>
            <tr>
              <td><code>ArrowRight</code></td>
              <td>Next media (in carousel)</td>
            </tr>
            <tr>
              <td><code>Escape</code></td>
              <td>Close player</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Live Demo</h2>
        <p>
          Check out the <a href="https://github.com/user/reelkit" target="_blank" rel="noopener noreferrer">example-react app</a> for
          a complete working implementation with mock content.
        </p>
      </section>
    </div>
  );
}
