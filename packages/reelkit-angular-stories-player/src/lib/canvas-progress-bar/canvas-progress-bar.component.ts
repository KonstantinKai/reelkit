import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  afterRenderEffect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import {
  createDisposableList,
  reaction,
  type CoreSignal,
} from '@reelkit/angular';
import {
  createCanvasProgressRenderer,
  type CanvasProgressRendererConfig,
} from '@reelkit/stories-core';

/**
 * Segmented progress bar for a group of stories, drawn on a canvas.
 *
 * A thin wrapper around the framework-free renderer from
 * `@reelkit/stories-core`. The draw loop runs outside Angular: it repaints on
 * every frame while a story plays, and nothing about that needs change
 * detection.
 */
@Component({
  selector: 'rk-canvas-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="rk-stories-progress-bar">
      <canvas #canvas></canvas>
    </div>
  `,
})
export class RkCanvasProgressBarComponent {
  private readonly _ngZone = inject(NgZone);

  private readonly _canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  /** Number of segments, one per story in the group. */
  readonly totalStories = input.required<number>();

  /** Which story is playing, straight from the stories controller. */
  readonly activeIndex = input.required<CoreSignal<number>>();

  /** Timer progress through that story, from 0 to 1. */
  readonly progress = input.required<CoreSignal<number>>();

  /**
   * Gap in pixels between segments.
   *
   * @default 2
   */
  readonly gap = input<number | undefined>(undefined);

  /**
   * Bar height in pixels.
   *
   * @default 2
   */
  readonly barHeight = input<number | undefined>(undefined);

  /**
   * Narrowest a segment may get before the bar shows a sliding window of the
   * group instead of every story at once.
   *
   * @default 8
   */
  readonly minSegmentWidth = input<number | undefined>(undefined);

  /** Colour of the unfilled segments. */
  readonly bgColor = input<string | undefined>(undefined);

  /** Colour of the played and playing segments. */
  readonly fillColor = input<string | undefined>(undefined);

  /**
   * Whether the bar redraws on every animation frame to follow a running
   * timer. A bar that is not live draws only when its signals change or its
   * container resizes, which is all a bar showing a paused group needs.
   *
   * @default true
   */
  readonly live = input(true);

  /** An input left unset reaches the renderer as undefined and takes its default. */
  private _rendererConfig(): CanvasProgressRendererConfig {
    return {
      gap: this.gap(),
      barHeight: this.barHeight(),
      minSegmentWidth: this.minSegmentWidth(),
      bgColor: this.bgColor(),
      fillColor: this.fillColor(),
    };
  }

  constructor() {
    afterRenderEffect((onCleanup) => {
      // The effect restarts only when the bar is handed another story count,
      // other signals or a different `live`. A timer tick changes what a
      // signal holds, never which signal the input holds, so it never
      // restarts the effect.
      const totalStories = this.totalStories();
      const activeIndex = this.activeIndex();
      const progress = this.progress();
      const live = this.live();
      const canvas = untracked(() => this._canvasRef().nativeElement);
      const renderer = untracked(() =>
        createCanvasProgressRenderer(this._rendererConfig()),
      );

      renderer.attach(canvas);

      const draw = (): void =>
        renderer.draw(totalStories, activeIndex.value, progress.value);

      const disposables = createDisposableList();

      if (live) {
        let frame = 0;
        const loop = (): void => {
          draw();
          frame = requestAnimationFrame(loop);
        };

        disposables.push(
          reaction(() => [activeIndex], draw),
          () => cancelAnimationFrame(frame),
        );

        this._ngZone.runOutsideAngular(() => {
          frame = requestAnimationFrame(loop);
        });
      } else {
        // Resizing the canvas clears it. This observer is created after the
        // renderer's own, and observers are notified in the order they were
        // created, so the bar is repainted after the renderer has measured.
        const resizeObserver = new ResizeObserver(draw);
        if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

        disposables.push(
          reaction(() => [activeIndex, progress], draw),
          () => resizeObserver.disconnect(),
        );

        draw();
      }

      disposables.push(renderer.dispose);

      // Angular ignores a function returned from this effect; cleanup has to
      // be registered here, or the previous animation loop keeps painting the
      // canvas.
      onCleanup(disposables.dispose);
    });
  }
}
