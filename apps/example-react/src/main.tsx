import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { setCdnBase } from '@reelkit/example-data';
import App from './app/App';

if (import.meta.env.DEV) setCdnBase('/cdn');

const lazy =
  (load: () => Promise<{ default: React.ComponentType }>) => async () => {
    const { default: Component } = await load();
    return { Component };
  };

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { index: true, lazy: lazy(() => import('./app/pages/FullPageSlider')) },
      {
        path: 'reel-player',
        lazy: lazy(() => import('./app/pages/ReelPlayerPage')),
      },
      {
        path: 'reel-player-custom',
        lazy: lazy(() => import('./app/pages/ReelPlayerCustomPage')),
      },
      {
        path: 'image-preview',
        lazy: lazy(() => import('./app/pages/ImagePreviewPage')),
      },
      {
        path: 'image-preview-custom',
        lazy: lazy(() => import('./app/pages/ImagePreviewCustomPage')),
      },
      {
        path: 'image-preview-video',
        lazy: lazy(() => import('./app/pages/ImagePreviewVideoPage')),
      },
      {
        path: 'stories-player',
        lazy: lazy(() => import('./app/pages/StoriesPlayerPage')),
      },
      {
        path: 'stories-player-custom',
        lazy: lazy(() => import('./app/pages/StoriesPlayerCustomPage')),
      },
      {
        path: '*',
        lazy: lazy(() => import('./app/pages/NotFound')),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
