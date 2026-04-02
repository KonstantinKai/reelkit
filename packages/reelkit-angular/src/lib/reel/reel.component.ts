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
  slideTransition,
  type RangeExtractor,
  type SliderController,
  type TransitionTransformFn,
  type SlideTransformStyle,
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
      [style.width]="size() ? size()![0] + 'px' : '100%'"
      [style.height]="size() ? size()![1] + 'px' : '100%'"
    >
      @if (hasMeasured()) {
        <div
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
        >
          @for (idx of visibleIndexes(); track trackByFn(idx, $index)) {
            <div
              role="group"
              [attr.aria-roledescription]="'slide'"
              [attr.aria-label]="'Slide ' + (idx + 1) + ' of ' + count()"
              [attr.aria-hidden]="idx !== indexSignal() ? 'true' : null"
              [attr.tabindex]="idx === indexSignal() ? '0' : null"
              [attr.data-index]="idx"
              [style.position]="'absolute'"
              [style.top.px]="0"
              [style.left.px]="0"
              [style.width]="isHorizontal() ? primarySize() + 'px' : '100%'"
              [style.height]="isHorizontal() ? '100%' : primarySize() + 'px'"
              [style.backface-visibility]="'hidden'"
              [style.transform]="slideStyles()[$index]?.transform ?? ''"
              [style.transform-origin]="
                slideStyles()[$index]?.transformOrigin ?? ''
              "
              [style.opacity]="slideStyles()[$index]?.opacity ?? ''"
              [style.z-index]="slideStyles()[$index]?.zIndex ?? ''"
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
  enableNavKeys = input<boolean>(true);

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
  >((index: number) => index);

  /**
   * Custom transition function applied to each slide.
   * Import a built-in transition (`slideTransition`, `cubeTransition`, etc.)
   * or provide your own `TransitionTransformFn`. Only the imported
   * transition ships in the bundle (tree-shakeable).
   */
  transition = input<TransitionTransformFn>(slideTransition);

  /** Enable touch/mouse gesture handling. */
  enableGestures = input<boolean>(true);

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

  private readonly _measuredSize = signal<[number, number]>([0, 0]);

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

  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _zone = inject(NgZone);
  private readonly _cdRef = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _injector = inject(Injector);

  private readonly _countSignal = createSignal(0);

  /**
   * The slider controller is created lazily in `ngOnInit` so that the
   * `input.required` `count` value is available. All class members that
   * depend on it (signal bridges, context, etc.) are also set up there.
   */
  private _controller!: SliderController;
  private _destroyed = false;

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
      this._controller?.goTo(index, animate) ?? Promise.resolve(),
  };

  readonly isHorizontal = computed(() => this.direction() === 'horizontal');

  readonly currentSize = computed<[number, number]>(() => {
    return this.size() ?? this._measuredSize();
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
   * Per-slide CSS styles computed from the transition function on each
   * animation frame. Each entry in the array corresponds to a slide in
   * `visibleIndexes()` by position (indexInRange).
   */
  protected readonly slideStyles = computed<SlideTransformStyle[]>(() => {
    const value = this.animatedValue();
    const indexes = this.visibleIndexes();
    const ps = this.primarySize();
    const dir = this.direction();
    const fn = this.transition();
    const rangeIndex = this._controller?.getRangeIndex() ?? 1;

    return indexes.map((_, i) => fn(value, i, rangeIndex, ps, dir));
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
    this._controller = this.createController();
    this._countSignal.value = this.count();
    this.initializeSignalBridges();
    this.initializeReelContext();
    this.registerConfigSyncEffect();
    this.registerSizeSyncEffect();
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
        enableGestures: this.enableGestures(),
        enableNavKeys: this.enableNavKeys(),
      },
      {
        onBeforeChange: (index, nextIndex, rangeIndex) => {
          if (this._destroyed) return;
          this.beforeChange.emit({
            index,
            nextIndex,
            indexInRange: rangeIndex,
          });
        },
        onAfterChange: (index, rangeIndex) => {
          if (this._destroyed) return;
          this._hasNavigated.set(true);
          this.afterChange.emit({ index, indexInRange: rangeIndex });
        },
        onDragStart: (index) => {
          if (!this._destroyed) this.slideDragStart.emit(index);
        },
        onDragEnd: (index) => {
          if (!this._destroyed) this.slideDragEnd.emit(index);
        },
        onDragCanceled: (index) => {
          if (!this._destroyed) this.slideDragCanceled.emit(index);
        },
      },
    );
  }

  private initializeSignalBridges(): void {
    this.visibleIndexes = toAngularSignal(
      this._controller.state.indexes,
      this._destroyRef,
    );
    this.animatedValue = animatedSignalBridge(
      this._controller.state.axisValue,
      this._zone,
      this._cdRef,
      this._destroyRef,
    );
    this.indexSignal = toAngularSignal(
      this._controller.state.index,
      this._destroyRef,
    );
    const disposeIndexBridge = this._controller.state.index.observe(() => {
      this._ctxIndex.set(this._controller.state.index.value);
    });
    this._ctxIndex.set(this._controller.state.index.value);
    this._destroyRef.onDestroy(disposeIndexBridge);
  }

  private initializeReelContext(): void {
    this._ctxCount.set(this.count());
    const disposeCountBridge = this._countSignal.observe(() => {
      this._ctxCount.set(this._countSignal.value);
    });
    this._destroyRef.onDestroy(disposeCountBridge);
  }

  private registerConfigSyncEffect(): void {
    runInInjectionContext(this._injector, () => {
      effect(() => {
        const count = this.count();
        const direction = this.direction();
        const loop = this.loop();
        const transitionDuration = this.transitionDuration();
        const swipeDistanceFactor = this.swipeDistanceFactor();
        const rangeExtractor = this.rangeExtractor();
        const enableWheel = this.enableWheel();
        const wheelDebounceMs = this.wheelDebounceMs();
        const enableGestures = this.enableGestures();
        const enableNavKeys = this.enableNavKeys();

        // Keep countSignal in sync first so context consumers (e.g. indicator)
        // always see the new count before the controller config is updated.

        this._countSignal.value = count;
        this._controller.updateConfig({
          count,
          direction,
          loop,
          transitionDuration,
          swipeDistanceFactor,
          rangeExtractor,
          enableWheel,
          wheelDebounceMs,
          enableGestures,
          enableNavKeys,
        });
      });
    });
  }

  private registerSizeSyncEffect(): void {
    runInInjectionContext(this._injector, () => {
      effect(() => {
        this._controller.setPrimarySize(this.primarySize());
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
    runInInjectionContext(this._injector, () => {
      effect(() => {
        if (this.hasMeasured() && !this._hasAnnouncedReady()) {
          untracked(() => this._hasAnnouncedReady.set(true));
        }
      });
    });
  }

  private registerDestroyHandler(): void {
    this._destroyRef.onDestroy(() => {
      this._destroyed = true;
      this._controller.dispose();
    });
  }

  private performPostViewInitSetup(): void {
    const hostElement = this._elementRef.nativeElement;
    this._controller.attach(hostElement);
    this._controller.observe();
    this.apiReady.emit(this.buildApi());
    this.registerAutoMeasureEffect(hostElement);
  }

  private buildApi(): ReelApi {
    return {
      next: () => this._controller.next(),
      prev: () => this._controller.prev(),
      goTo: (index: number, animate?: boolean) =>
        this._controller.goTo(index, animate),
      adjust: () => this._controller.adjust(),
      observe: () => this._controller.observe(),
      unobserve: () => this._controller.unobserve(),
    };
  }

  private registerAutoMeasureEffect(hostElement: HTMLElement): void {
    if (!this._isBrowser) return;

    runInInjectionContext(this._injector, () => {
      effect((onCleanup) => {
        if (this.size() !== undefined) return;

        const observer = new ResizeObserver((entries) =>
          this.measureAndUpdateSize(hostElement, entries),
        );
        observer.observe(hostElement);

        onCleanup(() => observer.disconnect());
      });
    });
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
    this._zone.run(() => {
      this._measuredSize.update(([prevW, prevH]) =>
        prevW !== width || prevH !== height ? [width, height] : [prevW, prevH],
      );
    });
  }
}
