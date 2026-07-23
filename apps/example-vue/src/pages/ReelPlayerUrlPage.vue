<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { Play } from 'lucide-vue-next';
import {
  ReelPlayerUrlOverlay,
  type ContentItem,
  type MediaItem,
  type UrlLocator,
} from '@reelkit/vue-reel-player';
import { useOverlayUrlState, indexCodec } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import { generateContent, getThumbnail } from '@reelkit/example-data';
import Thumbnail from '../components/Thumbnail.vue';
import '@reelkit/vue-reel-player/styles.css';

const _kParam = 'reel';

// How many posts this page pretends to have loaded so far.
const _kPageSize = 6;

// Stand-in for the round trip that fetches the next page.
const _kFetchDelayMs = 900;

// The full feed, generated once so the windowed locator has a stable target.
const feed: ContentItem[] = generateContent(24);

// This application is routed, so the router drives every read and write — the
// default History adapter would leave the router's own location stale.
const adapter = useVueRouterUrlAdapter();

// Only part of the feed has "arrived"; the rest stands in for pages not yet
// fetched.
const loaded = ref(feed.slice(0, _kPageSize));
const fetching = ref(false);

// Overlapping fetches: the window only ever grows, so a slow early request can
// never shrink it under a slide a later request already loaded, and only the
// latest request may clear the loading flag.
let fetchTicket = 0;

// A plain index feed, so identity is the index (built-in indexCodec). The
// locator windows it: `locate` answers only for the loaded window, `locateAsync`
// fetches the rest so a deep link into an unloaded post still opens.
const locator: UrlLocator<number> = {
  locate: (index) => (index >= 0 && index < loaded.value.length ? index : null),
  identify: (index) => index,
  locateAsync: async (index) => {
    if (index < 0 || index >= feed.length) return null;
    const ticket = ++fetchTicket;
    fetching.value = true;
    await new Promise((done) => setTimeout(done, _kFetchDelayMs));
    loaded.value = feed.slice(0, Math.max(loaded.value.length, index + 1));
    if (ticket === fetchTicket) fetching.value = false;
    return index;
  },
};

const reel = useOverlayUrlState({
  param: _kParam,
  adapter,
  codec: indexCodec,
  locator,
});

const router = useRouter();

const openLastViaRouter = () => router.push(`?${_kParam}=${feed.length - 1}`);

const openLastViaController = () => reel.set(feed.length - 1);
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>URL Reel Player</h1>
      <p class="subtitle">
        Every thumbnail is an ordinary link to
        <code>?reel=&lt;index&gt;</code> — open one in a new tab, copy its
        address, or press back to close. Paging the feed never piles up history
        entries, so one back step always leaves the player.
      </p>
      <p class="subtitle">
        Back closes the player when you opened it from here. A shared link
        opened directly in a fresh tab has no history behind it, so back leaves
        the site; close with the ✕ button or Escape to stay.
      </p>
      <p class="subtitle">
        Only the first {{ _kPageSize }} posts have loaded. The buttons below all
        point past them, the way a shared link into a long feed does — the
        player waits for the post to arrive instead of discarding the address.
      </p>

      <div class="actions">
        <RouterLink :to="`?${_kParam}=${feed.length - 1}`" class="action-btn">
          Open post {{ feed.length }} (link)
        </RouterLink>
        <button type="button" class="action-btn" @click="openLastViaRouter">
          Open post {{ feed.length }} (router)
        </button>
        <button type="button" class="action-btn" @click="openLastViaController">
          Open post {{ feed.length }} (controller.set)
        </button>
        <span v-if="fetching">Loading post…</span>
      </div>

      <div class="grid">
        <RouterLink
          v-for="(item, index) in loaded"
          :key="item.id"
          :to="`?${_kParam}=${index}`"
          class="thumb"
        >
          <Thumbnail :src="getThumbnail(item)" />
          <div
            v-if="item.media.some((m: MediaItem) => m.type === 'video')"
            class="video-badge"
          >
            <Play :size="14" fill="#fff" color="#fff" />
          </div>
          <div v-if="item.media.length > 1" class="multi-badge">
            {{ item.media.length }}
          </div>
          <div class="author">
            <img :src="item.author.avatar" alt="" class="avatar" />
            <span class="author-name">{{ item.author.name }}</span>
          </div>
        </RouterLink>
      </div>
    </div>

    <ReelPlayerUrlOverlay :controller="reel" :content="loaded" />
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
  margin-bottom: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 24px 0 32px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #222;
  transition: transform 0.2s;
  display: block;
}

.thumb:hover {
  transform: scale(1.02);
}

.video-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.multi-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 500;
}

.author {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px 8px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  color: #fff;
  font-size: 0.7rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
