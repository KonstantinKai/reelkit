import React from 'react';

interface ImageSlideProps {
  src: string;
  size: [number, number];
}

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
