import { type ReactNode, type FC, useRef, useState, useEffect } from 'react';
import {
  createSignal,
  createGestureController,
  type GestureController,
} from '@reelkit/core';
import { Observe } from '@reelkit/react';

/** Props for the {@link SwipeToClose} wrapper component. */
export interface SwipeToCloseProps {
  /** When `true`, vertical swipe-to-close gesture handling is active. Typically `true` on touch devices. */
  enabled: boolean;

  /** Callback invoked when the user completes a swipe-up gesture that exceeds the dismiss threshold. */
  onClose: () => void;

  /** Content to wrap — usually the `Reel` slider element. */
  children: ReactNode;

  /** Optional CSS class forwarded to the outer `<div>`. */
  className?: string;
}

/**
 * Wraps its children in a touch-aware container that can be swiped
 * upward to dismiss the lightbox.
 *
 * Uses a {@link GestureController} from `@reelkit/core` to track
 * vertical drag gestures. While dragging, the container translates
 * upward and fades out. If the drag distance exceeds 20 % of the
 * viewport height the `onClose` callback fires; otherwise the
 * container animates back to its original position.
 *
 * Rendering is optimised via `Signal`-backed `Observe`
 * so that only the inline styles re-render — not the entire subtree.
 *
 * @internal Used by {@link LightboxContent}. Not exported from the package.
 */
export const SwipeToClose: FC<SwipeToCloseProps> = ({
  enabled,
  onClose,
  children,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureControllerRef = useRef<GestureController | null>(null);

  const [dragOffset, opacity, isTransitioning] = useState(
    () => [createSignal(0), createSignal(1), createSignal(false)] as const,
  )[0];

  // Track if vertical drag end was handled
  const verticalDragEndHandledRef = useRef(false);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const height = window.innerHeight;
    const threshold = height * 0.2; // 20% of screen height

    const resetToOriginalPosition = () => {
      isTransitioning.value = true;
      dragOffset.value = 0;
      opacity.value = 1;
      setTimeout(() => {
        isTransitioning.value = false;
      }, 300);
    };

    const controller = createGestureController(
      { useTouchEventsOnly: true },
      {
        onVerticalDragStart: () => {
          verticalDragEndHandledRef.current = false;
        },
        onVerticalDragUpdate: (event) => {
          const { primaryDistance } = event;
          // Only handle upward swipes (negative distance)
          if (primaryDistance < 0) {
            dragOffset.value = primaryDistance;
            const progress = Math.min(
              Math.abs(primaryDistance) / (height * 0.3),
              1,
            );
            opacity.value = 1 - progress * 0.8;
          }
        },
        onVerticalDragEnd: (event) => {
          verticalDragEndHandledRef.current = true;
          const { primaryDistance } = event;

          if (primaryDistance < 0 && Math.abs(primaryDistance) > threshold) {
            // Close with animation
            isTransitioning.value = true;
            dragOffset.value = -height;
            opacity.value = 0;
            setTimeout(onClose, 300);
          } else {
            resetToOriginalPosition();
          }
        },
        // Fallback: reset if vertical drag started but onVerticalDragEnd wasn't called
        // (happens when last delta direction differs from overall drag direction)
        onDragEnd: () => {
          if (!verticalDragEndHandledRef.current && dragOffset.value !== 0) {
            resetToOriginalPosition();
          }
        },
      },
    );

    controller.attach(containerRef.current);
    controller.observe();
    gestureControllerRef.current = controller;

    return () => {
      controller.unobserve();
      controller.detach();
      gestureControllerRef.current = null;
    };
  }, [enabled, onClose, dragOffset, opacity, isTransitioning]);

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
          }}
        >
          {children}
        </div>
      )}
    </Observe>
  );
};
