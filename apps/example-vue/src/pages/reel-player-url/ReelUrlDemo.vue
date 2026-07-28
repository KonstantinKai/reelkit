<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Play } from 'lucide-vue-next';
import {
  ReelPlayerUrlOverlay,
  type ContentItem,
  type MediaItem,
} from '@reelkit/vue-reel-player';
import {
  useOverlayUrlState,
  indexCodec,
  urlStableIdKey,
  base64UrlCodec,
  urlIndexTwoAxisKey,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type TwoAxisPosition,
} from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import { getThumbnail } from '@reelkit/example-data';
import Thumbnail from '../../components/Thumbnail.vue';
import '@reelkit/vue-reel-player/styles.css';

type Addressing = 'index' | 'stableId';
type Axis = 'one' | 'two';
type InnerKey = 'index' | 'stableId';

const _kParam = 'reel';
const _kPageSize = 6;
const _kFetchDelayMs = 900;

const props = defineProps<{
  feed: ContentItem[];
  addressing: Addressing;
  axis: Axis;
  innerKey: InnerKey;
  hash: boolean;
}>();

const { feed, addressing, axis, innerKey, hash } = props;

// Only part of the feed has "arrived"; a link past the window pages the rest in
// through the locator. This instance is rebuilt when a switch changes the key
// shape, so the window resets with it.
const loaded = ref(feed.slice(0, _kPageSize));
const fetching = ref(false);

const adapter = useVueRouterUrlAdapter();
const innerIsId = axis === 'two' && innerKey === 'stableId';

// The wide key shape the four built-ins collapse to for this demo.
type ReelKey = UrlKey<number | string, number | TwoAxisPosition>;

// One id codec for whichever axes are id-addressed — items-independent, so
// pairing it with a paging (or inner) locator is fair game. A base64url
// `hashCodec` obscures the id on the wire; omit it to keep the id raw.
const idCodec = urlStableIdKey({
  items: () => [],
  hashCodec: hash ? base64UrlCodec : undefined,
}).codec as UrlCodec<number | string>;
const outerCodec = (addressing === 'index' ? indexCodec : idCodec) as UrlCodec<
  number | string
>;

const pageTo = async (index: number) => {
  fetching.value = true;
  await new Promise((done) => setTimeout(done, _kFetchDelayMs));
  loaded.value = feed.slice(0, index + 1);
  fetching.value = false;
  return index;
};

// Both outer locators window `loaded` and page the rest in on a miss. The index
// locator names a position; the id locator scans the full feed for the shared
// id — a link can only name an id the feed will eventually hold.
const indexLocator: UrlLocator<number> = {
  locate: (i) => (i >= 0 && i < loaded.value.length ? i : null),
  identify: (i) => i,
  locateAsync: (i) =>
    i < 0 || i >= feed.length ? Promise.resolve(null) : pageTo(i),
};
const idLocator: UrlLocator<string> = {
  locate: (id) => {
    const i = loaded.value.findIndex((x) => x.id === id);
    return i === -1 ? null : i;
  },
  identify: (i) => loaded.value[i].id,
  locateAsync: (id) => {
    const i = feed.findIndex((x) => x.id === id);
    return i === -1 ? Promise.resolve(null) : pageTo(i);
  },
};
const outerLocator = (
  addressing === 'index' ? indexLocator : idLocator
) as UrlLocator<number | string>;

// The inner axis is index by default; opt into ids by scanning the outer slot's
// media for a matching id. `innerLocate` receives the resolved outer index, so
// it scans the right post's media.
const innerOptions = innerIsId
  ? {
      innerCodec: idCodec,
      innerLocate: (outerIndex: number, id: number | string) => {
        const post = loaded.value[outerIndex];
        if (!post) return null;
        const i = post.media.findIndex((m) => m.id === id);
        return i === -1 ? null : i;
      },
      innerIdentify: (outerIndex: number, i: number): number | string =>
        loaded.value[outerIndex].media[i].id,
    }
  : {};

// The conditional-type guard wants concrete axis identities; this demo picks
// them at runtime, so build the key through a widened call.
const buildTwoAxis = urlIndexTwoAxisKey as unknown as (
  options: unknown,
) => ReelKey;
const key: ReelKey =
  axis === 'one'
    ? ({ codec: outerCodec, locator: outerLocator } as ReelKey)
    : buildTwoAxis({
        outerCodec,
        outerLocator,
        outerCount: () => loaded.value.length,
        innerCounts: () => loaded.value.map((item) => item.media.length),
        ...innerOptions,
      });

const reel = useOverlayUrlState({ param: _kParam, adapter, ...key }) as
  | UrlStateController<number>
  | UrlStateController<TwoAxisPosition>;

// Exact wire value for each axis, straight from the active codec. `feed` holds
// every id, so a deep link past the window can still be spelled.
const encodeOuter = (index: number) =>
  outerCodec.encode(addressing === 'index' ? index : feed[index].id);
const encodeInner = (index: number, inner: number) =>
  innerIsId ? idCodec.encode(feed[index].media[inner].id) : String(inner);

const wireFor = (index: number, inner: number) =>
  axis === 'two'
    ? `${encodeOuter(index)}.${encodeInner(index, inner)}`
    : encodeOuter(index);

const last = feed.length - 1;

const hasVideo = (item: ContentItem) =>
  item.media.some((m: MediaItem) => m.type === 'video');

// Pass the raw wire string: `set` writes it verbatim, so it works even for a
// post past the window whose id `identify` could not yet read.
const openLast = () =>
  (reel as UrlStateController<number>).set(wireFor(last, 0));
</script>

<template>
  <div class="actions">
    <RouterLink :to="`?${_kParam}=${wireFor(last, 0)}`" class="action-btn">
      Open post {{ feed.length }} (link, past the window)
    </RouterLink>
    <button type="button" class="action-btn" @click="openLast">
      Open post {{ feed.length }} (controller.set)
    </button>
    <span v-if="fetching">Loading post…</span>
  </div>

  <div class="grid">
    <div v-for="(item, index) in loaded" :key="item.id">
      <RouterLink
        :to="`?${_kParam}=${wireFor(index, 0)}`"
        class="thumb"
        :aria-label="`Open post ${index + 1}`"
      >
        <Thumbnail :src="getThumbnail(item)" />
        <div v-if="hasVideo(item)" class="video-badge">
          <Play :size="14" fill="#fff" color="#fff" />
        </div>
      </RouterLink>
      <div v-if="axis === 'two' && item.media.length > 1" class="inner-chips">
        <RouterLink
          v-for="(_, inner) in item.media"
          :key="inner"
          :to="`?${_kParam}=${wireFor(index, inner)}`"
          class="chip"
        >
          {{ index }}.{{ inner }}
        </RouterLink>
      </div>
    </div>
  </div>

  <ReelPlayerUrlOverlay :controller="reel" :content="loaded" />
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 0 0 24px;
}

.action-btn {
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}

.thumb {
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background-color: #000;
  display: block;
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
}

.inner-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

.chip {
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.7rem;
  text-decoration: none;
}
</style>
