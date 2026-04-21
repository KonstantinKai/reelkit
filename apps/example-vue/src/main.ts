import { createApp } from 'vue';
import { setCdnBase } from '@reelkit/example-data';
import App from './App.vue';
import { router } from './router';

if (import.meta.env.DEV) setCdnBase('/cdn');

createApp(App).use(router).mount('#app');
