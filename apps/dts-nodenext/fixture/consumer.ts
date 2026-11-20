// A consumer on `moduleResolution: nodenext`, the setting that reads the
// published declarations as ES modules. Each package gets one deliberate type
// error: if a declaration file fails to resolve, its exports turn into `any`,
// the assignment stops being an error, and the unused `@ts-expect-error`
// directive fails the check instead.

import { createSignal } from '@reelkit/core';
import { createStoriesController } from '@reelkit/stories-core';
import { Reel } from '@reelkit/react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { LightboxOverlay } from '@reelkit/react-lightbox';
import { ReelPlayerOverlay } from '@reelkit/react-reel-player';
import { StoriesOverlay } from '@reelkit/react-stories-player';
import { Reel as VueReel } from '@reelkit/vue';
import { useVueRouterUrlAdapter } from '@reelkit/vue/vue-router-url-adapter';
import { LightboxOverlay as VueLightboxOverlay } from '@reelkit/vue-lightbox';
import { ReelPlayerOverlay as VueReelPlayerOverlay } from '@reelkit/vue-reel-player';
import { StoriesOverlay as VueStoriesOverlay } from '@reelkit/vue-stories-player';

// @ts-expect-error a function is not a symbol
export const core: symbol = createSignal;
// @ts-expect-error a function is not a symbol
export const storiesCore: symbol = createStoriesController;
// @ts-expect-error a component is not a symbol
export const react: symbol = Reel;
// @ts-expect-error a hook is not a symbol
export const reactRouterAdapter: symbol = useReactRouterUrlAdapter;
// @ts-expect-error a component is not a symbol
export const reactLightbox: symbol = LightboxOverlay;
// @ts-expect-error a component is not a symbol
export const reactReelPlayer: symbol = ReelPlayerOverlay;
// @ts-expect-error a component is not a symbol
export const reactStoriesPlayer: symbol = StoriesOverlay;
// @ts-expect-error a component is not a symbol
export const vue: symbol = VueReel;
// @ts-expect-error a composable is not a symbol
export const vueRouterAdapter: symbol = useVueRouterUrlAdapter;
// @ts-expect-error a component is not a symbol
export const vueLightbox: symbol = VueLightboxOverlay;
// @ts-expect-error a component is not a symbol
export const vueReelPlayer: symbol = VueReelPlayerOverlay;
// @ts-expect-error a component is not a symbol
export const vueStoriesPlayer: symbol = VueStoriesOverlay;

// A typed value, not `any`, flows through a signal.
const count = createSignal(1);
// @ts-expect-error a number is not a string
export const countText: string = count.value;
