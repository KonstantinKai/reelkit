import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { MediaItem } from './types';
import type { ReelApi, ReelProps } from '@reelkit/react';
import React from 'react';

// Track the most recent Reel props
let lastReelProps: Partial<ReelProps> = {};
let lastReelApiRef: React.MutableRefObject<ReelApi | null> | null = null;

vi.mock('@reelkit/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/react')>();
  return {
    ...actual,
    Reel: (props: ReelProps) => {
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
  };
});

vi.mock('./ImageSlide', () => ({
  default: ({
    src,
    imageProps,
  }: {
    src: string;
    imageProps?: Record<string, unknown>;
  }) => (
    <div
      data-testid="image-slide"
      data-src={src}
      data-has-onload={imageProps?.['onLoad'] != null}
      onClick={() => (imageProps?.['onLoad'] as (() => void) | undefined)?.()}
    />
  ),
}));

vi.mock('./VideoSlide', () => ({
  default: ({
    src,
    isActive,
    isInnerActive,
    onReady,
    onWaiting,
  }: {
    src: string;
    isActive: boolean;
    isInnerActive?: boolean;
    onReady?: () => void;
    onWaiting?: () => void;
  }) => (
    <div
      data-testid="video-slide"
      data-src={src}
      data-active={isActive}
      data-inner-active={isInnerActive ?? true}
      data-has-on-ready={onReady != null}
      data-has-on-waiting={onWaiting != null}
      onClick={() => onReady?.()}
      onFocus={() => onWaiting?.()}
    />
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
  {
    id: 'm2',
    type: 'video',
    src: 'video.mp4',
    poster: 'poster.jpg',
    aspectRatio: 0.56,
  },
];

const videoMedia: MediaItem[] = [
  {
    id: 'v1',
    type: 'video',
    src: 'video1.mp4',
    poster: 'poster1.jpg',
    aspectRatio: 0.56,
  },
  {
    id: 'v2',
    type: 'video',
    src: 'video2.mp4',
    poster: 'poster2.jpg',
    aspectRatio: 0.56,
  },
];

const mockContentItem = { id: 'c1', media: imageMedia };

const _kSize: [number, number] = [400, 700];

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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        onActiveMediaTypeChange={onActiveMediaTypeChange}
      />,
    );

    // Initial index is 0, which is an image
    expect(onActiveMediaTypeChange).toHaveBeenCalledWith('image');
  });

  it('renders custom navigation when renderNavigation is provided', () => {
    const renderNavigation = vi.fn(({ onPrev, onNext, activeIndex, count }) => (
      <div data-testid="custom-nav">
        <button onClick={onPrev} data-testid="custom-prev">
          Prev
        </button>
        <span data-testid="custom-counter">
          {activeIndex + 1}/{count}
        </span>
        <button onClick={onNext} data-testid="custom-next">
          Next
        </button>
      </div>
    ));

    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        renderNavigation={renderNavigation}
      />,
    );

    // Custom nav should be rendered
    expect(screen.getByTestId('custom-nav')).toBeTruthy();
    // Default arrows should NOT be rendered
    expect(screen.queryByLabelText('Previous')).toBeNull();
    expect(screen.queryByLabelText('Next')).toBeNull();
  });

  it('passes correct props to renderNavigation', () => {
    const renderNavigation = vi.fn(() => <div data-testid="custom-nav" />);

    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        renderNavigation={renderNavigation}
      />,
    );

    expect(renderNavigation).toHaveBeenCalledWith(
      expect.objectContaining({
        item: mockContentItem,
        media: imageMedia[0],
        onPrev: expect.any(Function),
        onNext: expect.any(Function),
        activeIndex: 0,
        count: 3,
      }),
    );
  });

  it('custom navigation next calls slider next', () => {
    const renderNavigation = vi.fn(({ onNext }) => (
      <button onClick={onNext} data-testid="custom-next">
        Next
      </button>
    ));

    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        renderNavigation={renderNavigation}
      />,
    );

    fireEvent.click(screen.getByTestId('custom-next'));

    expect(lastReelApiRef!.current!.next).toHaveBeenCalled();
  });

  it('custom navigation prev calls slider prev', () => {
    const renderNavigation = vi.fn(({ onPrev }) => (
      <button onClick={onPrev} data-testid="custom-prev">
        Prev
      </button>
    ));

    render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        renderNavigation={renderNavigation}
      />,
    );

    fireEvent.click(screen.getByTestId('custom-prev'));

    expect(lastReelApiRef!.current!.prev).toHaveBeenCalled();
  });

  it('does not render custom navigation for single media item', () => {
    const singleMedia: MediaItem[] = [
      { id: 'm1', type: 'image', src: 'photo1.jpg', aspectRatio: 1.5 },
    ];
    const renderNavigation = vi.fn(() => <div data-testid="custom-nav" />);

    render(
      <NestedSlider
        media={singleMedia}
        isParentActive={true}
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
        renderNavigation={renderNavigation}
      />,
    );

    expect(screen.queryByTestId('custom-nav')).toBeNull();
    expect(renderNavigation).not.toHaveBeenCalled();
  });

  describe('parent active state propagation', () => {
    it('passes no className to Reel when parent is inactive', () => {
      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={false}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      expect(lastReelProps.className).toBeUndefined();
    });

    it('passes active className to Reel when parent is active', () => {
      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      expect(lastReelProps.className).toBe('rk-reel-nested-active');
    });

    it('updates className when isParentActive transitions from false to true', () => {
      const { rerender } = render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={false}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      expect(lastReelProps.className).toBeUndefined();

      rerender(
        <NestedSlider
          media={mixedMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      expect(lastReelProps.className).toBe('rk-reel-nested-active');
    });

    it('itemBuilder passes isParentActive as isActive to VideoSlide', () => {
      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      const itemBuilder = lastReelProps.itemBuilder as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => React.ReactElement;

      const { container } = render(itemBuilder(1, 1, _kSize));
      const videoSlide = container.querySelector('[data-testid="video-slide"]');
      expect(videoSlide!.getAttribute('data-active')).toBe('true');
    });

    it('itemBuilder passes false isActive when parent is inactive', () => {
      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={false}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      const itemBuilder = lastReelProps.itemBuilder as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => React.ReactElement;

      const { container } = render(itemBuilder(1, 1, _kSize));
      const videoSlide = container.querySelector('[data-testid="video-slide"]');
      expect(videoSlide!.getAttribute('data-active')).toBe('false');
    });
  });

  describe('inner active index ref', () => {
    it('uses ref for innerActiveIndex to avoid stale closures', () => {
      render(
        <NestedSlider
          media={videoMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      // Capture the itemBuilder BEFORE inner slide change
      const staleItemBuilder = lastReelProps.itemBuilder as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => React.ReactElement;

      // Simulate inner slide change via afterChange callback
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => {
        afterChange(1);
      });

      // The stale itemBuilder should still report correct isInnerActive
      // via ref (innerActiveIndexRef.current is updated during re-render)
      const { container: c1 } = render(staleItemBuilder(1, 1, _kSize));
      const videoSlide1 = c1.querySelector('[data-testid="video-slide"]');
      expect(videoSlide1!.getAttribute('data-inner-active')).toBe('true');

      // Index 0 should no longer be inner-active
      const { container: c0 } = render(staleItemBuilder(0, 0, _kSize));
      const videoSlide0 = c0.querySelector('[data-testid="video-slide"]');
      expect(videoSlide0!.getAttribute('data-inner-active')).toBe('false');
    });
  });

  it('has black background on container', () => {
    const { container } = render(
      <NestedSlider
        media={imageMedia}
        isParentActive={true}
        size={_kSize}
        contentItem={mockContentItem}
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
        size={_kSize}
        contentItem={mockContentItem}
        contentId="c1"
        innerSliderRef={innerSliderRef}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.width).toBe('400px');
    expect(wrapper.style.height).toBe('700px');
  });

  describe('renderNestedSlide', () => {
    const getItemBuilder = () =>
      lastReelProps.itemBuilder as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => React.ReactElement;

    it('uses default rendering when renderNestedSlide is not provided', () => {
      render(
        <NestedSlider
          media={imageMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      const { container } = render(getItemBuilder()(0, 0, _kSize));
      expect(
        container.querySelector('[data-testid="image-slide"]'),
      ).toBeTruthy();
    });

    it('calls renderNestedSlide for image items', () => {
      const renderNestedSlide = vi.fn(({ defaultContent }) => (
        <div data-testid="custom-nested">{defaultContent}</div>
      ));

      render(
        <NestedSlider
          media={imageMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      const { container } = render(getItemBuilder()(0, 0, _kSize));
      expect(
        container.querySelector('[data-testid="custom-nested"]'),
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="image-slide"]'),
      ).toBeTruthy();
    });

    it('calls renderNestedSlide for video items', () => {
      const renderNestedSlide = vi.fn(({ defaultContent }) => (
        <div data-testid="custom-nested">{defaultContent}</div>
      ));

      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      const { container } = render(getItemBuilder()(1, 1, _kSize));
      expect(
        container.querySelector('[data-testid="custom-nested"]'),
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="video-slide"]'),
      ).toBeTruthy();
    });

    it('passes correct props to renderNestedSlide for image item', () => {
      const renderNestedSlide = vi.fn(() => (
        <div data-testid="custom-nested" />
      ));

      render(
        <NestedSlider
          media={imageMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      getItemBuilder()(0, 0, _kSize);

      expect(renderNestedSlide).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mockContentItem,
          media: imageMedia[0],
          index: 0,
          size: _kSize,
          isActive: true,
          isInnerActive: true,
          slideKey: 'c1:m1',
          defaultContent: expect.anything(),
        }),
      );
    });

    it('passes correct props to renderNestedSlide for video item', () => {
      const renderNestedSlide = vi.fn(() => (
        <div data-testid="custom-nested" />
      ));

      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={false}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      getItemBuilder()(1, 1, _kSize);

      expect(renderNestedSlide).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mockContentItem,
          media: mixedMedia[1],
          index: 1,
          size: _kSize,
          isActive: false,
          isInnerActive: false,
          slideKey: 'c1:m2',
        }),
      );
    });

    it('provides onVideoRef only when isInnerActive is true', () => {
      const renderNestedSlide = vi.fn(() => <div />);

      render(
        <NestedSlider
          media={videoMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      // Index 0 is inner-active (initial state)
      getItemBuilder()(0, 0, _kSize);
      expect(renderNestedSlide).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isInnerActive: true,
          onVideoRef: expect.any(Function),
        }),
      );

      renderNestedSlide.mockClear();

      // Index 1 is NOT inner-active
      getItemBuilder()(1, 1, _kSize);
      expect(renderNestedSlide).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isInnerActive: false,
          onVideoRef: undefined,
        }),
      );
    });

    it('provides onReady/onWaiting only when isInnerActive is true', () => {
      const renderNestedSlide = vi.fn(() => <div />);
      const onReady = vi.fn();
      const onWaiting = vi.fn();

      render(
        <NestedSlider
          media={videoMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
          onWaiting={onWaiting}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      getItemBuilder()(0, 0, _kSize);
      expect(renderNestedSlide).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isInnerActive: true,
          onReady,
          onWaiting,
        }),
      );

      renderNestedSlide.mockClear();

      getItemBuilder()(1, 1, _kSize);
      expect(renderNestedSlide).toHaveBeenLastCalledWith(
        expect.objectContaining({
          isInnerActive: false,
          onReady: undefined,
          onWaiting: undefined,
        }),
      );
    });

    it('renderNestedSlide onReady clears parent loading state', () => {
      let capturedOnReady: (() => void) | undefined;
      const onReady = vi.fn();

      render(
        <NestedSlider
          media={videoMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
          renderNestedSlide={(props) => {
            capturedOnReady = props.onReady;
            return <div />;
          }}
        />,
      );

      getItemBuilder()(0, 0, _kSize);
      capturedOnReady!();

      expect(onReady).toHaveBeenCalledOnce();
    });

    it('renderNestedSlide can fully replace default content', () => {
      const renderNestedSlide = vi.fn(() => (
        <div data-testid="fully-custom">Custom content</div>
      ));

      render(
        <NestedSlider
          media={imageMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      const { container } = render(getItemBuilder()(0, 0, _kSize));
      expect(
        container.querySelector('[data-testid="fully-custom"]'),
      ).toBeTruthy();
      expect(container.querySelector('[data-testid="image-slide"]')).toBeNull();
    });

    it('updates isInnerActive after slide change', () => {
      const renderNestedSlide = vi.fn(() => <div />);

      render(
        <NestedSlider
          media={videoMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          renderNestedSlide={renderNestedSlide}
        />,
      );

      // Simulate inner slide change to index 1
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => {
        afterChange(1);
      });

      renderNestedSlide.mockClear();

      // Now index 1 should be inner-active, index 0 should not
      getItemBuilder()(1, 1, _kSize);
      expect(renderNestedSlide).toHaveBeenLastCalledWith(
        expect.objectContaining({ index: 1, isInnerActive: true }),
      );

      renderNestedSlide.mockClear();

      getItemBuilder()(0, 0, _kSize);
      expect(renderNestedSlide).toHaveBeenLastCalledWith(
        expect.objectContaining({ index: 0, isInnerActive: false }),
      );
    });
  });

  describe('loading indicator flow', () => {
    const getItemBuilder = () =>
      lastReelProps.itemBuilder as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => React.ReactElement;

    const mixedMedia3: MediaItem[] = [
      {
        id: 'v1',
        type: 'video',
        src: 'video.mp4',
        poster: 'poster.jpg',
        aspectRatio: 0.56,
      },
      { id: 'm1', type: 'image', src: 'photo1.jpg', aspectRatio: 1.5 },
      { id: 'm2', type: 'image', src: 'photo2.jpg', aspectRatio: 1.5 },
    ];

    it('forwards onReady to active inner image via imageProps.onLoad', () => {
      const onReady = vi.fn();

      render(
        <NestedSlider
          media={imageMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
        />,
      );

      const { container } = render(getItemBuilder()(0, 0, _kSize));
      const img = container.querySelector('[data-testid="image-slide"]')!;
      expect(img.getAttribute('data-has-onload')).toBe('true');

      fireEvent.click(img);
      expect(onReady).toHaveBeenCalledOnce();
    });

    it('does not forward onReady to inactive inner image', () => {
      render(
        <NestedSlider
          media={imageMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={vi.fn()}
        />,
      );

      const { container } = render(getItemBuilder()(1, 1, _kSize));
      const img = container.querySelector('[data-testid="image-slide"]')!;
      expect(img.getAttribute('data-has-onload')).toBe('false');
    });

    it('forwards onReady and onWaiting to active inner video', () => {
      const onReady = vi.fn();
      const onWaiting = vi.fn();

      render(
        <NestedSlider
          media={mixedMedia3}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
          onWaiting={onWaiting}
        />,
      );

      const { container } = render(getItemBuilder()(0, 0, _kSize));
      const video = container.querySelector('[data-testid="video-slide"]')!;
      expect(video.getAttribute('data-has-on-ready')).toBe('true');
      expect(video.getAttribute('data-has-on-waiting')).toBe('true');

      fireEvent.click(video);
      expect(onReady).toHaveBeenCalledOnce();

      fireEvent.focus(video);
      expect(onWaiting).toHaveBeenCalledOnce();
    });

    it('does not forward onReady/onWaiting to inactive inner video', () => {
      render(
        <NestedSlider
          media={mixedMedia3}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={vi.fn()}
          onWaiting={vi.fn()}
        />,
      );

      // Navigate to index 1 so index 0 (video) becomes inactive
      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      const { container } = render(getItemBuilder()(0, 0, _kSize));
      const video = container.querySelector('[data-testid="video-slide"]')!;
      expect(video.getAttribute('data-has-on-ready')).toBe('false');
      expect(video.getAttribute('data-has-on-waiting')).toBe('false');
    });

    it('calls onReady when navigating from video to image slide', () => {
      const onReady = vi.fn();

      render(
        <NestedSlider
          media={mixedMedia3}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
        />,
      );

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      expect(onReady).toHaveBeenCalledOnce();
    });

    it('calls onReady when navigating from image to another image', () => {
      const onReady = vi.fn();

      render(
        <NestedSlider
          media={mixedMedia3}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
        />,
      );

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));
      act(() => afterChange(2));

      expect(onReady).toHaveBeenCalledTimes(2);
    });

    it('does not call onReady when navigating to a video slide', () => {
      const onReady = vi.fn();
      const videoFirst: MediaItem[] = [
        { id: 'm1', type: 'image', src: 'photo.jpg', aspectRatio: 1.5 },
        {
          id: 'v1',
          type: 'video',
          src: 'video.mp4',
          poster: 'poster.jpg',
          aspectRatio: 0.56,
        },
      ];

      render(
        <NestedSlider
          media={videoFirst}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onReady={onReady}
        />,
      );

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      expect(onReady).not.toHaveBeenCalled();
    });
  });

  describe('beforeChange', () => {
    it('passes beforeChange to Reel', () => {
      render(
        <NestedSlider
          media={videoMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
        />,
      );

      expect(lastReelProps.beforeChange).toBeTypeOf('function');
    });
  });

  describe('isParentActive media type reporting', () => {
    it('reports media type when isParentActive becomes true', () => {
      const onActiveMediaTypeChange = vi.fn();

      const { rerender } = render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={false}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onActiveMediaTypeChange={onActiveMediaTypeChange}
        />,
      );

      expect(onActiveMediaTypeChange).not.toHaveBeenCalled();

      rerender(
        <NestedSlider
          media={mixedMedia}
          isParentActive={true}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onActiveMediaTypeChange={onActiveMediaTypeChange}
        />,
      );

      expect(onActiveMediaTypeChange).toHaveBeenCalledWith('image');
    });

    it('does not report media type when isParentActive is false', () => {
      const onActiveMediaTypeChange = vi.fn();

      render(
        <NestedSlider
          media={mixedMedia}
          isParentActive={false}
          size={_kSize}
          contentItem={mockContentItem}
          contentId="c1"
          innerSliderRef={innerSliderRef}
          onActiveMediaTypeChange={onActiveMediaTypeChange}
        />,
      );

      expect(onActiveMediaTypeChange).not.toHaveBeenCalled();
    });
  });
});
