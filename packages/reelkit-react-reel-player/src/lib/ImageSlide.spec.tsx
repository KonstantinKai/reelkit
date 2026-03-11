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
});
