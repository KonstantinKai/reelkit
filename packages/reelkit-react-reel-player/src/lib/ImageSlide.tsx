import React from 'react';

/** @internal */
interface ImageSlideProps {
  /** URL of the image to display. */
  src: string;
  /** [width, height] in pixels. */
  size: [number, number];
}

/**
 * Renders a single image slide with `object-fit: cover` and lazy loading.
 * @internal Used by {@link MediaSlide} and {@link NestedSlider}.
 */
const ImageSlide: React.FC<ImageSlideProps> = ({ src, size }) => {
  return (
    <div
      style={{
        width: size[0],
        height: size[1],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        loading="lazy"
      />
    </div>
  );
};

export default ImageSlide;
