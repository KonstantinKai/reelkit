import { defineComponent, h } from 'vue';

/**
 * Full-slide wave-loader shown while media is buffering.
 */
export const LoadingIndicator = defineComponent({
  name: 'RkLoadingIndicator',
  setup() {
    return () => h('div', { class: 'rk-reel-loader' });
  },
});

export default LoadingIndicator;
