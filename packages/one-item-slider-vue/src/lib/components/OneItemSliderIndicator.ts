import {
  defineComponent,
  h,
  computed,
  type PropType,
  type CSSProperties,
} from 'vue';
import type { SliderDirection } from '@kdevsoft/one-item-slider-core';

export const OneItemSliderIndicator = defineComponent({
  name: 'OneItemSliderIndicator',
  props: {
    count: {
      type: Number,
      required: true,
    },
    activeIndex: {
      type: Number,
      required: true,
    },
    direction: {
      type: String as PropType<SliderDirection>,
      default: 'vertical',
    },
    size: {
      type: Number,
      default: 8,
    },
    gap: {
      type: Number,
      default: 8,
    },
    activeColor: {
      type: String,
      default: 'rgba(255, 255, 255, 1)',
    },
    inactiveColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.4)',
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const containerStyle = computed<CSSProperties>(() => ({
      display: 'flex',
      flexDirection: props.direction === 'vertical' ? 'column' : 'row',
      gap: `${props.gap}px`,
      alignItems: 'center',
    }));

    const getDotStyle = (index: number): CSSProperties => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
      borderRadius: '50%',
      backgroundColor:
        index === props.activeIndex ? props.activeColor : props.inactiveColor,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    });

    return () => {
      const dots = Array.from({ length: props.count }, (_, i) =>
        h('span', {
          key: i,
          'data-testid': i,
          style: getDotStyle(i),
          onClick: () => emit('click', i),
        })
      );

      return h(
        'div',
        { style: containerStyle.value },
        dots
      );
    };
  },
});
