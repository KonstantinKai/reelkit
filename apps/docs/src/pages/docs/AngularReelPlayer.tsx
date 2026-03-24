import { CodeBlock } from '../../components/ui/CodeBlock';
import { Sandbox } from '../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import {
  Zap,
  Play,
  Volume2,
  Layout,
  Image,
  Monitor,
  Layers,
  Code,
} from 'lucide-react';

const playerInputs = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Controls overlay visibility; when false the overlay is removed from the DOM',
  },
  {
    prop: 'content',
    type: 'T[] (extends BaseContentItem)',
    default: 'required',
    description: 'Array of content items to display in the player',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Zero-based index of the initially visible item',
  },
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
    prop: 'transitionDuration',
    type: 'number',
    default: '300',
    description: 'Slide animation duration in ms',
  },
  {
    prop: 'swipeDistanceFactor',
    type: 'number',
    default: '0.12',
    description: 'Minimum swipe distance fraction to trigger slide change',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Enable infinite loop between slides',
  },
  {
    prop: 'useNavKeys',
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
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Debounce duration for wheel events in ms',
  },
];

const playerOutputs = [
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
  {
    prop: 'apiReady',
    type: 'EventEmitter<ReelApi>',
    description:
      'Emitted once the slider is ready, exposing the imperative API',
  },
];

const templateSlots = [
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
    directive: 'rkPlayerControls',
    context: 'PlayerControlsContext<T>',
    description: 'Custom global controls bar (close, sound toggle, etc.)',
  },
  {
    directive: 'rkPlayerNavigation',
    context: 'PlayerNavigationContext',
    description: 'Custom prev/next navigation arrows',
  },
  {
    directive: 'rkPlayerNestedSlide',
    context: 'PlayerNestedSlideContext',
    description:
      'Custom content for each slide inside the inner horizontal slider',
  },
  {
    directive: 'rkPlayerNestedNavigation',
    context: 'PlayerNestedNavigationContext',
    description: 'Custom navigation arrows for the inner horizontal slider',
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
    name: 'PlayerSlideContext<T>',
    fields:
      '{ $implicit: T, index, size: [number,number], isActive, slideKey }',
  },
  {
    name: 'PlayerSlideOverlayContext<T>',
    fields: '{ $implicit: T, index, isActive }',
  },
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
    name: 'PlayerNestedSlideContext',
    fields:
      '{ $implicit: MediaItem, index, size, isActive, isInnerActive, slideKey }',
  },
  {
    name: 'PlayerNestedNavigationContext',
    fields: '{ $implicit: onPrev, onNext, activeIndex, count }',
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
      </div>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Play,
                label: 'Video + Images',
                desc: 'Mixed media support',
              },
              {
                icon: Volume2,
                label: 'Sound Controls',
                desc: 'Mute/unmute via SoundStateService',
              },
              {
                icon: Layout,
                label: '6 Template Slots',
                desc: 'Full UI customization',
              },
              {
                icon: Layers,
                label: 'Nested Slider',
                desc: 'Horizontal inner slider for carousels',
              },
              { icon: Zap, label: 'Virtualized', desc: 'Only 3 slides in DOM' },
              {
                icon: Image,
                label: 'Posters',
                desc: 'Thumbnail placeholders while loading',
              },
              {
                icon: Monitor,
                label: 'Responsive',
                desc: 'Full viewport on mobile',
              },
              {
                icon: Code,
                label: 'Generic API',
                desc: 'Extend BaseContentItem for custom data',
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          code={`npm install @reelkit/angular-reel-player @reelkit/angular`}
          language="bash"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
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
      src: 'https://example.com/video1.mp4',
      poster: 'https://example.com/thumb1.jpg',
      aspectRatio: 9 / 16,
    }],
    author: { name: 'Alex Johnson', avatar: 'https://example.com/avatar1.jpg' },
    likes: 1234,
    description: 'Amazing content',
  },
  {
    id: '2',
    media: [{
      id: 'img1',
      type: 'image',
      src: 'https://example.com/photo1.jpg',
      aspectRatio: 2 / 3,
    }],
    author: { name: 'Sarah Miller', avatar: 'https://example.com/avatar2.jpg' },
    likes: 5678,
    description: 'Nature at its finest',
  },
];

@Component({
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
export class ReelFeedComponent {
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
          stackblitzDeps={{ '@reelkit/angular-reel-player': '0.1.0' }}
          stackblitzStyles={[
            'node_modules/@reelkit/angular-reel-player/styles.css',
          ]}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Template Slots</h2>
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
    </rk-reel-player-overlay>
  \`,
})
export class CustomPlayerComponent {
  isOpen = false;
  content: ContentItem[] = [];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Nested Slider (Multi-Media Items)
        </h2>
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
        <h2 className="text-2xl font-bold mb-4">SoundStateService</h2>
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
export class CustomSoundControl {
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
        <h2 className="text-2xl font-bold mb-4">Custom Data Types</h2>
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
export class MyFeedComponent {
  isOpen = false;
  posts: MyPost[] = [];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          RkReelPlayerOverlayComponent Inputs
        </h2>
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
        <h2 className="text-2xl font-bold mb-4">
          RkReelPlayerOverlayComponent Outputs
        </h2>
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
        <h2 className="text-2xl font-bold mb-4">MediaItem Interface</h2>
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
        <h2 className="text-2xl font-bold mb-4">Template Slot Context Types</h2>
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
    </div>
  );
}
