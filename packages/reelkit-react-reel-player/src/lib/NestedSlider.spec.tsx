import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MediaItem } from './types';
import type { ReelApi } from '@reelkit/react';
import React from 'react';

// Track the most recent Reel props
let lastReelProps: Record<string, unknown> = {};
let lastReelApiRef: React.MutableRefObject<ReelApi | null> | null = null;

vi.mock('@reelkit/react', () => ({
  Reel: (props: Record<string, unknown>) => {
    lastReelProps = props;
    // Capture the apiRef
    if (props.apiRef) {
      lastReelApiRef = props.apiRef as React.MutableRefObject<ReelApi | null>;
      // Provide a mock API
      lastReelApiRef.current = {
        next: vi.fn(),
        prev: vi.fn(),
        goTo: vi.fn().mockResolvedValue(undefined),
        adjust: vi.fn(),
        observe: vi.fn(),
        unobserve: vi.fn(),
      };
    }
    return <div data-testid="mock-reel" data-direction={props.direction} />;
  },
  ReelIndicator: ({
    count,
    active,
    direction,
  }: {
    count: number;
    active: number;
    direction: string;
  }) => (
    <div
      data-testid="mock-indicator"
      data-count={count}
      data-active={active}
      data-direction={direction}
    />
  ),
}));

vi.mock('./ImageSlide', () => ({
  default: ({ src }: { src: string }) => <div data-testid="image-slide" data-src={src} />,
}));

vi.mock('./VideoSlide', () => ({
  default: ({ src, isActive }: { src: string; isActive: boolean }) => (
    <div data-testid="video-slide" data-src={src} data-active={isActive} />
  ),
}));

// eslint-disable-next-line import/first
import NestedSlider from './NestedSlider';

const imageMedia: MediaItem[] = [
  { id: 'm1', type: 'image', src: 'photo1.jpg', aspectRatio: 1.5 },
  { id: 'm2', type: 'image', src: 'photo2.jpg', aspectRatio: 1.5 },
  { id: 'm3', type: 'image', src: 'photo3.jpg', aspectRatio: 1.5 },
];

const mixedMedia: MediaItem[] = [
  { id: 'm1', type: 'image', src: 'photo1.jpg', aspectRatio: 1.5 },
  { id: 'm2', type: 'video', src: 'video.mp4', poster: 'poster.jpg', aspectRatio: 0.56 },
];

const size: [number, number] = [400, 700];

describe('NestedSlider', () => {
  let innerSliderRef: React.MutableRefObject<ReelApi | null>;

  beforeEach(() => {
    innerSliderRef = { current: null };
    lastReelProps = {};
    lastReelApiRef = null;
  });

  it('renders a Reel with horizontal direction', () => {
    const { container } = render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    const reel = container.querySelector('[data-testid="mock-reel"]');
    expect(reel).toBeTruthy();
    expect(lastReelProps.direction).toBe('horizontal');
  });

  it('passes correct count to Reel', () => {
    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    expect(lastReelProps.count).toBe(3);
  });

  it('renders indicator dots for multiple media', () => {
    const { container } = render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    const indicator = container.querySelector('[data-testid="mock-indicator"]');
    expect(indicator).toBeTruthy();
    expect(indicator!.getAttribute('data-count')).toBe('3');
    expect(indicator!.getAttribute('data-direction')).toBe('horizontal');
  });

  it('hides prev arrow at first index', () => {
    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    // Initial index is 0, so prev should not be visible
    expect(screen.queryByLabelText('Previous')).toBeNull();
    expect(screen.getByLabelText('Next')).toBeTruthy();
  });

  it('syncs innerSliderRef with local ref', () => {
    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    expect(innerSliderRef.current).toBeTruthy();
    expect(innerSliderRef.current!.next).toBeTypeOf('function');
  });

  it('clears innerSliderRef on unmount', () => {
    const { unmount } = render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    expect(innerSliderRef.current).toBeTruthy();

    unmount();

    expect(innerSliderRef.current).toBeNull();
  });

  it('calls next on next arrow click', () => {
    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    fireEvent.click(screen.getByLabelText('Next'));

    expect(lastReelApiRef!.current!.next).toHaveBeenCalled();
  });

  it('reports active media type to parent', () => {
    const onActiveMediaTypeChange = vi.fn();

    render(
      <NestedSlider
        media={mixedMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        onActiveMediaTypeChange={onActiveMediaTypeChange}
      />,
    );

    // Initial index is 0, which is an image
    expect(onActiveMediaTypeChange).toHaveBeenCalledWith('image');
  });

  it('has black background on container', () => {
    const { container } = render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('rgb(0, 0, 0)');
  });

  it('renders with correct container dimensions', () => {
    const { container } = render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={size}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('700px');
  });
});
