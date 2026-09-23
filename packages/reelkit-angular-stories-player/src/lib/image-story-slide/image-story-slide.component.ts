import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  output,
} from '@angular/core';

/** One image story, drawn cover-fit so a source of any shape fills the canvas. */
@Component({
  selector: 'rk-image-story-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <img
      [src]="src()"
      alt=""
      draggable="false"
      class="rk-stories-image"
      [style.aspect-ratio]="aspectRatio()"
      (load)="loaded.emit()"
      (error)="onImageError($event)"
    />
  `,
})
export class RkImageStorySlideComponent {
  /** Drawn cover-fit, so a source of any shape fills the story canvas. */
  readonly src = input.required<string>();

  /** Width over height. Reserves the box before the image arrives. */
  readonly aspectRatio = input<number | undefined>(undefined);

  /** The player starts the auto-advance timer on this, not on render. */
  readonly loaded = output<void>();

  /** A broken image is hidden rather than shown; the player takes it from here. */
  readonly failed = output<void>();

  protected onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
    this.failed.emit();
  }
}
