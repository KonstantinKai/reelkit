---
title: Installation
url: https://reelkit.dev/docs/installation
section: Getting started
order: 2
desc: Install reelkit packages and configure your project. Independent versioning per package; install only what you need.
---

# Installation

Install reelkit packages + configure project. Each package version independent — install only what use.

## Package Options

| Package                           | Description                       | Use Case                             |
| --------------------------------- | --------------------------------- | ------------------------------------ |
| `@reelkit/core`                   | Framework-agnostic core           | Custom integrations                  |
| `@reelkit/stories-core`           | Framework-agnostic stories engine | Custom stories integrations          |
| `@reelkit/react`                  | React components                  | React 18+ applications               |
| `@reelkit/react-reel-player`      | Full-screen vertical reel player  | Instagram/TikTok style player        |
| `@reelkit/react-lightbox`         | Image gallery lightbox            | Full-screen image preview            |
| `@reelkit/react-stories-player`   | Instagram-style stories player    | Stories with auto-advance + gestures |
| `@reelkit/angular`                | Angular standalone components     | Angular 19+ applications             |
| `@reelkit/angular-reel-player`    | Full-screen vertical reel player  | Instagram/TikTok style player        |
| `@reelkit/angular-lightbox`       | Image gallery lightbox            | Full-screen image preview            |
| `@reelkit/angular-stories-player` | Instagram-style stories player    | Stories with auto-advance + gestures |
| `@reelkit/vue`                    | Vue 3 components and composables  | Vue 3 applications                   |
| `@reelkit/vue-reel-player`        | Full-screen vertical reel player  | Instagram/TikTok style player        |
| `@reelkit/vue-lightbox`           | Image gallery lightbox            | Full-screen image preview            |
| `@reelkit/vue-stories-player`     | Instagram-style stories player    | Stories with auto-advance + gestures |

## Install Commands

### React

```bash
npm install @reelkit/react
yarn add @reelkit/react
pnpm add @reelkit/react
```

### Angular

```bash
npm install @reelkit/angular
yarn add @reelkit/angular
pnpm add @reelkit/angular
```

### Vue

```bash
npm install @reelkit/vue
yarn add @reelkit/vue
pnpm add @reelkit/vue
```

## Peer Dependencies

### React

`@reelkit/react`:

- `react` >= 18.0.0
- `react-dom` >= 18.0.0

`@reelkit/react-reel-player`:

- `@reelkit/react`
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `lucide-react` >= 0.400.0

`@reelkit/react-lightbox`:

- `@reelkit/react`
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `lucide-react` >= 0.400.0

`@reelkit/react-stories-player`:

- `@reelkit/react`
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `lucide-react` >= 0.400.0

`lucide-react` only needed for default icons. Supply own controls + navigation via `renderControls` + `renderNavigation` (`renderHeader` + `renderNavigation` on stories player) = skip install.

### Angular

`@reelkit/angular`:

- `@angular/core` >= 19.0.0
- `@angular/common` >= 19.0.0

`@reelkit/angular-reel-player`:

- `@reelkit/angular`
- `@angular/core` >= 19.0.0
- `@angular/common` >= 19.0.0
- `lucide-angular` >= 0.460.0

`@reelkit/angular-lightbox`:

- `@reelkit/angular`
- `@angular/core` >= 19.0.0
- `@angular/common` >= 19.0.0
- `lucide-angular` >= 0.460.0

`@reelkit/angular-stories-player`:

- `@reelkit/angular`
- `@angular/core` >= 19.0.0
- `@angular/common` >= 19.0.0
- `lucide-angular` >= 0.460.0

`lucide-angular` only needed for default icons. Supply own controls + navigation via template slots (`rkPlayerControls` + `rkPlayerNavigation`, `rkLightboxControls` + `rkLightboxNavigation`, `rkStoriesHeader` + `rkStoriesNavigation`) = skip install.

### Vue

`@reelkit/vue`:

- `vue` >= 3.0.0

`@reelkit/vue-reel-player`:

- `@reelkit/vue`
- `vue` >= 3.3.0
- `lucide-vue-next` >= 0.400.0

`@reelkit/vue-lightbox`:

- `@reelkit/vue`
- `vue` >= 3.0.0
- `lucide-vue-next` >= 0.400.0

`@reelkit/vue-stories-player`:

- `@reelkit/vue`
- `vue` >= 3.3.0
- `lucide-vue-next` >= 0.400.0

`lucide-vue-next` only needed for default icons. Supply own controls + navigation via `#controls` + `#navigation` scoped slots (`#header` + `#navigation` on stories player) = skip install.

## TypeScript

All packages ship TypeScript types. No `@types` packages needed.

## Browser Support

reelkit support all modern browsers:

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+
