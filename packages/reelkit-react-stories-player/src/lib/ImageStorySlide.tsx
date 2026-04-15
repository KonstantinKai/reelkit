import type { FC } from 'react';

/** Props for the {@link ImageStorySlide} component. */
export interface ImageStorySlideProps {
  /** Image source URL. */
  src: string;

  /** Optional aspect ratio (width / height) for the image. */
  aspectRatio?: number;

  /** Called when the image finishes loading. */
  onLoad?: () => void;

  /** Called when the image fails to load. */
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
    onLoad={onLoad}
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
      onError?.();
    }}
    style={{
      objectFit: 'cover',
      width: '100%',
      height: '100%',
      aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
    }}
  />
);
