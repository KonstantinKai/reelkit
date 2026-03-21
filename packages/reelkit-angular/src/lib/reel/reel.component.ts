import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  OnInit,
  PLATFORM_ID,
  computed,
  contentChild,
  effect,
  inject,
  input,
  output,
  runInInjectionContext,
  signal,
  untracked,
  type Signal,
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  createSliderController,
  createSignal,
  defaultRangeExtractor,
  first,
  last,
  type RangeExtractor,
  type SliderController,
} from '@reelkit/core';
import { toAngularSignal } from '../signal-bridge/to-angular-signal';
import { animatedSignalBridge } from '../signal-bridge/animated-signal-bridge';
import {
  RK_REEL_CONTEXT,
  type ReelContextValue,
} from '../context/reel-context';
import { RkReelItemDirective } from './reel-item.directive';
import type { ReelApi } from './reel.types';

/**
 * Virtualized one-item slider component.
 *
 * Renders only the visible slides (typically 3: previous, current, next) at
 * any time via a content-child `*rkReelItem` structural directive template.
 *
 * Supports touch/mouse gestures, keyboard navigation, and optional mouse-
 * wheel scrolling. Emit the `apiReady` output to obtain an imperative API.
 *
 * @example
 * ```html
 * <rk-reel [count]="items.length" (apiReady)="api = $event">
 *   <ng-template rkReelItem let-i let-size="size">
 *     <app-slide [data]="items[i]" [style.width.px]="size[0]" />
 *   </ng-template>
 * </rk-reel>
 * ```
 */
@Component({
  selector: 'rk-reel',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Block display is required so that percentage width/height from the
    // parent (e.g. width: 100%; height: 100% in auto-size mode) are respected.
    // Without this, <rk-reel> is inline and height: 100% has no effect.
    style: 'display: block;',
  },
  providers: [
    {
      provide: RK_REEL_CONTEXT,
      useFactory: () => inject(ReelComponent).reelContextValue,
    },
  ],
  template: `
    <span
      aria-live="polite"
      aria-atomic="true"
      style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
      >{{ liveAnnouncement() }}</span
    >

    <span
      aria-live="assertive"
      aria-atomic="true"
      style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
      >{{ readyAnnouncement() }}</span
    >

    <div
      #container
      role="region"
      [attr.aria-roledescription]="'carousel'"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-busy]="!hasMeasured() ? 'true' : null"
      [class]="className()"
      style="user-select: none; -webkit-user-select: none; position: relative; overflow: hidden;"
      [style.width]="size() ? size()![0] + 'px' : null"
      [style.height]="size() ? size()![1] + 'px' : null"
    >
      @if (hasMeasured()) {
        <div
          [style.position]="'absolute'"
          [style.top.px]="0"
          [style.left.px]="0"
          [style.display]="'flex'"
          [style.flex-direction]="
            direction() === 'horizontal' ? 'row' : 'column'
          "
          [style.transform]="
            'translate' +
            (direction() === 'horizontal' ? 'X' : 'Y') +
            '(' +
            animatedValue() +
            'px)'
          "
          [style.width]="
            direction() === 'horizontal'
              ? visibleIndexes().length * primarySize() + 'px'
              : '100%'
          "
          [style.height]="
            direction() === 'horizontal'
              ? '100%'
              : visibleIndexes().length * primarySize() + 'px'
          "
        >
          @for (idx of visibleIndexes(); track trackByFn(idx, $index)) {
            <div
              role="group"
              [attr.aria-roledescription]="'slide'"
              [attr.aria-label]="'Slide ' + (idx + 1) + ' of ' + count()"
              [attr.aria-hidden]="idx !== indexSignal() ? 'true' : null"
              [attr.tabindex]="idx === indexSignal() ? '0' : null"
              [attr.data-index]="idx"
            >
              @if (itemTemplate()) {
                <ng-container
                  [ngTemplateOutlet]="itemTemplate()!.templateRef"
                  [ngTemplateOutletContext]="{
                    $implicit: idx,
                    indexInRange: $index,
                    size: currentSize(),
                  }"
                />
              }
            </div>
          } @empty {
            <span
              style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
              >No slides</span
            >
          }
        </div>
      } @else {
        <!--
          Measurement placeholder: shown while ResizeObserver has not yet fired.
          Preserves layout space so the container has a stable size for siblings.
          aria-hidden prevents screen readers from announcing this transient state.
        -->
        <div aria-hidden="true" style="position: absolute; inset: 0;"></div>
      }
      <ng-content />
    </div>
  `,
})
export class ReelComponent implements OnInit, AfterViewInit {
  /** Total number of slides (required). */
  count = input.required<number>();

  /** Axis along which slides transition. */
  direction = input<'horizontal' | 'vertical'>('vertical');

  /**
   * Explicit `[width, height]` dimensions in pixels. When omitted, the
   * component auto-measures its container via `ResizeObserver`.
   */
  size = input<[number, number] | undefined>(undefined);

  /** Index of the initially visible slide. */
  initialIndex = input<number>(0);

  /** Whether the slider wraps from last to first. */
  loop = input<boolean>(false);

  /** Slide transition duration in milliseconds. */
  transitionDuration = input<number>(300);

  /** Minimum swipe fraction (0-1) required to trigger slide change. */
  swipeDistanceFactor = input<number>(0.12);

  /** Enable keyboard arrow key navigation. */
  useNavKeys = input<boolean>(true);

  /** Enable mouse wheel navigation. */
  enableWheel = input<boolean>(false);

  /** Debounce duration for wheel events in milliseconds. */
  wheelDebounceMs = input<number>(200);

  /** Custom range extractor function. */
  rangeExtractor = input<RangeExtractor>(defaultRangeExtractor);

  /**
   * Custom key extractor for `@for` track expressions.
   * Useful in loop mode to avoid duplicate-key issues.
   */
  keyExtractor = input<
    (index: number, indexInRange: number) => string | number
  >((index: number, _indexInRange: number) => index);

  /** Optional CSS class applied to the root container element. */
  className = input<string>('');

  /**
   * Accessible label for the carousel region, announced by screen readers.
   * Defaults to "Carousel".
   */
  ariaLabel = input<string>('Carousel');

  /** Emitted after a slide transition completes. */
  afterChange = output<{ index: number; indexInRange: number }>();

  /** Emitted before a slide transition begins. */
  beforeChange = output<{
    index: number;
    nextIndex: number;
    indexInRange: number;
  }>();

  /** Emitted when a drag gesture starts. */
  slideDragStart = output<number>();

  /** Emitted when a drag gesture ends (released). */
  slideDragEnd = output<number>();

  /** Emitted when a drag gesture is canceled (snap-back). */
  slideDragCanceled = output<number>();

  /** Emitted once the controller is ready, exposing the imperative API. */
  apiReady = output<ReelApi>();

  itemTemplate = contentChild(RkReelItemDirective);

  private readonly measuredSize = signal<[number, number]>([0, 0]);

  /**
   * Becomes `true` after the first programmatic or gesture navigation so the
   * `aria-live` region stays silent on initial render.
   */
  private readonly _hasNavigated = signal<boolean>(false);

  /**
   * Becomes `true` after the ready announcement has been emitted once, so
   * the assertive live region does not re-announce on subsequent renders.
   */
  private readonly _hasAnnouncedReady = signal<boolean>(false);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  private readonly countSignal = createSignal(0);

  /**
   * The slider controller is created lazily in `ngOnInit` so that the
   * `input.required` `count` value is available. All class members that
   * depend on it (signal bridges, context, etc.) are also set up there.
   */
  private controller!: SliderController;

  // Initialized to safe placeholder values so computed signals that reference
  // them (e.g. liveAnnouncement) do not crash if Angular evaluates the template
  // before ngOnInit has run. The real bridges are installed in ngOnInit.
  protected visibleIndexes: Signal<number[]> = signal<number[]>([]);
  protected animatedValue: Signal<number> = signal<number>(0);
  protected indexSignal: Signal<number> = signal<number>(0);

  private readonly _ctxIndex = signal<number>(0);
  private readonly _ctxCount = signal<number>(0);

  /**
   * @internal Exposed to the provider factory above; not part of the public API.
   * Initialized in the class body so the DI factory can return it before
   * ngOnInit runs. The signals inside are populated lazily in ngOnInit.
   */
  readonly reelContextValue: ReelContextValue = {
    index: this._ctxIndex.asReadonly(),
    count: this._ctxCount.asReadonly(),
    goTo: (index: number, animate?: boolean) =>
      this.controller?.goTo(index, animate) ?? Promise.resolve(),
  };

  readonly currentSize = computed<[number, number]>(() => {
    return this.size() ?? this.measuredSize();
  });

  readonly hasMeasured = computed(() => {
    const [width, height] = this.currentSize();
    // Both explicit and auto-measured sizes must have positive dimensions.
    // An explicit size of [0, 0] is treated as unmeasured to avoid rendering
    // slides with zero width/height.
    return width > 0 && height > 0;
  });

  readonly primarySize = computed(() => {
    const currentSize = this.currentSize();
    return this.direction() === 'horizontal'
      ? first(currentSize)
      : last(currentSize);
  });

  /**
   * Text announced by the `aria-live` region whenever the active slide
   * changes. Empty string during initialization so no announcement fires
   * before any navigation has occurred.
   */
  readonly liveAnnouncement = computed<string>(() => {
    if (!this._hasNavigated()) return '';
    const idx = this.indexSignal();
    const total = this.count();
    if (total === 0) return '';
    return `Slide ${idx + 1} of ${total}`;
  });

  /**
   * Text for the assertive live region — fires once when the carousel
   * finishes measuring and becomes interactive. Reads empty string both
   * before measurement and after the first announcement to avoid repeating.
   *
   * Pure computed: the side-effect of marking the announcement as sent is
   * handled by `registerReadyAnnouncementEffect()` in `ngOnInit`.
   */
  readonly readyAnnouncement = computed<string>(() => {
    if (!this.hasMeasured()) return '';
    if (this._hasAnnouncedReady()) return '';
    const total = untracked(() => this.count());
    return `${this.ariaLabel()} ready, ${total} slide${total !== 1 ? 's' : ''}`;
  });

  protected trackByFn(idx: number, indexInRange: number): string | number {
    return this.keyExtractor()(idx, indexInRange);
  }

  ngOnInit(): void {
    this.controller = this.createController();
    this.countSignal.value = this.count();
    this.initializeSignalBridges();
    this.initializeReelContext();
    this.registerConfigSyncEffect();
    this.registerSizeSyncEffect();
    this.registerNavKeysSyncEffect();
    this.registerReadyAnnouncementEffect();
    this.registerDestroyHandler();
  }

  ngAfterViewInit(): void {
    this.performPostViewInitSetup();
  }

  private createController(): SliderController {
    return createSliderController(
      {
        count: this.count(),
        initialIndex: this.initialIndex(),
        direction: this.direction(),
        loop: this.loop(),
        transitionDuration: this.transitionDuration(),
        swipeDistanceFactor: this.swipeDistanceFactor(),
        rangeExtractor: this.rangeExtractor(),
        enableWheel: this.enableWheel(),
        wheelDebounceMs: this.wheelDebounceMs(),
      },
      {
        onBeforeChange: (index, nextIndex, rangeIndex) =>
          this.beforeChange.emit({
            index,
            nextIndex,
            indexInRange: rangeIndex,
          }),
        onAfterChange: (index, rangeIndex) => {
          this._hasNavigated.set(true);
          this.afterChange.emit({ index, indexInRange: rangeIndex });
        },
        onDragStart: (index) => this.slideDragStart.emit(index),
        onDragEnd: (index) => this.slideDragEnd.emit(index),
        onDragCanceled: (index) => this.slideDragCanceled.emit(index),
      },
    );
  }

  private initializeSignalBridges(): void {
    this.visibleIndexes = toAngularSignal(
      this.controller.state.indexes,
      this.destroyRef,
    );
    this.animatedValue = animatedSignalBridge(
      this.controller.state.axisValue,
      this.zone,
      this.cdRef,
      this.destroyRef,
    );
    this.indexSignal = toAngularSignal(
      this.controller.state.index,
      this.destroyRef,
    );
    const disposeIndexBridge = this.controller.state.index.observe(() => {
      this._ctxIndex.set(this.controller.state.index.value);
    });
    this._ctxIndex.set(this.controller.state.index.value);
    this.destroyRef.onDestroy(disposeIndexBridge);
  }

  private initializeReelContext(): void {
    this._ctxCount.set(this.count());
    const disposeCountBridge = this.countSignal.observe(() => {
      this._ctxCount.set(this.countSignal.value);
    });
    this.destroyRef.onDestroy(disposeCountBridge);
  }

  private registerConfigSyncEffect(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        const count = this.count();
        const direction = this.direction();
        const loop = this.loop();
        const transitionDuration = this.transitionDuration();
        const swipeDistanceFactor = this.swipeDistanceFactor();
        const rangeExtractor = this.rangeExtractor();
        const enableWheel = this.enableWheel();
        const wheelDebounceMs = this.wheelDebounceMs();

        // Keep countSignal in sync first so context consumers (e.g. indicator)
        // always see the new count before the controller config is updated.

        this.countSignal.value = count;
        this.controller.updateConfig({
          count,
          direction,
          loop,
          transitionDuration,
          swipeDistanceFactor,
          rangeExtractor,
          enableWheel,
          wheelDebounceMs,
        });
      });
    });
  }

  private registerSizeSyncEffect(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.controller.setPrimarySize(this.primarySize());
      });
    });
  }

  private registerNavKeysSyncEffect(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.useNavKeys()) {
          this.controller.observe();
        } else {
          this.controller.unobserve();
        }
      });
    });
  }

  /**
   * Marks `_hasAnnouncedReady` as `true` the first time the carousel becomes
   * measured, silencing the assertive live region after its one-time
   * announcement. Runs as an `effect` to keep `readyAnnouncement` a pure
   * computed with no side-effects.
   */
  private registerReadyAnnouncementEffect(): void {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (this.hasMeasured() && !this._hasAnnouncedReady()) {
          untracked(() => this._hasAnnouncedReady.set(true));
        }
      });
    });
  }

  private registerDestroyHandler(): void {
    this.destroyRef.onDestroy(() => {
      this.controller.detach();
      this.controller.dispose();
    });
  }

  private performPostViewInitSetup(): void {
    const hostElement = this.elementRef.nativeElement;
    this.controller.attach(hostElement);
    // Conditionally observe after attaching the DOM element. The effects
    // registered in ngOnInit run synchronously before ngAfterViewInit, so we
    // re-apply the current useNavKeys value here now that the element is
    // attached. This avoids unconditionally calling observe() when useNavKeys
    // is false.
    if (untracked(() => this.useNavKeys())) {
      this.controller.observe();
    }
    this.apiReady.emit(this.buildApi());
    this.startAutoMeasureIfNeeded(hostElement);
  }

  private buildApi(): ReelApi {
    return {
      next: () => this.controller.next(),
      prev: () => this.controller.prev(),
      goTo: (index: number, animate?: boolean) =>
        this.controller.goTo(index, animate),
      adjust: () => this.controller.adjust(),
      observe: () => this.controller.observe(),
      unobserve: () => this.controller.unobserve(),
    };
  }

  private startAutoMeasureIfNeeded(hostElement: HTMLElement): void {
    if (this.size() !== undefined) return;
    // ResizeObserver is a browser-only API — skip on the server to stay SSR-safe.
    if (!this.isBrowser) return;

    const observer = new ResizeObserver((entries) =>
      this.measureAndUpdateSize(hostElement, entries),
    );
    observer.observe(hostElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private measureAndUpdateSize(
    hostElement: HTMLElement,
    entries?: ResizeObserverEntry[],
  ): void {
    // Prefer contentRect from the ResizeObserver entry for accuracy in all environments
    // (including jsdom where clientWidth/clientHeight may be 0).
    const entry = entries?.[0];
    const width = entry ? entry.contentRect.width : hostElement.clientWidth;
    const height = entry ? entry.contentRect.height : hostElement.clientHeight;
    if (width <= 0 || height <= 0) return;

    // ResizeObserver callbacks fire outside Angular's zone in production.
    // We must use zone.run() (not just markForCheck()) so that Angular
    // schedules a new CD cycle. With OnPush, markForCheck() alone from
    // outside the zone marks the view dirty but never enqueues a tick,
    // so the component would never re-render until some other event causes CD.
    this.zone.run(() => {
      this.measuredSize.update(([prevW, prevH]) =>
        prevW !== width || prevH !== height ? [width, height] : [prevW, prevH],
      );
    });
  }
}
