import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ImageSlide from './ImageSlide';

describe('ImageSlide', () => {
  it('renders an img with correct src', () => {
    const { container } = render(
      <ImageSlide src="https://example.com/photo.jpg" size={[400, 600]} />,
    );

    const img = container.querySelector('img')!;
    expect(img.src).toBe('https://example.com/photo.jpg');
  });

  it('renders container with correct dimensions', () => {
    const { container } = render(
      <ImageSlide src="https://example.com/photo.jpg" size={[400, 600]} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('600px');
  });

  it('sets lazy loading on img', () => {
    const { container } = render(
      <ImageSlide src="https://example.com/photo.jpg" size={[400, 600]} />,
    );

    const img = container.querySelector('img')!;
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('applies object-fit cover', () => {
    const { container } = render(
      <ImageSlide src="https://example.com/photo.jpg" size={[400, 600]} />,
    );

    const img = container.querySelector('img')!;
    expect(img.style.objectFit).toBe('cover');
  });

  it('has black background on container', () => {
    const { container } = render(
      <ImageSlide src="https://example.com/photo.jpg" size={[400, 600]} />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('rgb(0, 0, 0)');
  });

  describe('imageProps', () => {
    it('spreads additional props onto img element', () => {
      const { container } = render(
        <ImageSlide
          src="https://example.com/photo.jpg"
          size={[400, 600]}
          imageProps={
            {
              'data-testid': 'slide-img',
              draggable: false,
            } as React.ImgHTMLAttributes<HTMLImageElement>
          }
        />,
      );

      const img = container.querySelector('img')!;
      expect(img.getAttribute('data-testid')).toBe('slide-img');
      expect(img.draggable).toBe(false);
    });

    it('overrides default alt via imageProps', () => {
      const { container } = render(
        <ImageSlide
          src="https://example.com/photo.jpg"
          size={[400, 600]}
          imageProps={{ alt: 'Mountain landscape' }}
        />,
      );

      const img = container.querySelector('img')!;
      expect(img.alt).toBe('Mountain landscape');
    });

    it('overrides default loading via imageProps', () => {
      const { container } = render(
        <ImageSlide
          src="https://example.com/photo.jpg"
          size={[400, 600]}
          imageProps={{ loading: 'eager' }}
        />,
      );

      const img = container.querySelector('img')!;
      expect(img.getAttribute('loading')).toBe('eager');
    });

    it('src prop takes precedence over imageProps.src', () => {
      const { container } = render(
        <ImageSlide
          src="https://example.com/correct.jpg"
          size={[400, 600]}
          imageProps={{ src: 'https://example.com/wrong.jpg' }}
        />,
      );

      const img = container.querySelector('img')!;
      expect(img.src).toBe('https://example.com/correct.jpg');
    });

    it('imgStyle takes precedence over imageProps.style', () => {
      const { container } = render(
        <ImageSlide
          src="https://example.com/photo.jpg"
          size={[400, 600]}
          imgStyle={{ objectFit: 'contain' }}
          imageProps={{ style: { objectFit: 'fill' } }}
        />,
      );

      const img = container.querySelector('img')!;
      expect(img.style.objectFit).toBe('contain');
    });
  });
});
