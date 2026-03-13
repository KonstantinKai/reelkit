import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useState,
  useEffect,
  useMemo,
  memo,
} from 'react';
import { clamp } from '@reelkit/core';

/** Axis along which indicator dots are arranged. */
export type ReelIndicatorDirection = 'horizontal' | 'vertical';

/**
 * Props for the {@link ReelIndicator} scrolling dot indicator component.
 */
export interface ReelIndicatorProps {
  /** Total number of items in the slider. */
  count: number;

  /** Index of the currently active item. */
  active: number;

  /**
   * Axis along which dots are arranged.
   * @default 'vertical'
   */
  direction?: ReelIndicatorDirection;

  /**
   * Dot radius in pixels.
   * @default 3
   */
  radius?: number;

  /**
   * Maximum number of normal-sized dots visible at once. Additional
   * dots at the edges are rendered at a smaller scale.
   * @default 5
   */
  visible?: number;

  /**
   * Space between dots in pixels.
   * @default 4
   */
  gap?: number;

  /**
   * CSS color for the active dot.
   * @default '#fff'
   */
  activeColor?: string;

  /**
   * CSS color for inactive dots.
   * @default 'rgba(255, 255, 255, 0.5)'
   */
  inactiveColor?: string;

  /**
   * Scale factor (0–1) applied to edge dots that overflow the visible window.
   * @default 0.5
   */
  edgeScale?: number;

  /** Optional CSS class name for the indicator container. */
  className?: string;

  /** Optional inline styles for the indicator container. */
  style?: CSSProperties;

  /**
   * Called when a dot is clicked.
   * @param index - The index of the clicked dot.
   */
  onDotClick?: (index: number) => void;
}

/**
 * Instagram-style indicator with scrolling dots.
 * - Shows `visible` normal-sized dots
 * - Adds 1 small dot at start if there are more items before
 * - Adds 1 small dot at end if there are more items after
 * - Slides when navigating to edge dots with smooth animation
 */
const Element: FC<ReelIndicatorProps> = (props) => {
  const {
    count,
    active,
    direction = 'vertical',
    visible = 5,
    radius = 3,
    gap = 4,
    activeColor = '#fff',
    inactiveColor = 'rgba(255, 255, 255, 0.5)',
    edgeScale = 0.5,
    className,
    style,
    onDotClick,
  } = props;

  const isVertical = direction === 'vertical';
  const dotSize = radius * 2;
  const itemSize = dotSize + gap;

  // Window start index - the first normal-sized dot
  const [windowStart, setWindowStart] = useState(() => {
    if (count <= visible) return 0;
    // Initially position so active is visible
    return clamp(active - Math.floor(visible / 2), 0, count - visible);
  });

  // Update window when active changes
  useEffect(() => {
    if (count <= visible) {
      setWindowStart(0);
      return;
    }

    setWindowStart((prev) => {
      // If active is before the window (on the small leading dot)
      if (active < prev) {
        // Slide window left to make active the first normal dot
        return Math.max(0, active);
      }
      // If active is after the window (on the small trailing dot)
      if (active >= prev + visible) {
        // Slide window right to make active the last normal dot
        return Math.min(count - visible, active - visible + 1);
      }
      return prev;
    });
  }, [active, count, visible]);

  const windowEnd = Math.min(windowStart + visible, count);
  const hasLeadingSmall = windowStart > 0;

  // Calculate container size - fixed size with space for both edge dots
  const normalDotsCount = Math.min(visible, count);
  let containerSize = normalDotsCount * itemSize;
  if (count > visible) {
    // Always reserve space for both edge dots to prevent size jumping
    containerSize += itemSize * 2;
  }

  // Build the dots array with absolute positioning for smooth sliding
  const dots = useMemo(() => {
    const result: ReactNode[] = [];

    // Render from (windowStart - 1) to (windowEnd + 1) to ensure smooth transitions
    const renderStart = Math.max(0, windowStart - 1);
    const renderEnd = Math.min(count, windowEnd + 1);

    for (let i = renderStart; i < renderEnd; i++) {
      const isActive = i === active;

      // Determine dot scale based on position relative to window
      let scale = 1;
      if (i < windowStart) {
        scale = edgeScale;
      } else if (i >= windowEnd) {
        scale = edgeScale;
      }

      // Calculate slot index for this dot
      let slotIndex: number;
      if (i < windowStart) {
        // Leading edge dot - always slot 0
        slotIndex = 0;
      } else if (i >= windowEnd) {
        // Trailing edge dot - last slot
        slotIndex = visible + 1;
      } else {
        // Visible dot - slots 1 to visible
        slotIndex = i - windowStart + 1;
      }

      // If no leading small, shift all visible and trailing left by 1
      if (!hasLeadingSmall && slotIndex > 0) {
        slotIndex -= 1;
      }

      const position = slotIndex * itemSize;

      result.push(
        <span
          key={i}
          data-reel-indicator={i}
          style={{
            position: 'absolute',
            [isVertical ? 'top' : 'left']: position,
            [isVertical ? 'left' : 'top']: 0,
            width: itemSize,
            height: itemSize,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'top 0.2s ease, left 0.2s ease',
          }}
          onClick={onDotClick ? () => onDotClick(i) : undefined}
          data-testid={`indicator-dot-${i}`}
        >
          <span
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              backgroundColor: isActive ? activeColor : inactiveColor,
              transition: 'transform 0.2s ease, background-color 0.2s ease',
              transform: `scale(${scale})`,
              cursor: onDotClick ? 'pointer' : 'default',
            }}
          />
        </span>,
      );
    }

    return result;
  }, [
    windowStart,
    windowEnd,
    hasLeadingSmall,
    visible,
    count,
    active,
    dotSize,
    itemSize,
    edgeScale,
    activeColor,
    inactiveColor,
    isVertical,
    onDotClick,
  ]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        [isVertical ? 'height' : 'width']: containerSize,
        [isVertical ? 'width' : 'height']: itemSize,
        ...style,
      }}
    >
      {dots}
    </div>
  );
};

/**
 * Instagram-style scrolling dot indicator. Shows a sliding window of
 * normal-sized dots with smaller edge dots indicating overflow.
 * The window slides smoothly as the active index changes.
 */
export const ReelIndicator = memo(Element);
