/* eslint-disable @typescript-eslint/no-unused-vars */
import { Directive, TemplateRef, inject } from '@angular/core';
import type {
  BaseContentItem,
  ContentItem,
  MediaItem,
  PlayerControlsContext,
  PlayerNavigationContext,
  PlayerNestedNavigationContext,
  PlayerNestedSlideContext,
  PlayerSlideContext,
  PlayerSlideOverlayContext,
  PlayerTimelineContext,
} from '../types';

/**
 * Template slot for custom slide content.
 *
 * @example
 * ```html
 * <rk-reel-player-overlay [content]="items" [isOpen]="open" (closed)="open = false">
 *   <ng-template rkPlayerSlide let-item let-index="index" let-isActive="isActive">
 *     <my-custom-slide [data]="item" [active]="isActive" />
 *   </ng-template>
 * </rk-reel-player-overlay>
 * ```
 */
@Directive({ selector: '[rkPlayerSlide]', standalone: true })
export class RkPlayerSlideDirective<T extends BaseContentItem = ContentItem> {
  readonly templateRef =
    inject<TemplateRef<PlayerSlideContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T extends BaseContentItem>(
    _dir: RkPlayerSlideDirective<T>,
    ctx: unknown,
  ): ctx is PlayerSlideContext<T> {
    return true;
  }
}

/**
 * Template slot for custom per-slide overlays (author, description, likes).
 *
 * @example
 * ```html
 * <ng-template rkPlayerSlideOverlay let-item let-isActive="isActive">
 *   <div *ngIf="isActive" class="my-overlay">{{ item.description }}</div>
 * </ng-template>
 * ```
 */
@Directive({ selector: '[rkPlayerSlideOverlay]', standalone: true })
export class RkPlayerSlideOverlayDirective<
  T extends BaseContentItem = ContentItem,
> {
  readonly templateRef =
    inject<TemplateRef<PlayerSlideOverlayContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T extends BaseContentItem>(
    _dir: RkPlayerSlideOverlayDirective<T>,
    ctx: unknown,
  ): ctx is PlayerSlideOverlayContext<T> {
    return true;
  }
}

/**
 * Template slot for custom player controls (close button, sound button, etc.).
 *
 * @example
 * ```html
 * <ng-template rkPlayerControls let-onClose>
 *   <button (click)="onClose()">X</button>
 * </ng-template>
 * ```
 */
@Directive({ selector: '[rkPlayerControls]', standalone: true })
export class RkPlayerControlsDirective<
  T extends BaseContentItem = ContentItem,
> {
  readonly templateRef =
    inject<TemplateRef<PlayerControlsContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T extends BaseContentItem>(
    _dir: RkPlayerControlsDirective<T>,
    ctx: unknown,
  ): ctx is PlayerControlsContext<T> {
    return true;
  }
}

/**
 * Template slot for custom vertical navigation arrows.
 *
 * @example
 * ```html
 * <ng-template rkPlayerNavigation let-onPrev let-onNext="onNext">
 *   <button (click)="onPrev()">Up</button>
 *   <button (click)="onNext()">Down</button>
 * </ng-template>
 * ```
 */
@Directive({ selector: '[rkPlayerNavigation]', standalone: true })
export class RkPlayerNavigationDirective {
  readonly templateRef =
    inject<TemplateRef<PlayerNavigationContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkPlayerNavigationDirective,
    ctx: unknown,
  ): ctx is PlayerNavigationContext {
    return true;
  }
}

/**
 * Template slot for custom slides inside the nested horizontal slider.
 *
 * @example
 * ```html
 * <ng-template rkPlayerNestedSlide let-item let-isInnerActive="isInnerActive">
 *   <rk-image-slide [src]="item.src" />
 * </ng-template>
 * ```
 */
@Directive({ selector: '[rkPlayerNestedSlide]', standalone: true })
export class RkPlayerNestedSlideDirective {
  readonly templateRef =
    inject<TemplateRef<PlayerNestedSlideContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkPlayerNestedSlideDirective,
    ctx: unknown,
  ): ctx is PlayerNestedSlideContext {
    return true;
  }
}

/**
 * Template slot for a custom playback timeline bar.
 *
 * Only rendered when the overlay's gating rules would render the default
 * bar (same `timeline='auto'|'always'|'never'` +
 * `timelineMinDurationSeconds` logic), so consumers don't re-implement it.
 *
 * @example
 * ```html
 * <ng-template rkPlayerTimeline let-item let-state="timelineState">
 *   <my-scrub-bar [state]="state" />
 * </ng-template>
 * ```
 */
@Directive({ selector: '[rkPlayerTimeline]', standalone: true })
export class RkPlayerTimelineDirective<
  T extends BaseContentItem = ContentItem,
> {
  readonly templateRef =
    inject<TemplateRef<PlayerTimelineContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T extends BaseContentItem>(
    _dir: RkPlayerTimelineDirective<T>,
    ctx: unknown,
  ): ctx is PlayerTimelineContext<T> {
    return true;
  }
}

/**
 * Template slot for custom navigation arrows inside the nested horizontal slider.
 */
@Directive({ selector: '[rkPlayerNestedNavigation]', standalone: true })
export class RkPlayerNestedNavigationDirective {
  readonly templateRef =
    inject<TemplateRef<PlayerNestedNavigationContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkPlayerNestedNavigationDirective,
    ctx: unknown,
  ): ctx is PlayerNestedNavigationContext {
    return true;
  }
}

export interface PlayerLoadingContext {
  /** Zero-based index of the currently active slide. */
  $implicit: number;

  /** The currently active content item. */
  item: BaseContentItem;

  /** Active index within nested slider, or null. */
  innerActiveIndex: number | null;
}

@Directive({ selector: '[rkPlayerLoading]' })
export class RkPlayerLoadingDirective {
  readonly templateRef = inject<TemplateRef<PlayerLoadingContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkPlayerLoadingDirective,
    ctx: unknown,
  ): ctx is PlayerLoadingContext {
    return true;
  }
}

export interface PlayerErrorContext {
  /** Zero-based index of the currently active slide. */
  $implicit: number;

  /** The currently active content item. */
  item: BaseContentItem;

  /** Active index within nested slider, or null. */
  innerActiveIndex: number | null;
}

@Directive({ selector: '[rkPlayerError]' })
export class RkPlayerErrorDirective {
  readonly templateRef = inject<TemplateRef<PlayerErrorContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _dir: RkPlayerErrorDirective,
    ctx: unknown,
  ): ctx is PlayerErrorContext {
    return true;
  }
}

export const PLAYER_TEMPLATE_SLOT_DIRECTIVES = [
  RkPlayerSlideDirective,
  RkPlayerSlideOverlayDirective,
  RkPlayerControlsDirective,
  RkPlayerTimelineDirective,
  RkPlayerNavigationDirective,
  RkPlayerNestedSlideDirective,
  RkPlayerNestedNavigationDirective,
] as const;

export type { MediaItem };
