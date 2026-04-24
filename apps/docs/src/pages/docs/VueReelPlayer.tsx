import { Link } from 'react-router-dom';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Sandbox } from '../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import {
  Zap,
  Play,
  Volume2,
  Layout,
  Clock,
  Image,
  Monitor,
  Settings,
  Ratio,
  Layers,
  Code,
} from 'lucide-react';
import { Heading } from '../../components/ui/Heading';

const playerProps = [
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description:
      'Accessible label for the dialog region; announced by screen readers when the overlay opens',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    default: '9 / 16',
    description:
      'Width/height ratio for the desktop container. Mobile uses the full viewport.',
  },
  {
    prop: 'content',
    type: 'T[] (extends BaseContentItem)',
    default: 'required',
    description: 'Array of content items to display in the player',
  },
  {
    prop: 'enableNavKeys',
    type: 'boolean',
    default: 'true',
    description: 'Enable keyboard arrow-key navigation',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: 'Enable mouse-wheel navigation',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Zero-based index of the initially visible item',
  },
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Controls overlay visibility; when false the overlay is removed from the DOM',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Enable infinite loop between slides',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Minimum swipe distance fraction to trigger a slide change',
  },
  {
    prop: 'timeline',
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      "Gating strategy for the built-in playback timeline bar. 'auto' renders only for videos longer than timelineMinDurationSeconds; 'always' renders whenever the active slide has a video; 'never' disables the built-in bar (use the #timeline slot for a fully custom replacement).",
  },
  {
    prop: 'timelineMinDurationSeconds',
    type: 'number',
    default: '30',
    description:
      "Minimum video duration (seconds) for timeline='auto' to render the built-in bar. Short looping clips below this threshold are suppressed.",
  },
  {
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Slide animation duration in ms',
  },
  {
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Debounce duration for wheel events in ms',
  },
];

const playerEvents = [
  {
    name: 'api-ready',
    payload: 'ReelApi',
    description:
      'Emitted once the slider is ready, exposing the imperative API',
  },
  {
    name: 'close',
    payload: 'void',
    description: 'Emitted when the player closes',
  },
  {
    name: 'slide-change',
    payload: 'number',
    description: 'Emitted with the new active slide index after a change',
  },
  {
    name: 'update:is-open',
    payload: 'boolean',
    description: 'Emitted on close; enables `v-model:is-open`',
  },
];

const scopedSlots = [
  {
    slot: 'controls',
    scope: '{ item, soundState, activeIndex, content, onClose }',
    description: 'Custom global controls bar (close, sound, share, etc.)',
  },
  {
    slot: 'error',
    scope: '{ item, activeIndex, innerActiveIndex }',
    description: 'Custom error indicator (replaces the default icon)',
  },
  {
    slot: 'loading',
    scope: '{ item, activeIndex, innerActiveIndex }',
    description: 'Custom loading indicator (replaces the default wave loader)',
  },
  {
    slot: 'navigation',
    scope: '{ item, activeIndex, count, onPrev, onNext }',
    description: 'Custom prev/next navigation arrows (desktop)',
  },
  {
    slot: 'nestedNavigation',
    scope: '{ media, activeIndex, count, onPrev, onNext }',
    description: 'Custom arrows for the inner horizontal slider',
  },
  {
    slot: 'nestedSlide',
    scope:
      '{ item, media, index, size, isActive, isInnerActive, slideKey, defaultContent, onReady, onWaiting, onError }',
    description: 'Custom slide content inside the inner horizontal slider',
  },
  {
    slot: 'slide',
    scope:
      '{ item, index, size, isActive, slideKey, defaultContent, onReady, onWaiting, onError }',
    description:
      'Fully custom slide content (falls back to default if omitted)',
  },
  {
    slot: 'slideOverlay',
    scope: '{ item, index, isActive }',
    description: 'Per-slide overlay (author info, likes, description, etc.)',
  },
  {
    slot: 'timeline',
    scope: '{ item, activeIndex, timelineState, defaultContent }',
    description:
      'Custom playback timeline bar. Only invoked when the built-in gate (timeline mode + min duration) would render the default bar; reuses the same auto/always/never logic. Use defaultContent() to wrap the built-in <TimelineBar />.',
  },
];

const contentItemFields = [
  { field: 'id', type: 'string', description: 'Unique identifier' },
  {
    field: 'media',
    type: 'MediaItem[]',
    description: 'One or more media assets (image or video)',
  },
  {
    field: 'author',
    type: '{ name: string; avatar?: string }',
    description: 'Author shown in the default slide overlay',
  },
  { field: 'description', type: 'string?', description: 'Caption text' },
  { field: 'likes', type: 'number?', description: 'Likes count' },
];

const mediaItemFields = [
  { field: 'id', type: 'string', description: 'Unique identifier' },
  { field: 'type', type: "'image' | 'video'", description: 'Media type' },
  { field: 'src', type: 'string', description: 'URL of the media asset' },
  {
    field: 'poster',
    type: 'string?',
    description: 'Poster thumbnail URL for video items',
  },
  {
    field: 'aspectRatio',
    type: 'number',
    description:
      'width/height ratio. Values < 1 = vertical (cover), ≥ 1 = horizontal (contain).',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-reel-overlay',
    component: 'Overlay',
    description: 'Fixed full-screen backdrop (background, z-index)',
  },
  {
    className: '.rk-reel-container',
    component: 'Overlay',
    description: 'Player container (position, overflow)',
  },
  {
    className: '.rk-reel-loader',
    component: 'Overlay',
    description: 'Wave loading animation overlay',
  },
  {
    className: '.rk-reel-media-error',
    component: 'Overlay',
    description: 'Error state overlay (centered icon + text)',
  },
  {
    className: '.rk-reel-media-error-text',
    component: 'Overlay',
    description: 'Error message text',
  },

  // Controls
  {
    className: '.rk-reel-button',
    component: 'Controls',
    description: 'Shared circular icon button (close, sound, nav arrows)',
  },
  {
    className: '.rk-reel-close-btn',
    component: 'Controls',
    description: 'Close button',
  },
  {
    className: '.rk-reel-sound-btn',
    component: 'Controls',
    description: 'Sound toggle button',
  },

  // Navigation
  {
    className: '.rk-reel-nav-arrows',
    component: 'Navigation',
    description: 'Desktop-only arrow container (hidden below 768px)',
  },
  {
    className: '.rk-reel-nav-button',
    component: 'Navigation',
    description: 'Individual prev/next nav arrow',
  },

  // Slide
  {
    className: '.rk-reel-slide-wrapper',
    component: 'Slide',
    description: 'Wrapper around media + overlay',
  },

  // SlideOverlay
  {
    className: '.rk-reel-slide-overlay',
    component: 'SlideOverlay',
    description: 'Gradient overlay container',
  },
  {
    className: '.rk-reel-slide-overlay-author',
    component: 'SlideOverlay',
    description: 'Author row (avatar + name)',
  },
  {
    className: '.rk-reel-slide-overlay-avatar',
    component: 'SlideOverlay',
    description: 'Author avatar image',
  },
  {
    className: '.rk-reel-slide-overlay-name',
    component: 'SlideOverlay',
    description: 'Author name text',
  },
  {
    className: '.rk-reel-slide-overlay-description',
    component: 'SlideOverlay',
    description: 'Description text',
  },
  {
    className: '.rk-reel-slide-overlay-likes',
    component: 'SlideOverlay',
    description: 'Likes row (heart + count)',
  },

  // VideoSlide
  {
    className: '.rk-reel-video-container',
    component: 'VideoSlide',
    description: 'Video wrapper (background, overflow)',
  },
  {
    className: '.rk-reel-video-element',
    component: 'VideoSlide',
    description: 'The <video> element',
  },
  {
    className: '.rk-reel-video-poster',
    component: 'VideoSlide',
    description: 'Poster image (fades out on play)',
  },

  {
    className: '.rk-reel-video-poster.rk-visible',
    component: 'VideoSlide',
    description:
      'State modifier applied to the poster while the video is paused/loading',
  },

  // NestedSlider
  {
    className: '.rk-reel-nested-indicator',
    component: 'NestedSlider',
    description:
      'Dot pagination under multi-media slides (position varies desktop vs. touch)',
  },
  {
    className: '.rk-reel-nested-nav',
    component: 'NestedSlider',
    description: 'Horizontal carousel arrows (hidden below 768px)',
  },
  {
    className: '.rk-reel-nested-nav-next',
    component: 'NestedSlider',
    description: 'Nested next arrow position',
  },
  {
    className: '.rk-reel-nested-nav-prev',
    component: 'NestedSlider',
    description: 'Nested prev arrow position',
  },

  // Timeline
  {
    className: '.rk-reel-timeline',
    component: 'TimelineBar',
    description:
      'Scrub-bar wrapper. Reuse on custom `#timeline` slot roots to inherit flush-bottom positioning, safe-area padding, and touch-device slide-overlay clearance.',
  },
  {
    className: '.rk-reel-timeline-track',
    component: 'TimelineBar',
    description: 'Track (unplayed region)',
  },
  {
    className: '.rk-reel-timeline-buffered',
    component: 'TimelineBar',
    description: 'Buffered segments layer',
  },
  {
    className: '.rk-reel-timeline-fill',
    component: 'TimelineBar',
    description: 'Played-progress fill',
  },
  {
    className: '.rk-reel-timeline-cursor',
    component: 'TimelineBar',
    description: 'Scrub-handle pill (floats above the track)',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-reel-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-reel-overlay-z',
    default: '1000',
    controls: 'Overlay z-index',
  },

  // Shared button
  {
    token: '--rk-reel-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default circular button background',
  },
  {
    token: '--rk-reel-button-bg-hover',
    default: 'rgba(255, 255, 255, 0.1)',
    controls: 'Nav arrow background (and base hover state)',
  },
  {
    token: '--rk-reel-button-bg-hover-strong',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Nav arrow hover background',
  },
  {
    token: '--rk-reel-button-fg',
    default: '#fff',
    controls: 'Button icon color',
  },
  {
    token: '--rk-reel-button-size',
    default: '44px',
    controls: 'Button width / height',
  },
  {
    token: '--rk-reel-button-radius',
    default: '50%',
    controls: 'Button border-radius',
  },

  // UI layout
  {
    token: '--rk-reel-ui-z',
    default: '10',
    controls: 'Close / sound / nav z-index',
  },
  {
    token: '--rk-reel-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / sound / nav arrows',
  },
  {
    token: '--rk-reel-nav-gap',
    default: '8px',
    controls: 'Spacing between stacked nav arrows',
  },
  {
    token: '--rk-reel-transition',
    default: '0.2s',
    controls: 'Hover transition duration',
  },

  // Loader
  {
    token: '--rk-reel-loader-color',
    default: 'rgba(255, 255, 255, 0.12)',
    controls: 'Wave loader gradient color',
  },
  {
    token: '--rk-reel-loader-duration',
    default: '1.8s',
    controls: 'Wave loader animation duration',
  },

  // Error state
  {
    token: '--rk-reel-error-fg',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Error icon and text color',
  },

  // Slide caption overlay
  {
    token: '--rk-reel-slide-overlay-bg',
    default: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-reel-slide-overlay-padding',
    default: '48px 16px 16px',
    controls: 'Caption inner padding',
  },
  {
    token: '--rk-reel-slide-overlay-name-color',
    default: '#fff',
    controls: 'Author name color',
  },

  // Video slide
  {
    token: '--rk-reel-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },

  // Nested horizontal slider
  {
    token: '--rk-reel-nested-button-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Nested arrow background',
  },
  {
    token: '--rk-reel-nested-button-size',
    default: '36px',
    controls: 'Nested arrow size',
  },

  // Playback timeline bar
  {
    token: '--rk-reel-timeline-track',
    default: 'rgba(255, 255, 255, 0.22)',
    controls: 'Track background (unplayed region)',
  },
  {
    token: '--rk-reel-timeline-buffered',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Buffered segments color',
  },
  {
    token: '--rk-reel-timeline-fill',
    default: '#fff',
    controls: 'Played-progress fill color',
  },
  {
    token: '--rk-reel-timeline-cursor',
    default: '#fff',
    controls: 'Scrub-handle pill color',
  },
  {
    token: '--rk-reel-timeline-height',
    default: '3px',
    controls: 'Track height at rest',
  },
  {
    token: '--rk-reel-timeline-height-active',
    default: '6px',
    controls: 'Track height on hover / focus / scrub',
  },
  {
    token: '--rk-reel-timeline-cursor-width',
    default: '10px',
    controls: 'Scrub-pill width at rest',
  },
  {
    token: '--rk-reel-timeline-cursor-width-active',
    default: '14px',
    controls: 'Scrub-pill width while scrubbing',
  },
  {
    token: '--rk-reel-timeline-cursor-height',
    default: '24px',
    controls: 'Scrub-pill height at rest',
  },
  {
    token: '--rk-reel-timeline-cursor-height-active',
    default: '32px',
    controls: 'Scrub-pill height while scrubbing',
  },
  {
    token: '--rk-reel-timeline-transition',
    default: '0.15s ease-out',
    controls: 'Track + pill grow/shrink animation',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowUp', action: 'Previous slide' },
  { key: 'ArrowDown', action: 'Next slide' },
  { key: 'ArrowLeft', action: 'Previous media (nested carousel)' },
  { key: 'ArrowRight', action: 'Next media (nested carousel)' },
  { key: 'Escape', action: 'Close player' },
];

export default function VueReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Vue Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Full-screen Instagram/TikTok-style vertical media player for Vue 3,
          built on{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player
          </code>
          .
        </p>
        <a
          href="https://vue-demo.reelkit.dev/reel-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          View live demo &rarr;
        </a>
      </div>

      {/* Features */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Features
        </Heading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Zap,
                label: 'Vertical Swipe',
                desc: 'Touch, drag, keyboard, wheel',
              },
              {
                icon: Play,
                label: 'Video Autoplay',
                desc: 'Plays when visible',
              },
              { icon: Volume2, label: 'Sound Toggle', desc: 'iOS continuity' },
              {
                icon: Layout,
                label: 'Multi-Media',
                desc: 'Horizontal nested carousels',
              },
              {
                icon: Clock,
                label: 'Position Memory',
                desc: 'Resumes where left off',
              },
              {
                icon: Image,
                label: 'Frame Capture',
                desc: 'Poster-to-video crossfade',
              },
              {
                icon: Layers,
                label: 'Virtualized',
                desc: 'Only 3 slides in DOM',
              },
              {
                icon: Ratio,
                label: 'Aspect Ratio',
                desc: '9:16 desktop, full mobile',
              },
              { icon: Monitor, label: 'Desktop Nav', desc: 'Arrow buttons' },
              {
                icon: Code,
                label: 'Generic Types',
                desc: 'Custom content data models',
              },
              {
                icon: Settings,
                label: 'Scoped Slots',
                desc: 'Customize every UI element',
              },
              {
                icon: Zap,
                label: 'v-model:is-open',
                desc: 'Two-way binding on visibility',
              },
            ]}
          />
        </div>
      </section>

      {/* Installation */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Installation
        </Heading>
        <CodeBlock
          code="npm install @reelkit/vue-reel-player @reelkit/vue lucide-vue-next"
          language="bash"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4 mb-2">
          Import the stylesheet once in your app entry (or any component):
        </p>
        <CodeBlock
          code={`import '@reelkit/vue-reel-player/styles.css';`}
          language="typescript"
        />
        <Callout type="info" title="Icons" className="mt-4">
          The default controls use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-vue-next
          </code>{' '}
          for icons (close, sound, navigation arrows). If you prefer a different
          icon library, use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #navigation
          </code>{' '}
          scoped slots to provide your own.
        </Callout>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Quick Start
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Render a grid of thumbnails and open the overlay at the clicked index.
          Binding{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>{' '}
          means the parent <code>ref</code> stays in sync when the user closes
          the player via button, gesture, or Escape.
        </p>
        <Sandbox
          code={`<script setup lang="ts">
import { ref } from 'vue';
import { ReelPlayerOverlay, type ContentItem } from '@reelkit/vue-reel-player';
import '@reelkit/vue-reel-player/styles.css';

const content: ContentItem[] = [
  {
    id: '1',
    media: [{
      id: 'v1',
      type: 'video',
      src: '/cdn/samples/videos/video-01.mp4',
      poster: '/cdn/samples/videos/video-poster-01.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Alex Johnson', avatar: '/cdn/samples/avatars/avatar-01.jpg' },
    likes: 1234,
    description: 'Amazing sunset vibes',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: '/cdn/samples/images/image-01.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: '/cdn/samples/avatars/avatar-02.jpg' },
    likes: 5678,
    description: 'Nature at its finest',
  },
  {
    id: '3',
    media: [{
      id: 'v2',
      type: 'video',
      src: '/cdn/samples/videos/video-02.mp4',
      poster: '/cdn/samples/videos/video-poster-02.jpg',
      aspectRatio: 16 / 9,
    }],
    author: { name: 'Mike Chen', avatar: '/cdn/samples/avatars/avatar-03.jpg' },
    likes: 3456,
    description: 'Adventure awaits',
  },
];

const isOpen = ref(false);
const startIndex = ref(0);

function openAt(i: number) {
  startIndex.value = i;
  isOpen.value = true;
}
</script>

<template>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
    <button
      v-for="(item, i) in content"
      :key="item.id"
      @click="openAt(i)"
      style="aspect-ratio:9/16;cursor:pointer;overflow:hidden;padding:0;border:0"
    >
      <img
        :src="item.media[0].poster || item.media[0].src"
        style="width:100%;height:100%;object-fit:cover"
      />
    </button>
  </div>

  <ReelPlayerOverlay
    v-model:is-open="isOpen"
    :content="content"
    :initial-index="startIndex"
  />
</template>`}
          language="vue"
          title="App.vue"
          framework="vue"
          stackblitzDeps={['@reelkit/vue-reel-player']}
          stackblitzExtraDeps={{ 'lucide-vue-next': '>=0.460.0' }}
        />
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          API Reference
        </Heading>

        <Heading level={3} className="text-xl font-semibold mb-3">
          Props
        </Heading>
        <div className="overflow-x-auto mb-6">
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
              {playerProps.map((p) => (
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
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
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

        <Heading level={3} className="text-xl font-semibold mb-3">
          Events
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Event</th>
                <th className="text-left py-3 px-4 font-semibold">Payload</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {playerEvents.map((e) => (
                <tr
                  key={e.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    @{e.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {e.payload}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {e.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-xl font-semibold mb-3">
          v-model:is-open
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            v-model:is-open
          </code>{' '}
          to drive the overlay with a single binding. The legacy{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            :is-open
          </code>{' '}
          +{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @close
          </code>{' '}
          pattern still works if you need the explicit event.
        </p>
        <CodeBlock
          code={`<template>
  <button @click="open = true">Open</button>
  <ReelPlayerOverlay v-model:is-open="open" :content="content" />
</template>`}
          language="vue"
        />
      </section>

      {/* Scoped Slots */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Scoped Slots
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Eight scoped slots let you replace any part of the player UI. Each
          receives a strongly-typed scope object. Slots you don't pass fall back
          to the defaults.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Slot</th>
                <th className="text-left py-3 px-4 font-semibold">Scope</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {scopedSlots.map((s) => (
                <tr
                  key={s.slot}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    #{s.slot}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.scope}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {s.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  CloseButton,
  SoundButton,
  type ContentItem,
  type SlideOverlaySlotScope,
  type ControlsSlotScope,
} from '@reelkit/vue-reel-player';

const isOpen = ref(false);
const content = ref<ContentItem[]>([/* ... */]);
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <!-- Custom per-slide overlay: branded caption -->
    <template #slideOverlay="{ item, isActive }: SlideOverlaySlotScope">
      <div v-if="isActive" style="position:absolute;bottom:80px;left:16px;color:#fff">
        <div style="display:flex;align-items:center;gap:8px">
          <img :src="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
          <span style="font-weight:600">{{ item.author.name }}</span>
        </div>
        <p style="margin-top:8px">{{ item.description }}</p>
      </div>
    </template>

    <!-- Custom global controls -->
    <template #controls="{ onClose }: ControlsSlotScope">
      <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
        <SoundButton />
        <CloseButton :on-click="onClose" />
      </div>
    </template>

    <!-- Custom playback timeline -->
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <CustomTimelineBar :state="timelineState" />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Custom Timeline slot */}
      <section className="mb-12">
        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Timeline
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the built-in playback bar with your own scrub UI via the{' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #timeline
          </code>{' '}
          slot. The slot fires only when the overlay's gating rules would render
          the default bar (same{' '}
          <code className="font-mono text-xs">timeline</code> mode +{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>
          ), so you don't re-implement it. Reuse the{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code> class on
          your root to inherit flush-bottom positioning, safe-area padding, and
          touch-device clearance.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount } from 'vue';
import {
  ReelPlayerOverlay,
  type TimelineSlotScope,
} from '@reelkit/vue-reel-player';
import { toVueRef, type TimelineController } from '@reelkit/vue';

const trackRef = shallowRef<HTMLDivElement | null>(null);
let dispose: (() => void) | null = null;
const bind = (state: TimelineController) => {
  if (trackRef.value) dispose = state.bindInteractions(trackRef.value);
};
onBeforeUnmount(() => dispose?.());
</script>

<template>
  <ReelPlayerOverlay :is-open="open" :content="items" timeline="always">
    <template #timeline="{ timelineState }: TimelineSlotScope">
      <div class="rk-reel-timeline" style="padding: 0 16px" @vue:mounted="bind(timelineState)">
        <div ref="trackRef" role="slider" style="height:6px;background:rgba(255,255,255,0.2)">
          <div :style="{
            width: (timelineState.progress.value * 100) + '%',
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #ec4899)',
          }" />
        </div>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Custom Content Types */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Custom Content Types
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          is generic over your content item shape. Extend{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            BaseContentItem
          </code>{' '}
          to use any data model, and import the matching slot-scope type to keep
          slot bindings strongly typed:
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { ref } from 'vue';
import {
  ReelPlayerOverlay,
  type BaseContentItem,
  type SlideOverlaySlotScope,
} from '@reelkit/vue-reel-player';

interface MyItem extends BaseContentItem {
  title: string;
  category: 'video' | 'photo';
}

const open = ref(false);
const items: MyItem[] = [/* ... */];
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="open" :content="items">
    <template #slideOverlay="{ item }: SlideOverlaySlotScope<MyItem>">
      <div class="my-overlay">
        <h2>{{ item.title }}</h2>
        <span>{{ item.category }}</span>
      </div>
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The same pattern works for every other slot. Import the matching scope
          type (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SlideSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ControlsSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            NavigationSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            NestedSlideSlotScope
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            LoadingSlotScope
          </code>
          ) and annotate the destructure.
        </p>
      </section>

      {/* Types */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Types
        </Heading>

        <Heading level={3} className="text-xl font-semibold mb-3">
          ContentItem
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {contentItemFields.map((f) => (
                <tr
                  key={f.field}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-xl font-semibold mb-3">
          TimelineBarProps
        </Heading>
        <CodeBlock
          code={`interface TimelineBarProps {
  class?: string;
  style?: CSSProperties;
}`}
          language="typescript"
        />

        <Heading level={3} className="text-xl font-semibold mt-6 mb-3">
          TimelineSlotScope&lt;T&gt;
        </Heading>
        <CodeBlock
          code={`interface TimelineSlotScope<T extends BaseContentItem> {
  item: T;
  activeIndex: number;
  timelineState: TimelineController;
  defaultContent: () => VNode | VNode[];
}`}
          language="typescript"
        />

        <Heading level={3} className="text-xl font-semibold mt-6 mb-3">
          MediaItem
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {mediaItemFields.map((f) => (
                <tr
                  key={f.field}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {f.field}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {f.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sub-Components */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Sub-Components
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Drop these into your custom{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>
          , or{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slideOverlay
          </code>{' '}
          templates. Pass the dimensions and callbacks through from the slot
          scope so autoplay, poster capture, and sound sync keep working.
        </p>

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          CloseButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Standalone circular close button with default reel-player styling. Use
          inside{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>
          .
        </p>
        <CodeBlock
          code={`import { CloseButton } from '@reelkit/vue-reel-player';

<CloseButton :on-click="onClose" />
<CloseButton :on-click="onClose" class-name="my-close-btn" :style="{ top: '24px', right: '24px' }" />`}
          language="vue"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SoundButton
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Mute/unmute toggle. Render it inside a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          provides one). Hidden when the active slide has no video.
        </p>
        <CodeBlock
          code={`import { SoundButton } from '@reelkit/vue-reel-player';

<SoundButton />
<SoundButton disabled class-name="my-sound-btn" />`}
          language="vue"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          TimelineBar
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Default playback scrub bar. Reads from the nearest{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TimelineProvider
          </code>{' '}
          (automatically mounted inside{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>
          ) and renders the track, buffered ranges, progress fill, and scrub
          pill. Theme via the{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code> custom
          properties, or replace via the{' '}
          <code className="font-mono text-xs">#timeline</code> slot.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import type { TimelineSlotScope } from '@reelkit/vue-reel-player';
</script>

<template>
  <!-- Wrap or augment the default bar from #timeline: -->
  <ReelPlayerOverlay>
    <template #timeline="{ defaultContent }: TimelineSlotScope">
      <MyTimecode />
      <component :is="defaultContent" />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          SlideOverlay
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          The default gradient overlay showing author, description, and likes.
          Renders when content carries those fields. Replace or hide it via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slideOverlay
          </code>{' '}
          slot.
        </p>
        <CodeBlock
          code={`import { SlideOverlay } from '@reelkit/vue-reel-player';

<SlideOverlay
  :author="{ name: 'John', avatar: '/avatar.jpg' }"
  description="Amazing content"
  :likes="12500"
/>`}
          language="vue"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          ImageSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Image slide with lazy loading and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            object-fit: cover
          </code>{' '}
          by default. Compose it inside the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          slot to customize image rendering while keeping built-in behavior.
        </p>
        <CodeBlock
          code={`import { ImageSlide } from '@reelkit/vue-reel-player';

<ImageSlide :src="media.src" :size="size" />

<ImageSlide
  :src="media.src"
  :size="size"
  class-name="my-image-slide"
  :style="{ backgroundColor: '#1a1a1a', borderRadius: '12px' }"
  :img-style="{ objectFit: 'contain' }"
/>`}
          language="vue"
        />

        <Heading level={3} className="text-lg font-semibold mt-6 mb-2">
          VideoSlide
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Video slide backed by a shared{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'<video>'}
          </code>{' '}
          element. Handles iOS sound continuity, poster frames, and position
          memory. Render it inside a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          provides one).
        </p>
        <CodeBlock
          code={`import { VideoSlide } from '@reelkit/vue-reel-player';

<VideoSlide
  :src="media.src"
  :poster="media.poster"
  :aspect-ratio="9 / 16"
  :size="size"
  :is-active="isActive"
  :slide-key="slideKey"
  :style="{ borderRadius: '12px' }"
/>`}
          language="vue"
        />

        <Callout
          type="info"
          title="Composing custom slides"
          className="mt-4 mb-4"
        >
          Use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ImageSlide
          </code>{' '}
          /{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            VideoSlide
          </code>{' '}
          to customize media rendering while keeping all built-in behavior
          (autoplay, poster capture, sound sync).
        </Callout>
        <CodeBlock
          code={`<script setup lang="ts">
import {
  ReelPlayerOverlay,
  ImageSlide,
  VideoSlide,
} from '@reelkit/vue-reel-player';
</script>

<template>
  <ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
    <template #slide="{ item, size, isActive, slideKey }">
      <ImageSlide
        v-if="item.media[0].type === 'image'"
        :src="item.media[0].src"
        :size="size"
        :style="{ backgroundColor: '#111' }"
        :img-style="{ objectFit: 'contain' }"
      />
      <VideoSlide
        v-else
        :src="item.media[0].src"
        :poster="item.media[0].poster"
        :aspect-ratio="item.media[0].aspectRatio"
        :size="size"
        :is-active="isActive"
        :slide-key="slideKey"
        :style="{ borderRadius: '16px' }"
      />
    </template>
  </ReelPlayerOverlay>
</template>`}
          language="vue"
        />
      </section>

      {/* Content Loading & Error Handling */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Content Loading & Error Handling
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The player tracks per-slide loading and error states. A wave loader
          shows while content loads; broken media shows an error icon. The
          player caches failed URLs, so reopening a broken slide skips the
          retry.
        </p>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Lifecycle Callbacks
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #slide
          </code>{' '}
          slot, call these callbacks from the slot scope to drive the loading
          indicator:
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Callback</th>
                <th className="text-left py-3 px-4 font-semibold">
                  When to call
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onReady
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Image loaded or video started playing. Clears loading and
                  error states.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onWaiting
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Video is buffering mid-playback. Shows the loading indicator.
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  onError
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Content failed to load. Shows error overlay and caches the URL
                  as broken.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`<!-- Inside #slide — wire callbacks to your custom media -->
<template #slide="{ item, size, isActive, onReady, onWaiting, onError }">
  <div :style="{ width: size[0] + 'px', height: size[1] + 'px' }">
    <img
      v-if="item.media[0].type === 'image'"
      :src="item.media[0].src"
      @load="onReady"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
    <video
      v-else
      :src="item.media[0].src"
      :autoplay="isActive"
      @canplay="onReady"
      @waiting="onWaiting"
      @error="onError"
      style="width:100%;height:100%;object-fit:cover"
    />
  </div>
</template>`}
          language="vue"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Loading & Error UI
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default wave loader and error icon via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #loading
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #error
          </code>{' '}
          slots:
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay v-model:is-open="isOpen" :content="content">
  <template #loading="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             align-items:center;justify-content:center;color:#fff;font-size:14px"
    >
      Loading slide {{ activeIndex + 1 }}...
    </div>
  </template>

  <template #error="{ activeIndex }">
    <div
      style="position:absolute;inset:0;z-index:10;display:flex;
             flex-direction:column;align-items:center;justify-content:center;
             gap:12px;color:rgba(255,255,255,0.5)"
    >
      <span style="font-size:48px">!</span>
      <span>Slide {{ activeIndex + 1 }} failed to load</span>
    </div>
  </template>
</ReelPlayerOverlay>`}
          language="vue"
        />
      </section>

      {/* Timeline */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Timeline
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The overlay renders a built-in playback timeline bar over the active
          video. Gate it via the{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            timeline
          </code>{' '}
          prop: <code className="font-mono text-xs">'auto'</code> (default)
          renders whenever the active media is a video longer than{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          (default 30), <code className="font-mono text-xs">'always'</code>{' '}
          whenever a video is active,{' '}
          <code className="font-mono text-xs">'never'</code> to disable. For a
          fully custom scrub bar, use the{' '}
          <code className="font-mono text-xs">#timeline</code> slot; its scope
          exposes a <code className="font-mono text-xs">timelineState</code>{' '}
          backed by the underlying{' '}
          <code className="font-mono text-xs">TimelineController</code>.
        </p>
        <CodeBlock
          code={`<ReelPlayerOverlay
  :is-open="isOpen"
  :content="items"
  timeline="auto"
  :timeline-min-duration-seconds="30"
  @close="isOpen = false"
/>`}
          language="vue"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Theme via the{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code> CSS
          custom properties.
        </p>
      </section>

      {/* Sound Context */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Sound Context
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ReelPlayerOverlay
          </code>{' '}
          mounts a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            SoundProvider
          </code>{' '}
          at its root, so any component rendered inside can read or toggle mute
          state via{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            useSoundState
          </code>
          . The composable re-exports from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue-reel-player
          </code>{' '}
          so you don't need a separate{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/vue
          </code>{' '}
          import.
        </p>
        <CodeBlock
          code={`<script setup lang="ts">
import { useSoundState, toVueRef } from '@reelkit/vue';

// Inside a custom control rendered from the #controls slot:
const soundState = useSoundState();
const muted = toVueRef(soundState.muted);
</script>

<template>
  <button @click="soundState.toggle()">
    {{ muted ? 'Unmute' : 'Mute' }}
  </button>
</template>`}
          language="vue"
        />
        <Callout type="info" className="mt-4">
          Inside the player, the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            #controls
          </code>{' '}
          slot also exposes{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            soundState
          </code>{' '}
          on its scope. Prefer that when you only need it inside the controls
          template.
        </Callout>
      </section>

      {/* CSS Classes */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          CSS Classes
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          CSS classes are plain (not scoped). A stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/vue-reel-player/styles.css
          </code>{' '}
          can override any of them with a higher-specificity selector. For
          color, size, and z-index changes, use the CSS custom properties in the{' '}
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

      {/* Theming */}
      <section id="theming" className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Theming
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Every color, size, z-index, and transition lives in a CSS custom
          property. Override one or many at{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            :root
          </code>{' '}
          (or any ancestor of the overlay) to retheme without touching component
          source. The tokens match{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-reel-player
          </code>
          , so overrides port between bindings.
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
            @reelkit/vue-reel-player/styles.css
          </code>
          .
        </p>

        <CodeBlock
          code={`/* Brand the reel-player overlay */
:root {
  --rk-reel-overlay-bg: #0f172a;
  --rk-reel-button-bg: rgba(99, 102, 241, 0.65);
  --rk-reel-button-bg-hover-strong: rgba(168, 85, 247, 0.85);
  --rk-reel-edge-padding: 24px;
  --rk-reel-button-size: 52px;

  /* Timeline bar: brand-matched, beefier on desktop */
  --rk-reel-timeline-track: rgba(99, 102, 241, 0.25);
  --rk-reel-timeline-buffered: rgba(168, 85, 247, 0.45);
  --rk-reel-timeline-fill: #a855f7;
  --rk-reel-timeline-cursor: #a855f7;
  --rk-reel-timeline-height: 4px;
  --rk-reel-timeline-height-active: 8px;
  --rk-reel-timeline-cursor-width-active: 18px;
  --rk-reel-timeline-transition: 0.2s ease-out;
}`}
          language="css"
        />
      </section>

      {/* Accessibility */}
      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Accessibility
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The overlay root is a modal dialog (
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="dialog"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-modal="true"
          </code>
          ). Set the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          prop to change the screen-reader announcement; it defaults to "Video
          player". Each slide carries{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label="Slide N of M"
          </code>
          .
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The overlay captures focus on open and returns it to the trigger on
          close. Tab and Shift+Tab cycle through focusable elements inside;
          focus that escapes (click outside, programmatic focus) gets pulled
          back. Implemented with{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            captureFocusForReturn
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            createFocusTrap
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/core
          </code>
          .
        </p>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <Heading level={2} className="text-2xl font-bold mb-4">
          Keyboard Shortcuts
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Key</th>
                <th className="text-left py-3 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {keyboardShortcuts.map((s) => (
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
