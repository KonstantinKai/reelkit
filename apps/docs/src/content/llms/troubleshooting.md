---
title: Troubleshooting
url: https://reelkit.dev/docs/troubleshooting
section: Meta
order: 1
desc: Fixes for iOS Safari quirks, video playback, fullscreen, keyboard navigation, and auto-sizing issues.
---

# Troubleshooting

Fixes iOS Safari quirks, video playback, fullscreen, keyboard nav.

## iOS Safari

### Viewport doesn't fill screen / bottom black space

Safari collapsible address bar make `100vh` taller than visible. Use `100dvh`:

```css
.slider-container {
  height: 100dvh; /* not 100vh */
}
```

### Horizontal scroll / content overflow

`100vw` include scrollbar width on iOS, push content past edge. Use `100%` + lock horizontal overflow:

```css
html,
body {
  overflow-x: hidden;
}

.slider-container {
  width: 100%; /* not 100vw */
}
```

### Pull-to-refresh / rubber-band bounce

Safari pull-to-refresh + elastic bounce fight vertical swipe. Do **not** put `overscroll-behavior: none` on `html, body` — kills normal page scroll. `ReelPlayerOverlay`, `LightboxOverlay`, `StoriesPlayerOverlay` handle on own containers. Custom layouts, scope it:

```css
.slider-container {
  overscroll-behavior: none;
}
```

### Pinch-to-zoom interferes with gestures

Disable zoom, stop pinch + double-tap firing during swipes:

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
/>
```

`viewport-fit=cover` extend layout into Dynamic Island / notch safe area.

### Layout broken after keyboard dismisses

Safari sometimes leave viewport compressed after keyboard closes. Force reset on blur:

```tsx
// React
<input
  onBlur={() => {
    window.scrollTo(0, 0);
    apiRef.current?.adjust();
  }}
/>

// Angular
(blur)="onInputBlur()"

onInputBlur() {
  window.scrollTo(0, 0);
  this.reelApi?.adjust();
}
```

## General

### Slides render at 0×0 size

No `size` prop, slider read container dims via `ResizeObserver`. Container with no CSS height measure 0×0, nothing render. Pass `size` or give container dims:

```css
/* The parent must have a height for auto-sizing to work */
.slider-container {
  width: 100%;
  height: 100dvh;
}
```

## Video

### Video doesn't autoplay

Browsers block unmuted autoplay. ReelKit set `muted` + `playsInline` on every video. Videos start muted; user unmute with sound toggle after tap. Check you not override these in custom slide.

### Video thumbnail / frame capture is blank

Frame capture draw video onto `<canvas>`. Cross-origin video taint canvas, draw silent fail. Your video CDN ! return CORS headers:

```text
Access-Control-Allow-Origin: *
```

ReelKit set `crossOrigin="anonymous"` default. Custom video element, add yourself.

## Fullscreen

### Fullscreen button does nothing on Safari

ReelKit disable Fullscreen API on Safari. iOS Safari restrict fullscreen to `<video>` only. Desktop Safari break `position: fixed` overlays in fullscreen: elements lose stacking context or vanish. `requestFullscreen()` resolve as no-op on Safari.

## Keyboard Navigation

### Arrow keys don't navigate after providing onNavKeyPress

`onNavKeyPress` **replaces** default keyboard nav. ReelKit stop calling `next()` / `prev()`, hands control to you. Call yourself:

```tsx
<Reel
  onNavKeyPress={(increment) => {
    // Your custom logic here
    console.log('Nav key:', increment);
    // You must trigger navigation yourself:
    apiRef.current?.[increment === 1 ? 'next' : 'prev']();
  }}
/>
```

### Escape key doesn't close the overlay

Keyboard controller handle arrow keys only. `ReelPlayerOverlay` + `LightboxOverlay` listen for Escape separately. Build custom overlay, add own Escape handler in `onClose`.
