import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/full-page-slider/full-page-slider.component').then(
        (m) => m.FullPageSliderComponent,
      ),
  },
  {
    path: 'reel-player',
    loadComponent: () =>
      import('./pages/reel-player/reel-player-page.component').then(
        (m) => m.ReelPlayerPageComponent,
      ),
  },
  {
    path: 'reel-player-custom',
    loadComponent: () =>
      import(
        './pages/reel-player-custom/reel-player-custom-page.component'
      ).then((m) => m.ReelPlayerCustomPageComponent),
  },
  {
    path: 'reel-player-url',
    loadComponent: () =>
      import('./pages/reel-player-url/reel-player-url-page.component').then(
        (m) => m.ReelPlayerUrlPageComponent,
      ),
  },
  {
    path: 'image-preview',
    loadComponent: () =>
      import('./pages/image-preview/image-preview-page.component').then(
        (m) => m.ImagePreviewPageComponent,
      ),
  },
  {
    path: 'image-preview-url',
    loadComponent: () =>
      import('./pages/image-preview-url/image-preview-url-page.component').then(
        (m) => m.ImagePreviewUrlPageComponent,
      ),
  },
  {
    path: 'image-preview-custom',
    loadComponent: () =>
      import(
        './pages/image-preview-custom/image-preview-custom-page.component'
      ).then((m) => m.ImagePreviewCustomPageComponent),
  },
  {
    path: 'image-preview-video',
    loadComponent: () =>
      import(
        './pages/image-preview-video/image-preview-video-page.component'
      ).then((m) => m.ImagePreviewVideoPageComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
