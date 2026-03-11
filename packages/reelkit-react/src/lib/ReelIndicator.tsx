import * as React from 'react';
import { clamp } from '@reelkit/core';

export type ReelIndicatorDirection = 'horizontal' | 'vertical';

export interface ReelIndicatorProps {
  /** Total number of items */
  count: number;
  /** Current active index */
  active: number;
  /** Direction of the indicator */
  direction?: ReelIndicatorDirection;
  /** Dot radius in pixels */
  radius?: number;
  /** Number of normal-sized visible dots */
  visible?: number;
  /** Gap between dots */
  gap?: number;
  /** Active dot color */
  activeColor?: string;
  /** Inactive dot color */
  inactiveColor?: string;
  /** Scale for edge dots (0-1) */
  edgeScale?: number;
  className?: string;
  style?: React.CSSProperties;
  onDotClick?: (index: number) => void;
}

/**
 * Instagram-style indicator with scrolling dots.
 * - Shows `visible` normal-sized dots
 * - Adds 1 small dot at start if there are more items before
 * - Adds 1 small dot at end if there are more items after
 * - Slides when navigating to edge dots with smooth animation
 */
const Element: React.FC<ReelIndicatorProps> = (props) => {
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
  const [windowStart, setWindowStart] = React.useState(() => {
    if (count <= visible) return 0;
    // Initially position so active is visible
    return clamp(active - Math.floor(visible / 2), 0, count - visible);
  });

  // Update window when active changes
  React.useEffect(() => {
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
  const dots = React.useMemo(() => {
    const result: React.ReactNode[] = [];

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

export const ReelIndicator = React.memo(Element);
