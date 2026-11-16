import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineNuxtConfig } from 'nuxt/config';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../',
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
    port: 4240,
  },
  typescript: {
    typeCheck: 'build',
    tsConfig: {
      extends: '../../../tsconfig.base.json', // Nuxt copies this string as-is to the `./.nuxt/tsconfig.json`, therefore it needs to be relative to that directory
    },
  },
  imports: {
    autoImport: true,
  },
  css: ['~/assets/css/styles.css'],
  vite: {
    // Absolute, because Nuxt sets the Vite root to the app source directory.
    plugins: [
      tsconfigPaths({
        projects: [
          fileURLToPath(new URL('../../tsconfig.base.json', import.meta.url)),
        ],
      }),
    ],
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },
});
