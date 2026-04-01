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
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  LucideAngularModule,
  LucideIconProvider,
  LUCIDE_ICONS,
  ChevronUp,
  ChevronDown,
} from 'lucide-angular';
import {
  noop,
  clamp,
  captureFrame,
  BodyLockService,
  ReelComponent,
  RkReelItemDirective,
  toAngularSignal,
  createContentLoadingController,
  createContentPreloader,
  type ReelApi,
  type ContentLoadingController,
  type ContentPreloader,
} from '@reelkit/angular';
import { SoundStateService } from '../sound-state/sound-state.service';
import { RkMediaSlideComponent } from '../media-slide/media-slide.component';
import { shared as sharedVideo } from '../video-slide/video-slide.component';
import { RkSlideOverlayComponent } from '../slide-overlay/slide-overlay.component';
import { RkCloseButtonComponent } from '../player-controls/close-button.component';
import { RkSoundButtonComponent } from '../player-controls/sound-button.component';
import {
  RkPlayerSlideDirective,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerNavigationDirective,
  RkPlayerNestedSlideDirective,
  RkPlayerNestedNavigationDirective,
  RkPlayerLoadingDirective,
  RkPlayerErrorDirective,
} from '../template-slots/player-template-slots';
import type {
  BaseContentItem,
  ContentItem,
  MediaType,
  PlayerSoundState,
} from '../types';

const _kDefaultAspectRatio = 9 / 16;
const _kMobileBreakpointPx = 768;

/**
 * Full-screen, Instagram/TikTok-style vertical reel player overlay.
 *
 * Renders a portal-like overlay containing a virtualized vertical `rk-reel`
 * slider with media playback, gesture/keyboard/wheel navigation, and optional
 * sound controls. Supports full customization via `@ContentChild` template
 * slots for overlays, slides, controls, and navigation.
 *
 * Locks body scroll while open. Closes on Escape key.
 * Provides `SoundStateService` at the component level.
 *
 * @example
 * ```html
 * <rk-reel-player-overlay
 *   [isOpen]="isOpen"
 *   [content]="items"
 *   (closed)="isOpen = false"
 * />
 * ```
 */
@Component({
  selector: 'rk-reel-player-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    SoundStateService,
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ ChevronUp, ChevronDown }),
      multi: true,
    },
  ],
  imports: [
    NgTemplateOutlet,
    LucideAngularModule,
    ReelComponent,
    RkReelItemDirective,
    RkMediaSlideComponent,
    RkSlideOverlayComponent,
    RkCloseButtonComponent,
    RkSoundButtonComponent,
  ],
  template: `
    @if (isOpen()) {
      <div
        #overlayEl
        class="rk-reel-overlay"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="ariaLabel()"
        tabindex="-1"
      >
        <div
          class="rk-reel-container"
          [style.width.px]="size()[0] || null"
          [style.height.px]="size()[1] || null"
        >
          <rk-reel
            [count]="content().length"
            [size]="size()"
            direction="vertical"
            [loop]="loop()"
            [useNavKeys]="useNavKeys()"
            [enableWheel]="enableWheel()"
            [wheelDebounceMs]="wheelDebounceMs()"
            [transitionDuration]="transitionDuration()"
            [swipeDistanceFactor]="swipeDistanceFactor()"
            [initialIndex]="initialIndex()"
            (apiReady)="onApiReady($event)"
            (beforeChange)="onBeforeChange()"
            (afterChange)="onAfterChange($event)"
            (slideDragStart)="onSlideDragStart()"
            (slideDragEnd)="onSlideDragEnd()"
            (slideDragCanceled)="onSlideDragCanceled()"
          >
            <ng-template rkReelItem let-index let-itemSize="size">
              @let item = content()[index];
              @let isActive = activeIndex() === index;

              <div
                class="rk-reel-slide-wrapper"
                role="group"
                aria-roledescription="slide"
                [attr.aria-label]="
                  'Slide ' + (index + 1) + ' of ' + content().length
                "
                [style.width.px]="itemSize[0]"
                [style.height.px]="itemSize[1]"
              >
                @if (slideTemplate()) {
                  <ng-container
                    [ngTemplateOutlet]="slideTemplate()!.templateRef"
                    [ngTemplateOutletContext]="{
                      $implicit: item,
                      index: index,
                      size: itemSize,
                      isActive: isActive,
                      slideKey: item.id,
                      onReady: getOnReady(index),
                      onWaiting: getOnWaiting(index),
                      onError: getOnError(index),
                    }"
                  />
                } @else {
                  <rk-media-slide
                    [content]="item"
                    [isActive]="isActive"
                    [width]="itemSize[0]"
                    [height]="itemSize[1]"
                    [enableWheel]="enableWheel()"
                    [onReady]="getOnReady(index)"
                    [onWaiting]="getOnWaiting(index)"
                    [onError]="getOnError(index)"
                    [nestedSlideTemplate]="
                      nestedSlideTemplate()?.templateRef ?? null
                    "
                    [nestedNavTemplate]="
                      nestedNavTemplate()?.templateRef ?? null
                    "
                    (videoRef)="isActive && onVideoRef($event)"
                    (innerMediaType)="isActive && onInnerMediaType($event)"
                    (innerApiReady)="onInnerApiReady($event)"
                  />

                  @if (slideOverlayTemplate()) {
                    <ng-container
                      [ngTemplateOutlet]="slideOverlayTemplate()!.templateRef"
                      [ngTemplateOutletContext]="{
                        $implicit: item,
                        index: index,
                        isActive: isActive,
                      }"
                    />
                  } @else {
                    @let asContent = asContentItem(item);
                    <rk-slide-overlay
                      [author]="asContent?.author"
                      [description]="asContent?.description"
                      [likes]="asContent?.likes"
                    />
                  }
                }
              </div>
            </ng-template>
          </rk-reel>

          @if (isError()) {
            @if (errorSlot()) {
              <ng-container
                [ngTemplateOutlet]="errorSlot()!.templateRef"
                [ngTemplateOutletContext]="{
                  $implicit: activeIndex(),
                  item: content()[activeIndex()],
                  innerActiveIndex: null,
                }"
              />
            } @else {
              <div class="rk-media-error" role="img" aria-label="Content unavailable">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"
                  aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                  <line x1="4" y1="4" x2="20" y2="20"/>
                </svg>
                <span class="rk-media-error-text">Content unavailable</span>
              </div>
            }
          } @else if (isLoading()) {
            @if (loadingSlot()) {
              <ng-container
                [ngTemplateOutlet]="loadingSlot()!.templateRef"
                [ngTemplateOutletContext]="{
                  $implicit: activeIndex(),
                  item: content()[activeIndex()],
                  innerActiveIndex: null,
                }"
              />
            } @else {
              <div class="rk-reel-loader"></div>
            }
          }

          @if (controlsTemplate()) {
            <ng-container
              [ngTemplateOutlet]="controlsTemplate()!.templateRef"
              [ngTemplateOutletContext]="{
                $implicit: closeFn,
                item: content()[activeIndex()],
                activeIndex: activeIndex(),
                content: content(),
                soundState: soundStateFacade,
                onClose: closeFn,
              }"
            />
          } @else {
            <rk-close-button (clicked)="close()" />
            @if (activeSlideHasVideo()) {
              <rk-sound-button [isDisabled]="isSoundDisabled()" />
            }
          }
        </div>

        @if (navigationTemplate()) {
          <ng-container
            [ngTemplateOutlet]="navigationTemplate()!.templateRef"
            [ngTemplateOutletContext]="{
              $implicit: onPrevFn,
              item: content()[activeIndex()],
              activeIndex: activeIndex(),
              count: content().length,
              onPrev: onPrevFn,
              onNext: onNextFn,
            }"
          />
        } @else {
          <div class="rk-player-nav-arrows">
            <button
              class="rk-player-nav-btn"
              (click)="onPrev()"
              aria-label="Previous slide"
              [disabled]="!loop() && activeIndex() === 0"
              [attr.aria-disabled]="!loop() && activeIndex() === 0"
            >
              <lucide-angular [img]="ChevronUpIcon" [size]="28" />
            </button>
            <button
              class="rk-player-nav-btn"
              (click)="onNext()"
              aria-label="Next slide"
              [disabled]="!loop() && activeIndex() === content().length - 1"
              [attr.aria-disabled]="
                !loop() && activeIndex() === content().length - 1
              "
            >
              <lucide-angular [img]="ChevronDownIcon" [size]="28" />
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class RkReelPlayerOverlayComponent<
  T extends BaseContentItem = ContentItem,
> {
  readonly isOpen = input.required<boolean>();
  readonly content = input.required<T[]>();
  readonly initialIndex = input<number>(0);

  /** Accessible label for the dialog. Defaults to "Video player". */
  readonly ariaLabel = input<string>('Video player');

  /**
   * Aspect ratio (width / height) for the player container on desktop.
   * Defaults to 9/16. On mobile (< 768px), the player uses the full viewport.
   */
  readonly aspectRatio = input<number | undefined>(undefined);

  readonly transitionDuration = input<number>(300);
  readonly swipeDistanceFactor = input<number>(0.12);
  readonly loop = input<boolean>(false);
  readonly useNavKeys = input<boolean>(true);
  readonly enableWheel = input<boolean>(true);
  readonly wheelDebounceMs = input<number>(200);

  readonly closed = output<void>();
  readonly slideChange = output<number>();
  readonly apiReady = output<ReelApi>();

  readonly slideTemplate = contentChild(RkPlayerSlideDirective<T>);
  readonly slideOverlayTemplate = contentChild(
    RkPlayerSlideOverlayDirective<T>,
  );
  readonly controlsTemplate = contentChild(RkPlayerControlsDirective<T>);
  readonly navigationTemplate = contentChild(RkPlayerNavigationDirective);
  readonly nestedSlideTemplate = contentChild(RkPlayerNestedSlideDirective);
  readonly nestedNavTemplate = contentChild(RkPlayerNestedNavigationDirective);
  protected readonly loadingSlot = contentChild(RkPlayerLoadingDirective);
  protected readonly errorSlot = contentChild(RkPlayerErrorDirective);

  private readonly _activeIndex = linkedSignal(() =>
    this.isOpen() ? this.initialIndex() : 0,
  );
  readonly activeIndex = this._activeIndex.asReadonly();

  private readonly _innerActiveMediaType = signal<MediaType | null>(null);

  private _reelApi: ReelApi | null = null;
  private _innerApi: ReelApi | null = null;
  private _videoEl: HTMLVideoElement | null = null;
  private _videoPausedOnDrag = false;

  protected readonly ChevronUpIcon = ChevronUp;
  protected readonly ChevronDownIcon = ChevronDown;

  /**
   * Stable arrow-function references passed into template context objects.
   * Using bound methods (`.bind(this)`) in template expressions creates a new
   * function instance on every change-detection cycle, defeating OnPush.
   */
  readonly closeFn = (): void => this.close();
  readonly onPrevFn = (): void => this.onPrev();
  readonly onNextFn = (): void => this.onNext();

  /**
   * A stable, template-safe facade over `SoundStateService` that satisfies
   * the `PlayerSoundState` interface. Passed into the `rkPlayerControls`
   * template context so custom control templates can read and toggle mute
   * state without requiring a direct `SoundStateService` injection.
   *
   * Arrow functions are used so `this` is always bound correctly when the
   * template calls `soundState.toggle()`.
   */
  readonly soundStateFacade: PlayerSoundState = {
    muted: () => this._soundState.muted(),
    disabled: () => this._soundState.disabled(),
    toggle: () => this._soundState.toggle(),
  };

  protected readonly isSoundDisabled = computed(() => {
    const idx = this.activeIndex();
    return (
      (this.content()[idx]?.media.length ?? 0) > 1 &&
      this._innerActiveMediaType() === 'image'
    );
  });

  /**
   * Whether the active slide contains at least one video track. Derived as a
   * `computed()` so the template never triggers impure method calls on each
   * change-detection cycle.
   */
  protected readonly activeSlideHasVideo = computed(
    () =>
      this.content()[this.activeIndex()]?.media.some(
        (m) => m.type === 'video',
      ) ?? false,
  );

  private readonly _preloader: ContentPreloader = createContentPreloader({
    maxCacheSize: 1000,
  });
  private readonly _loadingCtrl: ContentLoadingController =
    createContentLoadingController(true, 0);

  private readonly _sizeSignal = signal<[number, number]>([0, 0]);
  readonly size = this._sizeSignal.asReadonly();

  private readonly _overlayEl =
    viewChild<ElementRef<HTMLDivElement>>('overlayEl');

  private readonly _bodyLock = inject(BodyLockService);
  private readonly _soundState = inject(SoundStateService);
  private readonly _zone = inject(NgZone);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _document = inject(DOCUMENT);
  private readonly _injector = inject(Injector);

  protected readonly isLoading = toAngularSignal(
    this._loadingCtrl.isLoading,
    this._destroyRef,
  );

  protected readonly isError = toAngularSignal(
    this._loadingCtrl.isError,
    this._destroyRef,
  );

  private _preloaderDispose: (() => void) | null = null;

  constructor() {
    this._sizeSignal.set(this._getSize());
    this._listenToEscape();
    this._listenToResize();

    this._destroyRef.onDestroy(() => this._bodyLock.unlock());

    effect(() => {
      this._preloadNeighbors(this.activeIndex(), this.content());
    });

    effect(() => {
      if (this.isOpen()) {
        this._bodyLock.lock();
        this._setupInitialPreload();
        // Defer focus until after the next render cycle so the overlay element
        // created by @if(isOpen()) is guaranteed to be in the DOM.
        // afterNextRender fires after Angular has flushed the view, avoiding
        // the race condition that Promise.resolve().then() has — microtasks
        // can fire before Angular's change detection flushes the @if branch.
        afterNextRender(
          () => {
            const el = untracked(() => this._overlayEl())?.nativeElement;
            if (el) {
              el.focus();
            }
          },
          { injector: this._injector },
        );
      } else {
        this._bodyLock.unlock();
        if (this._preloaderDispose) {
          this._preloaderDispose();
          this._preloaderDispose = null;
        }
      }
    });
  }

  close(): void {
    this._soundState.reset();
    this.closed.emit();
  }

  onPrev(): void {
    this._reelApi?.prev();
  }

  onNext(): void {
    this._reelApi?.next();
  }

  onApiReady(api: ReelApi): void {
    this._reelApi = api;
    this.apiReady.emit(api);
  }

  onBeforeChange(): void {
    this._soundState.setDisabled(true);

    if (this._videoEl) {
      this._videoEl.pause();
      const key = this._videoEl.dataset['slideKey'];
      const frame = captureFrame(this._videoEl);
      if (key && frame) {
        sharedVideo.capturedFrames.set(key, frame);
      }
    }
  }

  onAfterChange(event: { index: number }): void {
    const index = event.index;
    this._loadingCtrl.setActiveIndex(index);

    const src = this.content()[index]?.media[0]?.src;
    if (src && this._preloader.isErrored(src)) {
      this._loadingCtrl.onError(index);
    } else if (src && this._preloader.isLoaded(src)) {
      this._loadingCtrl.onReady(index);
    }

    this._activeIndex.set(index);
    this._innerActiveMediaType.set(null);
    this._soundState.setDisabled(false);

    this.slideChange.emit(index);
  }

  getOnReady(index: number): () => void {
    return () => {
      this._loadingCtrl.onReady(index);
      const src = this.content()[index]?.media[0]?.src;
      if (src) this._preloader.markLoaded(src);
    };
  }

  getOnWaiting(index: number): () => void {
    return () => this._loadingCtrl.onWaiting(index);
  }

  getOnError(index: number): () => void {
    return () => {
      const src = this.content()[index]?.media[0]?.src;
      if (src) this._preloader.markErrored(src);
      this._loadingCtrl.onError(index);
    };
  }

  onVideoRef(ref: HTMLVideoElement | null): void {
    this._videoEl = ref;
  }

  onInnerMediaType(type: MediaType): void {
    this._innerActiveMediaType.set(type);
  }

  onInnerApiReady(api: ReelApi): void {
    this._innerApi = api;
  }

  onSlideDragStart(): void {
    this._innerApi?.unobserve();

    if (this._videoEl && !this._videoEl.paused) {
      this._videoEl.pause();
      this._videoPausedOnDrag = true;
    }
  }

  onSlideDragEnd(): void {
    this._innerApi?.observe();
    // A committed drag will be followed by onAfterChange, not onSlideDragCanceled.
    // Clear the flag here so a stale true cannot trigger a spurious play() call
    // if the event sequence is ever emitted out of expected order.
    this._videoPausedOnDrag = false;
  }

  onSlideDragCanceled(): void {
    if (this._videoPausedOnDrag && this._videoEl) {
      this._zone.runOutsideAngular(() => {
        this._videoEl!.play().catch(noop);
      });
    }
    this._videoPausedOnDrag = false;
  }

  /**
   * Attempts to cast a BaseContentItem to ContentItem for the default overlay.
   * Returns undefined if the item lacks the expected fields.
   */
  protected asContentItem(item: T): ContentItem | undefined {
    const record = item as Record<string, unknown>;
    if ('author' in record || 'description' in record || 'likes' in record) {
      return item as unknown as ContentItem;
    }
    return undefined;
  }

  private _getSize(): [number, number] {
    const win = this._document.defaultView;
    if (!win) return [0, 0];

    // Guard against degenerate aspect ratios (0, NaN, Infinity, negative).
    // Any such value would produce a zero-width or infinite-height container,
    // breaking layout entirely. Fall back to the default 9:16 ratio.
    const rawRatio = this.aspectRatio() ?? _kDefaultAspectRatio;
    const ratio =
      Number.isFinite(rawRatio) && rawRatio > 0
        ? rawRatio
        : _kDefaultAspectRatio;

    const windowWidth = win.innerWidth;
    const windowHeight = win.innerHeight;

    if (windowWidth < _kMobileBreakpointPx) {
      return [windowWidth, windowHeight];
    }

    let width = windowHeight * ratio;
    let height = windowHeight;

    if (width > windowWidth) {
      width = windowWidth;
      height = windowWidth / ratio;
    }

    return [width, height];
  }

  private _listenToEscape(): void {
    this._document.addEventListener('keydown', this._onKeyDown);
    this._destroyRef.onDestroy(() =>
      this._document.removeEventListener('keydown', this._onKeyDown),
    );
  }

  private readonly _onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen()) {
      this.close();
    }
  };

  private _listenToResize(): void {
    const win = this._document.defaultView;
    if (!win) return;

    this._zone.runOutsideAngular(() => {
      win.addEventListener('resize', this._onResize);
      this._destroyRef.onDestroy(() =>
        win.removeEventListener('resize', this._onResize),
      );
    });
  }

  private readonly _onResize = (): void => {
    this._zone.run(() => {
      this._sizeSignal.set(this._getSize());
      this._reelApi?.adjust();
    });
  };

  private _setupInitialPreload(): void {
    const idx = this.initialIndex();
    this._loadingCtrl.setActiveIndex(idx);

    const src = this.content()[idx]?.media[0]?.src;
    if (src && this._preloader.isErrored(src)) {
      this._loadingCtrl.onError(idx);
    } else if (src && this._preloader.isLoaded(src)) {
      this._loadingCtrl.onReady(idx);
    } else if (src) {
      this._preloaderDispose = this._preloader.onLoaded(src, () =>
        this._loadingCtrl.onReady(idx),
      );
    }
  }

  private _preloadNeighbors(idx: number, items: readonly T[]): void {
    if (!this.isOpen() || items.length === 0) return;

    const range = 2;
    const start = clamp(idx - range, 0, items.length - 1);
    const end = clamp(idx + range, 0, items.length - 1);

    for (let i = start; i <= end; i++) {
      if (i === idx) continue;
      for (const m of items[i].media) {
        if (m.type === 'video') {
          if (m.poster) this._preloader.preload(m.poster, 'image');
        } else {
          this._preloader.preload(m.src, 'image');
        }
      }
    }
  }
}
