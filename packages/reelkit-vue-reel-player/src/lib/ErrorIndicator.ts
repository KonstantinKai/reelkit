import { defineComponent, h } from 'vue';
import { ImageOff } from 'lucide-vue-next';

/**
 * Default error indicator shown when a slide's media fails to load.
 */
export const ErrorIndicator = defineComponent({
  name: 'RkErrorIndicator',
  setup() {
    return () =>
      h(
        'div',
        {
          class: 'rk-reel-media-error',
          role: 'img',
          'aria-label': 'Content unavailable',
        },
        [
          h(ImageOff, {
            size: 48,
            strokeWidth: 1.5,
            'aria-hidden': 'true',
          }),
          h(
            'span',
            { class: 'rk-reel-media-error-text' },
            'Content unavailable',
          ),
        ],
      );
  },
});

export default ErrorIndicator;
