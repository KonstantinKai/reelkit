import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  RkImageStorySlideComponent,
  RkVideoStorySlideComponent,
} from '@reelkit/angular-stories-player';
import type { CoreSignal } from '@reelkit/angular';
import type { CustomStory } from './stories-feed';

/**
 * The demo's slide: a story with a title and an emoji over its media, or over
 * a gradient when it has none, the way a promo story looks. Without it the
 * feed's text-only stories are an image slide with nothing to show.
 */
@Component({
  selector: 'app-story-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RkImageStorySlideComponent, RkVideoStorySlideComponent],
  styles: [
    `
      .slide {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .media {
        position: absolute;
        inset: 0;
      }

      .counter {
        position: absolute;
        bottom: 48px;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 1;
        color: #fff;
        font-size: 64px;
        font-weight: 800;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      }

      .copy {
        position: relative;
        z-index: 1;
        text-align: center;
        padding: 0 32px;
      }

      .copy.shaded {
        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.7);
      }

      .emoji {
        font-size: 56px;
        margin-bottom: 16px;
      }

      .title {
        color: #fff;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
        line-height: 1.2;
      }

      .subtitle {
        color: rgba(255, 255, 255, 0.85);
        font-size: 16px;
        line-height: 1.4;
      }

      .cta {
        margin-top: 24px;
        padding: 10px 28px;
        background: #fff;
        color: #000;
        border-radius: 24px;
        font-weight: 600;
        font-size: 14px;
        display: inline-block;
      }
    `,
  ],
  template: `
    @let item = story();
    <div
      class="slide"
      [style.width.px]="size()[0]"
      [style.height.px]="size()[1]"
      [style.background]="hasMedia() ? '#000' : (item.bgGradient ?? '#222')"
    >
      @if (hasImage()) {
        <div class="media">
          <rk-image-story-slide
            [src]="item.src"
            (loaded)="onReady()()"
            (failed)="onError()()"
          />
        </div>
      }

      @if (isVideo()) {
        <div class="media">
          <rk-video-story-slide
            [src]="item.src"
            [poster]="item.poster"
            [groupIndex]="groupIndex()"
            [storyIndex]="index()"
            [activeGroupIndex]="activeGroupIndex()"
            [activeStoryIndex]="activeStoryIndex()"
            (durationReady)="onDurationReady()($event)"
            (playbackStarted)="onReady()()"
            (buffering)="onWaiting()()"
            (finished)="onEnded()()"
            (failed)="onError()()"
          />
        </div>
      }

      @if (isPerfStory()) {
        <div class="counter">{{ index() + 1 }} / 100</div>
      }

      @if (item.title || item.emoji) {
        <div class="copy" [class.shaded]="hasMedia()">
          @if (item.emoji) {
            <div class="emoji">{{ item.emoji }}</div>
          }
          @if (item.title) {
            <div class="title">{{ item.title }}</div>
          }
          @if (item.subtitle) {
            <div class="subtitle">{{ item.subtitle }}</div>
          }
          @if (item.ctaText) {
            <div role="button" class="cta">{{ item.ctaText }}</div>
          }
        </div>
      }
    </div>
  `,
})
export class StoryCardComponent {
  readonly story = input.required<CustomStory>();
  readonly index = input.required<number>();
  readonly groupIndex = input.required<number>();
  readonly size = input.required<[number, number]>();
  readonly activeGroupIndex = input.required<CoreSignal<number>>();
  readonly activeStoryIndex = input.required<CoreSignal<number>>();

  readonly onReady = input.required<() => void>();
  readonly onError = input.required<() => void>();
  readonly onWaiting = input.required<() => void>();
  readonly onEnded = input.required<() => void>();
  readonly onDurationReady = input.required<(durationMs: number) => void>();

  protected readonly hasImage = computed(() => {
    const item = this.story();
    return item.mediaType === 'image' && item.src.length > 0;
  });

  protected readonly isVideo = computed(
    () => this.story().mediaType === 'video',
  );

  protected readonly hasMedia = computed(
    () => this.hasImage() || this.isVideo(),
  );

  protected readonly isPerfStory = computed(() =>
    this.story().id.startsWith('perf-'),
  );
}
