<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  LightboxUrlOverlay,
  type LightboxItem,
  type UrlLocator,
} from '@reelkit/vue-lightbox';
import { useOverlayUrlState, indexCodec } from '@reelkit/vue';
import { cdnUrl } from '@reelkit/example-data';
import Thumbnail from '../components/Thumbnail.vue';
import { useVueRouterUrlAdapter } from '../composables/useVueRouterUrlAdapter';
import '@reelkit/vue-lightbox/styles.css';

const _kParam = 'photo';

// How many images this page pretends to have loaded so far.
const _kPageSize = 3;

// Stand-in for the round trip that fetches the next page.
const _kFetchDelayMs = 900;

const sampleImages: LightboxItem[] = [
  { src: cdnUrl('samples/images/image-01.jpg'), title: 'Mountain River' },
  { src: cdnUrl('samples/images/image-02.jpg'), title: 'Snowy Peaks' },
  { src: cdnUrl('samples/images/image-03.jpg'), title: 'Foggy Forest' },
  { src: cdnUrl('samples/images/image-04.jpg'), title: 'Ocean Waves' },
  { src: cdnUrl('samples/images/image-05.jpg'), title: 'Autumn Path' },
];

// This application is routed, so the router drives every read and write — the
// default History adapter would leave the router's own location stale.
const adapter = useVueRouterUrlAdapter();

// Only part of the gallery has "arrived" — the rest stands in for pages this
// feed has not fetched yet.
const loaded = ref(sampleImages.slice(0, _kPageSize));
const fetching = ref(false);

// The parameter is a plain index, so the identity is the index — no codec
// needed. The locator windows it: `locate` answers only for what has loaded,
// and `locateAsync` fetches the rest. A supplied locator owns its own validity,
// so `locate` rejects anything outside the loaded window itself.
const locator: UrlLocator<number> = {
  locate: (index) => (index >= 0 && index < loaded.value.length ? index : null),
  identify: (index) => index,
  locateAsync: async (index) => {
    if (index < 0 || index >= sampleImages.length) return null;
    fetching.value = true;
    await new Promise((done) => setTimeout(done, _kFetchDelayMs));
    loaded.value = sampleImages.slice(0, index + 1);
    fetching.value = false;
    // The index the fetch just established — the lightbox takes it as-is,
    // never re-reading `items` (which Vue has not re-rendered yet).
    return index;
  },
};

// Build the controller once from the windowed locator, then hand it to the
// overlay. Keeping it here (not inside the overlay) leaves `photo.set` on hand
// for programmatic control. The parameter is a plain index, so it pairs with
// the built-in indexCodec.
const photo = useOverlayUrlState({
  param: _kParam,
  adapter,
  codec: indexCodec,
  locator,
});

const router = useRouter();

// Navigating through the router. No href, so the browser affordances are gone,
// but the URL still changes and back still closes.
const openLastViaRouter = () =>
  router.push(`?${_kParam}=${sampleImages.length - 1}`);

// Straight through the controller. The adapter routes the write, so this ends
// up in the same place as the other two — the difference is that the open
// started in code rather than from something the user could copy or middle-click.
const openLastViaController = () => photo.set(sampleImages.length - 1);
</script>

<template>
  <div class="image-gallery-page">
    <div class="gallery-header">
      <h1>URL Gallery</h1>
      <p>
        Every thumbnail is an ordinary link to <code>?photo=&lt;index&gt;</code>
        — open one in a new tab, copy its address, or press back to close.
        Paging through the gallery never piles up history entries.
      </p>
      <p>
        Back closes the gallery when you opened it from here — the link pushed
        an entry, so back pops to the gallery. A shared link opened directly in
        a fresh tab has no history behind it, so back leaves the site; close
        with the ✕ button or Escape to stay on the gallery.
      </p>
      <p>
        Only the first {{ _kPageSize }} images have loaded. The buttons below
        all point past them, the way a shared link into a long feed does — the
        lightbox waits for the image to arrive instead of discarding the
        address.
      </p>
      <div class="transition-selector">
        <!-- All three buttons open the same slide. They differ only in what the
             browser gets to know about it. -->

        <!-- A link, so the browser's own behaviour comes free: new tab, copy
             address, hover target, keyboard reach. -->
        <RouterLink
          :to="`?${_kParam}=${sampleImages.length - 1}`"
          class="transition-btn"
        >
          Open image {{ sampleImages.length }} (link)
        </RouterLink>
        <button type="button" class="transition-btn" @click="openLastViaRouter">
          Open image {{ sampleImages.length }} (router)
        </button>
        <button
          type="button"
          class="transition-btn"
          @click="openLastViaController"
        >
          Open image {{ sampleImages.length }} (controller.set)
        </button>
        <span v-if="fetching">Loading photo…</span>
      </div>
    </div>

    <div class="gallery-grid">
      <RouterLink
        v-for="(image, index) in loaded"
        :key="image.src"
        :to="`?${_kParam}=${index}`"
        class="gallery-item"
      >
        <Thumbnail :src="image.src" />
        <div class="gallery-item-overlay">
          <span v-if="image.title" class="gallery-item-title">{{
            image.title
          }}</span>
        </div>
      </RouterLink>
    </div>

    <LightboxUrlOverlay :controller="photo" :items="loaded" />
  </div>
</template>

<style scoped>
.image-gallery-page {
  min-height: 100dvh;
  padding: 56px 24px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.gallery-header {
  max-width: 1200px;
  margin: 0 auto 32px;
  text-align: center;
  color: #fff;
}

.gallery-header h1 {
  margin: 0 0 12px;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gallery-header p {
  margin: 0 0 8px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.gallery-header code {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.85em;
}

.transition-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.transition-selector span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.transition-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.transition-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 4 / 3;
  background: rgba(255, 255, 255, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.gallery-item:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.gallery-item-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-item-overlay {
  opacity: 1;
}

.gallery-item-title {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 600px) {
  .image-gallery-page {
    padding: 48px 12px 12px;
  }

  .gallery-header h1 {
    font-size: 1.75rem;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .gallery-item {
    border-radius: 8px;
  }

  .gallery-item-overlay {
    opacity: 1;
    padding: 8px;
  }

  .gallery-item-title {
    font-size: 12px;
  }
}
</style>
