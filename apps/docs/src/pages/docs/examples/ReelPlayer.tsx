import { Link } from 'react-router-dom';
import { CodeBlock } from '../../../components/ui/CodeBlock';
import { Sandbox } from '../../../components/ui/Sandbox';
import { ReelPlayerDemo } from '../../../components/demos/ReelPlayerDemo';
import {
  Zap,
  Play,
  Volume2,
  Layout,
  Clock,
  Image,
  Monitor,
  Settings,
} from 'lucide-react';

const fullCode = `import { useState } from 'react';
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
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: 'https://example.com/avatar.jpg' },
    likes: 1234,
    description: 'Amazing video!',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: 'https://example.com/photo.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: 'https://example.com/avatar2.jpg' },
    likes: 5678,
    description: 'Beautiful sunset',
  },
  {
    id: '3',
    media: [
      { id: 'img2', type: 'image', src: 'https://example.com/a.jpg', aspectRatio: 2 / 3 },
      { id: 'img3', type: 'image', src: 'https://example.com/b.jpg', aspectRatio: 3 / 4 },
    ],
    author: { name: 'Emma Davis', avatar: 'https://example.com/avatar3.jpg' },
    likes: 8901,
    description: 'Multi-media carousel',
  },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  return (
    <>
      {/* Thumbnail grid */}
      {content.map((item, i) => (
        <button key={item.id} onClick={() => {
          setInitialIndex(i);
          setIsOpen(true);
        }}>
          <img src={item.media[0].poster || item.media[0].src} />
        </button>
      ))}

      <ReelPlayerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={content}
        initialIndex={initialIndex}
      />
    </>
  );
}`;

export default function ReelPlayerExample() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          A full-featured Instagram/TikTok-style video player using
          @reelkit/react-reel-player.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The ReelPlayer component provides a complete TikTok/Instagram-style
          experience with:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              label: 'Vertical Swipe',
              desc: 'Touch, drag, keyboard, wheel',
            },
            { icon: Play, label: 'Video Autoplay', desc: 'Plays when visible' },
            { icon: Volume2, label: 'Sound Toggle', desc: 'iOS continuity' },
            {
              icon: Layout,
              label: 'Multi-Media',
              desc: 'Horizontal carousels',
            },
            {
              icon: Clock,
              label: 'Position Memory',
              desc: 'Resumes where left off',
            },
            { icon: Image, label: 'Frame Capture', desc: 'Poster transitions' },
            { icon: Monitor, label: 'Desktop Nav', desc: 'Arrow buttons' },
            {
              icon: Settings,
              label: 'Customizable',
              desc: 'Render props for controls, overlays',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center"
            >
              <item.icon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-slate-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ReelPlayerOverlay
          </code>{' '}
          component renders a full-screen player overlay. Pass an array of{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ContentItem
          </code>{' '}
          objects and control visibility with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          . When content includes author, description, or likes fields, a
          built-in slide overlay is displayed automatically.
        </p>
        <CodeBlock
          code={`// Control visibility
const [isOpen, setIsOpen] = useState(false);

// Open with specific index
<ReelPlayerOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  content={contentItems}
  initialIndex={0}
/>`}
          language="typescript"
        />
      </section>

      {/* Live Sandbox */}
      <section className="mb-12">
        <Sandbox code={fullCode} title="ReelPlayerPage.tsx" height={500}>
          <ReelPlayerDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Click a thumbnail to open the full-screen player. Press Escape or the
          close button to return.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Customization</h2>
        <p className="text-slate-600 dark:text-slate-400">
          The reel player supports render props for full customization of
          controls, navigation, slide overlays, and slide content. See the{' '}
          <Link
            to="/docs/api/react-reel-player"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            API Reference
          </Link>{' '}
          for{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderControls
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNavigation
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlideOverlay
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderSlide
          </code>
          , and{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderNestedNavigation
          </code>{' '}
          props, along with reusable sub-components like{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            CloseButton
          </code>
          ,{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SoundButton
          </code>
          , and{' '}
          <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SlideOverlay
          </code>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>
        <p className="text-slate-600 dark:text-slate-400">
          See the{' '}
          <Link
            to="/docs/api/react-reel-player"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            React Reel Player API
          </Link>{' '}
          for all props, types, CSS classes, and keyboard shortcuts.
        </p>
      </section>
    </div>
  );
}
