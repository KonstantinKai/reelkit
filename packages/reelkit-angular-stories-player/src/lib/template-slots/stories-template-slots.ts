/* eslint-disable @typescript-eslint/no-unused-vars */
import { Directive, inject, TemplateRef } from '@angular/core';
import type {
  StoryItem,
  StoriesSlideContext,
  StoriesHeaderContext,
  StoriesFooterContext,
  StoriesProgressBarContext,
  StoriesNavigationContext,
  StoriesGroupPreviewContext,
  StoriesLoadingContext,
  StoriesErrorContext,
} from '../types';

/**
 * Marks a template as the slot that replaces the built-in image and video rendering for one story.
 *
 * The template is handed a {@link StoriesSlideContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesSlide let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesSlide]' })
export class RkStoriesSlideDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesSlideContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive: RkStoriesSlideDirective<T> | RkStoriesSlideDirective,
    context: unknown,
  ): context is StoriesSlideContext<T> {
    return true;
  }
}

/**
 * Marks a template as the slot that replaces the author row, the sound and pause controls and the close button.
 *
 * The template is handed a {@link StoriesHeaderContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesHeader let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesHeader]' })
export class RkStoriesHeaderDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesHeaderContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive: RkStoriesHeaderDirective<T> | RkStoriesHeaderDirective,
    context: unknown,
  ): context is StoriesHeaderContext<T> {
    return true;
  }
}

/**
 * Marks a template as the slot that fills the strip under the story, which is empty by default.
 *
 * The template is handed a {@link StoriesFooterContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesFooter let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesFooter]' })
export class RkStoriesFooterDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesFooterContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive: RkStoriesFooterDirective<T> | RkStoriesFooterDirective,
    context: unknown,
  ): context is StoriesFooterContext<T> {
    return true;
  }
}

/**
 * Marks a template as the slot that replaces the segmented progress bar.
 *
 * The template is handed a {@link StoriesProgressBarContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesProgressBar let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesProgressBar]' })
export class RkStoriesProgressBarDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesProgressBarContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive:
      | RkStoriesProgressBarDirective<T>
      | RkStoriesProgressBarDirective,
    context: unknown,
  ): context is StoriesProgressBarContext<T> {
    return true;
  }
}

/**
 * Marks a template as the slot that replaces the previous and next controls.
 *
 * The template is handed a {@link StoriesNavigationContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesNavigation let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesNavigation]' })
export class RkStoriesNavigationDirective {
  readonly templateRef =
    inject<TemplateRef<StoriesNavigationContext>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard(
    _directive: RkStoriesNavigationDirective,
    context: unknown,
  ): context is StoriesNavigationContext {
    return true;
  }
}

/**
 * Marks a template as the slot that replaces the content of a desktop carousel card.
 *
 * The template is handed a {@link StoriesGroupPreviewContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesGroupPreview let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesGroupPreview]' })
export class RkStoriesGroupPreviewDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesGroupPreviewContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive:
      | RkStoriesGroupPreviewDirective<T>
      | RkStoriesGroupPreviewDirective,
    context: unknown,
  ): context is StoriesGroupPreviewContext<T> {
    return true;
  }
}

/**
 * Marks a template as the slot that replaces the spinner shown while a story's media arrives.
 *
 * The template is handed a {@link StoriesLoadingContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesLoading let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesLoading]' })
export class RkStoriesLoadingDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesLoadingContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive: RkStoriesLoadingDirective<T> | RkStoriesLoadingDirective,
    context: unknown,
  ): context is StoriesLoadingContext<T> {
    return true;
  }
}

/**
 * Marks a template as the slot that replaces what is shown when a story's media fails.
 *
 * The template is handed a {@link StoriesErrorContext}; leaving the slot out keeps the
 * built-in rendering.
 *
 * @example
 * ```html
 * <rk-stories-overlay [isOpen]="open()" [groups]="groups">
 *   <ng-template rkStoriesError let-value>…</ng-template>
 * </rk-stories-overlay>
 * ```
 */
@Directive({ selector: '[rkStoriesError]' })
export class RkStoriesErrorDirective<T extends StoryItem = StoryItem> {
  readonly templateRef =
    inject<TemplateRef<StoriesErrorContext<T>>>(TemplateRef);

  /** Types the template's context for the compiler. */
  static ngTemplateContextGuard<T extends StoryItem = StoryItem>(
    _directive: RkStoriesErrorDirective<T> | RkStoriesErrorDirective,
    context: unknown,
  ): context is StoriesErrorContext<T> {
    return true;
  }
}

/**
 * Every slot directive, for a component that wants to accept all of them
 * without listing each one in its `imports`.
 */
export const STORIES_TEMPLATE_SLOT_DIRECTIVES = [
  RkStoriesSlideDirective,
  RkStoriesHeaderDirective,
  RkStoriesFooterDirective,
  RkStoriesProgressBarDirective,
  RkStoriesNavigationDirective,
  RkStoriesGroupPreviewDirective,
  RkStoriesLoadingDirective,
  RkStoriesErrorDirective,
] as const;
