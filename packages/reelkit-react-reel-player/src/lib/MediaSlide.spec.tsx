import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ContentItem } from './types';

// Mock child components
vi.mock('./ImageSlide', () => ({
  default: ({
    src,
    size,
    imageProps,
  }: {
    src: string;
    size: [number, number];
    imageProps?: Record<string, unknown>;
  }) => (
    <div
      data-testid="image-slide"
      data-src={src}
      data-size={size.join(',')}
      onClick={() => (imageProps?.['onLoad'] as (() => void) | undefined)?.()}
    />
  ),
}));

vi.mock('./VideoSlide', () => ({
  default: ({
    src,
    poster,
    isActive,
    slideKey,
    onReady,
    onWaiting,
  }: {
    src: string;
    poster?: string;
    isActive: boolean;
    slideKey: string;
    onReady?: () => void;
    onWaiting?: () => void;
  }) => (
    <div
      data-testid="video-slide"
      data-src={src}
      data-poster={poster}
      data-active={isActive}
      data-slide-key={slideKey}
      onClick={() => onReady?.()}
      onFocus={() => onWaiting?.()}
    />
  ),
}));

let lastNestedSliderProps: Record<string, unknown> = {};

vi.mock('./NestedSlider', () => ({
  default: (
    props: Record<string, unknown> & {
      media: unknown[];
      isParentActive: boolean;
      contentId: string;
    },
  ) => {
    lastNestedSliderProps = props;
    return (
      <div
        data-testid="nested-slider"
        data-media-count={props.media.length}
        data-active={props.isParentActive}
        data-content-id={props.contentId}
      />
    );
  },
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

const _kSize: [number, number] = [400, 700];

describe('MediaSlide', () => {
  let innerSliderRef: React.MutableRefObject<null>;

  beforeEach(() => {
    innerSliderRef = { current: null };
    lastNestedSliderProps = {};
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
        size={_kSize}
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
        size={_kSize}
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
        size={_kSize}
        innerSliderRef={innerSliderRef}
      />,
    );

    const nestedSlider = container.querySelector(
      '[data-testid="nested-slider"]',
    );
    expect(nestedSlider).toBeTruthy();
    expect(nestedSlider!.getAttribute('data-media-count')).toBe('2');
  });

  it('passes isActive to VideoSlide', () => {
    const content: ContentItem = {
      ...baseContent,
      media: [{ id: 'v1', type: 'video', src: 'video.mp4', aspectRatio: 0.56 }],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={false}
        size={_kSize}
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
        size={_kSize}
        innerSliderRef={innerSliderRef}
      />,
    );

    const nestedSlider = container.querySelector(
      '[data-testid="nested-slider"]',
    );
    expect(nestedSlider!.getAttribute('data-content-id')).toBe('content-42');
  });

  it('passes slideKey to VideoSlide using content id', () => {
    const content: ContentItem = {
      ...baseContent,
      id: 'content-7',
      media: [{ id: 'v1', type: 'video', src: 'video.mp4', aspectRatio: 0.56 }],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={_kSize}
        innerSliderRef={innerSliderRef}
      />,
    );

    const videoSlide = container.querySelector('[data-testid="video-slide"]');
    expect(videoSlide!.getAttribute('data-slide-key')).toBe('content-7');
  });

  it('forwards onReady to ImageSlide via imageProps.onLoad', () => {
    const onReady = vi.fn();
    const content: ContentItem = {
      ...baseContent,
      media: [{ id: 'm1', type: 'image', src: 'photo.jpg', aspectRatio: 1.5 }],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={_kSize}
        innerSliderRef={innerSliderRef}
        onReady={onReady}
      />,
    );

    fireEvent.click(container.querySelector('[data-testid="image-slide"]')!);
    expect(onReady).toHaveBeenCalled();
  });

  it('forwards onReady and onWaiting to VideoSlide', () => {
    const onReady = vi.fn();
    const onWaiting = vi.fn();
    const content: ContentItem = {
      ...baseContent,
      media: [{ id: 'v1', type: 'video', src: 'video.mp4', aspectRatio: 0.56 }],
    };

    const { container } = render(
      <MediaSlide
        content={content}
        isActive={true}
        size={_kSize}
        innerSliderRef={innerSliderRef}
        onReady={onReady}
        onWaiting={onWaiting}
      />,
    );

    const videoSlide = container.querySelector('[data-testid="video-slide"]')!;
    fireEvent.click(videoSlide);
    expect(onReady).toHaveBeenCalled();

    fireEvent.focus(videoSlide);
    expect(onWaiting).toHaveBeenCalled();
  });

  it('forwards onReady and onWaiting to NestedSlider', () => {
    const onReady = vi.fn();
    const onWaiting = vi.fn();
    const content: ContentItem = {
      ...baseContent,
      media: [
        { id: 'm1', type: 'image', src: 'a.jpg', aspectRatio: 1 },
        { id: 'm2', type: 'video', src: 'b.mp4', aspectRatio: 0.5 },
      ],
    };

    render(
      <MediaSlide
        content={content}
        isActive={true}
        size={_kSize}
        innerSliderRef={innerSliderRef}
        onReady={onReady}
        onWaiting={onWaiting}
      />,
    );

    expect(lastNestedSliderProps['onReady']).toBe(onReady);
    expect(lastNestedSliderProps['onWaiting']).toBe(onWaiting);
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
        size={_kSize}
        innerSliderRef={innerSliderRef}
      />,
    );

    expect(container.querySelector('[data-testid="image-slide"]')).toBeNull();
    expect(container.querySelector('[data-testid="video-slide"]')).toBeNull();
    expect(
      container.querySelector('[data-testid="nested-slider"]'),
    ).toBeTruthy();
  });
});
