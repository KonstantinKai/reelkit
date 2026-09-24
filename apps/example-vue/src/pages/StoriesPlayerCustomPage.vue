<script setup lang="ts">
import { shallowRef } from 'vue';
import { StoriesOverlay, type StoriesGroup } from '@reelkit/vue-stories-player';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/vue-stories-player/styles.css';
import HtmlProgressBar from './stories-player/HtmlProgressBar.vue';

type DemoId =
  | 'custom-header'
  | 'custom-footer'
  | 'custom-navigation'
  | 'custom-progress'
  | 'custom-loading-error'
  | 'theming'
  | 'custom-group-preview';

const _kDemos: { id: DemoId; title: string; description: string }[] = [
  {
    id: 'custom-header',
    title: 'Custom Header',
    description:
      'Uses the header slot to replace the default header with a minimal close button and custom author layout.',
  },
  {
    id: 'custom-footer',
    title: 'Custom Footer',
    description:
      'Uses the footer slot to add a reply input and action buttons below each story.',
  },
  {
    id: 'custom-navigation',
    title: 'Custom Navigation',
    description:
      'Uses the navigation slot to replace default chevron buttons with labeled pill buttons.',
  },
  {
    id: 'custom-progress',
    title: 'Custom Progress Bar',
    description:
      'Uses the progressBar slot to replace the default canvas bar with plain HTML segments.',
  },
  {
    id: 'custom-loading-error',
    title: 'Custom Loading / Error',
    description:
      'Uses the loading and error slots to replace the default spinner and error icon. Includes a broken image story.',
  },
  {
    id: 'theming',
    title: 'Themed via CSS Tokens',
    description:
      'Rebrands the stories overlay by overriding --rk-stories-* CSS custom properties in a stylesheet. No component code changes.',
  },
  {
    id: 'custom-group-preview',
    title: 'Custom Carousel Cards',
    description:
      'Uses the groupPreview slot to draw the desktop carousel cards beside the story: the preview frame, the author and a story count. Needs a window wider than 768px.',
  },
];

const _kAvatars = [
  cdnUrl('samples/avatars/avatar-13.jpg'),
  cdnUrl('samples/avatars/avatar-14.jpg'),
  cdnUrl('samples/avatars/avatar-15.jpg'),
];

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3600_000).toISOString();

const groups: StoriesGroup[] = [
  {
    author: { id: 'u1', name: 'Travel', avatar: _kAvatars[0], verified: true },
    stories: [
      {
        id: 'c1',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-01.jpg'),
        createdAt: hoursAgo(1),
      },
      {
        id: 'c2',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-02.jpg'),
        createdAt: hoursAgo(2),
      },
      {
        id: 'c3',
        mediaType: 'video',
        src: cdnUrl('samples/videos/video-01.mp4'),
        poster: cdnUrl('samples/videos/video-poster-01.jpg'),
        createdAt: hoursAgo(3),
      },
    ],
  },
  {
    author: { id: 'u2', name: 'Food', avatar: _kAvatars[1] },
    stories: [
      {
        id: 'c4',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-03.jpg'),
        createdAt: hoursAgo(1),
      },
      {
        id: 'c5',
        mediaType: 'image',
        src: 'https://broken.invalid/does-not-exist.jpg',
        createdAt: hoursAgo(2),
      },
      {
        id: 'c6',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-04.jpg'),
        createdAt: hoursAgo(3),
      },
    ],
  },
  {
    author: { id: 'u3', name: 'Music', avatar: _kAvatars[2], verified: true },
    stories: [
      {
        id: 'c7',
        mediaType: 'video',
        src: cdnUrl('samples/videos/video-02.mp4'),
        poster: cdnUrl('samples/videos/video-poster-02.jpg'),
        createdAt: hoursAgo(1),
      },
      {
        id: 'c8',
        mediaType: 'image',
        src: cdnUrl('samples/images/image-05.jpg'),
        createdAt: hoursAgo(2),
      },
    ],
  },
];

const activeDemo = shallowRef<DemoId | null>(null);
const close = () => {
  activeDemo.value = null;
};
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Custom Stories Player</h1>
      <p class="subtitle">
        Demonstrates scoped slot customization: headers, footers, navigation,
        progress bars, and loading/error states.
      </p>

      <div class="grid">
        <div v-for="demo in _kDemos" :key="demo.id" class="card">
          <h2>{{ demo.title }}</h2>
          <p>{{ demo.description }}</p>
          <button type="button" class="open" @click="activeDemo = demo.id">
            Open Demo
          </button>
        </div>
      </div>
    </div>

    <StoriesOverlay
      :is-open="activeDemo === 'custom-header'"
      :groups="groups"
      @close="close"
    >
      <template
        #header="{
          author,
          onClose,
          isPaused,
          onTogglePause,
          isMuted,
          onToggleSound,
          isVideo,
        }"
      >
        <div class="custom-header">
          <div class="custom-header-author">
            <img :src="author.avatar" :alt="author.name" />
            <span>{{ author.name }}</span>
          </div>
          <div class="custom-header-actions">
            <button
              v-if="isVideo"
              type="button"
              class="pill"
              @click="onToggleSound"
            >
              {{ isMuted ? 'Unmute' : 'Mute' }}
            </button>
            <button type="button" class="pill" @click="onTogglePause">
              {{ isPaused ? 'Play' : 'Pause' }}
            </button>
            <button type="button" class="pill" @click="onClose">Close</button>
          </div>
        </div>
      </template>
    </StoriesOverlay>

    <StoriesOverlay
      :is-open="activeDemo === 'custom-footer'"
      :groups="groups"
      @close="close"
    >
      <template #footer="{ author }">
        <div class="custom-footer">
          <input type="text" :placeholder="`Reply to ${author.name}...`" />
          <button type="button" class="pill">Send</button>
        </div>
      </template>
    </StoriesOverlay>

    <StoriesOverlay
      :is-open="activeDemo === 'custom-navigation'"
      :groups="groups"
      @close="close"
    >
      <template
        #navigation="{ onPrevStory, onNextStory, onPrevGroup, onNextGroup }"
      >
        <div class="nav-column">
          <button type="button" class="pill group" @click="onPrevGroup">
            Prev Group
          </button>
          <button type="button" class="pill" @click="onPrevStory">Prev</button>
        </div>
        <div class="nav-gap" />
        <div class="nav-column">
          <button type="button" class="pill group" @click="onNextGroup">
            Next Group
          </button>
          <button type="button" class="pill" @click="onNextStory">Next</button>
        </div>
      </template>
    </StoriesOverlay>

    <StoriesOverlay
      :is-open="activeDemo === 'custom-progress'"
      :groups="groups"
      @close="close"
    >
      <template #progressBar="{ totalStories, activeIndex, progress }">
        <HtmlProgressBar
          :total-stories="totalStories"
          :active-index="activeIndex"
          :progress="progress"
        />
      </template>
    </StoriesOverlay>

    <StoriesOverlay
      :is-open="activeDemo === 'custom-loading-error'"
      :groups="groups"
      @close="close"
    >
      <template #loading="{ story }">
        <div class="custom-loading">Loading {{ story.mediaType }}...</div>
      </template>
      <template #error="{ story }">
        <div class="custom-error">
          <div class="custom-error-mark">!</div>
          <div>Failed to load {{ story.mediaType }}</div>
        </div>
      </template>
    </StoriesOverlay>

    <StoriesOverlay
      :is-open="activeDemo === 'custom-group-preview'"
      :groups="groups"
      desktop-layout="carousel"
      @close="close"
    >
      <template #groupPreview="{ group, story, onOpen }">
        <button
          type="button"
          class="preview-card"
          :aria-label="`Open stories by ${group.author.name}`"
          @click="onOpen"
        >
          <img
            v-if="story"
            class="preview-card-frame"
            :src="story.mediaType === 'video' ? story.poster : story.src"
            alt=""
          />
          <span class="preview-card-info">
            <span class="preview-card-count">
              {{ group.stories.length }}
              {{ group.stories.length === 1 ? 'story' : 'stories' }}
            </span>
            <span class="preview-card-author">
              <img :src="group.author.avatar" alt="" />
              {{ group.author.name }}
            </span>
          </span>
        </button>
      </template>
    </StoriesOverlay>

    <!-- Rethemed by the unscoped style at the bottom, which matches this
         overlay by its label. -->
    <StoriesOverlay
      :is-open="activeDemo === 'theming'"
      :groups="groups"
      aria-label="Themed stories"
      @close="close"
    />
  </div>
</template>

<style>
/* Unscoped: the overlay is teleported to the body, outside this page. */
.rk-stories-overlay[aria-label='Themed stories'] {
  --rk-stories-overlay-bg: #0f172a;
  --rk-stories-container-radius: 24px;
  --rk-stories-nav-bg: rgba(99, 102, 241, 0.35);
  --rk-stories-nav-bg-hover: rgba(168, 85, 247, 0.65);
  --rk-stories-top-shade-bg: linear-gradient(
    to bottom,
    rgba(99, 102, 241, 0.5) 0%,
    transparent 100%
  );
  --rk-stories-header-name-fg: #fef3c7;
  --rk-stories-ring-spin-duration: 2s;
}
</style>

<style scoped>
.page {
  min-height: 100dvh;
  background-color: #111;
  padding: 56px 16px 16px;
  color: #fff;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.card {
  background-color: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card h2 {
  font-size: 1.1rem;
  font-weight: 500;
}

.card p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  line-height: 1.5;
  flex: 1;
}

.open {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  background-color: #fff;
  color: #000;
  font-weight: 500;
}

.pill {
  padding: 6px 14px;
  border-radius: 8px;
  border: none;
  font-size: 0.7rem;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  backdrop-filter: blur(8px);
}

.pill.group {
  background: rgba(99, 102, 241, 0.3);
  color: #a78bfa;
}

.custom-header {
  position: absolute;
  top: 40px;
  left: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: auto;
}

.custom-header-author {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.custom-header-author img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.custom-header-actions {
  display: flex;
  gap: 8px;
}

.custom-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  pointer-events: auto;
}

.custom-footer input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 13px;
  outline: none;
}

.nav-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.nav-gap {
  width: 16px;
}

.custom-loading {
  position: absolute;
  top: 22px;
  right: 72px;
  z-index: 20;
  color: #fff;
  font-size: 12px;
  background: rgba(99, 102, 241, 0.8);
  padding: 4px 12px;
  border-radius: 12px;
  pointer-events: none;
}

.custom-error {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(145deg, #2d1b1b 0%, #1a1a2e 100%);
  color: #ff6b6b;
  pointer-events: none;
  font-size: 14px;
}

.custom-error-mark {
  font-size: 48px;
}

.preview-card {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 2px solid rgba(167, 139, 250, 0.6);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: #1e1b4b;
}

.preview-card-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-card-info {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 6px;
  padding: 12px;
  background: linear-gradient(transparent 40%, rgba(30, 27, 75, 0.9));
}

.preview-card-count {
  padding: 2px 8px;
  border-radius: 10px;
  background: #6366f1;
  color: #fff;
  font-size: 11px;
}

.preview-card-author {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
}

.preview-card-author img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>
