# Roadmap

## Framework Bindings

- [x] **React** - `@reelkit/react`
- [ ] **Vue** - `@reelkit/vue` (in progress)
- [ ] **Svelte** - `@reelkit/svelte` (in progress)
- [ ] **Angular** - `@reelkit/angular` (planned)
- [ ] **Solid** - `@reelkit/solid` (planned)
- [ ] **Qwik** - `@reelkit/qwik` (planned)
- [ ] **Aurelia** - `@reelkit/aurelia` (planned)
- [ ] **Web Components** - `@reelkit/web` (planned)

## Lightbox Customization

- [x] **CSS Classes** - All UI elements have CSS classes that can be overridden (`.lightbox-close`, `.lightbox-nav`, `.lightbox-counter`, etc.)

- [ ] **Render Props** - Allow customization of UI elements via render props:
  - `renderCloseButton` - Custom close button
  - `renderFullscreenButton` - Custom fullscreen toggle
  - `renderNavigation` - Custom prev/next arrows
  - `renderCounter` - Custom image counter
  - `renderInfo` - Custom title & description
  - `renderSwipeHint` - Custom mobile swipe hint

- [ ] **CSS Custom Properties** - Add CSS variables for easier theming (`--lightbox-bg`, `--lightbox-btn-size`, etc.)
- [ ] **Zoom Support** - Pinch-to-zoom and double-tap zoom
- [ ] **Thumbnails** - Optional thumbnail strip navigation

## Reel Player Customization

- [x] **CSS Classes** - All UI elements have CSS classes that can be overridden (`.reel-overlay`, `.reel-container`, `.player-nav-arrows`, etc.)

- [ ] **Render Props** - Allow customization of player controls:
  - `renderPlayButton` - Custom play/pause button
  - `renderProgressBar` - Custom progress indicator
  - `renderMuteButton` - Custom mute toggle
  - `renderOverlay` - Custom slide overlay

## Core Features

- [x] **Fullscreen gallery example**
- [x] **Scroll lock** - Body scroll lock for fullpage slider on mobile
- [ ] **RTL Support** - Right-to-left layout support
- [ ] **Accessibility** - ARIA labels and keyboard navigation improvements
