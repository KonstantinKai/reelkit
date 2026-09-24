<script setup lang="ts">
import { computed, shallowRef } from 'vue';
import type {
  ChromePlacement,
  DesktopLayout,
} from '@reelkit/vue-stories-player';
import { persistedRef } from '../composables/persistedRef';
import Segmented from '../components/Segmented.vue';
import StoriesSwitches from '../components/StoriesSwitches.vue';
import StoriesUrlDemo from './stories-player-url/StoriesUrlDemo.vue';
import {
  generateUrlGroups,
  kUrlPageSize,
  type Addressing,
  type InnerKey,
} from './stories-player-url/urlFeed';

// The whole feed, generated once, and the part of it that has "arrived". Both
// outlive a switch, so paging in a group survives a change of URL key shape.
const allGroups = generateUrlGroups();
const loaded = shallowRef(allGroups.slice(0, kUrlPageSize));

const addressing = persistedRef<Addressing>(
  'reelkit-stories-player-url-addressing',
  'index',
);
const innerKey = persistedRef<InnerKey>(
  'reelkit-stories-player-url-inner-key',
  'index',
);
const hash = persistedRef('reelkit-stories-player-url-hash', false);
const rememberSeen = persistedRef(
  'reelkit-stories-player-url-remember-seen',
  true,
);
const desktopLayout = persistedRef<DesktopLayout>(
  'reelkit-stories-player-url-desktop-layout',
  'single',
);
const chromePlacement = persistedRef<ChromePlacement>(
  'reelkit-stories-player-url-chrome-placement',
  'overlay',
);

const hashable = computed(
  () => addressing.value === 'stableId' || innerKey.value === 'stableId',
);

// Remount when the key shape changes: `useOverlayUrlState` builds its controller
// once, so a fresh key needs a fresh instance. The stale parameter self-heals
// out of the URL.
const demoKey = computed(
  () => `${addressing.value}.${innerKey.value}.${hash.value ? 'hash' : 'raw'}`,
);
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>URL Stories Player</h1>
      <p class="subtitle">
        The open group and story live in one
        <code>?story=&lt;group&gt;.&lt;story&gt;</code> parameter. Tapping a
        ring opens that user; swiping only replaces the entry, so one back step
        always closes. The switches rebuild the group half of the URL key. Only
        the first {{ kUrlPageSize }} groups have loaded — a link past them pages
        the rest in first.
      </p>

      <div class="switchers">
        <Segmented
          legend="Group addressing"
          :options="[
            {
              label: 'Index — 2.…',
              active: addressing === 'index',
              onClick: () => (addressing = 'index'),
            },
            {
              label: 'Stable id — user-2.…',
              active: addressing === 'stableId',
              onClick: () => (addressing = 'stableId'),
            },
          ]"
        />
        <Segmented
          legend="Story addressing"
          :options="[
            {
              label: 'Index — .0',
              active: innerKey === 'index',
              onClick: () => (innerKey = 'index'),
            },
            {
              label: 'Stable id — .story-2-0',
              active: innerKey === 'stableId',
              onClick: () => (innerKey = 'stableId'),
            },
          ]"
        />
        <Segmented
          legend="Hash (stable id)"
          :options="[
            {
              label: 'Raw',
              active: hashable && !hash,
              disabled: !hashable,
              onClick: () => (hash = false),
            },
            {
              label: 'base64url',
              active: hashable && hash,
              disabled: !hashable,
              onClick: () => (hash = true),
            },
          ]"
        />
        <StoriesSwitches
          v-model:remember-seen="rememberSeen"
          v-model:desktop-layout="desktopLayout"
          v-model:chrome-placement="chromePlacement"
        />
      </div>

      <StoriesUrlDemo
        :key="demoKey"
        v-model:loaded="loaded"
        :all-groups="allGroups"
        :addressing="addressing"
        :inner-key="innerKey"
        :hash="hash"
        :remember-seen="rememberSeen"
        :desktop-layout="desktopLayout"
        :chrome-placement="chromePlacement"
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
</style>
