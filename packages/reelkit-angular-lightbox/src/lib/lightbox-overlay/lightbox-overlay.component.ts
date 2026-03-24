import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { Signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  createSliderController,
  animate,
  type SliderController,
} from '@reelkit/angular';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import { BodyLockService, toAngularSignal } from '@reelkit/angular';

import { FullscreenService } from '../fullscreen/fullscreen.service';
import {
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkLightboxSlideDirective,
} from '../template-slots/lightbox-template-slots';
import { RkSwipeToCloseDirective } from '../swipe-to-close/swipe-to-close.directive';
import { RkCloseButtonComponent } from '../lightbox-controls/close-button.component';
import { setLightboxVideoMuted } from '../lightbox-video-slide/lightbox-video-slide.component';
import { RkCounterComponent } from '../lightbox-controls/counter.component';
import { RkFullscreenButtonComponent } from '../lightbox-controls/fullscreen-button.component';
import type {
  LightboxItem,
  TransitionType,
  ReelProxyProps,
  LightboxControlsContext,
  LightboxNavContext,
  LightboxInfoContext,
  LightboxSlideContext,
} from '../types';

const PRELOAD_RANGE = 2;
const DEFAULT_TRANSITION_DURATION = 300;
const DEFAULT_SWIPE_DISTANCE_FACTOR = 0.12;
const DEFAULT_WHEEL_DEBOUNCE_MS = 200;

/**
 * CSS selector string that matches all standard keyboard-focusable elements,
 * excluding those explicitly removed from the tab order via `tabindex="-1"`.
 */
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const SLIDE_BASE_CLASS = 'rk-lightbox-slide';

const PRELOAD_CACHE_MAX = 500;
const preloadedImages = new Set<string>();

const preloadImage = (src: string): void => {
  if (preloadedImages.has(src)) return;
  // Evict the oldest entry when the cache reaches its limit to prevent
  // unbounded memory growth when the lightbox is used with large image sets.
  if (preloadedImages.size >= PRELOAD_CACHE_MAX) {
    const oldest = preloadedImages.values().next().value;
    if (oldest !== undefined) {
      preloadedImages.delete(oldest);
    }
  }
  preloadedImages.add(src);
  const img = new Image();
  img.src = src;
};

const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/**
 * Moves keyboard focus into `container`. Prefers the first naturally
 * focusable descendant; falls back to the container itself (which carries
 * `tabindex="-1"` in the template).
 */
const focusFirstFocusable = (container: HTMLElement): void => {
  const firstFocusable =
    container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
  (firstFocusable ?? container).focus();
};

/**
 * Full-screen image lightbox overlay with gesture, keyboard, and wheel navigation.
 *
 * Renders a portal-like fixed overlay using `position: fixed; z-index: 9999`.
 * When `isOpen` is `false`, the overlay is removed from the DOM via `@if`.
 *
 * Customise controls, navigation, info overlay, and individual slides via
 * template slots:
 * - `[rkLightboxControls]` — replace close/counter/fullscreen bar
 * - `[rkLightboxNavigation]` — replace prev/next arrows
 * - `[rkLightboxInfo]` — replace title/description gradient
 * - `[rkLightboxSlide]` — replace slide content (e.g. for video slides)
 *
 * @example
 * ```html
 * <rk-lightbox-overlay
 *   [isOpen]="index !== null"
 *   [items]="images"
 *   [initialIndex]="index ?? 0"
 *   (closed)="index = null"
 * />
 * ```
 */
@Component({
  selector: 'rk-lightbox-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '(document:keydown)': 'onKeydown($event)' },
  styleUrls: ['../styles/lightbox-overlay.css'],
  providers: [
    FullscreenService,
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ ChevronLeft, ChevronRight }),
      multi: true,
    },
  ],
  imports: [
    NgTemplateOutlet,
    LucideAngularModule,
    RkSwipeToCloseDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
  ],
  template: `
    @if (isOpen()) {
      <div
        #container
        class="rk-lightbox-container"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel()"
        tabindex="-1"
      >
        @if (items().length === 0) {
          <div class="rk-lightbox-empty" role="status" aria-live="polite">
            No items to display
          </div>
        }

        @if (items().length > 0 && showControls()) {
          @if (controlsSlot()) {
            <ng-container
              [ngTemplateOutlet]="controlsSlot()!.templateRef"
              [ngTemplateOutletContext]="controlsContext()"
            />
          } @else {
            <div class="rk-lightbox-controls-left">
              <rk-counter
                [currentIndex]="currentIndex()"
                [count]="items().length"
              />
              <rk-fullscreen-button
                [isFullscreen]="fullscreenService.isFullscreen()"
                (toggled)="handleToggleFullscreen()"
              />
            </div>
            <rk-close-button (clicked)="handleClose()" />
          }
        }

        @if (items().length > 0) {
          <div [rkSwipeToClose]="isMobile()" (dismissed)="handleClose()">
            <div
              class="rk-lightbox-slider-viewport"
              [style.width.px]="size()[0]"
              [style.height.px]="size()[1]"
            >
              <div #sliderTrack class="rk-lightbox-slider-track">
                @for (idx of visibleIndexes(); track idx) {
                  @let item = items()[idx];
                  @if (item) {
                    <div
                      [class]="slideClass(idx)"
                      [style.width.px]="size()[0]"
                      [style.height.px]="size()[1]"
                      [style.--rk-transition-duration]="
                        _cssTransitionDuration()
                      "
                      role="group"
                      aria-roledescription="slide"
                      [attr.aria-label]="slideAriaLabel(idx)"
                    >
                      @if (slideSlot()) {
                        <ng-container
                          [ngTemplateOutlet]="slideSlot()!.templateRef"
                          [ngTemplateOutletContext]="slideContext(idx)"
                        />
                      } @else {
                        @if (!imageErrorIndexes().has(idx)) {
                          <div
                            class="rk-lightbox-img-placeholder"
                            [class.rk-loaded]="imageLoadedIndexes().has(idx)"
                            [style.width.px]="size()[0]"
                            [style.height.px]="size()[1]"
                            aria-hidden="true"
                          ></div>
                          <img
                            [src]="item.src"
                            [alt]="item.title || 'Image ' + (idx + 1)"
                            class="rk-lightbox-img"
                            [class.rk-loaded]="imageLoadedIndexes().has(idx)"
                            draggable="false"
                            loading="lazy"
                            (load)="onImageLoad(idx)"
                            (error)="onImageError(idx)"
                          />
                        } @else {
                          <div
                            class="rk-lightbox-img-error"
                            role="img"
                            [attr.aria-label]="
                              'Failed to load: ' +
                              (item.title || 'Image ' + (idx + 1))
                            "
                          >
                            <svg
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              aria-hidden="true"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                              <line x1="4" y1="4" x2="20" y2="20" />
                            </svg>
                            <span class="rk-lightbox-img-error-text"
                              >Image unavailable</span
                            >
                          </div>
                        }
                      }
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          @if (showNavigation()) {
            @if (navigationSlot()) {
              <ng-container
                [ngTemplateOutlet]="navigationSlot()!.templateRef"
                [ngTemplateOutletContext]="navContext()"
              />
            } @else if (!isMobile() && items().length > 1) {
              @if (currentIndex() > 0) {
                <button
                  class="rk-lightbox-nav rk-lightbox-nav-prev"
                  (click)="handlePrev()"
                  title="Previous"
                  aria-label="Previous"
                  type="button"
                >
                  <lucide-angular [img]="ChevronLeftIcon" [size]="32" />
                </button>
              }
              @if (currentIndex() < items().length - 1) {
                <button
                  class="rk-lightbox-nav rk-lightbox-nav-next"
                  (click)="handleNext()"
                  title="Next"
                  aria-label="Next"
                  type="button"
                >
                  <lucide-angular [img]="ChevronRightIcon" [size]="32" />
                </button>
              }
            }
          }

          @if (showInfo()) {
            @if (infoSlot()) {
              <ng-container
                [ngTemplateOutlet]="infoSlot()!.templateRef"
                [ngTemplateOutletContext]="infoContext()"
              />
            } @else if (currentItem()?.title || currentItem()?.description) {
              <div class="rk-lightbox-info">
                @if (currentItem()?.title) {
                  <h3 class="rk-lightbox-title">{{ currentItem()!.title }}</h3>
                }
                @if (currentItem()?.description) {
                  <p class="rk-lightbox-description">
                    {{ currentItem()!.description }}
                  </p>
                }
              </div>
            }
          }

          @if (isMobile()) {
            <div class="rk-lightbox-swipe-hint">Swipe up to close</div>
          }
        }
      </div>
    }
  `,
})
export class RkLightboxOverlayComponent {
  protected readonly fullscreenService = inject(FullscreenService);
  private readonly bodyLock = inject(BodyLockService);
  private readonly ngZone = inject(NgZone);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _injector = inject(Injector);

  protected readonly controlsSlot = contentChild(RkLightboxControlsDirective);
  protected readonly navigationSlot = contentChild(
    RkLightboxNavigationDirective,
  );
  protected readonly infoSlot = contentChild(RkLightboxInfoDirective);
  protected readonly slideSlot = contentChild(RkLightboxSlideDirective);

  private readonly containerRef =
    viewChild<ElementRef<HTMLDivElement>>('container');
  private readonly sliderTrackRef =
    viewChild<ElementRef<HTMLDivElement>>('sliderTrack');

  /** When `true`, the lightbox is rendered and body scroll is locked. */
  readonly isOpen = input.required<boolean>();

  readonly items = input.required<LightboxItem[]>();

  /** Zero-based index of the initially visible item. @default 0 */
  readonly initialIndex = input<number>(0);

  /** Transition animation type. @default 'slide' */
  readonly transition = input<TransitionType>('slide');

  readonly showInfo = input<boolean>(true);

  readonly showControls = input<boolean>(true);

  readonly showNavigation = input<boolean>(true);

  /** Duration of slide transition animations in ms. @default 300 */
  readonly transitionDuration = input<ReelProxyProps['transitionDuration']>(
    DEFAULT_TRANSITION_DURATION,
  );

  /** Minimum swipe distance fraction to trigger a slide change. @default 0.12 */
  readonly swipeDistanceFactor = input<ReelProxyProps['swipeDistanceFactor']>(
    DEFAULT_SWIPE_DISTANCE_FACTOR,
  );

  /** Whether the slider wraps from last slide back to first. @default false */
  readonly loop = input<ReelProxyProps['loop']>(false);

  /** Enable keyboard arrow key navigation. @default true */
  readonly useNavKeys = input<ReelProxyProps['useNavKeys']>(true);

  /** Enable mouse wheel navigation. @default false */
  readonly enableWheel = input<ReelProxyProps['enableWheel']>(false);

  /** Debounce duration for wheel events in ms. @default 200 */
  readonly wheelDebounceMs = input<ReelProxyProps['wheelDebounceMs']>(
    DEFAULT_WHEEL_DEBOUNCE_MS,
  );

  /**
   * Accessible label for the dialog, announced by screen readers when the
   * overlay opens. Override when the gallery has a more specific name.
   * @default 'Image gallery'
   */
  readonly ariaLabel = input<string>('Image gallery');

  readonly closed = output<void>();

  readonly slideChange = output<number>();

  /**
   * `initialIndex` clamped to `[0, items.length - 1]`.
   * Guards against callers passing an out-of-bounds value (e.g. when the
   * items array shrinks between renders).
   */
  private readonly _safeInitialIndex = computed(() => {
    const idx = this.initialIndex();
    const len = this.items().length;
    if (len === 0) return 0;
    return Math.max(0, Math.min(idx, len - 1));
  });

  /**
   * Zero-based index of the currently visible slide.
   * Automatically resets to `_safeInitialIndex` whenever the lightbox opens so
   * that re-opening always starts at the requested position.
   * Can still be updated imperatively by the slider's `onAfterChange` callback.
   */
  protected readonly currentIndex = linkedSignal(() =>
    this.isOpen() ? this._safeInitialIndex() : 0,
  );

  protected readonly size = signal<[number, number]>(
    typeof window !== 'undefined'
      ? [window.innerWidth, window.innerHeight]
      : [0, 0],
  );

  protected readonly isMobile = signal(isTouchDevice());

  private readonly _visibleIndexesFallback = linkedSignal<number[]>(() =>
    this.isOpen() ? [this._safeInitialIndex()] : [],
  );

  private _coreIndexes: Signal<number[]> | null = null;
  private readonly _useCoreIndexes = signal(false);

  protected readonly visibleIndexes = computed(() =>
    this._useCoreIndexes() && this._coreIndexes
      ? this._coreIndexes()
      : this._visibleIndexesFallback(),
  );

  protected readonly currentItem = computed(
    () => this.items()[this.currentIndex()],
  );

  /**
   * Set of slide indices whose images have completed loading.
   * Drives the shimmer-to-image crossfade in the template.
   * Cleared whenever the overlay closes so state is fresh on re-open.
   */
  protected readonly imageLoadedIndexes = signal<Set<number>>(new Set());

  /**
   * Set of slide indices whose images have failed to load.
   * Drives the broken-image fallback state in the template.
   * Cleared whenever the overlay closes so state is fresh on re-open.
   */
  protected readonly imageErrorIndexes = signal<Set<number>>(new Set());

  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;

  private slider: SliderController | null = null;
  /** Cleanup function returned by the axis-value observer in bridgeSliderSignals. */
  private _bridgeDispose: (() => void) | null = null;
  /** In-flight animation cancel function from bridgeSliderSignals. */
  private _bridgeCancelAnim: (() => void) | null = null;
  /**
   * Timer ID for the `setTimeout(() => done?.(), 0)` deferred call inside the
   * animation `onComplete` handler. Stored so `destroySlider()` can cancel it
   * when the overlay closes mid-animation, preventing `done()` from firing
   * against a disposed slider controller.
   */
  private _bridgeDoneTimer: ReturnType<typeof setTimeout> | null = null;

  private _previousFocus: Element | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('resize', this.handleResize);
      });
    }
    this.destroyRef.onDestroy(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.handleResize);
      }
      this.destroySlider();
      this.bodyLock.unlock();
    });

    effect(() => {
      if (this.isOpen()) {
        this.onOverlayOpened();
      } else {
        this.onOverlayClosed();
      }
    });

    effect(() => {
      this.preloadAdjacentSlides(this.currentIndex(), this.items());
    });

    effect(() => {
      const [width] = this.size();
      this.slider?.setPrimarySize(width);
    });

    effect(() => {
      if (this.sliderTrackRef()) {
        this.initSlider();
      }
    });

    effect(() => {
      const count = this.items().length;
      if (this.slider) {
        this.slider.updateConfig({ count });
      }
    });

    // `useNavKeys` toggles the slider's keyboard/wheel observation at runtime.
    // The core SliderConfig has no dedicated flag; instead `observe`/`unobserve`
    // control whether input handlers are active.
    effect(() => {
      const enabled = this.useNavKeys() ?? true;
      if (!this.slider) return;
      if (enabled) {
        this.ngZone.runOutsideAngular(() => this.slider!.observe());
      } else {
        this.ngZone.runOutsideAngular(() => this.slider!.unobserve());
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;

    if (event.key === 'Escape') {
      this.handleClose();
    }
  }

  /**
   * Closes the lightbox. If the browser is currently in fullscreen mode,
   * fullscreen is exited first so the page is never left in a fullscreen
   * state after the overlay is dismissed (whether via close button, swipe,
   * Escape key, or a custom controls slot).
   */
  protected handleClose(): void {
    if (this.fullscreenService.isFullscreen()) {
      this.fullscreenService.exit();
    }
    setLightboxVideoMuted(true);
    this.closed.emit();
  }

  protected onImageLoad(index: number): void {
    this.imageLoadedIndexes.update((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  protected onImageError(index: number): void {
    this.imageErrorIndexes.update((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  protected handlePrev(): void {
    this.slider?.prev();
  }

  protected handleNext(): void {
    this.slider?.next();
  }

  protected handleToggleFullscreen(): void {
    const container = this.containerRef();
    if (container) {
      this.fullscreenService.toggle(container.nativeElement);
    }
  }

  /**
   * Template outlet context for the `rkLightboxControls` slot.
   * Recomputed only when `currentIndex`, `items`, or `isFullscreen` changes —
   * not on every change-detection cycle as a plain method would be.
   */
  protected readonly controlsContext = computed<LightboxControlsContext>(
    () => ({
      $implicit: undefined as void,
      onClose: () => this.handleClose(),
      currentIndex: this.currentIndex(),
      count: this.items().length,
      isFullscreen: this.fullscreenService.isFullscreen(),
      onToggleFullscreen: () => this.handleToggleFullscreen(),
    }),
  );

  /**
   * Template outlet context for the `rkLightboxNavigation` slot.
   * Recomputed only when `currentIndex` or `items` changes.
   */
  protected readonly navContext = computed<LightboxNavContext>(() => ({
    $implicit: undefined as void,
    onPrev: () => this.handlePrev(),
    onNext: () => this.handleNext(),
    activeIndex: this.currentIndex(),
    count: this.items().length,
  }));

  /**
   * Template outlet context for the `rkLightboxInfo` slot.
   * Recomputed only when the current item or index changes.
   */
  protected readonly infoContext = computed<LightboxInfoContext>(() => ({
    $implicit: this.currentItem() ?? ({} as LightboxItem),
    index: this.currentIndex(),
  }));

  /**
   * Slide context for the `rkLightboxSlide` slot. Takes an index parameter
   * so it cannot be a parameterless `computed()`. Reads pre-computed signals
   * (`size`, `currentIndex`) to keep per-call work minimal.
   */
  protected slideContext(index: number): LightboxSlideContext {
    return {
      $implicit: this.items()[index] as LightboxItem,
      index,
      size: this.size(),
      isActive: index === this.currentIndex(),
    };
  }

  /**
   * CSS class string for a slide element. Takes an index parameter so it
   * cannot be a parameterless `computed()`. The transition-class prefix is
   * pre-computed once via `_slideTransitionClass` to avoid re-reading
   * `transition()` on each call.
   */
  protected slideClass(index: number): string {
    const base = this._slideTransitionClass();
    return index === this.currentIndex() ? `${base} rk-active` : base;
  }

  /**
   * Returns the accessible label for a slide: uses the item's title if
   * present, otherwise falls back to "Image X of Y".
   */
  protected slideAriaLabel(index: number): string {
    const item = this.items()[index];
    const position = `${index + 1} of ${this.items().length}`;
    return item?.title ? `${item.title}, ${position}` : `Image ${position}`;
  }

  /**
   * CSS value for the `--rk-transition-duration` custom property applied to
   * each slide element. This drives the CSS `transition` durations for the
   * `fade` and `zoom-in` transition types, keeping them in sync with the
   * `transitionDuration` input rather than being hardcoded to 300ms in CSS.
   */
  protected readonly _cssTransitionDuration = computed<string>(
    () => `${this.transitionDuration() ?? DEFAULT_TRANSITION_DURATION}ms`,
  );

  /**
   * Pre-computes the static part of the slide class (base + optional
   * transition modifier) so `slideClass(index)` only appends `rk-active`
   * rather than re-reading `transition()` on every call.
   */
  private readonly _slideTransitionClass = computed<string>(() => {
    const transition = this.transition();
    return transition === 'slide'
      ? SLIDE_BASE_CLASS
      : `${SLIDE_BASE_CLASS} rk-transition-${transition}`;
  });

  private readonly handleResize = (): void => {
    this.ngZone.run(() => {
      this.size.set([window.innerWidth, window.innerHeight]);
      this.isMobile.set(isTouchDevice());
    });
  };

  private onOverlayOpened(): void {
    this.bodyLock.lock();
    this._previousFocus = document.activeElement;
    // Defer focus until after the next render cycle so the container element
    // created by @if(isOpen()) is guaranteed to be in the DOM.
    // afterNextRender fires synchronously after Angular has flushed the view,
    // avoiding the race condition a bare setTimeout(0) has against change
    // detection on slower devices.
    afterNextRender(
      () => {
        const container = untracked(() => this.containerRef())?.nativeElement;
        if (container) {
          focusFirstFocusable(container);
        }
      },
      { injector: this._injector },
    );
  }

  private onOverlayClosed(): void {
    this.bodyLock.unlock();
    this.destroySlider();
    this.imageLoadedIndexes.set(new Set());
    this.imageErrorIndexes.set(new Set());
    if (this._previousFocus instanceof HTMLElement) {
      this._previousFocus.focus();
    }
    this._previousFocus = null;
  }

  private preloadAdjacentSlides(
    idx: number,
    items: readonly LightboxItem[],
  ): void {
    if (!this.isOpen()) return;

    const start = Math.max(0, idx - PRELOAD_RANGE);
    const end = Math.min(items.length - 1, idx + PRELOAD_RANGE);

    for (let i = start; i <= end; i++) {
      if (i === idx) continue;
      const item = items[i];
      if ((item.type ?? 'image') === 'video') {
        if (item.poster) preloadImage(item.poster);
      } else {
        preloadImage(item.src);
      }
    }
  }

  private initSlider(): void {
    const trackEl = this.sliderTrackRef()?.nativeElement;
    if (!trackEl || this.slider || !this.isOpen()) return;

    this.slider = createSliderController(
      {
        count: this.items().length,
        initialIndex: this._safeInitialIndex(),
        direction: 'horizontal',
        loop: this.loop() ?? false,
        transitionDuration:
          this.transitionDuration() ?? DEFAULT_TRANSITION_DURATION,
        swipeDistanceFactor:
          this.swipeDistanceFactor() ?? DEFAULT_SWIPE_DISTANCE_FACTOR,
        enableWheel: this.enableWheel() ?? false,
        wheelDebounceMs: this.wheelDebounceMs() ?? DEFAULT_WHEEL_DEBOUNCE_MS,
      },
      {
        onAfterChange: (index) => {
          this.ngZone.run(() => {
            this.currentIndex.set(index);
            this.slideChange.emit(index);
          });
        },
      },
    );

    this.slider.setPrimarySize(this.size()[0]);
    this.bridgeSliderSignals(this.slider);
    this.attachSlider(trackEl, this.slider);
  }

  private bridgeSliderSignals(slider: SliderController): void {
    this._coreIndexes = toAngularSignal(slider.state.indexes, this.destroyRef);
    this._useCoreIndexes.set(true);

    // Drive the slider track transform directly via DOM manipulation,
    // bypassing Angular's change detection entirely. This matches React's
    // AnimatedObserve pattern which uses flushSync for immediate DOM updates.
    let currentValue = slider.state.axisValue.value.value;

    const dispose = slider.state.axisValue.observe(() => {
      const { value, duration, done } = slider.state.axisValue.value;

      // Cancel any in-flight animation before starting a new one.
      if (this._bridgeCancelAnim) {
        this._bridgeCancelAnim();
        this._bridgeCancelAnim = null;
      }

      const trackEl = untracked(() => this.sliderTrackRef())?.nativeElement;
      if (!trackEl) return;

      if (duration > 0) {
        // Cancel any pending done() timer from a previous animation before
        // starting a new one. This prevents a stale done() call from firing
        // against the slider if the overlay closes mid-animation.
        if (this._bridgeDoneTimer !== null) {
          clearTimeout(this._bridgeDoneTimer);
          this._bridgeDoneTimer = null;
        }
        this._bridgeCancelAnim = animate({
          from: currentValue,
          to: value,
          duration,
          onUpdate: (v) => {
            currentValue = v;
            trackEl.style.transform = `translateX(${v}px)`;
          },
          onComplete: () => {
            this._bridgeCancelAnim = null;
            currentValue = value;
            this._bridgeDoneTimer = setTimeout(() => {
              this._bridgeDoneTimer = null;
              done?.();
            }, 0);
          },
        });
      } else {
        currentValue = value;
        trackEl.style.transform = `translateX(${value}px)`;
        done?.();
      }
    });

    // Store the dispose function so destroySlider() can cancel the bridge
    // observer when the overlay closes — not only when the component is destroyed.
    this._bridgeDispose = dispose;

    // Set initial position — observe() only fires on subsequent changes.
    const trackEl = untracked(() => this.sliderTrackRef())?.nativeElement;
    if (trackEl) {
      trackEl.style.transform = `translateX(${currentValue}px)`;
    }
    // Note: cleanup on component destroy is handled by the destroyRef.onDestroy
    // registered in the constructor (which calls destroySlider). Registering
    // another onDestroy here would accumulate stale callbacks across sessions.
  }

  private attachSlider(trackEl: HTMLElement, slider: SliderController): void {
    this.ngZone.runOutsideAngular(() => {
      slider.attach(trackEl);
      slider.observe();
    });
  }

  private destroySlider(): void {
    // Cancel the axis-value bridge observer and any in-flight animation
    // *before* disposing the slider so the observer callback never fires
    // against a detached track element.
    if (this._bridgeCancelAnim) {
      this._bridgeCancelAnim();
      this._bridgeCancelAnim = null;
    }
    // Cancel any pending deferred done() call so it doesn't fire against a
    // disposed slider after the overlay closes mid-animation.
    if (this._bridgeDoneTimer !== null) {
      clearTimeout(this._bridgeDoneTimer);
      this._bridgeDoneTimer = null;
    }
    if (this._bridgeDispose) {
      this._bridgeDispose();
      this._bridgeDispose = null;
    }

    if (this.slider) {
      this.slider.detach();
      this.slider.dispose();
      this.slider = null;
    }
    this._coreIndexes = null;
    this._useCoreIndexes.set(false);
  }
}
