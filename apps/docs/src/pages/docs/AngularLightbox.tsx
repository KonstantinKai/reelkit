import { Link } from 'react-router-dom';
import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { Sandbox } from '../../components/ui/Sandbox';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import {
  Image,
  Maximize2,
  Keyboard,
  Zap,
  MousePointer,
  X,
  Hash,
  Layers,
  Volume2,
  AlertTriangle,
  Loader,
} from 'lucide-react';
import { Heading } from '../../components/ui/Heading';

const lightboxInputs = [
  {
    prop: 'isOpen',
    type: 'boolean',
    default: 'required',
    description:
      'Controls visibility; when false the overlay is removed from the DOM',
  },
  {
    prop: 'items',
    type: 'LightboxItem[]',
    default: 'required',
    description: 'Array of lightbox items (images or videos)',
  },
  {
    prop: 'initialIndex',
    type: 'number',
    default: '0',
    description: 'Zero-based index of the initially visible item',
  },
  {
    prop: 'transition',
    type: "'slide' | 'fade' | 'flip' | 'zoom-in'",
    default: "'slide'",
    description:
      'Transition animation between slides. Internally maps to TransitionTransformFn',
  },
  {
    prop: 'showInfo',
    type: 'boolean',
    default: 'true',
    description: 'Whether to render the title/description info overlay',
  },
  {
    prop: 'showControls',
    type: 'boolean',
    default: 'true',
    description:
      'Whether to render the top controls bar (close, counter, fullscreen)',
  },
  {
    prop: 'showNavigation',
    type: 'boolean',
    default: 'true',
    description: 'Whether to render the prev/next navigation arrows',
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
    description:
      'Minimum swipe distance fraction (0–1) to trigger slide change',
  },
  {
    prop: 'swipeToCloseDirection',
    type: "'up' | 'down'",
    default: "'up'",
    description: 'Direction of the swipe-to-close gesture on mobile',
  },
  {
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Whether the slider wraps from the last slide back to first',
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
    prop: 'wheelDebounceMs',
    type: 'number',
    default: '200',
    description: 'Debounce duration for wheel events in ms',
  },
  {
    prop: 'ariaLabel',
    type: 'string',
    default: "'Image gallery'",
    description: 'Accessible label for the dialog region',
  },
];

const lightboxOutputs = [
  {
    prop: 'closed',
    type: 'EventEmitter<void>',
    description: 'Emitted when the user closes the lightbox',
  },
  {
    prop: 'slideChange',
    type: 'EventEmitter<number>',
    description: 'Emitted when the active slide index changes',
  },
];

const lightboxItemProps = [
  {
    prop: 'src',
    type: 'string',
    required: true,
    description: 'URL of the image or video',
  },
  {
    prop: 'type',
    type: "'image' | 'video'",
    required: false,
    description: "Item type. Defaults to 'image'",
  },
  {
    prop: 'poster',
    type: 'string',
    required: false,
    description: 'Thumbnail image for video items',
  },
  {
    prop: 'title',
    type: 'string',
    required: false,
    description: 'Title shown in the info overlay',
  },
  {
    prop: 'description',
    type: 'string',
    required: false,
    description: 'Description shown below the title',
  },
  {
    prop: 'width',
    type: 'number',
    required: false,
    description: 'Intrinsic image width in pixels',
  },
  {
    prop: 'height',
    type: 'number',
    required: false,
    description: 'Intrinsic image height in pixels',
  },
];

const templateSlots = [
  {
    directive: 'rkLightboxControls',
    context: 'LightboxControlsContext',
    description:
      'Replace the top controls bar (close button, counter, fullscreen toggle)',
  },
  {
    directive: 'rkLightboxNavigation',
    context: 'LightboxNavContext',
    description: 'Replace the prev/next navigation arrows',
  },
  {
    directive: 'rkLightboxInfo',
    context: 'LightboxInfoContext',
    description: 'Replace the bottom title/description gradient overlay',
  },
  {
    directive: 'rkLightboxSlide',
    context: 'LightboxSlideContext',
    description: 'Replace individual slide content (required for video slides)',
  },
  {
    directive: 'rkLightboxLoading',
    context: '{ $implicit: activeIndex, item }',
    description: 'Custom loading indicator',
  },
  {
    directive: 'rkLightboxError',
    context: '{ $implicit: activeIndex, item }',
    description: 'Custom error indicator',
  },
];

const contextTypes = [
  {
    name: 'LightboxControlsContext',
    fields:
      '{ item, onClose, activeIndex, count, isFullscreen, onToggleFullscreen }',
  },
  {
    name: 'LightboxNavContext',
    fields: '{ item, onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'LightboxInfoContext',
    fields: '{ $implicit: LightboxItem, index }',
  },
  {
    name: 'LightboxSlideContext',
    fields:
      '{ $implicit: LightboxItem, index, size: [number, number], isActive, onReady, onWaiting, onError }',
  },
];

const lifecycleCallbacks = [
  {
    callback: 'onReady',
    type: '() => void',
    description:
      'Notify that the slide content has loaded successfully (e.g. image decoded)',
  },
  {
    callback: 'onWaiting',
    type: '() => void',
    description:
      'Notify that the slide content is loading/buffering (shows spinner)',
  },
  {
    callback: 'onError',
    type: '() => void',
    description:
      'Notify that the slide content failed to load (shows error icon)',
  },
];

const cssClasses = [
  // Overlay
  {
    className: '.rk-lightbox-overlay',
    component: 'Overlay',
    description: 'Root container (full-screen backdrop)',
  },
  {
    className: '.rk-lightbox-top-shade',
    component: 'Overlay',
    description: 'Top gradient scrim behind controls',
  },
  {
    className: '.rk-lightbox-spinner',
    component: 'Overlay',
    description: 'Default loading spinner',
  },
  {
    className: '.rk-lightbox-img-error',
    component: 'Overlay',
    description: 'Error state container (broken image)',
  },
  {
    className: '.rk-lightbox-img-error-text',
    component: 'Overlay',
    description: 'Error state text label',
  },
  {
    className: '.rk-lightbox-swipe-hint',
    component: 'Overlay',
    description: 'Mobile swipe hint',
  },
  {
    className: '.rk-lightbox-empty',
    component: 'Overlay',
    description: 'Empty state text',
  },

  // Controls
  {
    className: '.rk-lightbox-controls-left',
    component: 'Controls',
    description: 'Top-left controls container',
  },
  {
    className: '.rk-lightbox-btn',
    component: 'Controls',
    description: 'Control button (fullscreen, etc.)',
  },
  {
    className: '.rk-lightbox-close',
    component: 'Controls',
    description: 'Close button',
  },
  {
    className: '.rk-lightbox-counter',
    component: 'Controls',
    description: 'Image counter chip',
  },

  // Navigation
  {
    className: '.rk-lightbox-nav',
    component: 'Navigation',
    description: 'Navigation arrow (both prev and next)',
  },
  {
    className: '.rk-lightbox-nav-prev',
    component: 'Navigation',
    description: 'Previous arrow',
  },
  {
    className: '.rk-lightbox-nav-next',
    component: 'Navigation',
    description: 'Next arrow',
  },

  // Info
  {
    className: '.rk-lightbox-info',
    component: 'Info',
    description: 'Title / description container',
  },
  {
    className: '.rk-lightbox-title',
    component: 'Info',
    description: 'Image title',
  },
  {
    className: '.rk-lightbox-description',
    component: 'Info',
    description: 'Image description',
  },

  // Slide
  {
    className: '.rk-lightbox-slide',
    component: 'Slide',
    description: 'Slide container',
  },
  {
    className: '.rk-lightbox-img',
    component: 'Slide',
    description: 'Image element',
  },

  // VideoSlide
  {
    className: '.rk-lightbox-video-container',
    component: 'VideoSlide',
    description: 'Video slide container (opt-in)',
  },
  {
    className: '.rk-lightbox-video-element',
    component: 'VideoSlide',
    description: 'Video element (opt-in)',
  },
  {
    className: '.rk-lightbox-video-poster',
    component: 'VideoSlide',
    description: 'Video poster image (opt-in)',
  },
  {
    className: '.rk-lightbox-video-error',
    component: 'VideoSlide',
    description: 'Video error state container',
  },
];

const themeTokens = [
  // Overlay
  {
    token: '--rk-lightbox-overlay-bg',
    default: '#000',
    controls: 'Full-screen backdrop color',
  },
  {
    token: '--rk-lightbox-overlay-z',
    default: '9999',
    controls: 'Overlay z-index',
  },

  // Top shade
  {
    token: '--rk-lightbox-top-shade-height',
    default: '80px',
    controls: 'Top gradient scrim height',
  },
  {
    token: '--rk-lightbox-top-shade-bg',
    default: 'linear-gradient(rgba(0,0,0,0.6), transparent)',
    controls: 'Top gradient scrim color',
  },

  // Layout
  {
    token: '--rk-lightbox-edge-padding',
    default: '16px',
    controls: 'Edge inset for close / nav / top-left controls',
  },
  {
    token: '--rk-lightbox-controls-gap',
    default: '12px',
    controls: 'Gap between top-left controls',
  },
  {
    token: '--rk-lightbox-transition',
    default: '0.2s',
    controls: 'Button hover transition duration',
  },
  {
    token: '--rk-lightbox-blur',
    default: '8px',
    controls: 'Backdrop blur radius for buttons / chips',
  },

  // Shared button colors
  {
    token: '--rk-lightbox-btn-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Default background for close, nav, small buttons',
  },
  {
    token: '--rk-lightbox-btn-bg-hover',
    default: 'rgba(255, 255, 255, 0.2)',
    controls: 'Hover background for close, nav, small buttons',
  },
  {
    token: '--rk-lightbox-btn-fg',
    default: '#fff',
    controls: 'Icon color for close, nav, small buttons',
  },

  // Button sizes
  {
    token: '--rk-lightbox-btn-size',
    default: '36px',
    controls: 'Small button size (fullscreen toggle, etc.)',
  },
  {
    token: '--rk-lightbox-close-size',
    default: '40px',
    controls: 'Close button size',
  },
  {
    token: '--rk-lightbox-nav-size',
    default: '48px',
    controls: 'Prev/next arrow size',
  },
  {
    token: '--rk-lightbox-nav-opacity',
    default: '0.7',
    controls: 'Idle opacity of prev/next arrows',
  },

  // Counter
  {
    token: '--rk-lightbox-counter-fg',
    default: '#fff',
    controls: 'Counter text color',
  },
  {
    token: '--rk-lightbox-counter-bg',
    default: 'rgba(0, 0, 0, 0.5)',
    controls: 'Counter chip background',
  },
  {
    token: '--rk-lightbox-counter-size',
    default: '14px',
    controls: 'Counter font size',
  },
  {
    token: '--rk-lightbox-counter-padding',
    default: '6px 12px',
    controls: 'Counter chip padding',
  },
  {
    token: '--rk-lightbox-counter-radius',
    default: '20px',
    controls: 'Counter chip border-radius',
  },

  // Spinner
  {
    token: '--rk-lightbox-spinner-size',
    default: '28px',
    controls: 'Default spinner width/height',
  },
  {
    token: '--rk-lightbox-spinner-duration',
    default: '0.8s',
    controls: 'Spinner rotation duration',
  },

  // Error
  {
    token: '--rk-lightbox-error-fg',
    default: 'rgba(255, 255, 255, 0.4)',
    controls: 'Error icon + text color',
  },

  // Info (bottom caption)
  {
    token: '--rk-lightbox-info-bg',
    default: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
    controls: 'Caption scrim gradient',
  },
  {
    token: '--rk-lightbox-info-padding',
    default: '24px',
    controls: 'Caption inner padding',
  },
  {
    token: '--rk-lightbox-title-size',
    default: '18px',
    controls: 'Title font size',
  },
  {
    token: '--rk-lightbox-description-size',
    default: '14px',
    controls: 'Description font size',
  },

  // Swipe hint (mobile)
  {
    token: '--rk-lightbox-hint-fg',
    default: 'rgba(255, 255, 255, 0.5)',
    controls: 'Swipe hint text color',
  },
  {
    token: '--rk-lightbox-hint-bg',
    default: 'rgba(0, 0, 0, 0.3)',
    controls: 'Swipe hint chip background',
  },

  // Video slide (opt-in)
  {
    token: '--rk-lightbox-video-bg',
    default: '#000',
    controls: 'Letterbox background behind <video>',
  },
];

const keyboardShortcuts = [
  { key: 'ArrowLeft', action: 'Previous image' },
  { key: 'ArrowRight', action: 'Next image' },
  { key: 'Escape', action: 'Close lightbox (or exit fullscreen if active)' },
];

export default function AngularLightbox() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Angular Lightbox</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Full-screen image &amp; video gallery lightbox for Angular, built on{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-lightbox
          </code>
          .
        </p>
        <a
          href="https://angular-demo.reelkit.dev/image-preview?utm_source=docs"
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
                icon: Image,
                label: 'Images & Video',
                desc: 'Built-in video slide support',
              },
              {
                icon: MousePointer,
                label: 'Touch Gestures',
                desc: 'Swipe to navigate',
              },
              {
                icon: X,
                label: 'Swipe to Close',
                desc: 'Swipe up to dismiss',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys + Escape',
              },
              {
                icon: Maximize2,
                label: 'Fullscreen',
                desc: 'Cross-browser API',
              },
              {
                icon: Hash,
                label: 'Transitions',
                desc: 'Slide, fade, flip, zoom-in',
              },
              {
                icon: Zap,
                label: 'Preloading',
                desc: 'Adjacent images prefetched',
              },
              {
                icon: Volume2,
                label: 'Sound Toggle',
                desc: 'Per-slide mute/unmute',
              },
              {
                icon: Loader,
                label: 'Loading States',
                desc: 'Spinner + custom slot',
              },
              {
                icon: AlertTriangle,
                label: 'Error Handling',
                desc: 'Error icon + custom slot',
              },
              {
                icon: Layers,
                label: 'Template Slots',
                desc: '6 customizable slot zones',
              },
              {
                icon: Layers,
                label: 'OnPush',
                desc: 'Angular signals + OnPush',
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
          code={`npm install @reelkit/angular-lightbox @reelkit/angular lucide-angular`}
          language="bash"
        />
        <Callout type="info" title="Icons" className="mt-4">
          The default controls use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lucide-angular
          </code>{' '}
          for icons. If you prefer a different icon library, use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxControls
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxNavigation
          </code>{' '}
          template slots to provide your own.
        </Callout>
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Basic Usage
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Import the styles and the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxOverlayComponent
          </code>{' '}
          standalone component into your component's{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            imports
          </code>{' '}
          array.
        </p>
        <Sandbox
          code={`import { Component } from '@angular/core';
import {
  RkLightboxOverlayComponent,
  type LightboxItem,
} from '@reelkit/angular-lightbox';
import '@reelkit/angular-lightbox/styles.css';

const images: LightboxItem[] = [
  {
    src: '/cdn/samples/images/image-01.jpg',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
  },
  {
    src: '/cdn/samples/images/image-02.jpg',
    title: 'Snowy Peaks',
  },
  {
    src: '/cdn/samples/images/image-03.jpg',
    title: 'Misty Forest',
    description: 'Morning fog over the forest canopy',
  },
  {
    src: '/cdn/samples/images/image-04.jpg',
    title: 'Autumn Trail',
  },
  {
    src: '/cdn/samples/images/image-05.jpg',
    title: 'Ocean Cliff',
    description: 'Dramatic cliffs above the Pacific',
  },
  {
    src: '/cdn/samples/images/image-06.jpg',
    title: 'Desert Dunes',
  },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RkLightboxOverlayComponent],
  template: \`
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      @for (img of images; track img.src; let i = $index) {
        <button (click)="openIndex = i" style="aspect-ratio:4/3;cursor:pointer">
          <img [src]="img.src" style="width:100%;height:100%;object-fit:cover" />
        </button>
      }
    </div>

    <rk-lightbox-overlay
      [isOpen]="openIndex !== null"
      [items]="images"
      [initialIndex]="openIndex ?? 0"
      (closed)="openIndex = null"
    />
  \`,
})
export class AppComponent {
  images = images;
  openIndex: number | null = null;
}`}
          language="typescript"
          title="gallery.component.ts"
          framework="angular"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Template Slots
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Four template slot directives allow full customization of the overlay
          UI without forking the component. Each slot receives a strongly-typed
          context object.
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
  RkLightboxOverlayComponent,
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkCloseButtonComponent,
  RkCounterComponent,
  RkFullscreenButtonComponent,
  type LightboxItem,
  type LightboxControlsContext,
  type LightboxNavContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxControlsDirective,
    RkLightboxNavigationDirective,
    RkLightboxInfoDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
  ],
  template: \`
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="images" (closed)="isOpen = false">

      <!-- Custom controls bar -->
      <ng-template rkLightboxControls
                   let-ctx
                   let-onClose="onClose"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <div style="position:absolute;top:0;left:0;right:0;padding:12px;
                    display:flex;align-items:center;justify-content:space-between">
          <rk-close-button (click)="onClose()" />
          <rk-counter [current]="activeIndex + 1" [total]="count" />
          <rk-fullscreen-button />
        </div>
      </ng-template>

      <!-- Custom navigation -->
      <ng-template rkLightboxNavigation
                   let-onPrev="onPrev"
                   let-onNext="onNext"
                   let-activeIndex="activeIndex"
                   let-count="count">
        <button (click)="onPrev()" [disabled]="activeIndex === 0">&#8592;</button>
        <button (click)="onNext()" [disabled]="activeIndex === count - 1">&#8594;</button>
      </ng-template>

      <!-- Custom info overlay -->
      <ng-template rkLightboxInfo let-item let-index="index">
        <div style="position:absolute;bottom:0;left:0;right:0;padding:16px;
                    background:linear-gradient(transparent,rgba(0,0,0,0.6))">
          <h3 style="color:#fff">{{ item.title }}</h3>
          <p style="color:rgba(255,255,255,0.7)">{{ item.description }}</p>
        </div>
      </ng-template>

    </rk-lightbox-overlay>
  \`,
})
export class AppComponent {
  images: LightboxItem[] = [];
  isOpen = false;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Video Support
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Video slides require opting in via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxSlide
          </code>{' '}
          template slot and the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxVideoSlideComponent
          </code>
          . This design avoids bundling the video player for galleries that only
          need images.
        </p>
        <CodeBlock
          code={`import {
  RkLightboxOverlayComponent,
  RkLightboxSlideDirective,
  RkLightboxVideoSlideComponent,
  type LightboxItem,
  type LightboxSlideContext,
} from '@reelkit/angular-lightbox';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RkLightboxOverlayComponent,
    RkLightboxSlideDirective,
    RkLightboxVideoSlideComponent,
  ],
  template: \`
    <rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
      <ng-template rkLightboxSlide
                   let-item
                   let-size="size"
                   let-isActive="isActive">
        @if (item.type === 'video') {
          <rk-lightbox-video-slide
            [item]="item"
            [size]="size"
            [isActive]="isActive"
          />
        } @else {
          <img [src]="item.src"
               [style.width.px]="size[0]"
               [style.height.px]="size[1]"
               style="object-fit:contain" />
        }
      </ng-template>
    </rk-lightbox-overlay>
  \`,
})
export class AppComponent {
  isOpen = false;
  items: LightboxItem[] = [
    { src: '/photo.jpg', title: 'Photo' },
    { src: '/clip.mp4', type: 'video', poster: '/clip-thumb.jpg', title: 'Video' },
  ];
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Fullscreen
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            fullscreenSignal
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestFullscreen
          </code>
          , and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            exitFullscreen
          </code>{' '}
          from{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular
          </code>{' '}
          to observe or toggle fullscreen state.
        </p>
        <CodeBlock
          code={`import { fullscreenSignal, requestFullscreen, exitFullscreen } from '@reelkit/angular';

@Component({ ... })
export class AppComponent {
  readonly isFullscreen = fullscreenSignal();

  toggle(container: HTMLElement): void {
    if (this.isFullscreen()) {
      exitFullscreen();
    } else {
      requestFullscreen(container);
    }
  }
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          RkLightboxOverlayComponent Inputs
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
              {lightboxInputs.map((p) => (
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
          RkLightboxOverlayComponent Outputs
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
              {lightboxOutputs.map((p) => (
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
          LightboxItem Interface
        </Heading>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Field</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">Required</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {lightboxItemProps.map((p) => (
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
                    {p.required ? 'yes' : 'no'}
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
          Transitions
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The lightbox supports four built-in transition animations via the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            transition
          </code>{' '}
          input. Each string value maps internally to a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>
          .
        </p>

        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">
                  Transition
                </th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'slide'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Standard horizontal slide (default)
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'fade'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Crossfade between images
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'flip'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  3D card flip effect
                </td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3 px-4 font-mono text-sm text-primary-600">
                  'zoom-in'
                </td>
                <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                  Zoom in from smaller to normal size
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock
          code={`<rk-lightbox-overlay
  [isOpen]="isOpen"
  [items]="images"
  [transition]="'flip'"
  (closed)="isOpen = false"
/>`}
          language="html"
        />

        <p className="text-slate-600 dark:text-slate-400 mt-4">
          The{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            @reelkit/angular-lightbox
          </code>{' '}
          package also exports{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lightboxFadeTransition
          </code>{' '}
          and{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            lightboxZoomTransition
          </code>{' '}
          as{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            TransitionTransformFn
          </code>{' '}
          values for use in custom components that accept transition functions
          directly.
        </p>
        <CodeBlock
          code={`import {
  lightboxFadeTransition,
  lightboxZoomTransition,
} from '@reelkit/angular-lightbox';`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          Content Loading & Error Handling
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          When using the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxSlide
          </code>{' '}
          template slot, three lifecycle callbacks are available on the context
          to report loading state. The lightbox tracks per-slide state and shows
          a spinner or error icon accordingly. A content preloader caches broken
          URLs so revisiting a failed slide skips the retry.
        </p>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Lifecycle Callbacks
        </Heading>
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold">Callback</th>
                <th className="text-left py-3 px-4 font-semibold">Type</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {lifecycleCallbacks.map((c) => (
                <tr
                  key={c.callback}
                  className="border-b border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                    {c.callback}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">
                    {c.type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                    {c.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Heading level={3} className="text-xl font-semibold mt-6 mb-4">
          Wiring Callbacks in rkLightboxSlide
        </Heading>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxSlide
               let-item
               let-size="size"
               let-isActive="isActive"
               let-onReady="onReady"
               let-onWaiting="onWaiting"
               let-onError="onError">
    @if (item.type === 'video') {
      <rk-lightbox-video-slide
        [item]="item"
        [size]="size"
        [isActive]="isActive"
      />
    } @else {
      <img [src]="item.src"
           [style.width.px]="size[0]"
           [style.height.px]="size[1]"
           style="object-fit:contain"
           (load)="onReady()"
           (error)="onError()" />
    }
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Loading Template
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxLoading
          </code>{' '}
          directive to replace the default spinner.
        </p>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxLoading let-index let-item="item">
    <div style="display:flex;flex-direction:column;align-items:center;color:#fff">
      <span>Loading image {{ index + 1 }}...</span>
      <span style="opacity:0.6">{{ item.title }}</span>
    </div>
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />

        <Heading level={3} className="text-xl font-semibold mt-8 mb-4">
          Custom Error Template
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Use the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            rkLightboxError
          </code>{' '}
          directive to replace the default error icon.
        </p>
        <CodeBlock
          code={`<rk-lightbox-overlay [isOpen]="isOpen" [items]="items" (closed)="isOpen = false">
  <ng-template rkLightboxError let-index let-item="item">
    <div style="display:flex;flex-direction:column;align-items:center;color:#ef4444">
      <span>Failed to load</span>
      <span style="opacity:0.6">{{ item.title ?? item.src }}</span>
    </div>
  </ng-template>
</rk-lightbox-overlay>`}
          language="html"
        />
      </section>

      <section className="mb-12">
        <Heading level={2} className="text-2xl font-bold mb-4">
          CSS Classes
        </Heading>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All CSS classes are plain (not scoped), so they can be targeted with
          higher-specificity selectors in a stylesheet loaded after{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/angular-lightbox/styles.css
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
          (or any ancestor of the lightbox) to retheme without touching
          component source. The tokens match the React lightbox, so overrides
          port between bindings.
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
            @reelkit/angular-lightbox/styles.css
          </code>
          .
        </p>

        <CodeBlock
          code={`/* Brand the lightbox */
:root {
  --rk-lightbox-overlay-bg: #0f172a;
  --rk-lightbox-btn-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-btn-bg-hover: rgba(168, 85, 247, 0.85);
  --rk-lightbox-nav-size: 56px;
  --rk-lightbox-counter-bg: rgba(99, 102, 241, 0.65);
  --rk-lightbox-info-bg: linear-gradient(
    transparent,
    rgba(99, 102, 241, 0.55) 60%,
    rgba(168, 85, 247, 0.85)
  );
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
          input to change the screen-reader announcement; it defaults to "Image
          gallery". Each slide carries{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            role="group"
          </code>
          ,{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-roledescription="slide"
          </code>
          , and an{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            aria-label
          </code>{' '}
          derived from the image title plus position.
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          The lightbox captures focus on open and returns it to the trigger on
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
