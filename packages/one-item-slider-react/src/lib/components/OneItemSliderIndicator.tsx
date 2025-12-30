import * as React from 'react';
import { clamp, extractRange, first } from '@kdevsoft/one-item-slider-core';
import useDepsDidChangeEffect from '../hooks/useDepsDidChangeEffect';
import useRafState from '../hooks/useRafState';

export interface OneItemSliderIndicatorProps {
  count: number;
  active: number;
  radius?: number;
  visible?: number;
  className?: string;
  style?: React.CSSProperties;
  onDotClick?: (index: number) => void;
  renderDot?: (props: {
    index: number;
    isActive: boolean;
    isBounded: boolean;
  }) => React.ReactElement;
}

const Element: React.FC<OneItemSliderIndicatorProps> = (props) => {
  const { count, active, visible = 3, radius = 3, className, style, onDotClick, renderDot } = props;
  const activeRef = React.useRef(active);
  const itemSize = React.useMemo(() => radius * 2 + 6, [radius]);
  const [axisValue, setAxisValue] = useRafState(() =>
    count <= visible ? 0 : active > 0 ? (active - 1) * -1 * itemSize : itemSize,
  );
  const [range, setRange] = React.useState(() =>
    extractRange(count, active, clamp(active + visible - 1, 0, count - 1), 0),
  );

  const width = React.useMemo(
    () => (count <= visible ? itemSize * count : itemSize * (visible + 2)),
    [visible, itemSize, count],
  );

  useDepsDidChangeEffect(() => {
    if (range.indexOf(active) === -1) {
      const increment = active > activeRef.current ? 1 : -1;
      const isLoopToFirst = active === 0 && activeRef.current === count - 1;
      const isLoopToLast = active === count - 1 && activeRef.current === 0;
      setAxisValue((prev) => {
        if (isLoopToFirst) {
          return itemSize;
        }

        if (isLoopToLast) {
          return clamp(count - 1 - visible, 0, count) * itemSize * -1;
        }

        return prev + itemSize * increment * -1;
      });
      setRange(() => {
        if (isLoopToFirst) {
          return extractRange(count, 0, visible - 1, 0);
        }

        if (isLoopToLast) {
          return extractRange(count, clamp(count - visible, 0, count), count - 1, 0);
        }

        return extractRange(count, first(range) + increment, first(range) + increment + visible - 1, 0);
      });
    }

    activeRef.current = active;
  }, [active]);

  const defaultRenderDot = React.useCallback(
    ({ index, isActive, isBounded }: { index: number; isActive: boolean; isBounded: boolean }) => {
      const dotStyle: React.CSSProperties = {
        width: radius * 2,
        height: radius * 2,
        borderRadius: '50%',
        backgroundColor: isActive ? '#fff' : 'rgba(255, 255, 255, 0.44)',
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        transform: isBounded ? 'scale(0.7)' : 'scale(1)',
        margin: isActive ? '0 1px' : '0 3px',
        cursor: onDotClick ? 'pointer' : 'default',
      };

      const wrapperStyle: React.CSSProperties = isActive
        ? {
            width: radius * 2 + 4,
            height: radius * 2 + 4,
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: '1px solid #fff',
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
            margin: '0 1px',
            cursor: onDotClick ? 'pointer' : 'default',
          }
        : {};

      const handleClick = onDotClick ? () => onDotClick(index) : undefined;

      if (isActive) {
        return (
          <span key={index} style={wrapperStyle} onClick={handleClick}>
            <span data-testid={index} style={{ ...dotStyle, margin: 0 }} />
          </span>
        );
      }

      return <span key={index} data-testid={index} style={dotStyle} onClick={handleClick} />;
    },
    [radius, onDotClick],
  );

  const renderDotFn = renderDot ?? defaultRenderDot;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto',
        width,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          alignItems: 'center',
          transition: 'transform 0.3s ease',
          transform: `translateX(${axisValue}px)`,
        }}
      >
        {Array.from({ length: count }, (_, i) => {
          const isActive = i === active;
          const bounded = !range.includes(i);

          return renderDotFn({
            index: i,
            isActive,
            isBounded: bounded,
          });
        })}
      </div>
    </div>
  );
};

export const OneItemSliderIndicator = React.memo(Element);

export default OneItemSliderIndicator;
