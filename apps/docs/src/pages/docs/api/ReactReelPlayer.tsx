import { CodeBlock } from '../../../components/ui/CodeBlock';
import '../docs.css';

export default function ReactReelPlayerApi() {
  return (
    <div className="docs-page">
      <h1 className="docs-title">React Reel Player API</h1>
      <p className="docs-description">
        The <code>@reelkit/react-reel-player</code> package provides a full-screen
        vertical reel player component, similar to Instagram Reels or TikTok.
      </p>

      <section className="docs-section">
        <h2>Installation</h2>
        <CodeBlock
          lang="bash"
          code="npm install @reelkit/react-reel-player"
        />
        <p>
          Don't forget to import the styles:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-reel-player/styles.css';`}
        />
      </section>

      <section className="docs-section">
        <h2>ReelPlayerOverlay</h2>
        <p>
          The main component that renders a full-screen player overlay with video/image support,
          sound controls, and navigation.
        </p>
        <CodeBlock
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
];

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Player</button>
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
      />
    </>
  );
}`}
        />

        <h3>Props</h3>
        <table className="api-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>isOpen</code></td>
              <td><code>boolean</code></td>
              <td>required</td>
              <td>Controls overlay visibility</td>
            </tr>
            <tr>
              <td><code>onClose</code></td>
              <td><code>() =&gt; void</code></td>
              <td>required</td>
              <td>Called when player closes</td>
            </tr>
            <tr>
              <td><code>content</code></td>
              <td><code>ContentItem[]</code></td>
              <td>required</td>
              <td>Array of content items to display</td>
            </tr>
            <tr>
              <td><code>initialIndex</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Starting slide index</td>
            </tr>
            <tr>
              <td><code>onSlideChange</code></td>
              <td><code>(index: number) =&gt; void</code></td>
              <td>-</td>
              <td>Callback fired after slide change</td>
            </tr>
            <tr>
              <td><code>apiRef</code></td>
              <td><code>MutableRefObject&lt;ReelApi&gt;</code></td>
              <td>-</td>
              <td>Ref to access Reel API</td>
            </tr>
            <tr>
              <td><code>loop</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enable infinite loop</td>
            </tr>
            <tr>
              <td><code>useNavKeys</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Enable keyboard navigation</td>
            </tr>
            <tr>
              <td><code>enableWheel</code></td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
              <td>Enable mouse wheel navigation</td>
            </tr>
            <tr>
              <td><code>wheelDebounceMs</code></td>
              <td><code>number</code></td>
              <td><code>200</code></td>
              <td>Wheel debounce duration (ms)</td>
            </tr>
            <tr>
              <td><code>transitionDuration</code></td>
              <td><code>number</code></td>
              <td><code>300</code></td>
              <td>Transition animation duration (ms)</td>
            </tr>
            <tr>
              <td><code>swipeDistanceFactor</code></td>
              <td><code>number</code></td>
              <td><code>0.12</code></td>
              <td>Swipe threshold (0-1)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h2>Types</h2>

        <h3>ContentItem</h3>
        <CodeBlock
          code={`interface ContentItem {
  id: string;
  media: MediaItem[];
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}`}
        />

        <h3>MediaItem</h3>
        <CodeBlock
          code={`interface MediaItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;       // Video thumbnail
  aspectRatio: number;   // width / height
}`}
        />

        <h3>MediaType</h3>
        <CodeBlock code={`type MediaType = 'image' | 'video';`} />
      </section>

      <section className="docs-section">
        <h2>Sound Context</h2>
        <p>
          For custom implementations, you can access the sound state:
        </p>
        <CodeBlock
          code={`import { SoundProvider, useSoundState } from '@reelkit/react-reel-player';

interface SoundState {
  muted: boolean;
  disabled: boolean;
  toggle: () => void;
  setMuted: (value: boolean) => void;
  setDisabled: (value: boolean) => void;
}`}
        />
      </section>

      <section className="docs-section">
        <h2>Examples</h2>

        <h3>Single Video</h3>
        <CodeBlock
          code={`{
  id: '1',
  media: [{
    id: 'v1',
    type: 'video',
    src: 'https://example.com/video.mp4',
    poster: 'https://example.com/thumb.jpg',
    aspectRatio: 9 / 16,
  }],
  author: { name: 'Creator', avatar: '...' },
  likes: 5000,
  description: 'Check this out!',
}`}
        />

        <h3>Multi-Media Post</h3>
        <p>
          Posts with multiple media items display a horizontal nested slider:
        </p>
        <CodeBlock
          code={`{
  id: '2',
  media: [
    { id: 'img1', type: 'image', src: '...', aspectRatio: 4 / 5 },
    { id: 'v1', type: 'video', src: '...', poster: '...', aspectRatio: 9 / 16 },
    { id: 'img2', type: 'image', src: '...', aspectRatio: 1 },
  ],
  author: { name: 'Blogger', avatar: '...' },
  likes: 10000,
  description: 'My trip',
}`}
        />

        <h3>Gallery with Index</h3>
        <CodeBlock
          code={`function Gallery() {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const open = (i: number) => {
    setIndex(i);
    setIsOpen(true);
  };

  return (
    <>
      {content.map((item, i) => (
        <div key={item.id} onClick={() => open(i)}>
          <img src={item.media[0].poster || item.media[0].src} />
        </div>
      ))}
      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={index}
      />
    </>
  );
}`}
        />
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
              <td>Previous media (in nested slider)</td>
            </tr>
            <tr>
              <td><code>ArrowRight</code></td>
              <td>Next media (in nested slider)</td>
            </tr>
            <tr>
              <td><code>Escape</code></td>
              <td>Close player</td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>
  );
}
