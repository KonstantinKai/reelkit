# Reel Player Specification

## Overview

A full-screen vertical media player component inspired by Instagram Reels and TikTok. Supports mixed media content including images, videos, and multi-media posts with horizontal nested sliders.

## Features

### Core Functionality

- **Full-screen overlay** - Dark overlay with centered content area
- **Vertical slider** - Main navigation between content items
- **Mixed media support** - Images, videos, and multi-media posts
- **Nested horizontal slider** - For multi-media posts with multiple items

### Video Playback

- **Autoplay** - Videos automatically play when slide becomes active
- **Auto-pause** - Videos pause when navigating away from slide
- **Shared video element** - Single video DOM element reused across slides for iOS sound continuity
- **Playback position persistence** - Resumes from last position when returning to a video
- **Frame capture** - Captures current frame as poster when leaving video slide
- **Muted by default** - Respects browser autoplay policies
- **Sound toggle** - Button to unmute/mute video

### Navigation

- **Keyboard**
  - `ArrowUp` / `ArrowDown` - Navigate outer vertical slider
  - `ArrowLeft` / `ArrowRight` - Navigate inner horizontal slider (nested)
  - `Escape` - Close player overlay

- **Touch gestures**
  - Swipe up/down - Navigate vertical slider
  - Swipe left/right - Navigate horizontal nested slider

- **Buttons**
  - Previous/Next arrows - Vertical navigation
  - Close button (X) - Close overlay

- **Mouse wheel** - Scroll to navigate vertically

### UI Elements

- **Close button** - Top-right corner
- **Sound toggle button** - Bottom-right corner (only for video content)
- **Navigation arrows** - Right side of overlay (desktop only)
- **Nested slider indicators** - Dot indicators for multi-media posts

## Components

### ReelPlayerOverlay

Main container component that manages:
- Player open/close state
- Active slide index
- Sound state context
- Drag coordination between outer and inner sliders

**Props:**
```typescript
interface ReelPlayerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem[];
  initialIndex?: number;
}
```

### MediaSlide

Routes content to appropriate component based on media type:
- Single image → `ImageSlide`
- Single video → `VideoSlide`
- Multiple items → `NestedSlider`

### VideoSlide

Handles video playback with:
- Shared video element pattern for iOS compatibility
- Frame capture on slide change
- Loading state with wave animation
- Playback position storage

**Key behavior:**
- `crossOrigin="anonymous"` for frame capture
- `playsInline` for iOS support
- `disablePictureInPicture` and `disableRemotePlayback`

### NestedSlider

Horizontal slider for multi-media posts:
- Coordinates with parent slider during drag
- Reports active media type (image/video) to parent
- Shows dot indicators

### PlayerControls

Control buttons:
- Close button (always visible)
- Sound toggle (visible only for video content)
- Sound button disabled state for images in nested slider with videos

### SoundState

React context for managing sound state across components:
- `muted: boolean` - Current mute state
- `disabled: boolean` - Temporarily disable during transitions
- `toggle()` - Toggle mute state
- `setDisabled()` - Set disabled state

## Data Types

```typescript
type MediaType = 'image' | 'video';

interface MediaItem {
  id: string;
  type: MediaType;
  src: string;
  poster?: string;       // Video thumbnail
  aspectRatio: number;   // width / height
}

interface ContentItem {
  id: string;
  media: MediaItem[];    // Single or multiple for nested slider
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  description: string;
}
```

## Styling

### CSS Classes

- `.rk-reel-overlay` - Full-screen overlay container
- `.rk-reel-container` - Centered content area
- `.rk-video-slide-container` - Video slide wrapper
- `.rk-video-slide-element` - Video element
- `.rk-video-slide-poster` - Poster image with fade transition
- `.rk-video-slide-loader` - Wave loading animation
- `.rk-player-close-btn` - Close button
- `.rk-player-sound-btn` - Sound toggle button
- `.rk-player-nav-arrows` - Navigation arrows container

### Aspect Ratio

Player maintains phone-like aspect ratio (9:16 portrait). Videos with different aspect ratios use:
- Vertical videos (`aspectRatio < 1`): `object-fit: cover`
- Horizontal videos (`aspectRatio >= 1`): `object-fit: contain`

## Edge Cases

1. **iOS Sound Continuity** - Shared video element preserves user interaction state
2. **Cross-origin videos** - `crossOrigin="anonymous"` enables frame capture
3. **Autoplay blocked** - Gracefully handles browser autoplay policies
4. **Fast navigation** - Sound button disabled during slide transitions
5. **Image in nested video slider** - Sound button shows disabled state

## Browser Support

- Chrome/Chromium - Full support
- Firefox - Full support
- Safari/WebKit - Full support with iOS considerations
- Mobile browsers - Touch gestures and autoplay handled

## Future Considerations

- Extract video utilities to `@reelkit/core`
- Add preloading for adjacent slides
- Support for vertical videos with different aspect ratios
- Progress indicator for video playback
- Double-tap to like interaction
