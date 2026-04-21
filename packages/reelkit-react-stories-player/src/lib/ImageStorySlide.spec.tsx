import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageStorySlide } from './ImageStorySlide';

describe('ImageStorySlide', () => {
  it('renders an img element with the provided src', () => {
    const { container } = render(<ImageStorySlide src="test.jpg" />);
    const img = container.querySelector('img');
    expect(img).toBeTruthy();
    expect(img!.src).toContain('test.jpg');
  });

  it('calls onLoad when the image loads', () => {
    const onLoad = vi.fn();
    const { container } = render(
      <ImageStorySlide src="test.jpg" onLoad={onLoad} />,
    );
    const img = container.querySelector('img')!;
    act(() => {
      img.dispatchEvent(new Event('load'));
    });
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError when the image fails to load', () => {
    const onError = vi.fn();
    const { container } = render(
      <ImageStorySlide src="broken.jpg" onError={onError} />,
    );
    const img = container.querySelector('img')!;
    act(() => {
      img.dispatchEvent(new Event('error'));
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('hides the image on error', () => {
    const { container } = render(
      <ImageStorySlide src="broken.jpg" onError={vi.fn()} />,
    );
    const img = container.querySelector('img')!;
    act(() => {
      img.dispatchEvent(new Event('error'));
    });
    expect(img.style.display).toBe('none');
  });

  it('applies aspect ratio style when provided', () => {
    const { container } = render(
      <ImageStorySlide src="test.jpg" aspectRatio={0.75} />,
    );
    const img = container.querySelector('img')!;
    expect(img.style.aspectRatio).toBe('0.75');
  });

  it('applies the shared stories image class', () => {
    const { container } = render(<ImageStorySlide src="test.jpg" />);
    const img = container.querySelector('img')!;
    expect(img.classList.contains('rk-stories-image')).toBe(true);
  });

  it('sets draggable to false', () => {
    const { container } = render(<ImageStorySlide src="test.jpg" />);
    const img = container.querySelector('img')!;
    expect(img.draggable).toBe(false);
  });
});
