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
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { noop } from '@reelkit/angular';
import {
  BodyLockService,
  ReelComponent,
  RkReelItemDirective,
  type ReelApi,
} from '@reelkit/angular';
import { ICON_CHEVRON_UP, ICON_CHEVRON_DOWN } from '../icons/icons';
import { SoundStateService } from '../sound-state/sound-state.service';
import { RkMediaSlideComponent } from '../media-slide/media-slide.component';
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
} from '../template-slots/player-template-slots';
import type {
  BaseContentItem,
  ContentItem,
  MediaType,
  PlayerSoundState,
} from '../types';

const DEFAULT_ASPECT_RATIO = 9 / 16;
const MOBILE_BREAKPOINT_PX = 768;

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
  providers: [SoundStateService],
  imports: [
    NgTemplateOutlet,
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
                    }"
                  />
                } @else {
                  <rk-media-slide
                    [content]="item"
                    [isActive]="isActive"
                    [width]="itemSize[0]"
                    [height]="itemSize[1]"
                    [enableWheel]="enableWheel()"
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

          @if (controlsTemplate()) {
            <ng-container
              [ngTemplateOutlet]="controlsTemplate()!.templateRef"
              [ngTemplateOutletContext]="{
                $implicit: closeFn,
                activeIndex: activeIndex(),
                content: content(),
                soundState: soundStateFacade,
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
              onNext: onNextFn,
              activeIndex: activeIndex(),
              count: content().length,
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
              [innerHTML]="iconChevronUp"
            ></button>
            <button
              class="rk-player-nav-btn"
              (click)="onNext()"
              aria-label="Next slide"
              [disabled]="!loop() && activeIndex() === content().length - 1"
              [attr.aria-disabled]="
                !loop() && activeIndex() === content().length - 1
              "
              [innerHTML]="iconChevronDown"
            ></button>
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

  private readonly _activeIndex = linkedSignal(() =>
    this.isOpen() ? this.initialIndex() : 0,
  );
  readonly activeIndex = this._activeIndex.asReadonly();

  private readonly _innerActiveMediaType = signal<MediaType | null>(null);

  private _reelApi: ReelApi | null = null;
  private _innerApi: ReelApi | null = null;
  private _videoEl: HTMLVideoElement | null = null;
  private _videoPausedOnDrag = false;

  private readonly _sanitizer = inject(DomSanitizer);

  protected readonly iconChevronUp: SafeHtml =
    this._sanitizer.bypassSecurityTrustHtml(ICON_CHEVRON_UP);
  protected readonly iconChevronDown: SafeHtml =
    this._sanitizer.bypassSecurityTrustHtml(ICON_CHEVRON_DOWN);

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

  constructor() {
    this._sizeSignal.set(this._getSize());
    this._listenToEscape();
    this._listenToResize();

    this._destroyRef.onDestroy(() => this._bodyLock.unlock());

    effect(() => {
      if (this.isOpen()) {
        this._bodyLock.lock();
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
  }

  onAfterChange(event: { index: number }): void {
    this._activeIndex.set(event.index);
    this._innerActiveMediaType.set(null);

    // Always re-enable sound after a transition completes. For image-only
    // slides the sound button is hidden by activeSlideHasVideo(), but leaving
    // disabled=true would corrupt soundStateFacade.disabled() for consumers
    // using custom control templates.
    this._soundState.setDisabled(false);

    this.slideChange.emit(event.index);
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
    const rawRatio = this.aspectRatio() ?? DEFAULT_ASPECT_RATIO;
    const ratio =
      Number.isFinite(rawRatio) && rawRatio > 0
        ? rawRatio
        : DEFAULT_ASPECT_RATIO;

    const windowWidth = win.innerWidth;
    const windowHeight = win.innerHeight;

    if (windowWidth < MOBILE_BREAKPOINT_PX) {
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
    // Running inside NgZone so signal writes schedule change detection
    // correctly, even though the resize listener fires outside Angular.
    this._zone.run(() => {
      this._sizeSignal.set(this._getSize());
      this._reelApi?.adjust();
    });
  };
}
