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

const playerInputs = [
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Video player'",
    description: 'Accessible label for the dialog region',
  },
  {
    prop: 'aspectRatio',
    type: 'number | undefined',
    default: 'undefined',
    description:
      'Width/height ratio for desktop container. Defaults to 9/16. On mobile the player uses full viewport.',
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
    description: 'Enable keyboard arrow key navigation',
  },
  {
    prop: 'enableWheel',
    type: 'boolean',
    default: 'true',
    description: 'Enable mouse wheel navigation',
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
    description: 'Minimum swipe distance fraction to trigger slide change',
  },
  {
    prop: 'timeline',
    type: "'auto' | 'always' | 'never'",
    default: "'auto'",
    description:
      "Gating strategy for the built-in playback timeline bar. 'auto' renders only for videos longer than timelineMinDurationSeconds; 'always' renders whenever the active slide has a video; 'never' disables the built-in bar (use rkPlayerTimeline template slot for a fully custom replacement).",
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

const playerOutputs = [
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description:
      'Emitted once the slider is ready, exposing the imperative API',
  },
  {
    prop: 'closed',
    type: 'EventEmitter<void>',
    description: 'Emitted when the player is closed',
  },
  {
    prop: 'slideChange',
    type: 'EventEmitter<number>',
    description: 'Emitted when the active slide index changes',
  },
];

const templateSlots = [
  {
    directive: 'rkPlayerControls',
    context: 'PlayerControlsContext<T>',
    description: 'Custom global controls bar (close, sound toggle, etc.)',
  },
  {
    directive: 'rkPlayerError',
    context: '{ $implicit: activeIndex, item, innerActiveIndex }',
    description: 'Custom error indicator template slot',
  },
  {
    directive: 'rkPlayerLoading',
    context: '{ $implicit: activeIndex, item, innerActiveIndex }',
    description: 'Custom loading indicator template slot',
  },
  {
    directive: 'rkPlayerNavigation',
    context: 'PlayerNavigationContext',
    description: 'Custom prev/next navigation arrows',
  },
  {
    directive: 'rkPlayerNestedNavigation',
    context: 'PlayerNestedNavigationContext',
    description: 'Custom navigation arrows for the inner horizontal slider',
  },
  {
    directive: 'rkPlayerNestedSlide',
    context: 'PlayerNestedSlideContext',
    description:
      'Custom content for each slide inside the inner horizontal slider',
  },
  {
    directive: 'rkPlayerSlide',
    context: 'PlayerSlideContext<T>',
    description: 'Fully custom slide content replacing the default media slide',
  },
  {
    directive: 'rkPlayerSlideOverlay',
    context: 'PlayerSlideOverlayContext<T>',
    description: 'Per-slide overlay (author info, likes, description, etc.)',
  },
  {
    directive: 'rkPlayerTimeline',
    context: 'PlayerTimelineContext<T>',
    description:
      'Custom playback timeline bar. Rendered only when the gate (timeline mode + min duration) would render the default bar (same auto/always/never logic).',
  },
];

const mediaItemProps = [
  {
    prop: 'id',
    type: 'string',
    description: 'Unique identifier for the media item',
  },
  { prop: 'type', type: "'image' | 'video'", description: 'Media type' },
  { prop: 'src', type: 'string', description: 'URL of the media asset' },
  {
    prop: 'poster',
    type: 'string?',
    description: 'Poster thumbnail URL for video items',
  },
  {
    prop: 'aspectRatio',
    type: 'number',
    description:
      'width/height ratio. Values < 1 indicate vertical (cover), > 1 horizontal (contain)',
  },
];

const contextTypes = [
  {
    name: 'PlayerControlsContext<T>',
    fields:
      '{ $implicit: onClose, activeIndex, content: T[], soundState: PlayerSoundState }',
  },
  {
    name: 'PlayerNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'PlayerNestedNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'PlayerNestedSlideContext',
    fields:
      '{ $implicit: MediaItem, index, size, isActive, isInnerActive, slideKey }',
  },
  {
    name: 'PlayerSlideContext<T>',
    fields:
      '{ $implicit: T, index, size: [number,number], isActive, slideKey, onReady, onWaiting, onError }',
  },
  {
    name: 'PlayerSlideOverlayContext<T>',
    fields: '{ $implicit: T, index, isActive }',
  },
  {
    name: 'PlayerTimelineContext<T>',
    fields: '{ $implicit: T, activeIndex, timelineState: PlayerTimelineState }',
  },
  {
    name: 'PlayerTimelineState',
    fields:
      '{ duration(), currentTime(), progress(), bufferedRanges(), isScrubbing(), seek(t), bindInteractions(el) }',
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
    className: '.rk-reel-nav-btn',
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
    className: '.rk-reel-video-loader',
    component: 'VideoSlide',
    description: 'Wave loading animation',
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
  {
    className: '.rk-reel-nested-slider-inner',
    component: 'NestedSlider',
    description: 'Nested horizontal slider root',
  },

  // Timeline
  {
    className: '.rk-reel-timeline',
    component: 'TimelineBar',
    description:
      'Scrub-bar wrapper. Reuse on custom `rkPlayerTimeline` template roots to inherit flush-bottom positioning, safe-area padding, and touch-device slide-overlay clearance.',
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
  {
    token: '--rk-reel-video-loader-color',
    default: 'rgba(255, 255, 255, 0.15)',
    controls: 'Video buffering shimmer color',
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
  {
    token: '--rk-reel-nested-edge-padding',
    default: '12px',
    controls: 'Nested arrow edge inset',
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

export default function AngularReelPlayer() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular Reel Player</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Full-screen Instagram/TikTok-style vertical media player for Angular,
          built on{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-reel-player
          </code>
          .
        </p>
        <a
          href="https://angular-demo.reelkit.dev/reel-player?utm_source=docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          View live demo &rarr;
        </a>
      </div>

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
                label: 'Customizable',
                desc: 'Template slots for everything',
              },
              {
                icon: Zap,
                label: 'Error Handling',
                desc: 'Broken media detection with LRU cache',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Installation
        </Heading>
        <CodeBlock
          code={`npm install @reelkit/angular-reel-player @reelkit/angular lucide-angular`}
          language="bash"
        />
        <Callout type="info" title="Icons" className="mt-4">
          The default controls use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-angular
          </code>{' '}
          for icons (close, sound, navigation arrows). If you prefer a different
          icon library, use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerControls
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerNavigation
          </code>{' '}
          template slots to provide your own.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Basic Usage
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Import the stylesheet and the standalone{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          into your component's{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            imports
          </code>{' '}
          array.
        </p>
        <Sandbox
          code={`import { Component, signal } from '@angular/core';
import {
  RkReelPlayerOverlayComponent,
  type ContentItem,
} from '@reelkit/angular-reel-player';
import '@reelkit/angular-reel-player/styles.css';

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
    description: 'Amazing content',
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <!-- Grid thumbnail view -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      @for (item of content; track item.id; let i = $index) {
        <button
          (click)="openAt(i)"
          style="aspect-ratio:9/16;cursor:pointer;overflow:hidden"
        >
          <img
            [src]="item.media[0].poster || item.media[0].src"
            style="width:100%;height:100%;object-fit:cover"
          />
        </button>
      }
    </div>

    <rk-reel-player-overlay
      [isOpen]="isOpen()"
      [content]="content"
      [initialIndex]="startIndex()"
      (closed)="isOpen.set(false)"
    />
  \`,
})
export class AppComponent {
  readonly content = content;
  readonly isOpen = signal(false);
  readonly startIndex = signal(0);

  openAt(index: number): void {
    this.startIndex.set(index);
    this.isOpen.set(true);
  }
}`}
          language="typescript"
          title="reel-feed.component.ts"
          framework="angular"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Template Slots
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Six template slot directives let you customize every aspect of the
          player's UI. Each receives a strongly-typed context object. Only
          provide the slots you want to override — the defaults are used for the
          rest.
        </p>

        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Directive</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Context Type
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {templateSlots.map((s) => (
                <tr
                  key={s.directive}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    [{s.directive}]
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {s.context}
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
          code={`import {
  RkReelPlayerOverlayComponent,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerNavigationDirective,
  RkCloseButtonComponent,
  RkSoundButtonComponent,
  type ContentItem,
  type PlayerSlideOverlayContext,
  type PlayerControlsContext,
  type PlayerNavigationContext,
} from '@reelkit/angular-reel-player';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkReelPlayerOverlayComponent,
    RkPlayerSlideOverlayDirective,
    RkPlayerControlsDirective,
    RkPlayerNavigationDirective,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
  ],
  template: \`
    <rk-reel-player-overlay
      [isOpen]="isOpen"
      [content]="content"
      (closed)="isOpen = false"
    >
      <!-- Custom per-slide overlay: author + likes -->
      <ng-template rkPlayerSlideOverlay let-item let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <div style="display:flex;align-items:center;gap:8px">
              <img [src]="item.author.avatar" style="width:40px;height:40px;border-radius:50%" />
              <span style="font-weight:600">{{ item.author.name }}</span>
            </div>
            <p style="margin-top:8px">{{ item.description }}</p>
          </div>
        }
      </ng-template>

      <!-- Custom global controls -->
      <ng-template rkPlayerControls
                   let-onClose
                   let-soundState="soundState">
        <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px">
          <rk-sound-button [soundState]="soundState" />
          <rk-close-button (click)="onClose()" />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkPlayerNavigation
                   let-onPrev
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%)">
          <button (click)="onPrev()" [disabled]="activeIndex === 0">&#9650;</button>
          <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#9660;</button>
        </div>
      </ng-template>

      <!-- Custom playback timeline -->
      <ng-template rkPlayerTimeline let-state="timelineState">
        <div class="rk-reel-timeline" style="padding:0 16px"
             (pointerdown)="bindTrack(track, state); track.focus()">
          <div #track
               role="slider"
               [attr.aria-valuenow]="state.currentTime()"
               style="height:6px;background:rgba(255,255,255,0.2);border-radius:999px">
            <div [style.width.%]="state.progress() * 100"
                 style="height:100%;background:linear-gradient(90deg,#6366f1,#ec4899);border-radius:999px"></div>
          </div>
        </div>
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  content: ContentItem[] = [];

  private _trackDispose: (() => void) | null = null;
  /** Wire pointer + keyboard scrub onto your custom track element. */
  bindTrack(el: HTMLElement, state: PlayerTimelineState) {
    this._trackDispose?.();
    this._trackDispose = state.bindInteractions(el);
  }
}`}
          language="typescript"
        />
      </section>

      {/* Custom Timeline subsection */}
      <section className="mb-12">
        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Timeline
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerTimeline
          </code>{' '}
          template slot is invoked only when the overlay's gating rules would
          render the default bar (same{' '}
          <code className="font-mono text-xs">timeline</code> mode +{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>
          ), so you don't re-implement it. Reuse the{' '}
          <code className="font-mono text-xs">.rk-reel-timeline</code> class on
          your root to inherit flush-bottom positioning, safe-area padding, and
          touch-device clearance. Call{' '}
          <code className="font-mono text-xs">state.bindInteractions(el)</code>{' '}
          on your scrub track to wire pointer + keyboard scrubbing.
        </p>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Nested Slider (Multi-Media Items)
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            ContentItem
          </code>{' '}
          contains multiple{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            media
          </code>{' '}
          entries, the player renders them in a horizontal nested slider
          (Instagram carousel style). Use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerNestedSlide
          </code>{' '}
          slot to customize the inner slide content.
        </p>
        <CodeBlock
          code={`const carouselItem: ContentItem = {
  id: '3',
  media: [
    { id: 'img-a', type: 'image', src: '/photo-a.jpg', aspectRatio: 2 / 3 },
    { id: 'img-b', type: 'image', src: '/photo-b.jpg', aspectRatio: 3 / 4 },
    { id: 'img-c', type: 'image', src: '/photo-c.jpg', aspectRatio: 1 },
  ],
  author: { name: 'Emma Davis', avatar: '/avatar3.jpg' },
  likes: 8901,
  description: 'Travel moments',
};`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Content Loading & Error Handling
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The player tracks per-slide loading and error states. A wave loader
          shows while content loads; an error icon shows for broken media.
          Errored URLs are cached so revisiting shows the error instantly
          without retrying.
        </p>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Lifecycle Callbacks
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkPlayerSlide
          </code>{' '}
          template slot, use the context callbacks to control the loading
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
          code={`<!-- Wire lifecycle callbacks in a custom slide template -->
<rk-reel-player-overlay [isOpen]="isOpen" [content]="items" (closed)="isOpen = false">
  <ng-template rkPlayerSlide
    let-item
    let-size="size"
    let-isActive="isActive"
    let-onReady="onReady"
    let-onWaiting="onWaiting"
    let-onError="onError"
  >
    @if (item.media[0].type === 'image') {
      <img
        [src]="item.media[0].src"
        (load)="onReady()"
        (error)="onError()"
        [style.width.px]="size[0]"
        [style.height.px]="size[1]"
        style="object-fit: cover"
      />
    } @else {
      <video
        [src]="item.media[0].src"
        [autoplay]="isActive"
        (canplay)="onReady()"
        (waiting)="onWaiting()"
        (error)="onError()"
        [style.width.px]="size[0]"
        [style.height.px]="size[1]"
        style="object-fit: cover"
      />
    }
  </ng-template>
</rk-reel-player-overlay>`}
          language="html"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Loading & Error UI
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Replace the default wave loader and error icon with custom templates:
        </p>

        <CodeBlock
          code={`<rk-reel-player-overlay [isOpen]="isOpen" [content]="items" (closed)="isOpen = false">
  <ng-template rkPlayerLoading let-index let-item="item">
    <div style="
      position: absolute; inset: 0; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 14px;
    ">
      Loading slide {{ index + 1 }}...
    </div>
  </ng-template>

  <ng-template rkPlayerError let-index let-item="item">
    <div style="
      position: absolute; inset: 0; z-index: 10;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 12px; color: rgba(255,255,255,0.5);
    ">
      <span style="font-size: 48px">!</span>
      <span>Failed to load media</span>
    </div>
  </ng-template>
</rk-reel-player-overlay>`}
          language="html"
        />
      </section>

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
          input: <code className="font-mono text-xs">'auto'</code> (default)
          renders whenever the active media is a video longer than{' '}
          <code className="font-mono text-xs">timelineMinDurationSeconds</code>{' '}
          (default 30), <code className="font-mono text-xs">'always'</code>{' '}
          whenever a video is active,{' '}
          <code className="font-mono text-xs">'never'</code> to disable. For a
          fully custom scrub bar, use the{' '}
          <code className="font-mono text-xs">rkPlayerTimeline</code> template
          directive; its context exposes a{' '}
          <code className="font-mono text-xs">timelineState</code> backed by the
          underlying{' '}
          <code className="font-mono text-xs">TimelineController</code>.
        </p>
        <CodeBlock
          code={`<rk-reel-player-overlay
  [isOpen]="isOpen()"
  [content]="items"
  timeline="auto"
  [timelineMinDurationSeconds]="30"
  (closed)="isOpen.set(false)"
/>`}
          language="html"
        />
        <p className="text-slate-600 dark:text-slate-400 mt-4">
          Theme via the{' '}
          <code className="font-mono text-xs">--rk-reel-timeline-*</code> CSS
          custom properties. For direct control in custom consumer components,
          inject <code className="font-mono text-xs">TimelineStateService</code>
          .
        </p>

        <Heading level={3} className="text-xl font-semibold mt-8 mb-3">
          RkTimelineBarComponent
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Default playback scrub bar component. Consumes{' '}
          <code className="font-mono text-xs">TimelineStateService</code>{' '}
          (provided by{' '}
          <code className="font-mono text-xs">
            RkReelPlayerOverlayComponent
          </code>
          ) and renders the track, buffered ranges, progress fill, and scrub
          pill. Selector:{' '}
          <code className="font-mono text-xs">rk-timeline-bar</code>. Inputs:{' '}
          <code className="font-mono text-xs">class?: string</code>,{' '}
          <code className="font-mono text-xs">
            style?: Record&lt;string, string&gt;
          </code>
          . Use inside an{' '}
          <code className="font-mono text-xs">rkPlayerTimeline</code> template
          to wrap or augment the default bar; use standalone only inside a
          consumer that provides the service.
        </p>
        <CodeBlock
          code={`import { RkTimelineBarComponent } from '@reelkit/angular-reel-player';

@Component({
  standalone: true,
  imports: [RkReelPlayerOverlayComponent, RkTimelineBarComponent],
  template: \`
    <rk-reel-player-overlay [isOpen]="isOpen()" [content]="items">
      <!-- Wrap or augment the default bar: -->
      <ng-template rkPlayerTimeline>
        <my-timecode />
        <rk-timeline-bar />
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          SoundStateService
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Provided at the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkReelPlayerOverlayComponent
          </code>{' '}
          level. Injected by the default sound button and exposed in the
          controls template slot context. Can be injected in custom controls
          that are <em>children</em> of the overlay for direct access.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { SoundStateService } from '@reelkit/angular-reel-player';

@Component({ ... })
export class AppComponent {
  readonly soundState = inject(SoundStateService);

  // Use in template:
  // [class.muted]="soundState.muted()"
  // [disabled]="soundState.disabled()"
  // (click)="soundState.toggle()"
}`}
          language="typescript"
        />
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Member</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  muted()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  Signal&lt;boolean&gt;
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Whether the player is currently muted
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  disabled()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  Signal&lt;boolean&gt;
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  True when the active slide has no video or is transitioning
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                  toggle()
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500">
                  () =&gt; void
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                  Toggles the muted state
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Custom Data Types
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Extend{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            BaseContentItem
          </code>{' '}
          to use your own domain model. The component is generic:{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            {'RkReelPlayerOverlayComponent<T extends BaseContentItem>'}
          </code>
          .
        </p>
        <CodeBlock
          code={`import type { BaseContentItem } from '@reelkit/angular-reel-player';

interface MyPost extends BaseContentItem {
  // id: string  — from BaseContentItem
  // media: MediaItem[]  — from BaseContentItem
  title: string;
  tags: string[];
  publishedAt: Date;
}

@Component({
  imports: [RkReelPlayerOverlayComponent],
  template: \`
    <rk-reel-player-overlay [isOpen]="isOpen" [content]="posts" (closed)="isOpen = false">
      <ng-template rkPlayerSlideOverlay let-post let-isActive="isActive">
        @if (isActive) {
          <div style="position:absolute;bottom:80px;left:16px;color:#fff">
            <h3>{{ post.title }}</h3>
            @for (tag of post.tags; track tag) {
              <span>#{{ tag }} </span>
            }
          </div>
        }
      </ng-template>
    </rk-reel-player-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  posts: MyPost[] = [];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          RkReelPlayerOverlayComponent Inputs
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Input</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Default</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {playerInputs.map((p) => (
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
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          RkReelPlayerOverlayComponent Outputs
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Output</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {playerOutputs.map((p) => (
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

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          MediaItem Interface
        </Heading>
        <div className="overflow-x-auto">
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
              {mediaItemProps.map((p) => (
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

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Template Slot Context Types
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Fields</th>
              </tr>
            </thead>
            <tbody>
              {contextTypes.map((t) => (
                <tr
                  key={t.name}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {t.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {t.fields}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          CSS Classes
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All CSS classes are plain (not scoped), so they can be targeted with
          higher-specificity selectors in a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-reel-player/styles.css
          </code>
          . For color, size, and z-index changes, prefer the CSS custom
          properties documented in the{' '}
          <Link
            to={{ hash: '#theming' }}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Theming
          </Link>{' '}
          section below — they're designed for exactly that.
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
          source. The tokens match the React and Vue packages, so overrides port
          between bindings.
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
            @reelkit/angular-reel-player/styles.css
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
            ariaLabel
          </code>{' '}
          input to change the screen-reader announcement; it defaults to "Video
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
              {[
                { key: 'ArrowUp', action: 'Previous slide' },
                { key: 'ArrowDown', action: 'Next slide' },
                {
                  key: 'ArrowLeft',
                  action: 'Previous media (in nested slider)',
                },
                { key: 'ArrowRight', action: 'Next media (in nested slider)' },
                { key: 'Escape', action: 'Close player' },
              ].map((s) => (
                <tr
                  key={s.key}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4">
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {s.key}
                    </kbd>
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
