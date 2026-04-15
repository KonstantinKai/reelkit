import React, { type CSSProperties } from 'react';

/**
 * Props for the {@link ImageSlide} component.
 */
export interface ImageSlideProps {
  /** URL of the image to display. */
  src: string;

  /** [width, height] in pixels. */
  size: [number, number];

  /** Additional CSS class for the root container. */
  className?: string;

  /** Additional inline styles merged onto the root container. */
  style?: CSSProperties;

  /** CSS class for the `<img>` element. */
  imgClassName?: string;

  /** Inline styles merged onto the `<img>` element. */
  imgStyle?: CSSProperties;

  /** Additional props spread onto the `<img>` element (e.g. `alt`, `loading`, `onLoad`). */
  imageProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

/**
 * Renders a single image slide with `object-fit: cover` and lazy loading.
 *
 * Can be used standalone inside a `renderSlide` callback for custom
 * image slides with your own styles.
 *
 * @example
 * ```tsx
 * <ImageSlide
 *   src="/photo.jpg"
 *   size={[400, 700]}
 *   style={{ backgroundColor: '#1a1a1a' }}
 *   imgStyle={{ objectFit: 'contain' }}
 * />
 * ```
 */
const ImageSlide: React.FC<ImageSlideProps> = ({
  src,
  size,
  className,
  style,
  imgClassName,
  imgStyle,
  imageProps,
}) => {
  return (
    <div
      className={className}
      style={{
        width: size[0],
        height: size[1],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        overflow: 'hidden',
        ...style,
      }}
    >
      <img
        alt=""
        loading="lazy"
        {...imageProps}
        src={src}
        className={imgClassName}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          ...imgStyle,
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          imageProps?.onError?.(e);
        }}
      />
    </div>
  );
};

export default ImageSlide;
