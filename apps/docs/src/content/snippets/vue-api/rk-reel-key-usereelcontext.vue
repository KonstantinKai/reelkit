<script setup lang="ts">
import { useReelContext } from '@reelkit/vue';

const ctx = useReelContext();

function jump(index: number) {
  ctx?.goTo(index, true);
}
</script>
