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
} from 'lucide-react';

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
    type: "'slide' | 'fade' | 'zoom-in'",
    default: "'slide'",
    description: 'CSS transition animation between slides',
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
    prop: 'loop',
    type: 'boolean',
    default: 'false',
    description: 'Whether the slider wraps from the last slide back to first',
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
    default: 'false',
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
];

const contextTypes = [
  {
    name: 'LightboxControlsContext',
    fields:
      '{ onClose, currentIndex, count, isFullscreen, onToggleFullscreen }',
  },
  {
    name: 'LightboxNavContext',
    fields: '{ onPrev, onNext, activeIndex, count }',
  },
  {
    name: 'LightboxInfoContext',
    fields: '{ $implicit: LightboxItem, index }',
  },
  {
    name: 'LightboxSlideContext',
    fields:
      '{ $implicit: LightboxItem, index, size: [number, number], isActive }',
  },
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
      </div>

      <section className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FeatureCardGrid
            items={[
              {
                icon: Image,
                label: 'Images & Video',
                desc: 'Built-in video slide support',
              },
              {
                icon: Maximize2,
                label: 'Fullscreen',
                desc: 'Native browser fullscreen',
              },
              {
                icon: Keyboard,
                label: 'Keyboard Nav',
                desc: 'Arrow keys + Escape to close',
              },
              {
                icon: Zap,
                label: 'Preloading',
                desc: 'Adjacent images preloaded',
              },
              {
                icon: MousePointer,
                label: 'Swipe to Close',
                desc: 'Mobile swipe-up gesture',
              },
              {
                icon: X,
                label: 'Template Slots',
                desc: '4 customizable slot zones',
              },
              {
                icon: Hash,
                label: 'Transitions',
                desc: 'slide, fade, zoom-in',
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
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
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
        <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
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
    src: 'https://picsum.photos/id/1015/1600/1000',
    title: 'Mountain River',
    description: 'A beautiful mountain river',
    width: 1600,
    height: 1000,
  },
  {
    src: 'https://picsum.photos/id/1016/1000/1600',
    title: 'Snowy Peaks',
    width: 1000,
    height: 1600,
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
export class GalleryComponent {
  images = images;
  openIndex: number | null = null;
}`}
          language="typescript"
          title="gallery.component.ts"
          framework="angular"
          stackblitzDeps={{
            '@reelkit/angular-lightbox': '0.1.0',
            'lucide-angular': '>=0.460.0',
          }}
          stackblitzStyles={['@reelkit/angular-lightbox/styles.css']}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Template Slots</h2>
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
                   let-currentIndex="currentIndex"
                   let-count="count">
        <div style="position:absolute;top:0;left:0;right:0;padding:12px;
                    display:flex;align-items:center;justify-content:space-between">
          <rk-close-button (click)="onClose()" />
          <rk-counter [current]="currentIndex + 1" [total]="count" />
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
export class CustomLightboxComponent {
  images: LightboxItem[] = [];
  isOpen = false;
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Video Support</h2>
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
export class MixedGalleryComponent {
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
        <h2 className="text-2xl font-bold mb-4">SwipeToClose Directive</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkSwipeToCloseDirective
          </code>{' '}
          is used internally by the lightbox to handle the mobile
          swipe-up-to-close gesture. It can be applied to any element to add the
          same behavior.
        </p>
        <CodeBlock
          code={`import { RkSwipeToCloseDirective } from '@reelkit/angular-lightbox';

// Applied to a custom element
@Component({
  imports: [RkSwipeToCloseDirective],
  template: \`
    <div rkSwipeToClose (swipedUp)="close()">
      <!-- your custom overlay content -->
    </div>
  \`,
})`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">FullscreenService</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Provided at the{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            RkLightboxOverlayComponent
          </code>{' '}
          level. Can be injected inside the overlay's template slot children to
          observe or toggle fullscreen state directly.
        </p>
        <CodeBlock
          code={`import { inject } from '@angular/core';
import { FullscreenService } from '@reelkit/angular-lightbox';

@Component({ ... })
export class CustomControlsComponent {
  readonly fs = inject(FullscreenService);

  // Use in template:
  // [class.active]="fs.isFullscreen()"
  // (click)="fs.toggle(containerElement)"
}`}
          language="typescript"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">
          RkLightboxOverlayComponent Inputs
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
        <h2 className="text-2xl font-bold mb-4">
          RkLightboxOverlayComponent Outputs
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
        <h2 className="text-2xl font-bold mb-4">LightboxItem Interface</h2>
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
