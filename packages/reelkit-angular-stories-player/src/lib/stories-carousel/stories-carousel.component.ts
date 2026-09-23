import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  output,
  signal,
  type TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toAngularSignal, type CoreSignal } from '@reelkit/angular';
import {
  formatTimeAgo,
  getCardOffsets,
  getCardSize,
  getCarouselSlot,
  getPreviewSource,
  getRingPresentation,
  getSlideGroupIndexes,
  getSlotOffset,
  isCardShown,
  type StoryItem,
  type StoriesGroup,
} from '@reelkit/stories-core';
import type { StoriesGroupPreviewContext, StoriesSlideContext } from '../types';

/** Ring diameter on a carousel card. */
const _kCardRingSize = 52;

/**
 * A group change in progress. `start` lays the cards out around the group
 * being left, with no transition; `run` moves them to their places around the
 * group being opened, which is what the cards animate across.
 */
export interface CarouselSlide {
  /** Index of the group being left. */
  from: number;

  /** Index of the group being opened. */
  to: number;

  /**
   * `start` for the first frame, laid out around `from` with transitions off;
   * `run` once the cards are moving to their places around `to`.
   */
  phase: 'start' | 'run';
}

/** One card, ready to draw: where it sits and what it shows. */
interface CardView<T extends StoryItem> {
  groupIndex: number;
  group: StoriesGroup<T>;
  story: T | undefined;
  offset: number;
  visible: boolean;
  focusable: boolean;
  transform: string;
  previewSource: string | undefined;

  /**
   * Whether the frame — the consumer's slide template, scaled down — is what
   * this card should draw. Only for a story with no picture of its own. A
   * story whose picture failed to load is not one of those: drawing its slide
   * would paint the card in whatever that slide paints a story with media,
   * where the plain card is what it should look like.
   */
  showFrame: boolean;
  ringClassName: string;
  ringStyle: Record<string, string>;
  ringAvatarSize: number;
  timeAgo: string;
  viewedCount: number;
}

/**
 * Side cards of the desktop carousel.
 *
 * At rest it draws the groups either side of the active story, which the
 * player itself fills. During a group change it also draws the groups at both
 * ends in the centre slot and slides every card from its place around the old
 * group to its place around the new one.
 *
 * @internal The player owns every value here; the carousel draws cards and
 * reports clicks and the end of a slide.
 */
@Component({
  selector: 'rk-stories-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  template: `
    <div
      class="rk-stories-carousel"
      [class.rk-stories-carousel--instant]="slide()?.phase === 'start'"
    >
      @for (card of cards(); track card.groupIndex) {
        <div
          class="rk-stories-card"
          [class.rk-stories-card--center]="card.offset === 0"
          [class.rk-stories-card--hidden]="!card.visible"
          [style.width.px]="cardSize()[0]"
          [style.height.px]="cardSize()[1]"
          [style.transform]="card.transform"
          (transitionend)="onTransitionEnd($event, card.groupIndex)"
        >
          @if (previewTpl(); as tpl) {
            <ng-container
              [ngTemplateOutlet]="tpl"
              [ngTemplateOutletContext]="previewContext(card)"
            />
          } @else {
            <!-- A story with no picture of its own — text on a gradient, say —
                 is drawn by the consumer's own slide template at the player's
                 size and scaled down to the card. It is a picture of the
                 story, so nothing in it is reachable. It sits under the
                 button, never inside it: a slide template can hold buttons
                 and links of its own, and a control cannot sit inside
                 another. -->
            @if (
              !card.previewSource && card.showFrame && frameTemplate();
              as tpl
            ) {
              @if (frameContext()(card.groupIndex); as context) {
                <span
                  class="rk-stories-card-frame"
                  aria-hidden="true"
                  inert
                  [style.width.px]="activeSize()[0]"
                  [style.height.px]="activeSize()[1]"
                  [style.transform]="'scale(' + frameScale() + ')'"
                >
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="context"
                  />
                </span>
              }
            }
            <button
              type="button"
              class="rk-stories-card-button"
              [attr.aria-label]="'Open stories by ' + card.group.author.name"
              [attr.tabindex]="card.focusable ? 0 : -1"
              (click)="opened.emit(card.groupIndex)"
            >
              @if (card.previewSource) {
                <img
                  class="rk-stories-card-image"
                  [src]="card.previewSource"
                  alt=""
                  (error)="onPreviewFailed(card.previewSource)"
                />
              }
              <span class="rk-stories-card-scrim"></span>
              <span class="rk-stories-card-info">
                <span [class]="card.ringClassName" [style]="card.ringStyle">
                  <img
                    class="rk-stories-ring-avatar"
                    [src]="card.group.author.avatar"
                    alt=""
                    [width]="card.ringAvatarSize"
                    [height]="card.ringAvatarSize"
                  />
                </span>
                <span class="rk-stories-card-name">{{
                  card.group.author.name
                }}</span>
                @if (card.timeAgo) {
                  <span class="rk-stories-card-time">{{ card.timeAgo }}</span>
                }
              </span>
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class RkStoriesCarouselComponent<T extends StoryItem = StoryItem> {
  private readonly _destroyRef = inject(DestroyRef);

  /** Every group the player shows, in player order. */
  readonly groups = input.required<StoriesGroup<T>[]>();

  /**
   * Group the player is on. At rest the cards lay out around it; during a
   * slide the slide decides the layout instead.
   */
  readonly activeGroupIndex = input.required<number>();

  /** The group change in progress, or null while the cards are at rest. */
  readonly slide = input<CarouselSlide | null>(null);

  /**
   * Player canvas size as `[width, height]`. Card size and every slot position
   * come from it, so the cards follow a window resize.
   */
  readonly activeSize = input.required<[number, number]>();

  /** Which story a group's card previews. */
  readonly storyIndexFor = input.required<(groupIndex: number) => number>();

  /** Stories seen per author, when the player was given a viewed controller. */
  readonly viewedState = input<CoreSignal<Map<string, number>> | undefined>(
    undefined,
  );

  /** The template that replaces a card's content, when one was supplied. */
  readonly previewTemplate = input<
    TemplateRef<StoriesGroupPreviewContext<T>> | undefined
  >(undefined);

  /**
   * The player's own slide template, for drawing a card whose story has no
   * picture to preview. Left out, such a card shows the author alone.
   */
  readonly frameTemplate = input<
    TemplateRef<StoriesSlideContext<T>> | undefined
  >(undefined);

  /**
   * The slide context for a card's frame, or null when that group's story is
   * one the carousel does not draw — a video, which the player shows through
   * one shared element.
   */
  readonly frameContext = input<
    (groupIndex: number) => StoriesSlideContext<T> | null
  >(() => null);

  /** A card was clicked; the player opens that group. */
  readonly opened = output<number>();

  /** The sliding cards have arrived. */
  readonly slideEnded = output<void>();

  protected readonly cardSize = computed(() => getCardSize(this.activeSize()));

  /** Player-sized content, shrunk to the card it is drawn on. */
  protected readonly frameScale = computed(
    () => this.cardSize()[1] / this.activeSize()[1],
  );

  protected readonly previewTpl = computed(
    () => this.previewTemplate() ?? null,
  );

  /**
   * The viewed store, bridged to an Angular signal. The bridge is built from
   * the input alone, so the counts changing does not build a second one and
   * leave the first subscribed for the life of the carousel.
   */
  private readonly _viewedCounts = computed(() => {
    const state = this.viewedState();
    return state ? toAngularSignal(state, this._destroyRef) : undefined;
  });

  /**
   * Sources that would not load. A card whose picture fails falls back to the
   * plain card the player already draws for a story with nothing to preview,
   * rather than to the browser's broken-image mark. Kept by source rather than
   * by group so a feed that grows or reorders carries the answer with it.
   */
  private readonly _failedPreviews = signal<ReadonlySet<string>>(new Set());

  protected onPreviewFailed(source: string | undefined): void {
    if (!source) return;
    this._failedPreviews.update((failed) =>
      failed.has(source) ? failed : new Set(failed).add(source),
    );
  }

  protected readonly cards = computed<CardView<T>[]>(() => {
    const groups = this.groups();
    const slide = this.slide();
    const activeGroupIndex = this.activeGroupIndex();
    const activeSize = this.activeSize();
    const [, cardHeight] = this.cardSize();
    const viewed = this._viewedCounts()?.();
    const failedPreviews = this._failedPreviews();

    const base = slide
      ? slide.phase === 'start'
        ? slide.from
        : slide.to
      : activeGroupIndex;

    const groupIndexes = slide
      ? getSlideGroupIndexes(slide.from, slide.to, groups.length)
      : getCardOffsets(activeGroupIndex, groups.length).map(
          (offset) => activeGroupIndex + offset,
        );

    return groupIndexes.flatMap((groupIndex) => {
      const group = groups[groupIndex];
      if (!group) return [];

      const offset = groupIndex - base;
      const visible = isCardShown(offset);
      const slot = getCarouselSlot(getSlotOffset(offset), activeSize);
      const story = group.stories[this.storyIndexFor()(groupIndex)];
      const candidate = getPreviewSource(story);
      const viewedCount = viewed?.get(group.author.id) ?? 0;
      const ring = getRingPresentation({
        totalStories: group.stories.length,
        viewedCount,
        size: _kCardRingSize,
      });

      return [
        {
          groupIndex,
          group,
          story,
          offset,
          visible,
          focusable: slide === null && visible,
          transform: `translate(-50%, -50%) translateX(${slot.x}px) scale(${
            slot.height / cardHeight
          })`,
          previewSource:
            candidate && !failedPreviews.has(candidate) ? candidate : undefined,
          showFrame: !candidate,
          ringClassName: ring.className,
          ringStyle: ring.style as Record<string, string>,
          ringAvatarSize: ring.avatarSize,
          timeAgo: story?.createdAt ? formatTimeAgo(story.createdAt) : '',
          viewedCount,
        },
      ];
    });
  });

  protected previewContext(card: CardView<T>): StoriesGroupPreviewContext<T> {
    return {
      $implicit: card.group,
      groupIndex: card.groupIndex,
      story: card.story,
      offset: card.offset,
      viewedCount: card.viewedCount,
      onOpen: () => this.opened.emit(card.groupIndex),
    };
  }

  /**
   * Only the card arriving in the centre ends the slide, and only on its own
   * transform: a card's children animate too, and a scrim finishing first
   * would end the slide before the cards had moved.
   */
  protected onTransitionEnd(event: TransitionEvent, groupIndex: number): void {
    const slide = this.slide();
    if (
      slide?.phase === 'run' &&
      groupIndex === slide.to &&
      event.propertyName === 'transform' &&
      event.target === event.currentTarget
    ) {
      this.slideEnded.emit();
    }
  }
}
