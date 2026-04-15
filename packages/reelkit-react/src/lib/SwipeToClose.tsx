import { type ReactNode, type FC, useRef, useState, useEffect } from 'react';
import { createSignal, createGestureController, abs } from '@reelkit/core';
import { Observe } from './Observe';

/** Swipe direction for the {@link SwipeToClose} gesture. */
export type SwipeToCloseDirection = 'up' | 'down';

/** Props for the {@link SwipeToClose} component. */
export interface SwipeToCloseProps {
  /** Swipe direction that triggers the close gesture. */
  direction: SwipeToCloseDirection;

  /** When `true`, gesture handling is active. */
  enabled?: boolean;

  /** Content to wrap. */
  children: ReactNode;

  /**
   * Fraction of the viewport height the user must swipe to trigger close.
   * @default 0.2
   */
  threshold?: number;

  /** Optional CSS class forwarded to the outer `<div>`. */
  className?: string;

  /** Callback fired when the swipe exceeds the dismiss threshold. */
  onClose: () => void;
}

/**
 * Wraps its children in a touch-aware container that can be swiped
 * to dismiss. Supports both upward (lightbox) and downward (stories)
 * swipe directions.
 */
export const SwipeToClose: FC<SwipeToCloseProps> = ({
  direction,
  enabled = true,
  onClose,
  children,
  threshold = 0.2,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ onClose, threshold });
  propsRef.current = { onClose, threshold };

  const isDown = direction === 'down';
  const sign = isDown ? 1 : -1;

  const [{ dragOffset, opacity, isTransitioning, controller }] = useState(
    () => {
      const drag = createSignal(0);
      const op = createSignal(1);
      const trans = createSignal(false);
      const verticalDragEndHandled = { current: false };

      const resetToOriginalPosition = () => {
        trans.value = true;
        drag.value = 0;
        op.value = 1;
        setTimeout(() => {
          trans.value = false;
        }, 300);
      };

      const ctrl = createGestureController(
        { useTouchEventsOnly: true },
        {
          onVerticalDragStart: () => {
            verticalDragEndHandled.current = false;
          },
          onVerticalDragUpdate: (event) => {
            const matchesDirection = isDown
              ? event.primaryDistance > 0
              : event.primaryDistance < 0;

            if (matchesDirection) {
              drag.value = event.primaryDistance;
              const height = window.innerHeight;
              const progress = Math.min(
                abs(event.primaryDistance) / (height * 0.3),
                1,
              );
              op.value = 1 - progress * 0.8;
            }
          },
          onVerticalDragEnd: (event) => {
            verticalDragEndHandled.current = true;
            const height = window.innerHeight;
            const dismissThreshold = height * propsRef.current.threshold;
            const matchesDirection = isDown
              ? event.primaryDistance > 0
              : event.primaryDistance < 0;

            if (
              matchesDirection &&
              abs(event.primaryDistance) > dismissThreshold
            ) {
              trans.value = true;
              drag.value = height * sign;
              op.value = 0;
              setTimeout(() => propsRef.current.onClose(), 300);
            } else {
              resetToOriginalPosition();
            }
          },
          onDragEnd: () => {
            if (!verticalDragEndHandled.current && drag.value !== 0) {
              resetToOriginalPosition();
            }
          },
        },
      );

      return {
        dragOffset: drag,
        opacity: op,
        isTransitioning: trans,
        controller: ctrl,
      };
    },
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!enabled || !el) return;

    controller.attach(el);
    controller.observe();

    return () => {
      controller.unobserve();
      controller.detach();
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Observe signals={[dragOffset, opacity, isTransitioning]}>
      {() => (
        <div
          ref={containerRef}
          className={className}
          style={{
            transform: `translateY(${dragOffset.value}px)`,
            opacity: opacity.value,
            transition: isTransitioning.value
              ? 'transform 300ms ease-out, opacity 300ms ease-out'
              : 'none',
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </div>
      )}
    </Observe>
  );
};
