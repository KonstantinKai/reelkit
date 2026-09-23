import type { FC } from 'react';

/** Props for the {@link ImageStorySlide} component. */
export interface ImageStorySlideProps {
  /** Drawn cover-fit, so a source of any shape fills the story canvas. */
  src: string;

  /** Width over height. Reserves the box before the image arrives. */
  aspectRatio?: number;

  /** The player starts the auto-advance timer on this, not on mount. */
  onLoad?: () => void;

  /** A broken image is hidden rather than shown; the player takes it from here. */
  onError?: () => void;
}

/**
 * Renders a single image story slide with cover-fit sizing.
 */
export const ImageStorySlide: FC<ImageStorySlideProps> = ({
  src,
  aspectRatio,
  onLoad,
  onError,
}) => (
  <img
    src={src}
    alt=""
    draggable={false}
    className="rk-stories-image"
    onLoad={onLoad}
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
      onError?.();
    }}
    style={aspectRatio ? { aspectRatio: `${aspectRatio}` } : undefined}
  />
);
