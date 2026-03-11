import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ContentItem } from './types';

// Mock child components
vi.mock('./ImageSlide', () => ({
  default: ({ src, size }: { src: string; size: [number, number] }) => (
    <div data-testid="image-slide" data-src={src} data-size={size.join(',')} />
  ),
}));

vi.mock('./VideoSlide', () => ({
  default: ({
    src,
    poster,
    isActive,
    slideKey,
  }: {
    src: string;
    poster?: string;
    isActive: boolean;
    slideKey: string;
  }) => (
    <div
      data-testid="video-slide"
      data-src={src}
      data-poster={poster}
      data-active={isActive}
      data-slide-key={slideKey}
    />
  ),
}));

vi.mock('./NestedSlider', () => ({
  default: ({
    media,
    isParentActive,
    contentId,
  }: {
    media: unknown[];
    isParentActive: boolean;
    contentId: string;
  }) => (
    <div
      data-testid="nested-slider"
      data-media-count={media.length}
      data-active={isParentActive}
      data-content-id={contentId}
    />
  ),
}));

// eslint-disable-next-line import/first
import MediaSlide from './MediaSlide';
// eslint-disable-next-line import/first
import React from 'react';

const baseContent: ContentItem = {
  id: 'test-1',
  media: [],
  author: { name: 'Test', avatar: '' },
  likes: 0,
  description: '',
};

const size: [number, number] = [400, 700];

describe('MediaSlide', () => {
  let innerSliderRef: React.MutableRefObject<null>;

  beforeEach(() => {
    innerSliderRef = { current: null };
  });

  it('renders ImageSlide for single image', () => {
    const content: ContentItem = {
      ...baseContent,
      media: [{ id: 'm1', type: 'image', src: 'photo.jpg', aspectRatio: 1.5 }],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    const imageSlide = container.querySelector('[data-testid="image-slide"]');
    expect(imageSlide).toBeTruthy();
    expect(imageSlide!.getAttribute('data-src')).toBe('photo.jpg');
  });

  it('renders VideoSlide for single video', () => {
    const content: ContentItem = {
      ...baseContent,
      media: [
        {
          id: 'v1',
          type: 'video',
          src: 'video.mp4',
          poster: 'poster.jpg',
          aspectRatio: 0.56,
        },
      ],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    const videoSlide = container.querySelector('[data-testid="video-slide"]');
    expect(videoSlide).toBeTruthy();
    expect(videoSlide!.getAttribute('data-src')).toBe('video.mp4');
    expect(videoSlide!.getAttribute('data-poster')).toBe('poster.jpg');
  });

  it('renders NestedSlider for multiple media items', () => {
    const content: ContentItem = {
      ...baseContent,
      media: [
        { id: 'm1', type: 'image', src: 'photo1.jpg', aspectRatio: 1.5 },
        { id: 'm2', type: 'image', src: 'photo2.jpg', aspectRatio: 1.5 },
      ],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    const nestedSlider = container.querySelector('[data-testid="nested-slider"]');
    expect(nestedSlider).toBeTruthy();
    expect(nestedSlider!.getAttribute('data-media-count')).toBe('2');
  });

  it('passes isActive to VideoSlide', () => {
    const content: ContentItem = {
      ...baseContent,
      media: [
        { id: 'v1', type: 'video', src: 'video.mp4', aspectRatio: 0.56 },
      ],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={false}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    const videoSlide = container.querySelector('[data-testid="video-slide"]');
    expect(videoSlide!.getAttribute('data-active')).toBe('false');
  });

  it('passes contentId to NestedSlider', () => {
    const content: ContentItem = {
      ...baseContent,
      id: 'content-42',
      media: [
        { id: 'm1', type: 'image', src: 'a.jpg', aspectRatio: 1 },
        { id: 'm2', type: 'video', src: 'b.mp4', aspectRatio: 0.5 },
      ],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    const nestedSlider = container.querySelector('[data-testid="nested-slider"]');
    expect(nestedSlider!.getAttribute('data-content-id')).toBe('content-42');
  });

  it('passes slideKey to VideoSlide using content id', () => {
    const content: ContentItem = {
      ...baseContent,
      id: 'content-7',
      media: [
        { id: 'v1', type: 'video', src: 'video.mp4', aspectRatio: 0.56 },
      ],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    const videoSlide = container.querySelector('[data-testid="video-slide"]');
    expect(videoSlide!.getAttribute('data-slide-key')).toBe('content-7');
  });

  it('does not render ImageSlide or VideoSlide for multiple items', () => {
    const content: ContentItem = {
      ...baseContent,
      media: [
        { id: 'm1', type: 'image', src: 'a.jpg', aspectRatio: 1 },
        { id: 'm2', type: 'image', src: 'b.jpg', aspectRatio: 1 },
      ],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={size}
        innerSliderRef={innerSliderRef}
      />,
    );

    expect(container.querySelector('[data-testid="image-slide"]')).toBeNull();
    expect(container.querySelector('[data-testid="video-slide"]')).toBeNull();
    expect(container.querySelector('[data-testid="nested-slider"]')).toBeTruthy();
  });
});
