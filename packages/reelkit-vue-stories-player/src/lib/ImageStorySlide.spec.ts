import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { ImageStorySlide } from './ImageStorySlide';

describe('ImageStorySlide', () => {
  it('renders an img element with the provided src', () => {
    const img = mount(ImageStorySlide, { props: { src: 'test.jpg' } })
      .element as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.src).toContain('test.jpg');
  });

  it('calls onLoad when the image loads', () => {
    const onLoad = vi.fn();
    const img = mount(ImageStorySlide, { props: { src: 'test.jpg', onLoad } })
      .element as HTMLImageElement;
    img.dispatchEvent(new Event('load'));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it('calls onError and hides the image when it fails to load', () => {
    const onError = vi.fn();
    const img = mount(ImageStorySlide, {
      props: { src: 'broken.jpg', onError },
    }).element as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    expect(onError).toHaveBeenCalledTimes(1);
    expect(img.style.display).toBe('none');
  });

  it('applies aspect ratio style when provided', () => {
    const img = mount(ImageStorySlide, {
      props: { src: 'test.jpg', aspectRatio: 0.75 },
    }).element as HTMLImageElement;
    expect(img.style.aspectRatio).toBe('0.75');
  });

  it('applies the shared stories image class and is not draggable', () => {
    const img = mount(ImageStorySlide, { props: { src: 'test.jpg' } })
      .element as HTMLImageElement;
    expect(img.classList.contains('rk-stories-image')).toBe(true);
    expect(img.draggable).toBe(false);
  });
});
