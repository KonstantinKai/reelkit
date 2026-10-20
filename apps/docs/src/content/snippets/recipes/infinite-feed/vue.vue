<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { Reel, type ReelExpose } from '@reelkit/vue';
import { fetchPosts, type Post } from './api';

// Start fetching this many slides before the end, so the next page is usually
// in place before the viewer gets there.
const kLoadAhead = 3;

const posts = shallowRef<Post[]>([]);
const status = ref<'idle' | 'loading' | 'error'>('idle');
const reel = shallowRef<ReelExpose | null>(null);
let nextPage = 0;
let request: AbortController | null = null;

function load() {
  if (status.value === 'loading') return;
  const current = new AbortController();
  request = current;
  status.value = 'loading';

  fetchPosts(nextPage, current.signal).then(
    (page) => {
      nextPage += 1;
      // Only three slides are ever mounted, so an image further down is
      // fetched now and comes from the cache when its slide mounts.
      for (const post of page) new Image().src = post.image;
      posts.value = [...posts.value, ...page];
      status.value = 'idle';
    },
    () => {
      if (!current.signal.aborted) status.value = 'error';
    },
  );
}

function loadNearEnd(index: number) {
  // A failed page waits for Retry, so swiping back and forth does not fire a
  // request each time.
  if (status.value === 'idle' && index >= posts.value.length - kLoadAhead) {
    load();
  }
}

const keyOf = (index: number) => posts.value[index]?.id ?? 'status';

onMounted(load);
onBeforeUnmount(() => request?.abort());
</script>

<template>
  <!--
    One slide past the posts shows the loading or error state. Arrow keys are
    heard window-wide and the wheel would hold the page's scroll. This feed
    sits inside a page, so both stay off and the buttons step through it; turn
    them on when the feed fills the screen.
  -->
  <Reel
    ref="reel"
    :count="posts.length + 1"
    style="width: 100%; height: 100%"
    direction="vertical"
    :enable-nav-keys="false"
    :key-extractor="keyOf"
    @after-change="loadNearEnd"
  >
    <template #item="{ index, size }">
      <div
        v-if="posts[index]"
        :style="{ width: size[0] + 'px', height: size[1] + 'px', position: 'relative' }"
      >
        <img
          :src="posts[index].image"
          alt=""
          style="width: 100%; height: 100%; object-fit: cover"
        />
        <!-- Text laid over a photo needs its own backdrop to stay readable on a light one. -->
        <h2 class="title">{{ posts[index].title }}</h2>
      </div>
      <div
        v-else
        :style="{
          width: size[0] + 'px',
          height: size[1] + 'px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: '#fff',
        }"
      >
        <template v-if="status === 'error'">
          <p style="margin: 0">The feed could not be loaded.</p>
          <button type="button" class="retry" @click="load">Retry</button>
        </template>
        <p v-else style="margin: 0">Loading…</p>
      </div>
    </template>

    <div class="nav">
      <button type="button" class="nav-button" aria-label="Previous post" @click="reel?.prev()">↑</button>
      <button type="button" class="nav-button" aria-label="Next post" @click="reel?.next()">↓</button>
    </div>
  </Reel>
</template>

<style scoped>
.title {
  position: absolute;
  left: 16px;
  bottom: 16px;
  margin: 0;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 18px;
}

.nav {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1;
}

.retry {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.nav-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}
</style>
