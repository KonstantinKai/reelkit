<script setup lang="ts">
import { ref } from 'vue';
import { useBodyLock, useFullscreen, useReelContext } from '@reelkit/vue';

// Lock body scroll when an overlay is open
const isOpen = ref(true);
useBodyLock(isOpen);

// Fullscreen API with cross-browser support
const containerRef = ref<HTMLElement | null>(null);
const { isFullscreen, toggle } = useFullscreen({ elementRef: containerRef });

// Access parent Reel context (when inside a Reel)
const reelContext = useReelContext();
// reelContext?.index  — active slide index signal
// reelContext?.count  — total slide count signal
// reelContext?.goTo() — navigate programmatically

// Bridge a core Subscribable into a reactive Vue ref
import { toVueRef } from '@reelkit/vue';
const index = toVueRef(reelContext!.index); // Ref<number> — re-renders on change
</script>
