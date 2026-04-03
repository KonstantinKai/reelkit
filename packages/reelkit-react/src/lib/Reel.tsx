/* eslint-disable react-hooks/exhaustive-deps */
import {
  type MutableRefObject,
  type CSSProperties,
  type ReactNode,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  memo,
} from 'react';
import {
  createSliderController,
  createSignal,
  defaultRangeExtractor,
  first,
  last,
  slideTransition,
  type RangeExtractor,
  type AnimatedValue,
  type Signal,
  type SliderDirection,
  type TransitionTransformFn,
  type GestureCommonEvent,
  type GestureEvent,
} from '@reelkit/core';
import { AnimatedObserve, Observe } from './Observe';
import { ReelContext, type ReelContextValue } from './ReelContext';

/**
 * Props for the {@link Reel} virtualized one-item slider component.
 */
export interface ReelProps {
  /** Total number of slides. */
  count: number;

  /**
   * Ref or callback to access the imperative {@link ReelApi}. Accepts either
   * a `MutableRefObject` or a callback function.
   */
  apiRef?: MutableRefObject<ReelApi | null> | ((api: ReelApi) => void);

  /**
   * Index of the initially visible slide.
   * @default 0
   */
  initialIndex?: number;

  /**
   * Slider dimensions as `[width, height]` in pixels.
   *
   * When omitted, the component auto-measures its container using
   * `ResizeObserver`. In that case the container must be sized by CSS
   * (e.g. via a parent flex/grid, explicit width/height, or percentage).
   * The slider renders nothing until the first measurement completes.
   */
  size?: [number, number];

  /**
   * Axis along which slides transition.
   * @default 'vertical'
   */
  direction?: 'horizontal' | 'vertical';

  /**
   * Duration of slide transition animations in milliseconds.
   * @default 300
   */
  transitionDuration?: number;

  /**
   * Minimum swipe distance as a fraction (0–1) of the slide's primary
   * dimension required to trigger a slide change.
   * @default 0.12
   */
  swipeDistanceFactor?: number;

  /**
   * Whether the slider wraps around from the last slide back to the first
   * (and vice versa).
   * @default false
   */
  loop?: boolean;

  /**
   * Enable keyboard arrow key navigation.
   * @default true
   */
  enableNavKeys?: boolean;

  /**
   * Enable mouse wheel navigation.
   * @default false
   */
  enableWheel?: boolean;

  /**
   * Debounce duration for wheel events in milliseconds.
   * @default 200
   */
  wheelDebounceMs?: number;

  /** Optional CSS class name for the root container element. */
  className?: string;

  /** Optional inline styles for the root container element. */
  style?: CSSProperties;

  /**
   * Whether gesture (touch/mouse drag) navigation is enabled.
   * When `false`, navigation is only possible via the API (`next`, `prev`, `goTo`).
   * @default true
   */
  enableGestures?: boolean;

  /** Optional children rendered after the slider content (e.g. indicators, overlays). */
  children?: ReactNode;

  /**
   * Transition effect for slide animations.
   * Import a built-in transition (`slideTransition`, `cubeTransition`, etc.)
   * or pass a custom {@link TransitionTransformFn}. Only the imported
   * transition ships in the bundle (tree-shakeable).
   *
   * @default slideTransition
   */
  transition?: TransitionTransformFn;

  /**
   * Custom function to determine which slide indices are rendered.
   * Defaults to the built-in extractor that returns current ± 1 overscan.
   */
  rangeExtractor?: RangeExtractor;

  /**
   * Render function called for each visible slide.
   *
   * @param index - The absolute slide index (0-based).
   * @param indexInRange - Position within the current visible range.
   * @param size - The `[width, height]` dimensions of the slider.
   * @returns A React element representing the slide content.
   */
  itemBuilder: (
    index: number,
    indexInRange: number,
    size: [number, number],
  ) => ReactNode;

  /**
   * Called after a slide transition completes and the index is updated.
   * @param index - The new active slide index.
   * @param indexInRange - Position within the visible range.
   */
  afterChange?: (index: number, indexInRange: number) => void;

  /**
   * Called before a slide transition begins.
   * @param index - Current slide index.
   * @param nextIndex - The index the slider is transitioning to.
   * @param indexInRange - Position of the current index within the visible range.
   */
  beforeChange?: (
    index: number,
    nextIndex: number,
    indexInRange: number,
  ) => void;

  /**
   * Custom key extractor for React reconciliation. Useful when `loop` is
   * enabled to avoid duplicate key warnings.
   *
   * @param index - The absolute slide index.
   * @param indexInRange - Position within the visible range.
   * @returns A unique string key for the slide element.
   */
  keyExtractor?: (index: number, indexInRange: number) => string;

  /**
   * Called when the user begins dragging a slide.
   * @param index - The slide index being dragged.
   */
  onSlideDragStart?: (index: number) => void;

  /**
   * Called when a drag gesture is canceled (snap-back to original slide).
   * @param index - The slide index that remains active.
   */
  onSlideDragCanceled?: (index: number) => void;

  /**
   * Called when the user releases a drag gesture.
   * @param index - The slide index at the time of release.
   */
  onSlideDragEnd?: (index: number) => void;

  /**
   * Fired on a single tap (no drag, no long press). Requires `enableGestures`.
   * @param event - Gesture event with position and element info.
   */
  onTap?: (event: GestureCommonEvent) => void;

  /**
   * Fired on double-tap. Requires `enableGestures`.
   * @param event - Gesture event with position and element info.
   */
  onDoubleTap?: (event: GestureCommonEvent) => void;

  /**
   * Fired when a long press is detected. Requires `enableGestures`.
   * @param event - Gesture event with position and element info.
   */
  onLongPress?: (event: GestureCommonEvent) => void;

  /**
   * Fired when the pointer is released after a long press. Requires `enableGestures`.
   * @param event - Gesture event with position, element, and drag info.
   */
  onLongPressEnd?: (event: GestureEvent) => void;

  /**
   * Fired when a navigation key is pressed (arrow keys). When provided,
   * replaces the default prev/next slide behavior.
   * @param increment - Direction: `-1` for prev, `1` for next.
   */
  onNavKeyPress?: (increment: -1 | 1) => void;
}

const defaultKeyExtractor: NonNullable<ReelProps['keyExtractor']> = (index) =>
  index.toString();

/**
 * Creates a key extractor function that handles duplicate keys when loop
 * mode is active with small item counts (e.g. 2 items). In loop mode,
 * the same index can appear multiple times in the visible range; this
 * extractor appends a `_cloned` suffix to disambiguate.
 *
 * @param count - Total number of slides.
 * @param keyPrefix - Optional prefix prepended to each key.
 * @returns A key extractor compatible with {@link ReelProps.keyExtractor}.
 */
export const createDefaultKeyExtractorForLoop =
  (count: number, keyPrefix?: string): NonNullable<ReelProps['keyExtractor']> =>
  (index: number, indexInRange: number) => {
    const key = `${keyPrefix ?? ''}${index}`;

    if (count === 2 && [0, 1].includes(index) && indexInRange === 0) {
      return `${key}_cloned`;
    }

    return key;
  };

/**
 * Imperative API exposed by the {@link Reel} component via `apiRef`.
 * Provides programmatic control over slider navigation and lifecycle.
 */
export interface ReelApi {
  /** Animate to the next slide. */
  next: () => void;

  /** Animate to the previous slide. */
  prev: () => void;

  /**
   * Navigate to a specific slide index. Returns a promise that
   * resolves when the transition completes.
   * @param index - Target slide index.
   * @param animate - When `true`, animates the transition.
   */
  goTo: (index: number, animate?: boolean) => Promise<void>;

  /** Recalculate positions (useful after resize or layout change). */
  adjust: () => void;

  /** Start listening to gesture, keyboard, and wheel events. */
  observe: () => void;

  /** Stop listening to gesture, keyboard, and wheel events. */
  unobserve: () => void;
}

const Element = ({
  rangeExtractor = defaultRangeExtractor,
  initialIndex = 0,
  direction = 'vertical',
  swipeDistanceFactor = 0.12,
  loop = false,
  keyExtractor = defaultKeyExtractor,
  enableNavKeys = true,
  transitionDuration = 300,
  enableWheel = false,
  wheelDebounceMs = 200,
  transition = slideTransition,
  enableGestures = true,
  ...props
}: ReelProps) => {
  const { size: sizeProp, apiRef: forwardedRef } = props;
  const autoSize = sizeProp === undefined;
  const [measuredSize, setMeasuredSize] = useState<[number, number]>([0, 0]);
  const size: [number, number] = autoSize ? measuredSize : sizeProp;

  const propsRef = useRef<ReelProps>(null as unknown as ReelProps);
  propsRef.current = {
    ...props,
    size,
    rangeExtractor,
    initialIndex,
    direction,
    swipeDistanceFactor,
    loop,
    keyExtractor,
    enableNavKeys,
    transitionDuration,
    enableWheel,
    wheelDebounceMs,
  };

  const isHorizontal = direction === 'horizontal';
  const primarySize = isHorizontal ? first(size) : last(size);
  const ref = useRef<HTMLDivElement>(null);

  const [controller, itemBuilder, reelContextValue] = useState(() => {
    const ctrl = createSliderController(
      {
        count: props.count,
        initialIndex,
        direction,
        loop,
        transitionDuration,
        swipeDistanceFactor,
        rangeExtractor,
        enableWheel,
        wheelDebounceMs,
        enableGestures,
        enableNavKeys,
      },
      {
        onBeforeChange: (index, nextIndex, rangeIndex) => {
          propsRef.current.beforeChange?.(index, nextIndex, rangeIndex);
        },
        onAfterChange: (index, rangeIndex) => {
          propsRef.current.afterChange?.(index, rangeIndex);
        },
        onDragStart: (index) => {
          propsRef.current.onSlideDragStart?.(index);
        },
        onDragEnd: (index) => {
          propsRef.current.onSlideDragEnd?.(index);
        },
        onDragCanceled: (index) => {
          propsRef.current.onSlideDragCanceled?.(index);
        },
        onTap: (e) => propsRef.current.onTap?.(e),
        onDoubleTap: (e) => propsRef.current.onDoubleTap?.(e),
        onLongPress: (e) => propsRef.current.onLongPress?.(e),
        onLongPressEnd: (e) => propsRef.current.onLongPressEnd?.(e),
        ...(props.onNavKeyPress
          ? {
              onNavKeyPress: (increment: -1 | 1) =>
                propsRef.current.onNavKeyPress?.(increment),
            }
          : {}),
      },
    );

    const ctxValue: ReelContextValue = {
      index: ctrl.state.index,
      count: createSignal(props.count),
      goTo: ctrl.goTo,
    };

    const builder = (i: number, indexInRange: number) => {
      const { keyExtractor, itemBuilder, size } = propsRef.current;
      return (
        <div key={keyExtractor!(i, indexInRange)} data-index={i}>
          {itemBuilder(i, indexInRange, size!)}
        </div>
      );
    };

    return [ctrl, builder, ctxValue] as const;
  })[0];

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    reelContextValue.count.value = props.count;
    controller.updateConfig({
      count: props.count,
      direction,
      loop,
      transitionDuration,
      swipeDistanceFactor,
      rangeExtractor,
      enableGestures,
      enableNavKeys,
      enableWheel,
    });
  }, [
    props.count,
    direction,
    loop,
    transitionDuration,
    swipeDistanceFactor,
    rangeExtractor,
    enableGestures,
    enableNavKeys,
    enableWheel,
  ]);

  useEffect(() => {
    controller.setPrimarySize(primarySize);
  }, [primarySize]);

  useEffect(() => {
    if (ref.current) {
      controller.attach(ref.current);
      controller.observe();
    }

    if (forwardedRef !== undefined && forwardedRef !== null) {
      const publicApi: ReelApi = {
        next: () => controller.next(),
        prev: () => controller.prev(),
        goTo: (index: number, animate?: boolean) =>
          controller.goTo(index, animate),
        adjust: () => controller.adjust(),
        observe: () => controller.observe(),
        unobserve: () => controller.unobserve(),
      };

      if (typeof forwardedRef === 'function') {
        forwardedRef(publicApi);
      } else {
        forwardedRef.current = publicApi;
      }
    }

    return controller.detach;
  }, []);

  // Auto-measure container size via ResizeObserver when size prop is omitted.
  // useLayoutEffect ensures the observer is attached before paint, so the
  // first measurement callback arrives as early as possible.
  useLayoutEffect(() => {
    if (!autoSize || !ref.current) return;

    const el = ref.current;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setMeasuredSize((prev) =>
          prev[0] === w && prev[1] === h ? prev : [w, h],
        );
      }
    };

    const observer = new ResizeObserver(measure);
    observer.observe(el);

    return () => observer.disconnect();
  }, [autoSize]);

  const rootStyle: CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...(autoSize ? {} : { width: first(size), height: last(size) }),
    ...props.style,
  };

  const { axisValue, indexes } = controller.state;

  const hasMeasured = !autoSize || primarySize > 0;

  return (
    <ReelContext.Provider value={reelContextValue}>
      <div ref={ref} className={props.className} style={rootStyle}>
        {hasMeasured && (
          <Observe signals={[indexes]}>
            {() => (
              <TransitionContent
                primarySize={primarySize}
                isHorizontal={isHorizontal}
                axisValue={axisValue}
                transitionFn={transition}
                currentRangeIndex={controller.getRangeIndex()}
                direction={direction}
              >
                {indexes.value.map(itemBuilder)}
              </TransitionContent>
            )}
          </Observe>
        )}
        {props.children}
      </div>
    </ReelContext.Provider>
  );
};

/**
 * Virtualized one-item slider component. Renders only the visible slides
 * (typically 3: previous, current, next) to the DOM at any time, enabling
 * efficient handling of large lists (10,000+ items).
 *
 * Supports touch/mouse gestures, keyboard navigation, and optional mouse
 * wheel scrolling. Use `apiRef` for imperative control.
 */
export const Reel = memo(
  Element,
  (prev, next) =>
    // useEffect deps (controller config sync)
    prev.count === next.count &&
    prev.direction === next.direction &&
    prev.loop === next.loop &&
    prev.transitionDuration === next.transitionDuration &&
    prev.swipeDistanceFactor === next.swipeDistanceFactor &&
    prev.rangeExtractor === next.rangeExtractor &&
    prev.enableNavKeys === next.enableNavKeys &&
    prev.enableWheel === next.enableWheel &&
    prev.wheelDebounceMs === next.wheelDebounceMs &&
    prev.transition === next.transition &&
    prev.enableGestures === next.enableGestures &&
    // JSX/render output
    prev.size?.[0] === next.size?.[0] &&
    prev.size?.[1] === next.size?.[1] &&
    prev.className === next.className &&
    prev.style === next.style &&
    prev.children === next.children,
);

const TransitionContent = memo(
  ({
    children,
    isHorizontal,
    primarySize,
    axisValue,
    transitionFn,
    currentRangeIndex,
    direction,
  }: {
    children: ReactNode;
    isHorizontal: boolean;
    primarySize: number;
    axisValue: Signal<AnimatedValue>;
    transitionFn: TransitionTransformFn;
    currentRangeIndex: number;
    direction: SliderDirection;
  }) => {
    const childArray = Array.isArray(children) ? children : [children];

    return (
      <AnimatedObserve signal={axisValue}>
        {(value) => (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {childArray.map((child, i) => {
              const styles = transitionFn(
                value,
                i,
                currentRangeIndex,
                primarySize,
                direction,
              );
              const childKey = (child as { key?: string })?.key ?? i;
              return (
                <div
                  key={childKey}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    [isHorizontal ? 'width' : 'height']: primarySize,
                    [isHorizontal ? 'height' : 'width']: '100%',
                    backfaceVisibility: 'hidden',
                    ...styles,
                  }}
                >
                  {child}
                </div>
              );
            })}
          </div>
        )}
      </AnimatedObserve>
    );
  },
);

export { defaultRangeExtractor };
