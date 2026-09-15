import { ref } from 'vue';
import { useBodyLock } from '@reelkit/vue';

const isOpen = ref(false);
useBodyLock(isOpen);

// Also accepts a static boolean
useBodyLock(true);
