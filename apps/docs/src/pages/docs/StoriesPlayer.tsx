import { Link } from 'react-router-dom';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Sandbox } from '../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import { StoriesPlayerDemo } from '../../components/demos/StoriesPlayerDemo';
import {
  Zap,
  Play,
  Layout,
  Clock,
  Timer,
  Image,
  Monitor,
  Settings,
  Code,
  Layers,
  Heart,
  Circle,
} from 'lucide-react';

const fullCode = `import { useState, useMemo } from 'react';
import {
  StoriesOverlay,
  StoriesRingList,
  type StoriesGroup,
} from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';

const groups: StoriesGroup[] = [
  {
    author: {
      id: 'user-1',
      name: 'Alice',
      avatar: '/cdn/samples/avatars/avatar-06.jpg',
      verified: true,
    },
    stories: [
      {
        id: 's1-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-001.jpg',
      },
      {
        id: 's1-2',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-002.jpg',
      },
      {
        id: 's1-3',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-003.jpg',
      },
    ],
  },
  {
    author: {
      id: 'user-2',
      name: 'Bob',
      avatar: '/cdn/samples/avatars/avatar-07.jpg',
    },
    stories: [
      {
        id: 's2-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-004.jpg',
      },
      {
        id: 's2-2',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-005.jpg',
      },
    ],
  },
  {
    author: {
      id: 'user-3',
      name: 'Charlie',
      avatar: '/cdn/samples/avatars/avatar-08.jpg',
      verified: true,
    },
    stories: [
      {
        id: 's3-1',
        mediaType: 'image',
        src: '/cdn/samples/images/stories/story-006.jpg',
      },
    ],
  },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(0);
  const viewedState = useMemo(() => new Map<string, number>(), []);

  const openStories = (groupIndex: number) => {
    setSelectedGroup(groupIndex);
    setIsOpen(true);
  };

  return (
    <div style={{ padding: 16, background: '#0f172a', minHeight: '100vh' }}>
      <StoriesRingList
        groups={groups}
        viewedState={viewedState}
        onSelect={openStories}
      />

      <StoriesOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groups={groups}
        initialGroupIndex={selectedGroup}
        onStoryViewed={(gi, si) => {
          const author = groups[gi].author;
          const current = viewedState.get(author.id) ?? 0;
          viewedState.set(author.id, Math.max(current, si + 1));
        }}
      />
    </div>
  );
}`;

const storiesOverlayProps = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Controls overlay visibility. When true, body scroll is locked.',
  },
  {
    prop: 'groups',
    type: 'StoriesGroup<T>[]',
    default: 'required',
    description: 'Array of story groups to display',
  },
  {
    prop: 'onClose',
    type: '() => void',
    default: 'required',
    description: 'Callback to close the overlay',
  },
  {
    prop: 'initialGroupIndex',
    type: 'number',
    default: '0',
    description: 'Zero-based index of the initially visible group',
  },
  {
    prop: 'initialStoryIndex',
    type: 'number',
    default: '0',
    description:
      'Zero-based index of the initially visible story within the group',
  },
  {
    prop: 'groupTransition',
    type: 'TransitionTransformFn',
    default: 'cubeTransition',
    description: 'Transition effect for the outer (group) slider',
  },
  {
    prop: 'defaultImageDuration',
    type: 'number',
    default: '5000',
    description:
      'Default auto-advance duration for image stories in milliseconds',
  },
  {
    prop: 'tapZoneSplit',
    type: 'number',
    default: '0.3',
    description:
      'Tap zone split ratio (0\u20131). Left portion triggers prev, right triggers next.',
  },
  {
    prop: 'hideUIOnPause',
    type: 'boolean',
    default: 'true',
    description:
      'Whether to hide story UI (header, footer) when paused via long press',
  },
  {
    prop: 'enableKeyboard',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard navigation (left/right arrows, Escape)',
  },
  {
    prop: 'innerTransitionDuration',
    type: 'number',
    default: '200',
    description:
      'Duration of the inner (story) transition animation in milliseconds',
  },
  {
    prop: 'minSegmentWidth',
    type: 'number',
    default: '8',
    description: 'Minimum segment width in pixels for the progress bar',
  },
  {
    prop: 'apiRef',
    type: 'MutableRefObject<StoriesApi | null>',
    default: '-',
    description: 'Ref to access the imperative StoriesApi',
  },
  {
    prop: 'renderHeader',
    type: '(props: HeaderRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Custom header renderer. Receives author, story, pause/mute state.',
  },
  {
    prop: 'renderFooter',
    type: '(props: FooterRenderProps<T>) => ReactNode',
    default: '-',
    description: 'Custom footer renderer. Receives author and story info.',
  },
  {
    prop: 'renderSlide',
    type: '(props: SlideRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Custom slide renderer, replacing the default image/video slides.',
  },
  {
    prop: 'renderNavigation',
    type: '(props: NavigationRenderProps) => ReactNode',
    default: '-',
    description:
      'Custom desktop navigation. Replaces default prev/next chevron buttons.',
  },
  {
    prop: 'renderProgressBar',
    type: '(props: ProgressBarRenderProps<T>) => ReactNode',
    default: '-',
    description: 'Custom progress bar. Replaces default canvas progress bar.',
  },
  {
    prop: 'renderLoading',
    type: '(props: LoadingRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Custom loading UI renderer. When not provided, shows default header spinner.',
  },
  {
    prop: 'renderError',
    type: '(props: ErrorRenderProps<T>) => ReactNode',
    default: '-',
    description:
      'Custom error UI renderer. When not provided, shows default error icon overlay.',
  },
];

const storiesCallbacks = [
  {
    prop: 'onClose',
    type: '() => void',
    description: 'Called when the overlay should close',
  },
  {
    prop: 'onStoryChange',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Fired when the active story changes',
  },
  {
    prop: 'onGroupChange',
    type: '(groupIndex: number) => void',
    description: 'Fired when the active group changes',
  },
  {
    prop: 'onStoryViewed',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Fired when a story becomes visible',
  },
  {
    prop: 'onStoryComplete',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: "Fired when a story's timer completes",
  },
  {
    prop: 'onDoubleTap',
    type: '(groupIndex: number, storyIndex: number) => void',
    description: 'Fired on a double-tap gesture',
  },
  {
    prop: 'onPause',
    type: '() => void',
    description: 'Fired when the player is paused',
  },
  {
    prop: 'onResume',
    type: '() => void',
    description: 'Fired when the player is resumed',
  },
];

const storiesApiMethods = [
  {
    method: 'nextStory()',
    type: '() => void',
    description: 'Advance to the next story within the current group',
  },
  {
    method: 'prevStory()',
    type: '() => void',
    description: 'Go to the previous story within the current group',
  },
  {
    method: 'nextGroup()',
    type: '() => void',
    description: 'Switch to the next user group',
  },
  {
    method: 'prevGroup()',
    type: '() => void',
    description: 'Switch to the previous user group',
  },
  {
    method: 'goToGroup(index)',
    type: '(index: number) => void',
    description: 'Jump to a specific group by index',
  },
  {
    method: 'pause()',
    type: '() => void',
    description: 'Pause auto-advance and the progress timer',
  },
  {
    method: 'resume()',
    type: '() => void',
    description: 'Resume auto-advance and the progress timer',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-stories-overlay',
    component: 'Overlay',
    description: 'Fixed full-screen backdrop (background, z-index)',
  },
  {
    className: '.rk-stories-swipe-wrapper',
    component: 'Overlay',
    description: 'Swipe-to-close wrapper (hosts nav buttons + canvas)',
  },
  {
    className: '.rk-stories-container',
    component: 'Overlay',
    description: 'Rounded story canvas (position, overflow)',
  },
  {
    className: '.rk-stories-ui-layer',
    component: 'Overlay',
    description: 'UI overlay container (header, progress, navigation)',
  },
  {
    className: '.rk-stories-ui-layer--hidden',
    component: 'Overlay',
    description: 'UI hidden state (toggled by hideUIOnPause)',
  },
  {
    className: '.rk-stories-error',
    component: 'Overlay',
    description: 'Error state (centered icon + text)',
  },
  {
    className: '.rk-stories-error-text',
    component: 'Overlay',
    description: 'Error message text',
  },

  // Navigation
  {
    className: '.rk-stories-nav-btn',
    component: 'Navigation',
    description: 'Desktop prev/next arrow',
  },

  // ProgressBar
  {
    className: '.rk-stories-progress-bar',
    component: 'ProgressBar',
    description: 'Canvas progress bar positioning wrapper',
  },

  // Group / Story
  {
    className: '.rk-stories-slide-wrapper',
    component: 'Group',
    description: 'One group of stories (outer slide)',
  },
  {
    className: '.rk-stories-story',
    component: 'Story',
    description: 'A single story (inner slide root)',
  },

  // StoryHeader
  {
    className: '.rk-stories-header',
    component: 'StoryHeader',
    description: 'Header bar (avatar, name, actions)',
  },
  {
    className: '.rk-stories-header--hidden',
    component: 'StoryHeader',
    description: 'Header hidden state (visible=false)',
  },
  {
    className: '.rk-stories-header-avatar',
    component: 'StoryHeader',
    description: 'Author avatar image',
  },
  {
    className: '.rk-stories-header-name',
    component: 'StoryHeader',
    description: 'Author name text',
  },
  {
    className: '.rk-stories-header-verified',
    component: 'StoryHeader',
    description: 'Verified badge container',
  },
  {
    className: '.rk-stories-header-time',
    component: 'StoryHeader',
    description: 'Time-ago text',
  },
  {
    className: '.rk-stories-header-actions',
    component: 'StoryHeader',
    description: 'Right-side actions (close, mute, pause)',
  },
  {
    className: '.rk-stories-header-btn',
    component: 'StoryHeader',
    description: 'Header action button',
  },
  {
    className: '.rk-stories-header-spinner',
    component: 'StoryHeader',
    description: 'Video buffering spinner',
  },

  // ImageStorySlide
  {
    className: '.rk-stories-image',
    component: 'ImageStorySlide',
    description: 'Image story element',
  },

  // VideoStorySlide
  {
    className: '.rk-stories-video',
    component: 'VideoStorySlide',
    description: 'Video story container',
  },
  {
    className: '.rk-stories-video-element',
    component: 'VideoStorySlide',
    description: 'The shared <video> element',
  },
  {
    className: '.rk-stories-video-poster',
    component: 'VideoStorySlide',
    description: 'Video poster image (fades out on play)',
  },
  {
    className: '.rk-stories-video-poster--visible',
    component: 'VideoStorySlide',
    description: 'Poster visible state (pre-playback)',
  },

  // HeartAnimation
  {
    className: '.rk-stories-heart',
    component: 'HeartAnimation',
    description: 'Double-tap heart pop animation',
  },

  // StoriesRing
  {
    className: '.rk-stories-ring',
    component: 'StoriesRing',
    description: 'Story ring (avatar with animated gradient border)',
  },
  {
    className: '.rk-stories-ring--active',
    component: 'StoriesRing',
    description: 'Ring with unviewed stories (animates)',
  },
  {
    className: '.rk-stories-ring-avatar',
    component: 'StoriesRing',
    description: 'Avatar image inside the ring',
  },

  // StoriesRingList
  {
    className: '.rk-stories-ring-list',
    component: 'StoriesRingList',
    description: 'Horizontal ring list container',
  },
  {
    className: '.rk-stories-ring-list-item',
    component: 'StoriesRingList',
    description: 'Ring + name column',
  },
  {
    className: '.rk-stories-ring-list-name',
    component: 'StoriesRingList',
    description: 'Author name below each ring',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-stories-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-stories-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },
  {
    token: '--rk-stories-container-radius',
    default: '12px',
    controls: 'Rounded corners on the story canvas (desktop)',
  },
  {
    token: '--rk-stories-swipe-gap',
    default: '16px',
    controls: 'Gap between nav buttons and the story canvas',
  },

  // UI layer + top shade
  {
    token: '--rk-stories-top-shade-height',
    default: '120px',
    controls: 'Top gradient scrim height behind the header',
  },
  {
    token: '--rk-stories-top-shade-bg',
    default: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)',
    controls: 'Top gradient scrim color',
  },
  {
    token: '--rk-stories-ui-transition',
    default: '200ms',
    controls: 'Fade duration when hideUIOnPause toggles',
  },

  // Nav buttons (desktop)
  {
    token: '--rk-stories-nav-size',
    default: '44px',
    controls: 'Desktop prev/next button size',
  },
  {
    token: '--rk-stories-nav-bg',
    default: 'rgba(255, 255, 255, 0.1)',
    controls: 'Desktop nav button background',
  },
  {
    token: '--rk-stories-nav-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Desktop nav button hover background',
  },
  {
    token: '--rk-stories-nav-fg',
    default: 'rgba(255, 255, 255, 0.7)',
    controls: 'Desktop nav button icon color',
  },
  {
    token: '--rk-stories-nav-fg-hover',
    default: '#fff',
    controls: 'Desktop nav button hover icon color',
  },

  // Error state
  {
    token: '--rk-stories-error-bg',
    default: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    controls: 'Error state background gradient',
  },
  {
    token: '--rk-stories-error-fg',
    default: 'rgba(255, 255, 255, 0.5)',
    controls: 'Error icon and text color',
  },
  {
    token: '--rk-stories-error-text-size',
    default: '13px',
    controls: 'Error message font size',
  },

  // Story media
  {
    token: '--rk-stories-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
  {
    token: '--rk-stories-video-poster-transition',
    default: '200ms',
    controls: 'Poster fade duration when the video starts playing',
  },

  // Story header
  {
    token: '--rk-stories-header-top',
    default: '18px',
    controls: 'Vertical offset of the header from the top of the story',
  },
  {
    token: '--rk-stories-header-padding',
    default: '12px 16px',
    controls: 'Inner padding of the header row',
  },
  {
    token: '--rk-stories-header-avatar-size',
    default: '32px',
    controls: 'Avatar width/height',
  },
  {
    token: '--rk-stories-header-name-fg',
    default: '#fff',
    controls: 'Author name color',
  },
  {
    token: '--rk-stories-header-name-size',
    default: '14px',
    controls: 'Author name font size',
  },
  {
    token: '--rk-stories-header-time-fg',
    default: 'rgba(255, 255, 255, 0.6)',
    controls: 'Time-ago text color',
  },
  {
    token: '--rk-stories-header-btn-fg',
    default: '#fff',
    controls: 'Header action icon color (close, mute, pause)',
  },

  // Heart animation (double-tap like)
  {
    token: '--rk-stories-heart-duration',
    default: '800ms',
    controls: 'Pop-in/fade-out animation duration',
  },

  // Ring (avatar with animated border)
  {
    token: '--rk-stories-ring-spin-duration',
    default: '4s',
    controls: 'Active ring gradient rotation duration',
  },

  // Ring list (horizontal feed above the player)
  {
    token: '--rk-stories-ring-list-gap',
    default: '12px',
    controls: 'Spacing between rings in the list',
  },
  {
    token: '--rk-stories-ring-list-padding',
    default: '12px',
    controls: 'Inner padding around the ring list',
  },
  {
    token: '--rk-stories-ring-list-name-size',
    default: '12px',
    controls: 'Author name font size below each ring',
  },
];

export default function StoriesPlayerPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Stories Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          An Instagram-style stories player overlay for React using{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player
          </code>
          .
        </p>
        <a
          href="https://react-demo.reelkit.dev/stories-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          View live demo &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'Nested Navigation',
                desc: 'Tap to advance stories, swipe to switch groups',
              },
              {
                icon: Play,
                label: 'Video Stories',
                desc: 'Autoplay with sound toggle',
              },
              {
                icon: Timer,
                label: 'Auto-Advance',
                desc: 'Configurable timer per story',
              },
              {
                icon: Layout,
                label: '3D Transitions',
                desc: 'Cube, flip, fade, zoom, slide',
              },
              {
                icon: Clock,
                label: 'Progress Bar',
                desc: 'Canvas-based segmented progress',
              },
              {
                icon: Image,
                label: 'Image & Video',
                desc: 'Handles both media types',
              },
              {
                icon: Layers,
                label: 'Virtualized',
                desc: 'Only 3 slides in DOM',
              },
              {
                icon: Heart,
                label: 'Double-Tap Like',
                desc: 'Heart animation on double-tap',
              },
              {
                icon: Monitor,
                label: 'Desktop Nav',
                desc: 'Chevron buttons on desktop',
              },
              {
                icon: Circle,
                label: 'Story Rings',
                desc: 'Instagram-style avatar rings',
              },
              {
                icon: Code,
                label: 'Generic Types',
                desc: 'Extend StoryItem with custom data',
              },
              {
                icon: Settings,
                label: 'Render Props',
                desc: 'Customize every UI element',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          code="npm i @reelkit/react-stories-player @reelkit/react lucide-react"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Don't forget to import the styles:
        </p>
        <CodeBlock
          code={`import '@reelkit/react-stories-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          The default header uses{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-react
          </code>{' '}
          for icons. If you prefer a different icon library, use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderHeader
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderNavigation
          </code>{' '}
          to provide your own.
        </Callout>
      </section>

      {/* Sandbox */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>{' '}
          component renders a full-screen stories player. Pair it with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesRingList
          </code>{' '}
          for Instagram-style entry points. Pass an array of{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesGroup
          </code>{' '}
          objects and control visibility with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            isOpen
          </code>
          .
        </p>
        <CodeBlock code={fullCode} language="tsx" />
      </section>

      {/* Live Demo */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Live Demo</h2>
        <Sandbox
          code={fullCode}
          title="StoriesPlayer.tsx"
          height={200}
          stackblitzDeps={['@reelkit/react-stories-player', '@reelkit/react']}
        >
          <StoriesPlayerDemo />
        </Sandbox>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Click a story ring to open the player. Tap left/right sides to
          navigate, swipe to switch users.
        </p>
      </section>

      {/* Props Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">API Reference</h2>

        <h3 className="text-xl font-semibold mt-6 mb-4">StoriesOverlayProps</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {storiesOverlayProps.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {p.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold mt-8 mb-4">Callbacks</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Prop</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {storiesCallbacks.map((p) => (
                <tr
                  key={p.prop}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {p.prop}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {p.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {p.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transitions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Transitions</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            groupTransition
          </code>{' '}
          prop controls the 3D transition effect when swiping between user
          groups. Import transition functions from{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react
          </code>
          :
        </p>
        <CodeBlock
          code={`import {
  cubeTransition,   // default \u2014 3D cube rotation
  flipTransition,   // card flip
  fadeTransition,   // crossfade
  zoomTransition,   // zoom in/out
  slideTransition,  // horizontal slide
} from '@reelkit/react';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  groupTransition={flipTransition}
/>`}
          language="tsx"
        />
      </section>

      {/* Content Loading Lifecycle */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Content Loading Lifecycle</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Each story slide communicates its loading state via callbacks provided
          through{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            SlideRenderProps
          </code>
          :
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Callback</th>
                <th className="text-left py-3 px-4 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Content is ready (image loaded, video playing). The progress
                  timer starts.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Content stalls (video buffering mid-playback). The spinner
                  shows and timer pauses.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Content failed to load. The error overlay is shown.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onDurationReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Report the actual media duration (e.g. from video metadata) to
                  restart the timer with the correct duration.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onEnded
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Signal that the media has ended (e.g. video finished).
                  Advances to the next story.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Callout type="info" title="Preloader caching" className="mt-4">
          The built-in{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ImageStorySlide
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            VideoStorySlide
          </code>{' '}
          components preload the next story in the background. When a user
          navigates to a preloaded story, the content appears instantly without
          a loading spinner.
        </Callout>
      </section>

      {/* Render Props */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Render Props</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every UI element can be replaced via render props. Each receives typed
          props with all necessary state and callbacks.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-4">renderHeader</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default header (author info, pause/mute buttons, close
          button):
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderHeader={({ author, story, isPaused, isMuted, isVideo, onToggleSound, onTogglePause, onClose }) => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      zIndex: 10,
    }}>
      <img src={author.avatar} style={{ width: 32, height: 32, borderRadius: '50%' }} />
      <span style={{ color: '#fff', fontWeight: 600 }}>{author.name}</span>
      {isVideo && <button onClick={onToggleSound}>{isMuted ? 'Unmute' : 'Mute'}</button>}
      <button onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">renderFooter</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Add a footer below the story content:
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderFooter={({ author, story, storyIndex }) => (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
      color: '#fff',
      zIndex: 10,
    }}>
      <span>{author.name} \u2014 Story {storyIndex + 1}</span>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">renderSlide</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Fully replace the default image/video slides. Use{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            ImageStorySlide
          </code>{' '}
          and{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            VideoStorySlide
          </code>{' '}
          sub-components for built-in media handling:
        </p>
        <CodeBlock
          code={`import {
  StoriesOverlay,
  ImageStorySlide,
  VideoStorySlide,
} from '@reelkit/react-stories-player';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderSlide={({ story, index, groupIndex, size, activeGroupIndex, activeStoryIndex, onDurationReady, onReady, onWaiting, onError, onEnded }) => {
    const [w, h] = size;

    if (story.mediaType === 'video') {
      return (
        <div style={{ width: w, height: h, background: '#000' }}>
          <VideoStorySlide
            src={story.src}
            poster={story.poster}
            groupIndex={groupIndex}
            storyIndex={index}
            activeGroupIndex={activeGroupIndex}
            activeStoryIndex={activeStoryIndex}
            onDurationReady={onDurationReady}
            onPlaying={onReady}
            onWaiting={onWaiting}
            onEnded={onEnded}
            onError={onError}
          />
        </div>
      );
    }

    return (
      <div style={{ width: w, height: h, background: '#000' }}>
        <ImageStorySlide src={story.src} onLoad={onReady} onError={onError} />
      </div>
    );
  }}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">renderNavigation</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default desktop chevron buttons:
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderNavigation={({ onPrevStory, onNextStory, onPrevGroup, onNextGroup }) => (
    <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10 }}>
      <button onClick={onPrevGroup}>Prev Group</button>
      <button onClick={onPrevStory}>Prev</button>
      <button onClick={onNextStory}>Next</button>
      <button onClick={onNextGroup}>Next Group</button>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">renderProgressBar</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default canvas progress bar with a custom implementation.
          The{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            progress
          </code>{' '}
          signal emits values from 0 to 1:
        </p>
        <CodeBlock
          code={`import { Observe } from '@reelkit/react';

<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderProgressBar={({ totalStories, activeIndex, progress }) => (
    <div style={{ display: 'flex', gap: 4, padding: '8px 16px' }}>
      {Array.from({ length: totalStories }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.3)', borderRadius: 1, overflow: 'hidden' }}>
          <Observe signals={[activeIndex, progress]}>
            {() => {
              const fill = i < activeIndex.value ? 1 : i === activeIndex.value ? progress.value : 0;
              return <div style={{ width: \`\${fill * 100}%\`, height: '100%', background: '#fff' }} />;
            }}
          </Observe>
        </div>
      ))}
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">renderLoading</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Custom loading indicator while content is being fetched:
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderLoading={({ story, storyIndex, groupIndex }) => (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
    }}>
      <span>Loading story {storyIndex + 1}...</span>
    </div>
  )}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">renderError</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Custom error overlay when content fails to load:
        </p>
        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderError={({ story, storyIndex, groupIndex }) => (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      color: '#fff',
      background: 'rgba(0,0,0,0.8)',
    }}>
      <span style={{ fontSize: 48 }}>!</span>
      <span>Failed to load story</span>
    </div>
  )}
/>`}
          language="tsx"
        />
      </section>

      {/* StoriesApi */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">StoriesApi</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            apiRef
          </code>{' '}
          prop for imperative control:
        </p>
        <CodeBlock
          code={`import { useRef } from 'react';
import { StoriesOverlay, type StoriesApi } from '@reelkit/react-stories-player';

function App() {
  const apiRef = useRef<StoriesApi | null>(null);

  return (
    <>
      <button onClick={() => apiRef.current?.nextStory()}>Next Story</button>
      <button onClick={() => apiRef.current?.nextGroup()}>Next Group</button>
      <button onClick={() => apiRef.current?.pause()}>Pause</button>

      <StoriesOverlay
        isOpen={isOpen}
        onClose={handleClose}
        groups={groups}
        apiRef={apiRef}
      />
    </>
  );
}`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">Methods</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Method</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {storiesApiMethods.map((m) => (
                <tr
                  key={m.method}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {m.method}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {m.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {m.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Double-Tap & Likes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Double-Tap & Likes</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          A built-in heart animation plays on double-tap, giving instant visual
          feedback. The{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onDoubleTap
          </code>{' '}
          callback fires with the group and story index so you can persist the
          like in your own state (API call, local storage, etc.). The player
          does not manage like state internally.
        </p>

        <CodeBlock
          code={`<StoriesOverlay
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  groups={groups}
  onDoubleTap={(groupIndex, storyIndex) => {
    // Built-in heart animation plays automatically.
    // Handle the like in your own state:
    const story = groups[groupIndex].stories[storyIndex];
    toggleLike(story.id);
  }}
/>`}
          language="tsx"
        />

        <h3 className="text-xl font-semibold mt-8 mb-4">
          Customizing the Heart Animation
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Tweak the animation speed via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            --rk-stories-heart-duration
          </code>{' '}
          token (see{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>
          ). For color, size, or hiding the heart entirely, target the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            .rk-stories-heart
          </code>{' '}
          class directly. The{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            HeartAnimation
          </code>{' '}
          component is also exported for standalone use.
        </p>

        <CodeBlock
          code={`/* Speed up the pop via the token */
:root {
  --rk-stories-heart-duration: 1s;
}

/* Restyle color and size via the class */
.rk-stories-heart {
  color: #ff3b5c;
  font-size: 80px;
}

/* Or hide the built-in heart entirely */
.rk-stories-heart {
  display: none;
}`}
          language="css"
        />

        <Callout type="info" className="mt-4">
          The built-in heart animation cannot be replaced via a render prop yet.
          You can restyle it with CSS or hide it with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            display: none
          </code>{' '}
          and handle your own animation in the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            onDoubleTap
          </code>{' '}
          callback. If you need a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            renderDoubleTap
          </code>{' '}
          render prop, let us know via{' '}
          <a
            href="https://github.com/KonstantinKai/reelkit/issues"
            className="text-primary-600 dark:text-primary-400 underline"
          >
            GitHub Issues
          </a>
          .
        </Callout>
      </section>

      {/* Sub-Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Sub-Components</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Reusable building blocks exported for composition in custom render
          props:
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">CanvasProgressBar</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          High-performance canvas-based segmented progress bar. Renders segments
          for each story and animates the active segment fill via{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            requestAnimationFrame
          </code>
          . Supports a sliding window for groups with many stories.
        </p>
        <CodeBlock
          code={`import { CanvasProgressBar } from '@reelkit/react-stories-player';

<CanvasProgressBar
  totalStories={group.stories.length}
  activeIndex={activeIndexSignal}
  progress={progressSignal}
  minSegmentWidth={8}
  gap={2}
  barHeight={2}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">StoryHeader</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Default header with author avatar, name, verified badge, relative
          timestamp, pause/play toggle, mute/unmute toggle, loading spinner, and
          close button. Used automatically when{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            renderHeader
          </code>{' '}
          is not provided.
        </p>
        <CodeBlock
          code={`import { StoryHeader } from '@reelkit/react-stories-player';

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
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">ImageStorySlide</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Full-bleed image slide with{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            object-fit: cover
          </code>
          . Reports load/error via callbacks for lifecycle tracking.
        </p>
        <CodeBlock
          code={`import { ImageStorySlide } from '@reelkit/react-stories-player';

<ImageStorySlide
  src="/photo.jpg"
  aspectRatio={9 / 16}
  onLoad={() => console.log('loaded')}
  onError={() => console.log('failed')}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">VideoStorySlide</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Video slide using a shared{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            {'<video>'}
          </code>{' '}
          element for iOS sound continuity. Handles autoplay, poster frames,
          sound sync, and reports duration and playback lifecycle events.
        </p>
        <CodeBlock
          code={`import { VideoStorySlide } from '@reelkit/react-stories-player';

<VideoStorySlide
  src="/clip.mp4"
  poster="/clip-poster.jpg"
  groupIndex={0}
  storyIndex={2}
  activeGroupIndex={activeGroupSignal}
  activeStoryIndex={activeStorySignal}
  onDurationReady={(ms) => console.log('duration:', ms)}
  onPlaying={() => console.log('playing')}
  onWaiting={() => console.log('buffering')}
  onEnded={() => console.log('ended')}
  onError={() => console.log('error')}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">StoriesRing</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Circular avatar with an Instagram-style gradient ring. Segments
          indicate viewed/unviewed stories — gradient for unviewed, muted gray
          for viewed.
        </p>
        <CodeBlock
          code={`import { StoriesRing } from '@reelkit/react-stories-player';

<StoriesRing
  author={{ id: '1', name: 'Alice', avatar: '/avatar.jpg' }}
  totalStories={5}
  viewedCount={2}
  onClick={() => openStories(0)}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">StoriesRingList</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Horizontal scrollable row of{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesRing
          </code>{' '}
          components with author names. One ring per group.
        </p>
        <CodeBlock
          code={`import { StoriesRingList } from '@reelkit/react-stories-player';

<StoriesRingList
  groups={groups}
  viewedState={viewedMap}
  onSelect={(groupIndex) => openStories(groupIndex)}
/>`}
          language="tsx"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">HeartAnimation</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Animated heart overlay triggered on double-tap. Scales up and fades
          out over 800ms. Customize via CSS (see Double-Tap & Likes section).
        </p>
        <CodeBlock
          code={`import { HeartAnimation } from '@reelkit/react-stories-player';

<HeartAnimation onComplete={() => console.log('animation done')} />`}
          language="tsx"
        />
      </section>

      {/* Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Types</h2>

        <h3 className="text-lg font-semibold mb-2">StoryItem</h3>
        <CodeBlock
          code={`interface StoryItem {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  poster?: string;
  duration?: number;       // ms, images default to 5000, videos use natural duration
  createdAt?: string | Date;
  aspectRatio?: number;    // width / height
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">AuthorInfo</h3>
        <CodeBlock
          code={`interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">StoriesGroup{'<T>'}</h3>
        <CodeBlock
          code={`interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          HeaderRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface HeaderRenderProps<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
  isPaused: boolean;
  isMuted: boolean;
  isVideo: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onClose: () => void;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          FooterRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface FooterRenderProps<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  story: T;
  storyIndex: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          SlideRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface SlideRenderProps<T extends StoryItem = StoryItem> {
  story: T;
  index: number;
  groupIndex: number;
  isActive: boolean;
  size: [number, number];
  activeGroupIndex: Signal<number>;
  activeStoryIndex: Signal<number>;
  onDurationReady: (durationMs: number) => void;
  onReady: () => void;
  onWaiting: () => void;
  onError: () => void;
  onEnded: () => void;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          NavigationRenderProps
        </h3>
        <CodeBlock
          code={`interface NavigationRenderProps {
  onPrevStory: () => void;
  onNextStory: () => void;
  onPrevGroup: () => void;
  onNextGroup: () => void;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          ProgressBarRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface ProgressBarRenderProps<T extends StoryItem = StoryItem> {
  totalStories: number;
  activeIndex: Signal<number>;
  progress: Signal<number>;
  group: StoriesGroup<T>;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          LoadingRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface LoadingRenderProps<T extends StoryItem = StoryItem> {
  story: T;
  storyIndex: number;
  groupIndex: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">
          ErrorRenderProps{'<T>'}
        </h3>
        <CodeBlock
          code={`interface ErrorRenderProps<T extends StoryItem = StoryItem> {
  story: T;
  storyIndex: number;
  groupIndex: number;
}`}
          language="typescript"
        />

        <h3 className="text-lg font-semibold mt-6 mb-2">StoriesApi</h3>
        <CodeBlock
          code={`interface StoriesApi {
  nextStory(): void;
  prevStory(): void;
  nextGroup(): void;
  prevGroup(): void;
  goToGroup(index: number): void;
  pause(): void;
  resume(): void;
}`}
          language="typescript"
        />
      </section>

      {/* Custom Story Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Custom Story Types</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Extend{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoryItem
          </code>{' '}
          with custom fields and pass the type parameter to{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            StoriesOverlay
          </code>
          . All render props will receive your extended type:
        </p>
        <CodeBlock
          code={`import {
  StoriesOverlay,
  ImageStorySlide,
  type StoryItem,
  type StoriesGroup,
  type SlideRenderProps,
} from '@reelkit/react-stories-player';

interface PromoStory extends StoryItem {
  title: string;
  subtitle?: string;
  bgGradient?: string;
  ctaText?: string;
}

const groups: StoriesGroup<PromoStory>[] = [
  {
    author: { id: 'brand', name: 'My Brand', avatar: '/brand.png', verified: true },
    stories: [
      {
        id: 'promo-1',
        mediaType: 'image',
        src: '/sale-banner.jpg',
        title: 'Flash Sale',
        subtitle: 'Up to 50% off',
        ctaText: 'Shop Now',
      },
      {
        id: 'promo-2',
        mediaType: 'image',
        src: '',
        title: 'Thank You',
        subtitle: '10K followers!',
        bgGradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      },
    ],
  },
];

function CustomSlide({ story, size, onReady, onError }: SlideRenderProps<PromoStory>) {
  const [w, h] = size;
  const hasImage = story.src && story.mediaType === 'image';

  return (
    <div style={{ width: w, height: h, background: story.bgGradient ?? '#000', position: 'relative' }}>
      {hasImage && <ImageStorySlide src={story.src} onLoad={onReady} onError={onError} />}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 32, color: '#fff' }}>
        <h2>{story.title}</h2>
        {story.subtitle && <p>{story.subtitle}</p>}
        {story.ctaText && (
          <button style={{ marginTop: 16, padding: '8px 24px', borderRadius: 20, background: '#fff', color: '#000', border: 'none' }}>
            {story.ctaText}
          </button>
        )}
      </div>
    </div>
  );
}

<StoriesOverlay<PromoStory>
  isOpen={isOpen}
  onClose={handleClose}
  groups={groups}
  renderSlide={(props) => <CustomSlide {...props} />}
/>`}
          language="tsx"
        />
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">CSS Classes</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All CSS classes are plain (not CSS modules), so they can be targeted
          with higher-specificity selectors in a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player/styles.css
          </code>
          . For color, size, and z-index changes, prefer the CSS custom
          properties documented in the{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          section below.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Class</th>
                <th className="text-left py-3 px-4 font-semibold">Component</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {cssClasses.map((c) => (
                <tr
                  key={c.className}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.className}
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm">
                    {c.component}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="theming" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Theming</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every color, size, z-index, and transition lives in a CSS custom
          property. Override one or many at{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          (or any ancestor of the overlay) to retheme without touching component
          source.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Token</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">Controls</th>
              </tr>
            </thead>
            <tbody>
              {themeTokens.map((t) => (
                <tr
                  key={t.token}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.token}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.default}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {t.controls}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-3">
          Drop the snippet below into a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player/styles.css
          </code>
          .
        </p>

        <CodeBlock
          language="css"
          code={`/* Brand the stories overlay */
:root {
  --rk-stories-overlay-bg: #0f172a;
  --rk-stories-container-radius: 24px;
  --rk-stories-nav-bg: rgba(99, 102, 241, 0.25);
  --rk-stories-nav-bg-hover: rgba(168, 85, 247, 0.55);
  --rk-stories-top-shade-bg: linear-gradient(
    to bottom,
    rgba(99, 102, 241, 0.5) 0%,
    transparent 100%
  );
  --rk-stories-header-name-fg: #fef3c7;
  --rk-stories-ring-spin-duration: 2s;
}`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'ArrowLeft', action: 'Previous story' },
                { key: 'ArrowRight', action: 'Next story' },
                { key: 'Escape', action: 'Close player' },
              ].map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {s.key}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {s.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
