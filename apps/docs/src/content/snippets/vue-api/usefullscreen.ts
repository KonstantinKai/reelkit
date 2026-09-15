import { ref } from 'vue';
import { useFullscreen } from '@reelkit/vue';

const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, request, exit, toggle } = useFullscreen({
  elementRef: containerRef,
});
