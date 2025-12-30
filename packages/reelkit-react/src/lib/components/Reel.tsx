/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from 'react';
import {
  createSliderController,
  defaultRangeExtractor,
  first,
  last,
  type SliderController,
  type RangeExtractor,
  type AnimatedValue,
  type Signal,
  type ComputedSignal,
} from '@reelkit/core';
import {
  AnimatedValueNotifierObserver,
  ValueNotifierObserver,
} from './ValueNotifierObserver';

export interface ReelProps {
  count: number;
  itemBuilder: (
    index: number,
    indexInRange: number,
    size: [number, number]
  ) => React.ReactElement;
  apiRef?:
    | React.MutableRefObject<ReelApi | null>
    | ((api: ReelApi) => void);

  /**
   * @default 0
   */
  initialIndex?: number;
  size: [number, number];
  direction?: 'horizontal' | 'vertical';

  /**
   * Transition duration in milliseconds
   * @default 300
   */
  transitionDuration?: number;

  /**
   * A value between 0 and 1, a distance which finger should be slides
   *
   * @default 0.12
   */
  swipeDistanceFactor?: number;

  loop?: boolean;

  useNavKeys?: boolean;

  afterChange?: (index: number, indexInRange: number) => void;
  beforeChange?: (
    index: number,
    nextIndex: number,
    indexInRange: number
  ) => void;
  keyExtractor?: (index: number, indexInRange: number) => string;
  onSlideDragStart?: (index: number) => void;
  onSlideDragCanceled?: (index: number) => void;
  onSlideDragEnd?: () => void;
  rangeExtractor?: RangeExtractor;

  /**
   * Optional className for the root element
   */
  className?: string;

  /**
   * Optional style for the root element
   */
  style?: React.CSSProperties;

  /**
   * Optional children to render after the slider content
   */
  children?: React.ReactNode;
}

const defaultKeyExtractor: NonNullable<ReelProps['keyExtractor']> = (
  index
) => index.toString();

export const createDefaultKeyExtractorForLoop =
  (
    count: number,
    keyPrefix?: string
  ): NonNullable<ReelProps['keyExtractor']> =>
  (index: number, indexInRange: number) => {
    const key = `${keyPrefix ?? ''}${index}`;

    /**
     * Handles case with duplicating keys
     */
    if (count === 2 && [0, 1].includes(index) && indexInRange === 0) {
      return `${key}_cloned`;
    }

    return key;
  };

export interface ReelApi {
  next: () => void;
  prev: () => void;
  goTo: (index: number, animate?: boolean) => Promise<void>;
  adjust: () => void;
  observe: () => void;
  unobserve: () => void;
}

const Element = ({
  rangeExtractor = defaultRangeExtractor,
  initialIndex = 0,
  direction = 'vertical',
  swipeDistanceFactor = 0.12,
  loop = false,
  keyExtractor = defaultKeyExtractor,
  useNavKeys = true,
  transitionDuration = 300,
  ...props
}: ReelProps) => {
  const { size, apiRef: forwardedRef } = props;
  const propsRef = React.useRef<ReelProps>(null as unknown as ReelProps);
  propsRef.current = {
    ...props,
    rangeExtractor,
    initialIndex,
    direction,
    swipeDistanceFactor,
    loop,
    keyExtractor,
    useNavKeys,
    transitionDuration,
  };

  const isHorizontal = direction === 'horizontal';
  const primarySize = isHorizontal ? first(size) : last(size);
  const ref = React.useRef<HTMLDivElement>(null);

  // Create controller once
  const [controller] = React.useState<SliderController>(() =>
    createSliderController(
      {
        count: props.count,
        initialIndex,
        direction,
        loop,
        transitionDuration,
        swipeDistanceFactor,
        rangeExtractor,
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
        onDragEnd: () => {
          propsRef.current.onSlideDragEnd?.();
        },
        onDragCanceled: (index) => {
          propsRef.current.onSlideDragCanceled?.(index);
        },
      }
    )
  );

  // Update controller with new props
  React.useEffect(() => {
    controller.updateConfig({
      count: props.count,
      direction,
      loop,
      transitionDuration,
      swipeDistanceFactor,
      rangeExtractor,
    });
  }, [props.count, direction, loop, transitionDuration, swipeDistanceFactor, rangeExtractor]);

  // Update primary size
  React.useEffect(() => {
    controller.setPrimarySize(primarySize);
  }, [primarySize]);

  // Attach/detach controller to element
  React.useEffect(() => {
    if (ref.current) {
      controller.attach(ref.current);
      controller.observe();
    }

    return () => {
      controller.detach();
    };
  }, []);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (useNavKeys) {
      controller.observe();
    } else {
      controller.unobserve();
    }
  }, [useNavKeys]);

  // Expose public API
  React.useEffect(() => {
    if (forwardedRef !== undefined && forwardedRef !== null) {
      const publicApi: ReelApi = {
        next: () => controller.next(),
        prev: () => controller.prev(),
        goTo: (index: number, animate?: boolean) => controller.goTo(index, animate),
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
  }, [forwardedRef]);

  const itemBuilder = React.useCallback(
    (i: number, indexInRange: number) => (
      <div key={keyExtractor(i, indexInRange)} data-index={i}>
        {props.itemBuilder(i, indexInRange, size)}
      </div>
    ),
    [keyExtractor, props.itemBuilder, size]
  );

  const rootStyle: React.CSSProperties = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    width: first(size),
    height: last(size),
    ...props.style,
  };

  const { index, axisValue, indexes } = controller.state;

  return (
    <div ref={ref} className={props.className} style={rootStyle}>
      <ValueNotifierObserver deps={[indexes]}>
        {() => (
          <Content
            primarySize={primarySize}
            isHorizontal={isHorizontal}
            axisValue={axisValue}
            length={indexes.value.length}
          >
            {indexes.value.map(itemBuilder)}
          </Content>
        )}
      </ValueNotifierObserver>
      {props.children}
    </div>
  );
};

export const Reel = React.memo(
  Element,
  (prev, next) =>
    prev.count === next.count &&
    prev.itemBuilder === next.itemBuilder &&
    prev.keyExtractor === next.keyExtractor &&
    first(prev.size) === first(next.size) &&
    last(prev.size) === last(next.size) &&
    prev.beforeChange === next.beforeChange &&
    prev.afterChange === next.afterChange &&
    prev.onSlideDragStart === next.onSlideDragStart &&
    prev.onSlideDragCanceled === next.onSlideDragCanceled &&
    prev.useNavKeys === next.useNavKeys
);

const Content = React.memo(
  ({
    children,
    isHorizontal,
    primarySize,
    axisValue,
    length,
  }: {
    children: React.ReactNode;
    isHorizontal: boolean;
    primarySize: number;
    axisValue: Signal<AnimatedValue>;
    length: number;
  }) => (
    <AnimatedValueNotifierObserver valueNotifier={axisValue}>
      {(value) => (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            transform: `translate${isHorizontal ? 'X' : 'Y'}(${value}px)`,
            flexDirection: isHorizontal ? 'row' : 'column',
            [isHorizontal ? 'width' : 'height']: length * primarySize,
            [isHorizontal ? 'height' : 'width']: '100%',
          }}
        >
          {children}
        </div>
      )}
    </AnimatedValueNotifierObserver>
  )
);

export { defaultRangeExtractor };
export default Reel;
