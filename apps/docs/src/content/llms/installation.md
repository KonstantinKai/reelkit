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

| Package                         | Description                      | Use Case                             |
| ------------------------------- | -------------------------------- | ------------------------------------ |
| `@reelkit/core`                 | Framework-agnostic core          | Custom integrations                  |
| `@reelkit/react`                | React components                 | React 18+ applications               |
| `@reelkit/react-reel-player`    | Full-screen vertical reel player | Instagram/TikTok style player        |
| `@reelkit/react-lightbox`       | Image gallery lightbox           | Full-screen image preview            |
| `@reelkit/react-stories-player` | Instagram-style stories player   | Stories with auto-advance + gestures |
| `@reelkit/angular`              | Angular standalone components    | Angular 17+ applications             |
| `@reelkit/angular-reel-player`  | Full-screen vertical reel player | Instagram/TikTok style player        |
| `@reelkit/angular-lightbox`     | Image gallery lightbox           | Full-screen image preview            |
| `@reelkit/vue`                  | Vue 3 components and composables | Vue 3 applications                   |
| `@reelkit/vue-reel-player`      | Full-screen vertical reel player | Instagram/TikTok style player        |
| `@reelkit/vue-lightbox`         | Image gallery lightbox           | Full-screen image preview            |

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

`lucide-react` only needed for default control icons. Supply own controls via `renderControls` = skip install.

### Angular

`@reelkit/angular`:

- `@angular/core` >= 17.0.0
- `@angular/common` >= 17.0.0

`@reelkit/angular-reel-player`:

- `@reelkit/angular`
- `@angular/core` >= 19.0.0
- `lucide-angular` >= 0.460.0

`@reelkit/angular-lightbox`:

- `@reelkit/angular`
- `@angular/core` >= 17.0.0
- `lucide-angular` >= 0.400.0

`lucide-angular` only needed for default control icons. Supply own controls via `rkPlayerControls` = skip install.

### Vue

`@reelkit/vue`:

- `vue` >= 3.0.0

## TypeScript

All packages ship TypeScript types. No `@types` packages needed.

## Browser Support

reelkit support all modern browsers:

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+
