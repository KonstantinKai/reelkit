import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./pages/FullPageSliderPage.vue'),
  },
  {
    path: '/reel-player',
    component: () => import('./pages/ReelPlayerPage.vue'),
  },
  {
    path: '/reel-player-custom',
    component: () => import('./pages/ReelPlayerCustomPage.vue'),
  },
  {
    path: '/image-preview',
    component: () => import('./pages/ImagePreviewPage.vue'),
  },
  {
    path: '/image-preview-custom',
    component: () => import('./pages/ImagePreviewCustomPage.vue'),
  },
  {
    path: '/image-preview-video',
    component: () => import('./pages/ImagePreviewVideoPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('./pages/NotFoundPage.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
