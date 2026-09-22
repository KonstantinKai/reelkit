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

  /** Colours, sizes and spacing for the renderer. */
  readonly config = input<CanvasProgressRendererConfig>({});

  constructor() {
    afterRenderEffect(() => {
      // Only the segment count reshapes the bar. The two signals are read
      // inside the loop, untracked, so a tick never restarts it.
      const totalStories = this.totalStories();
      const canvas = untracked(() => this._canvasRef().nativeElement);
      const activeIndex = untracked(() => this.activeIndex());
      const progress = untracked(() => this.progress());
      const renderer = untracked(() =>
        createCanvasProgressRenderer(this.config()),
      );

      renderer.attach(canvas);

      const draw = (): void =>
        renderer.draw(totalStories, activeIndex.value, progress.value);

      let frame = 0;
      const loop = (): void => {
        draw();
        frame = requestAnimationFrame(loop);
      };

      const disposables = createDisposableList();
      disposables.push(
        reaction(() => [activeIndex], draw),
        () => cancelAnimationFrame(frame),
        renderer.dispose,
      );

      this._ngZone.runOutsideAngular(() => {
        frame = requestAnimationFrame(loop);
      });

      return () => disposables.dispose();
    });
  }
}
