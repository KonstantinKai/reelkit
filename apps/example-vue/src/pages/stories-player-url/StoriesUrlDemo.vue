<script setup lang="ts">
import { shallowRef } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  StoriesRingList,
  StoriesUrlOverlay,
  createStoriesViewedStateController,
  useOverlayUrlState,
  urlIndexTwoAxisKey,
  base64UrlCodec,
  type DesktopLayout,
  type StoriesGroup,
  type TwoAxisIdentity,
  type TwoAxisPosition,
  type UrlCodec,
  type UrlKey,
  type UrlLocator,
  type UrlStateController,
} from '@reelkit/vue-stories-player';
import { indexCodec, urlStableIdKey } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import '@reelkit/vue-stories-player/styles.css';
import type { Addressing, InnerKey } from './urlFeed';

const _kParam = 'story';
const _kFetchDelayMs = 600;

/**
 * URL-driven stories player over a windowed feed. The open group and story ride
 * one `?story=<group>.<story>` parameter — the outer group switchable between a
 * bare index and the author's stable id (raw or base64url), the inner story an
 * index or the story id. Only the first few groups have "arrived"; a link past
 * the window pages the rest in through the group locator's `locateAsync`.
 *
 * The parent remounts this whenever the key shape changes, so everything below
 * is built once for one shape.
 */
const props = defineProps<{
  allGroups: StoriesGroup[];
  addressing: Addressing;
  innerKey: InnerKey;
  hash: boolean;
  rememberSeen: boolean;
  desktopLayout: DesktopLayout;
}>();

const loaded = defineModel<StoriesGroup[]>('loaded', { required: true });

const { allGroups, addressing, innerKey, hash } = props;
const innerIsId = innerKey === 'stableId';
const fetching = shallowRef(false);
const router = useRouter();

// One id codec for whichever axes are id-addressed (group by author id, story
// by story id). Items-independent, so it pairs with a paging locator.
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
  loaded.value = allGroups.slice(0, index + 1);
  fetching.value = false;
  return index;
};

const indexLocator: UrlLocator<number> = {
  locate: (i) => (i >= 0 && i < loaded.value.length ? i : null),
  identify: (i) => i,
  locateAsync: (i) =>
    i < 0 || i >= allGroups.length ? Promise.resolve(null) : pageTo(i),
};
const idLocator: UrlLocator<string> = {
  locate: (id) => {
    const i = loaded.value.findIndex((group) => group.author.id === id);
    return i === -1 ? null : i;
  },
  identify: (i) => loaded.value[i].author.id,
  locateAsync: (id) => {
    const i = allGroups.findIndex((group) => group.author.id === id);
    return i === -1 ? Promise.resolve(null) : pageTo(i);
  },
};
const outerLocator = (
  addressing === 'index' ? indexLocator : idLocator
) as UrlLocator<number | string>;

// The inner (story) axis is an index by default; opt into ids by scanning the
// resolved group's stories for a matching id.
const innerOptions = innerIsId
  ? {
      innerCodec: idCodec,
      innerLocate: (outerIndex: number, id: number | string) => {
        const group = loaded.value[outerIndex];
        if (!group) return null;
        const i = group.stories.findIndex((story) => story.id === id);
        return i === -1 ? null : i;
      },
      innerIdentify: (outerIndex: number, i: number): number | string =>
        loaded.value[outerIndex].stories[i].id,
    }
  : {};

// The conditional-type guard wants concrete axis identities; this demo picks
// them at runtime, so build the key through a widened call.
const buildTwoAxis = urlIndexTwoAxisKey as unknown as (
  options: unknown,
) => ReturnType<typeof urlIndexTwoAxisKey>;
const key = buildTwoAxis({
  outerCodec,
  outerLocator,
  outerCount: () => loaded.value.length,
  innerCounts: () => loaded.value.map((group) => group.stories.length),
  ...innerOptions,
});

// Exact wire per axis, from the active codec. `allGroups` holds every id, so a
// deep link past the loaded window can still be spelled.
const encodeGroup = (groupIndex: number) =>
  outerCodec.encode(
    addressing === 'index' ? groupIndex : allGroups[groupIndex].author.id,
  );
const encodeStory = (groupIndex: number, storyIndex: number) =>
  innerIsId
    ? idCodec.encode(allGroups[groupIndex].stories[storyIndex].id)
    : String(storyIndex);

// The same key drives the address bar and what is remembered, so a stored
// entry reads exactly like the parameter of a shared link. The storage key
// carries the key shape too — index entries would otherwise be read back under
// id addressing and name nothing.
const viewed = createStoriesViewedStateController({
  storageKey: `reelkit-stories-url-seen-${addressing}.${innerKey}${hash ? '.hash' : ''}`,
  key: key as UrlKey<TwoAxisIdentity<unknown, unknown>, TwoAxisPosition>,
  groups: () => loaded.value,
});

const stories = useOverlayUrlState({
  param: _kParam,
  adapter: useVueRouterUrlAdapter(),
  ...key,
}) as UrlStateController<TwoAxisPosition>;

const paramFor = (groupIndex: number, storyIndex = 0) =>
  `${encodeGroup(groupIndex)}.${encodeStory(groupIndex, storyIndex)}`;
const lastGroup = allGroups.length - 1;

const openGroup = (groupIndex: number) =>
  router.push(
    `?${_kParam}=${paramFor(
      groupIndex,
      props.rememberSeen ? viewed.resumeStoryIndex(groupIndex) : 0,
    )}`,
  );
</script>

<template>
  <div class="actions">
    <RouterLink :to="`?${_kParam}=${paramFor(lastGroup)}`" class="action">
      Open group {{ lastGroup + 1 }} (link, past the window)
    </RouterLink>
    <button
      type="button"
      class="action"
      @click="router.push(`?${_kParam}=${paramFor(lastGroup)}`)"
    >
      Open group {{ lastGroup + 1 }} (router)
    </button>
    <!-- The raw wire string: `set` writes it verbatim, so it works even for a
         group past the window whose id `identify` could not yet read. -->
    <button
      type="button"
      class="action"
      @click="stories.set(paramFor(lastGroup))"
    >
      Open group {{ lastGroup + 1 }} (controller.set)
    </button>
    <!-- Seen state outlives the page, so without this the rings fill up once
         and the demo can never be watched a second time. -->
    <button type="button" class="action clear" @click="viewed.forget()">
      clear seen
    </button>
    <span v-if="fetching" class="fetching">Loading group…</span>
  </div>

  <!-- "Remember seen" off means the controller is not handed over at all, and
       a ring then opens the group's first story. -->
  <StoriesRingList
    :groups="loaded"
    :viewed="rememberSeen ? viewed : undefined"
    @select="openGroup"
  />

  <!-- The same controller as the ring list: the carousel cards draw the same
       rings, groups resume where they were left, and every story shown is
       recorded. -->
  <StoriesUrlOverlay
    :controller="stories"
    :groups="loaded"
    :desktop-layout="desktopLayout"
    :viewed="rememberSeen ? viewed : undefined"
  />
</template>

<style scoped>
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.action {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
}

.action.clear {
  margin-left: auto;
}

.fetching {
  align-self: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}
</style>
