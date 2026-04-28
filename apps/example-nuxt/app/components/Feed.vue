<script setup lang="ts">
import { ref } from 'vue';
import { Reel, ReelIndicator, type ReelExpose } from '@reelkit/vue';
import type { FeedItem } from '../types';

defineProps<{ items: FeedItem[] }>();

const reelRef = ref<ReelExpose | null>(null);
</script>

<template>
  <ClientOnly>
    <div :style="{ width: '100vw', height: '100vh', overflow: 'hidden' }">
      <Reel
        ref="reelRef"
        :count="items.length"
        direction="vertical"
        enable-wheel
      >
        <template #item="{ index, size }">
          <div
            v-if="items[index]"
            :style="{
              width: `${size[0]}px`,
              height: `${size[1]}px`,
              backgroundColor: items[index]!.color,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }"
          >
            <h2 :style="{ fontSize: '2rem', fontWeight: 600 }">
              {{ items[index]!.title }}
            </h2>
            <p :style="{ opacity: 0.7, marginTop: '8px' }">
              Item {{ index + 1 }} of {{ items.length }}
            </p>
          </div>
        </template>

        <div
          :style="{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
          }"
        >
          <ReelIndicator
            direction="vertical"
            :visible="5"
            :radius="4"
            :gap="6"
            :on-dot-click="(i: number) => reelRef?.goTo(i, true)"
          />
        </div>
      </Reel>
    </div>
  </ClientOnly>
</template>
