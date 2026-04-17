import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';

const lazy =
  (load: () => Promise<{ default: React.ComponentType }>) => async () => {
    const { default: Component } = await load();
    return { Component };
  };

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        {
          path: 'docs/getting-started',
          lazy: lazy(() => import('../pages/docs/GettingStarted')),
        },
        {
          path: 'docs/installation',
          lazy: lazy(() => import('../pages/docs/Installation')),
        },
        { path: 'docs/ssr', lazy: lazy(() => import('../pages/docs/SSR')) },
        {
          path: 'docs/core/guide',
          lazy: lazy(() => import('../pages/docs/core/Guide')),
        },
        {
          path: 'docs/core/api',
          lazy: lazy(() => import('../pages/docs/core/Api')),
        },
        {
          path: 'docs/react/guide',
          lazy: lazy(() => import('../pages/docs/react/Guide')),
        },
        {
          path: 'docs/react/api',
          lazy: lazy(() => import('../pages/docs/react/Api')),
        },
        {
          path: 'docs/angular/guide',
          lazy: lazy(() => import('../pages/docs/angular/Guide')),
        },
        {
          path: 'docs/angular/api',
          lazy: lazy(() => import('../pages/docs/angular/Api')),
        },
        {
          path: 'docs/reel-player',
          lazy: lazy(() => import('../pages/docs/ReelPlayer')),
        },
        {
          path: 'docs/lightbox',
          lazy: lazy(() => import('../pages/docs/Lightbox')),
        },
        {
          path: 'docs/angular-reel-player',
          lazy: lazy(() => import('../pages/docs/AngularReelPlayer')),
        },
        {
          path: 'docs/angular-lightbox',
          lazy: lazy(() => import('../pages/docs/AngularLightbox')),
        },
        {
          path: 'docs/stories-core',
          lazy: lazy(() => import('../pages/docs/StoriesCore')),
        },
        {
          path: 'docs/stories-player',
          lazy: lazy(() => import('../pages/docs/StoriesPlayer')),
        },
        {
          path: 'docs/angular-stories-player',
          lazy: lazy(() => import('../pages/docs/AngularStoriesPlayer')),
        },
        {
          path: 'docs/vue/guide',
          lazy: lazy(() => import('../pages/docs/vue/Guide')),
        },
        {
          path: 'docs/vue/api',
          lazy: lazy(() => import('../pages/docs/vue/Api')),
        },
        {
          path: 'docs/vue-reel-player',
          lazy: lazy(() => import('../pages/docs/VueReelPlayer')),
        },
        {
          path: 'docs/vue-lightbox',
          lazy: lazy(() => import('../pages/docs/VueLightbox')),
        },
        {
          path: 'docs/vue-stories-player',
          lazy: lazy(() => import('../pages/docs/VueStoriesPlayer')),
        },
        {
          path: 'docs/troubleshooting',
          lazy: lazy(() => import('../pages/docs/Troubleshooting')),
        },
        {
          path: 'docs/changelog',
          lazy: lazy(() => import('../pages/docs/Changelog')),
        },
        { path: 'privacy', lazy: lazy(() => import('../pages/Privacy')) },
        { path: 'terms', lazy: lazy(() => import('../pages/Terms')) },
        { path: '*', lazy: lazy(() => import('../pages/NotFound')) },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
