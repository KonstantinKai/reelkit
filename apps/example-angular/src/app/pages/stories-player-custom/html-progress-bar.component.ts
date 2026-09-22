import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { toAngularSignal, type CoreSignal } from '@reelkit/angular';

/**
 * A progress bar drawn from plain elements, for the progress bar slot demo.
 * The player hands over its own signals, which are bridged into Angular here
 * so the segments follow the timer rather than a copy taken once.
 */
@Component({
  selector: 'app-html-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
        display: flex;
        gap: 4px;
        padding: 8px 8px 0;
      }

      .segment {
        flex: 1;
        height: 3px;
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.25);
        overflow: hidden;
      }

      .fill {
        height: 100%;
        border-radius: 2px;
        background: linear-gradient(90deg, #6366f1, #a78bfa);
        transition: width 200ms;
      }

      /* The story being watched has no transition: the timer drives its width
         every frame, and an ease would trail behind it the whole way. */
      .fill--watching {
        transition: none;
      }

      /* A story already finished sits flat rather than in the live gradient. */
      .fill--past {
        background: #6366f1;
      }
    `,
  ],
  template: `
    <div class="bar">
      @for (segment of segments(); track $index) {
        <div class="segment">
          <div
            class="fill"
            [class.fill--watching]="$index === activeIndexNow()"
            [class.fill--past]="$index < activeIndexNow()"
            [style.width.%]="segment"
          ></div>
        </div>
      }
    </div>
  `,
})
export class HtmlProgressBarComponent {
  readonly totalStories = input.required<number>();
  readonly activeIndex = input.required<CoreSignal<number>>();
  readonly progress = input.required<CoreSignal<number>>();

  private readonly _destroyRef = inject(DestroyRef);

  // The bridge is built from the input alone, and read one step later, so a
  // tick of the timer does not rebuild the bridge that reported it.
  private readonly _activeBridge = computed(() =>
    toAngularSignal(this.activeIndex(), this._destroyRef),
  );
  private readonly _progressBridge = computed(() =>
    toAngularSignal(this.progress(), this._destroyRef),
  );

  private readonly _active = computed(() => this._activeBridge()());
  private readonly _progress = computed(() => this._progressBridge()());

  protected readonly activeIndexNow = computed(() => this._active());

  protected readonly segments = computed(() => {
    const active = this._active();
    const progress = this._progress();
    return Array.from({ length: this.totalStories() }, (_, index) =>
      index < active ? 100 : index === active ? progress * 100 : 0,
    );
  });
}
