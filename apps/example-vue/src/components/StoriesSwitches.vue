<script setup lang="ts">
import type {
  ChromePlacement,
  DesktopLayout,
} from '@reelkit/vue-stories-player';
import Segmented from './Segmented.vue';

/**
 * The switches every stories demo shares. "Remember seen" off makes a page
 * behave as if nothing had ever been seen: rings all unseen, every group
 * opens on its first story, nothing recorded. The store stays attached, so
 * switching back on shows what was stored all along. "Desktop layout" picks
 * the single story or the carousel of neighbouring groups. "Progress &
 * header" picks one copy above the player or one inside every group, which
 * turns with the group the way Instagram does it.
 */
const rememberSeen = defineModel<boolean>('rememberSeen', { required: true });
const desktopLayout = defineModel<DesktopLayout>('desktopLayout', {
  required: true,
});
const chromePlacement = defineModel<ChromePlacement>('chromePlacement', {
  required: true,
});
</script>

<template>
  <Segmented
    legend="Remember seen"
    :options="
      [true, false].map((remember) => ({
        label: remember ? 'On' : 'Off',
        active: rememberSeen === remember,
        onClick: () => (rememberSeen = remember),
      }))
    "
  />
  <Segmented
    legend="Desktop layout"
    :options="
      (['single', 'carousel'] as const).map((layout) => ({
        label: layout === 'single' ? 'Single' : 'Carousel',
        active: desktopLayout === layout,
        onClick: () => (desktopLayout = layout),
      }))
    "
  />
  <Segmented
    legend="Progress & header"
    :options="
      (['overlay', 'group'] as const).map((placement) => ({
        label: placement === 'overlay' ? 'Overlay' : 'Group',
        active: chromePlacement === placement,
        onClick: () => (chromePlacement = placement),
      }))
    "
  />
</template>
