import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  linkedSignal,
} from '@angular/core';

/**
 * Renders a single image slide with `object-fit: cover` and lazy loading.
 *
 * Shows a poster/placeholder while the image loads and hides it once the
 * image is ready. Falls back to displaying the poster (or a dark background)
 * permanently when the image fails to load.
 *
 * @example
 * ```html
 * <rk-image-slide [src]="item.src" [isActive]="isActive" />
 * ```
 */
@Component({
  selector: 'rk-image-slide',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display:block;width:100%;height:100%' },
  template: `
    <div
      class="rk-image-slide-container"
      [attr.aria-hidden]="!isActive() || null"
      [style.width.px]="width()"
      [style.height.px]="height()"
    >
      @if (poster()) {
        <img
          [src]="poster()!"
          alt=""
          class="rk-image-slide-poster"
          [class.rk-visible]="isLoading() || hasError()"
        />
      }
      @if (!hasError()) {
        <img
          [attr.alt]="alt() || null"
          loading="lazy"
          [src]="src()"
          class="rk-image-slide-img"
          [class.rk-visible]="!isLoading()"
          (load)="onLoad()"
          (error)="onError()"
        />
      }
    </div>
  `,
  styles: [
    `
      .rk-image-slide-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        overflow: hidden;
      }

      .rk-image-slide-poster {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        z-index: 2;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .rk-image-slide-poster.rk-visible {
        opacity: 1;
      }

      .rk-image-slide-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .rk-image-slide-img.rk-visible {
        opacity: 1;
      }
    `,
  ],
})
export class RkImageSlideComponent {
  readonly src = input.required<string>();
  readonly poster = input<string | undefined>(undefined);
  /** Descriptive alt text for the image. Empty string marks it as decorative. */
  readonly alt = input<string>('');
  readonly isActive = input<boolean>(false);
  readonly width = input<number>(0);
  readonly height = input<number>(0);

  /**
   * Automatically resets to `true` whenever `src` changes, so the poster
   * re-appears while the new image loads. Uses `linkedSignal` to avoid the
   * `OnChanges` lifecycle hook.
   */
  protected readonly isLoading = linkedSignal(() => {
    void this.src();
    return true;
  });

  /**
   * Automatically resets to `false` whenever `src` changes, clearing any
   * previous load error when the source is replaced.
   */
  protected readonly hasError = linkedSignal(() => {
    void this.src();
    return false;
  });

  protected onLoad(): void {
    this.isLoading.set(false);
    this.hasError.set(false);
  }

  protected onError(): void {
    this.isLoading.set(false);
    this.hasError.set(true);
  }
}
