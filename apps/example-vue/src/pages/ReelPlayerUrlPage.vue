<script setup lang="ts">
import { computed } from 'vue';
import { type ContentItem } from '@reelkit/vue-reel-player';
import { generateContent } from '@reelkit/example-data';
import { persistedRef } from '../composables/persistedRef';
import ReelUrlDemo from './reel-player-url/ReelUrlDemo.vue';

type Addressing = 'index' | 'stableId';
type Axis = 'one' | 'two';
type InnerKey = 'index' | 'stableId';

// How many posts the demo pretends to have loaded so far — mirrored in the
// child, shown here only in the copy below.
const _kPageSize = 6;

// The full feed, generated once so a switch never regenerates it.
const feed: ContentItem[] = generateContent(24);

const addressing = persistedRef<Addressing>(
  'reelkit-reel-player-url-addressing',
  'index',
);
const axis = persistedRef<Axis>('reelkit-reel-player-url-axis', 'one');
const innerKey = persistedRef<InnerKey>(
  'reelkit-reel-player-url-inner-key',
  'index',
);
const hash = persistedRef('reelkit-reel-player-url-hash', false);

const innerSwitchable = computed(() => axis.value === 'two');
const hashable = computed(
  () =>
    addressing.value === 'stableId' ||
    (innerSwitchable.value && innerKey.value === 'stableId'),
);

// Remount when the key shape changes: `useOverlayUrlState` builds its controller
// once, so a fresh key needs a fresh instance. The stale parameter self-heals
// out of the URL.
const demoKey = computed(
  () =>
    `${addressing.value}.${axis.value}.${innerKey.value}.${
      hash.value ? 'hash' : 'raw'
    }`,
);
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>URL Reel Player</h1>
      <p class="subtitle">
        Every thumbnail is an ordinary link — open one in a new tab, copy its
        address, or press back to close. The switches rebuild the URL key, so
        the address bar changes shape while the player stays the same. Only the
        first
        {{ _kPageSize }} posts have loaded; the buttons point past them, so a
        shared link pages the rest in through the locator before it opens.
      </p>

      <div class="switchers">
        <fieldset class="seg">
          <legend>Addressing</legend>
          <div class="seg-row">
            <button
              type="button"
              :class="{ on: addressing === 'index' }"
              @click="addressing = 'index'"
            >
              Index — ?reel=3
            </button>
            <button
              type="button"
              :class="{ on: addressing === 'stableId' }"
              @click="addressing = 'stableId'"
            >
              Stable id — ?reel=&lt;id&gt;
            </button>
          </div>
        </fieldset>

        <fieldset class="seg">
          <legend>Axis</legend>
          <div class="seg-row">
            <button
              type="button"
              :class="{ on: axis === 'one' }"
              @click="axis = 'one'"
            >
              One — post
            </button>
            <button
              type="button"
              :class="{ on: axis === 'two' }"
              @click="axis = 'two'"
            >
              Two — post.media
            </button>
          </div>
        </fieldset>

        <fieldset class="seg">
          <legend>Inner key (2-axis)</legend>
          <div class="seg-row">
            <button
              type="button"
              :class="{ on: innerSwitchable && innerKey === 'index' }"
              :disabled="!innerSwitchable"
              @click="innerKey = 'index'"
            >
              Index — .2
            </button>
            <button
              type="button"
              :class="{ on: innerSwitchable && innerKey === 'stableId' }"
              :disabled="!innerSwitchable"
              @click="innerKey = 'stableId'"
            >
              Stable id — .&lt;media-id&gt;
            </button>
          </div>
        </fieldset>

        <fieldset class="seg">
          <legend>Hash (stable id)</legend>
          <div class="seg-row">
            <button
              type="button"
              :class="{ on: hashable && !hash }"
              :disabled="!hashable"
              @click="hash = false"
            >
              Raw
            </button>
            <button
              type="button"
              :class="{ on: hashable && hash }"
              :disabled="!hashable"
              @click="hash = true"
            >
              base64url
            </button>
          </div>
        </fieldset>
      </div>

      <ReelUrlDemo
        :key="demoKey"
        :feed="feed"
        :addressing="addressing"
        :axis="axis"
        :inner-key="innerKey"
        :hash="hash"
      />
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  background-color: #111;
  padding: 56px 16px 16px;
  color: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 16px;
  font-weight: 500;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.switchers {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.seg {
  border: 0;
  padding: 0;
  margin: 0;
}

.seg legend {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.72rem;
  margin-bottom: 6px;
}

.seg-row {
  display: flex;
  gap: 6px;
}

.seg-row button {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-size: 0.8rem;
  cursor: pointer;
}

.seg-row button.on {
  background: rgba(99, 102, 241, 0.55);
}

.seg-row button:disabled {
  color: rgba(255, 255, 255, 0.3);
  cursor: not-allowed;
}
</style>
