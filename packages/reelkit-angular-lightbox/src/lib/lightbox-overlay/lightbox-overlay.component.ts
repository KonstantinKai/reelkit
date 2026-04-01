import {
  ChangeDetectionStrategy,
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
import { NgTemplateOutlet } from '@angular/common';
import {
  createContentLoadingController,
  createContentPreloader,
  createSoundController,
  slideTransition,
  flipTransition,
  fullscreenSignal,
  requestFullscreen,
  exitFullscreen,
  ReelComponent,
  RkReelItemDirective,
  type ContentLoadingController,
  type ContentPreloader,
  type SoundController,
  type TransitionTransformFn,
  type ReelApi,
} from '@reelkit/angular';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import { BodyLockService, toAngularSignal } from '@reelkit/angular';
import {
  RkLightboxControlsDirective,
  RkLightboxNavigationDirective,
  RkLightboxInfoDirective,
  RkLightboxSlideDirective,
  RkLightboxLoadingDirective,
  RkLightboxErrorDirective,
} from '../template-slots/lightbox-template-slots';
import { RkSwipeToCloseDirective } from '@reelkit/angular';
import { RkCloseButtonComponent } from '../lightbox-controls/close-button.component';
import { RkCounterComponent } from '../lightbox-controls/counter.component';
import { RkFullscreenButtonComponent } from '../lightbox-controls/fullscreen-button.component';
import { RkSoundButtonComponent } from '../lightbox-controls/sound-button.component';
import { lightboxFadeTransition } from '../lightboxFadeTransition';
import { lightboxZoomTransition } from '../lightboxZoomTransition';
import type {
  LightboxItem,
  TransitionType,
  ReelProxyProps,
  LightboxControlsContext,
  LightboxNavContext,
  LightboxInfoContext,
  LightboxSlideContext,
} from '../types';

const _kPreloadRange = 2;
const _kDefaultTransitionDuration = 300;
const _kDefaultSwipeDistanceFactor = 0.12;
const _kDefaultWheelDebounceMs = 200;

/**
 * CSS selector string that matches all standard keyboard-focusable elements,
 * excluding those explicitly removed from the tab order via `tabindex="-1"`.
 */
const _kFocusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const _kTransitionMap: Record<TransitionType, TransitionTransformFn> = {
  slide: slideTransition,
  fade: lightboxFadeTransition,
  flip: flipTransition,
  'zoom-in': lightboxZoomTransition,
};

const preloader: ContentPreloader = createContentPreloader({
  maxCacheSize: 1000,
});

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
    container.querySelector<HTMLElement>(_kFocusableSelector);
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
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ ChevronLeft, ChevronRight }),
      multi: true,
    },
  ],
  imports: [
    NgTemplateOutlet,
    LucideAngularModule,
    ReelComponent,
    RkReelItemDirective,
    RkSwipeToCloseDirective,
    RkCloseButtonComponent,
    RkCounterComponent,
    RkFullscreenButtonComponent,
    RkSoundButtonComponent,
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
          <div class="rk-lightbox-top-shade"></div>
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
                [isFullscreen]="isFullscreen()"
                (toggled)="handleToggleFullscreen()"
              />
              @if (isVideoSlide() && !isSoundDisabled()) {
                <rk-sound-button
                  [muted]="isMuted()"
                  (toggled)="soundCtrl.toggle()"
                />
              }
            </div>
            <rk-close-button (clicked)="handleClose()" />
          }
        }

        @if (isError()) {
          @if (errorSlot()) {
            <ng-container
              [ngTemplateOutlet]="errorSlot()!.templateRef"
              [ngTemplateOutletContext]="{ $implicit: currentIndex(), item: currentItem() }"
            />
          } @else {
            <div class="rk-lightbox-img-error" role="img" aria-label="Content unavailable">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"
                aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
                <line x1="4" y1="4" x2="20" y2="20"/>
              </svg>
              <span class="rk-lightbox-img-error-text">Content unavailable</span>
            </div>
          }
        } @else if (isLoading()) {
          @if (loadingSlot()) {
            <ng-container
              [ngTemplateOutlet]="loadingSlot()!.templateRef"
              [ngTemplateOutletContext]="{ $implicit: currentIndex(), item: currentItem() }"
            />
          } @else {
            <div class="rk-lightbox-spinner"></div>
          }
        }

        @if (items().length > 0) {
          <div [rkSwipeToClose]="isMobile()" (dismissed)="handleClose()">
            <rk-reel
              [count]="items().length"
              [size]="size()"
              direction="horizontal"
              [initialIndex]="safeInitialIndex()"
              [loop]="loop() ?? false"
              [useNavKeys]="useNavKeys() ?? true"
              [enableWheel]="enableWheel() ?? true"
              [wheelDebounceMs]="wheelDebounceMs() ?? 200"
              [transitionDuration]="transitionDuration() ?? 300"
              [swipeDistanceFactor]="swipeDistanceFactor() ?? 0.12"
              [transition]="transitionFn()"
              (apiReady)="onApiReady($event)"
              (afterChange)="onAfterChange($event)"
            >
              <ng-template rkReelItem let-idx let-itemSize="size">
                @let item = items()[idx];
                @if (item) {
                  <div
                    class="rk-lightbox-slide"
                    [style.width.px]="itemSize[0]"
                    [style.height.px]="itemSize[1]"
                    role="group"
                    aria-roledescription="slide"
                    [attr.aria-label]="slideAriaLabel(idx)"
                  >
                    @if (slideSlot()) {
                      <ng-container
                        [ngTemplateOutlet]="slideSlot()!.templateRef"
                        [ngTemplateOutletContext]="slideContext(idx)"
                      />
                    } @else if (!imageErrorIndexes().has(idx)) {
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
                    }
                  </div>
                }
              </ng-template>
            </rk-reel>
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
            } @else if (currentItem().title || currentItem().description) {
              <div class="rk-lightbox-info">
                @if (currentItem().title) {
                  <h3 class="rk-lightbox-title">{{ currentItem().title }}</h3>
                }
                @if (currentItem().description) {
                  <p class="rk-lightbox-description">
                    {{ currentItem().description }}
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
  private readonly _bodyLock = inject(BodyLockService);
  private readonly _ngZone = inject(NgZone);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _injector = inject(Injector);

  protected readonly loadingCtrl: ContentLoadingController =
    createContentLoadingController(true, 0);

  protected readonly isLoading = toAngularSignal(
    this.loadingCtrl.isLoading,
    this._destroyRef,
  );

  protected readonly isError = toAngularSignal(
    this.loadingCtrl.isError,
    this._destroyRef,
  );

  protected readonly isFullscreen = toAngularSignal(
    fullscreenSignal,
    this._destroyRef,
  );

  protected readonly soundCtrl: SoundController = createSoundController();

  protected readonly isMuted = toAngularSignal(
    this.soundCtrl.muted,
    this._destroyRef,
  );

  protected readonly isSoundDisabled = toAngularSignal(
    this.soundCtrl.disabled,
    this._destroyRef,
  );

  protected readonly controlsSlot = contentChild(RkLightboxControlsDirective);
  protected readonly navigationSlot = contentChild(
    RkLightboxNavigationDirective,
  );
  protected readonly infoSlot = contentChild(RkLightboxInfoDirective);
  protected readonly slideSlot = contentChild(RkLightboxSlideDirective);
  protected readonly loadingSlot = contentChild(RkLightboxLoadingDirective);
  protected readonly errorSlot = contentChild(RkLightboxErrorDirective);

  private readonly _containerRef =
    viewChild<ElementRef<HTMLDivElement>>('container');

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
    _kDefaultTransitionDuration,
  );

  /** Minimum swipe distance fraction to trigger a slide change. @default 0.12 */
  readonly swipeDistanceFactor = input<ReelProxyProps['swipeDistanceFactor']>(
    _kDefaultSwipeDistanceFactor,
  );

  /** Whether the slider wraps from last slide back to first. @default false */
  readonly loop = input<ReelProxyProps['loop']>(false);

  /** Enable keyboard arrow key navigation. @default true */
  readonly useNavKeys = input<ReelProxyProps['useNavKeys']>(true);

  /** Enable mouse wheel navigation. @default true */
  readonly enableWheel = input<ReelProxyProps['enableWheel']>(true);

  /** Debounce duration for wheel events in ms. @default 200 */
  readonly wheelDebounceMs = input<ReelProxyProps['wheelDebounceMs']>(
    _kDefaultWheelDebounceMs,
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
  protected readonly safeInitialIndex = computed(() => {
    const idx = this.initialIndex();
    const len = this.items().length;
    if (len === 0) return 0;
    return Math.max(0, Math.min(idx, len - 1));
  });

  /**
   * Zero-based index of the currently visible slide.
   * Automatically resets to `safeInitialIndex` whenever the lightbox opens so
   * that re-opening always starts at the requested position.
   * Can still be updated imperatively by the slider's `onAfterChange` callback.
   */
  protected readonly currentIndex = linkedSignal(() =>
    this.isOpen() ? this.safeInitialIndex() : 0,
  );

  protected readonly size = signal<[number, number]>(
    typeof window !== 'undefined'
      ? [window.innerWidth, window.innerHeight]
      : [0, 0],
  );

  protected readonly isMobile = signal(isTouchDevice());

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

  protected readonly isVideoSlide = computed(() => {
    const item = this.currentItem();
    return item?.type === 'video';
  });

  protected readonly transitionFn = computed<TransitionTransformFn>(
    () => _kTransitionMap[this.transition()],
  );

  protected readonly ChevronLeftIcon = ChevronLeft;
  protected readonly ChevronRightIcon = ChevronRight;

  private _reelApi: ReelApi | null = null;
  private _preloaderDispose: (() => void) | null = null;
  private _previousFocus: Element | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this._ngZone.runOutsideAngular(() => {
        window.addEventListener('resize', this._handleResize);
      });
    }
    this._destroyRef.onDestroy(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this._handleResize);
      }
      this._bodyLock.unlock();
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
    if (fullscreenSignal.value) {
      exitFullscreen();
    }
    this.soundCtrl.muted.value = true;
    this.closed.emit();
  }

  protected onImageLoad(index: number): void {
    const src = this.items()[index]?.src;
    if (src) preloader.markLoaded(src);
    this.loadingCtrl.onReady(index);
    this.imageLoadedIndexes.update((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  protected onImageError(index: number): void {
    const src = this.items()[index]?.src;
    if (src) preloader.markErrored(src);
    this.loadingCtrl.onError(index);
    this.imageErrorIndexes.update((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }

  protected handlePrev(): void {
    this._reelApi?.prev();
  }

  protected handleNext(): void {
    this._reelApi?.next();
  }

  protected onApiReady(api: ReelApi): void {
    this._reelApi = api;
  }

  protected onAfterChange(event: { index: number }): void {
    const index = event.index;
    this.loadingCtrl.setActiveIndex(index);
    const src = this.items()[index]?.src;
    if (src && preloader.isErrored(src)) {
      this.loadingCtrl.onError(index);
    } else if (src && preloader.isLoaded(src)) {
      this.loadingCtrl.onReady(index);
    }
    this.currentIndex.set(index);
    this.slideChange.emit(index);
  }

  protected handleToggleFullscreen(): void {
    if (fullscreenSignal.value) {
      exitFullscreen();
    } else {
      const container = this._containerRef();
      if (container) {
        requestFullscreen(container.nativeElement);
      }
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
      item: this.currentItem(),
      activeIndex: this.currentIndex(),
      count: this.items().length,
      isFullscreen: this.isFullscreen(),
      onClose: () => this.handleClose(),
      onToggleFullscreen: () => this.handleToggleFullscreen(),
    }),
  );

  protected readonly navContext = computed<LightboxNavContext>(() => ({
    $implicit: undefined as void,
    item: this.currentItem(),
    activeIndex: this.currentIndex(),
    count: this.items().length,
    onPrev: () => this.handlePrev(),
    onNext: () => this.handleNext(),
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
      onReady: () => {
        this.loadingCtrl.onReady(index);
        const src = this.items()[index]?.src;
        if (src) preloader.markLoaded(src);
      },
      onWaiting: () => this.loadingCtrl.onWaiting(index),
      onError: () => {
        const src = this.items()[index]?.src;
        if (src) preloader.markErrored(src);
        this.loadingCtrl.onError(index);
      },
    };
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

  private readonly _handleResize = (): void => {
    this._ngZone.run(() => {
      this.size.set([window.innerWidth, window.innerHeight]);
      this.isMobile.set(isTouchDevice());
      this._reelApi?.adjust();
    });
  };

  private onOverlayOpened(): void {
    this._bodyLock.lock();
    this._previousFocus = document.activeElement;

    const initialIdx = this.safeInitialIndex();
    this.loadingCtrl.setActiveIndex(initialIdx);

    const initialSrc = this.items()[initialIdx]?.src;
    if (initialSrc && preloader.isErrored(initialSrc)) {
      this.loadingCtrl.onError(initialIdx);
    } else if (initialSrc && preloader.isLoaded(initialSrc)) {
      this.loadingCtrl.onReady(initialIdx);
    } else if (initialSrc) {
      this._preloaderDispose = preloader.onLoaded(initialSrc, () =>
        this.loadingCtrl.onReady(initialIdx),
      );
    }

    afterNextRender(
      () => {
        const container = untracked(() => this._containerRef())?.nativeElement;
        if (container) {
          focusFirstFocusable(container);
        }
      },
      { injector: this._injector },
    );
  }

  private onOverlayClosed(): void {
    this._bodyLock.unlock();
    this._reelApi = null;
    this.imageLoadedIndexes.set(new Set());
    this.imageErrorIndexes.set(new Set());
    this.soundCtrl.muted.value = true;
    if (this._preloaderDispose) {
      this._preloaderDispose();
      this._preloaderDispose = null;
    }
    if (fullscreenSignal.value) {
      exitFullscreen();
    }
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
    preloader.preloadRange(items, idx, _kPreloadRange);
  }
}
