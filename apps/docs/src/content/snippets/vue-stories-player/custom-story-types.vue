<script setup lang="ts">
import { ref } from 'vue';
import {
  StoriesOverlay,
  type SlideSlotScope,
  type StoriesGroup,
  type StoryItem,
} from '@reelkit/vue-stories-player';

const isOpen = ref(false);

interface PromoStory extends StoryItem {
  title?: string;
  ctaHref?: string;
}

const groups: StoriesGroup<PromoStory>[] = [
  {
    author: { id: 'shop', name: 'Shop', avatar: '/shop.jpg' },
    stories: [
      {
        id: 'sale',
        mediaType: 'image',
        src: '/sale.jpg',
        title: 'Spring sale',
        ctaHref: '/sale',
      },
    ],
  },
];
</script>

<template>
  <StoriesOverlay v-model:is-open="isOpen" :groups="groups">
    <!-- Annotate the scope with your own item type to keep the slot typed. -->
    <template #slide="scope: SlideSlotScope<PromoStory>">
      <article class="promo">
        <h2>{{ scope.story.title }}</h2>
        <a v-if="scope.story.ctaHref" :href="scope.story.ctaHref">Shop now</a>
      </article>
    </template>
  </StoriesOverlay>
</template>
