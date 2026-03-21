import {
  type CSSProperties,
  type FC,
  type ReactNode,
  useContext,
  useState,
  useEffect,
  memo,
} from 'react';
import { clamp, type Subscribable } from '@reelkit/core';
import { Observe } from './Observe';
import { ReelContext } from './ReelContext';

/** Axis along which indicator dots are arranged. */
export type ReelIndicatorDirection = 'horizontal' | 'vertical';

/**
 * Props for the {@link ReelIndicator} scrolling dot indicator component.
 */
export interface ReelIndicatorProps {
  /**
   * Total number of items in the slider.
   * Auto-connected from parent Reel when omitted.
   */
  count?: number;

  /**
   * Index of the currently active item.
   * Auto-connected from parent Reel when omitted.
   * When provided, takes precedence over the context value.
   */
  active?: number;

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

/** Internal props with required active/count (resolved by the outer wrapper). */
interface ReelIndicatorInnerProps
  extends Omit<ReelIndicatorProps, 'active' | 'count'> {
  count: number;
  active: number;
}

const ReelIndicatorInner: FC<ReelIndicatorInnerProps> = (props) => {
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

  const [windowStart, setWindowStart] = useState(() => {
    if (count <= visible) return 0;
    return clamp(active - Math.floor(visible / 2), 0, count - visible);
  });

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

  const normalDotsCount = Math.min(visible, count);
  let containerSize = normalDotsCount * itemSize;
  if (count > visible) {
    // Always reserve space for both edge dots to prevent size jumping
    containerSize += itemSize * 2;
  }

  const dots: ReactNode[] = [];

  // Render from (windowStart - 1) to (windowEnd + 1) to ensure smooth transitions
  const renderStart = Math.max(0, windowStart - 1);
  const renderEnd = Math.min(count, windowEnd + 1);

  for (let i = renderStart; i < renderEnd; i++) {
    const isActiveDot = i === active;

    let scale = 1;
    if (i < windowStart) {
      scale = edgeScale;
    } else if (i >= windowEnd) {
      scale = edgeScale;
    }

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

    dots.push(
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
            backgroundColor: isActiveDot ? activeColor : inactiveColor,
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            transform: `scale(${scale})`,
            cursor: onDotClick ? 'pointer' : 'default',
          }}
        />
      </span>,
    );
  }

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
 *
 * When rendered inside a {@link Reel}, `active` and `count` are
 * auto-connected from the parent slider's signals. Explicit props
 * take precedence when provided.
 */
const Element: FC<ReelIndicatorProps> = (props) => {
  const reelContext = useContext(ReelContext);
  const hasActive = props.active !== undefined;
  const hasCount = props.count !== undefined;

  if (!hasActive && !reelContext) {
    throw new Error(
      'ReelIndicator: "active" prop is required when rendered outside a <Reel> component.',
    );
  }
  if (!hasCount && !reelContext) {
    throw new Error(
      'ReelIndicator: "count" prop is required when rendered outside a <Reel> component.',
    );
  }

  // Pure controlled mode — skip context entirely
  if (hasActive && hasCount) {
    return (
      <ReelIndicatorInner
        {...props}
        active={props.active!}
        count={props.count!}
      />
    );
  }

  // Context mode — subscribe to signals
  const signals = [
    !hasActive && reelContext!.index,
    !hasCount && reelContext!.count,
  ].filter(Boolean) as Subscribable[];

  const onDotClick =
    props.onDotClick ??
    ((i: number) => {
      reelContext!.goTo(i, true);
    });

  return (
    <Observe signals={signals}>
      {() => (
        <ReelIndicatorInner
          {...props}
          active={props.active ?? reelContext!.index.value}
          count={props.count ?? reelContext!.count.value}
          onDotClick={onDotClick}
        />
      )}
    </Observe>
  );
};

export const ReelIndicator = memo(Element);
