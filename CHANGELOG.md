## @reelkit/react-reel-player@0.6.5 (2026-09-25)

### 🩹 Fixes

- A multi-media post whose media changes now starts again from its first item

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.3
- Updated @reelkit/core to 0.8.4

## @reelkit/vue-reel-player@0.4.2 (2026-09-25)

### 🩹 Fixes

- Opening the player moves keyboard focus into the dialog and keeps Tab inside it
- A multi-media post whose media changes now shows its first item, instead of the carousel dots and arrows pointing at the first item while the old one stayed on screen

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.4
- Updated @reelkit/vue to 0.7.2

## @reelkit/angular-reel-player@0.6.3 (2026-09-25)

### 🩹 Fixes

- `RkNestedSliderComponent.mediaAt` returns the item at the index it is given; it no longer falls back to the first item for an index past the end, which the slider no longer asks for
- A multi-media post whose media changes now shows its first item, instead of the carousel dots and arrows pointing at the first item while the old one stayed on screen

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.8.2
- Updated @reelkit/core to 0.8.4

## @reelkit/react-stories-player@0.6.2 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.2
- Updated @reelkit/react to 0.9.3
- Updated @reelkit/core to 0.8.4

## @reelkit/vue-stories-player@0.2.2 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.2
- Updated @reelkit/core to 0.8.4
- Updated @reelkit/vue to 0.7.2

## @reelkit/angular-stories-player@0.2.2 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.2
- Updated @reelkit/angular to 0.8.2
- Updated @reelkit/core to 0.8.4

## @reelkit/react-lightbox@0.6.5 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.3
- Updated @reelkit/core to 0.8.4

## @reelkit/vue-lightbox@0.3.3 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.7.2

## @reelkit/angular-lightbox@0.6.3 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.8.2
- Updated @reelkit/core to 0.8.4

## @reelkit/stories-core@0.6.2 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.4

## @reelkit/react@0.9.3 (2026-09-25)

### 🩹 Fixes

- `Reel` no longer calls `itemBuilder` for slides removed by a smaller `count`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.4

## @reelkit/vue@0.7.2 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.4

## @reelkit/angular@0.8.2 (2026-09-25)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.4

## @reelkit/core@0.8.4 (2026-09-25)

### 🩹 Fixes

- Removing slides so the active one no longer exists now moves the slider to the new last slide instead of rendering a slide that is gone
- Changing the slide count, loop or range extractor now refreshes which slides are rendered straight away, not only on the next navigation

## @reelkit/react-reel-player@0.6.4 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.2
- Updated @reelkit/core to 0.8.3

## @reelkit/vue-reel-player@0.4.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.3
- Updated @reelkit/vue to 0.7.1

## @reelkit/angular-reel-player@0.6.2 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.8.1
- Updated @reelkit/core to 0.8.3

## @reelkit/angular-reel-player@0.6.1 (2026-09-24)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.8.0

## @reelkit/react-stories-player@0.6.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.1
- Updated @reelkit/react to 0.9.2
- Updated @reelkit/core to 0.8.3

## @reelkit/react-stories-player@0.6.0 (2026-09-24)

### 🚀 Features

- New chromePlacement option: set it to 'group' and every group carries its own progress bar and header, which turn with the group the way they do on Instagram, while the default 'overlay' keeps one copy above the player
- renderProgressBar and renderHeader now receive groupIndex and isActive, so a custom bar or header can tell a neighbouring group from the one playing
- CanvasProgressBar takes live={false} to draw a still bar that repaints only when its signals change or it resizes, with no animation loop
- useAttachViewedState is exported, for a page that mounts the player only once it opens and so has to read the viewed store itself
- The props type of every sub-component is exported: CanvasProgressBarProps, StoryHeaderProps, ImageStorySlideProps, VideoStorySlideProps, StoriesRingProps, StoriesRingListProps and HeartAnimationProps
- OverlayUrlStateOptions is re-exported beside useOverlayUrlState

### 🩹 Fixes

- A duration set on a video story now wins over the one the video reports
- Story rings open from the keyboard with Enter or Space, the way a button does

### ⚠️ Breaking Changes

- The double-tap heart animation's keyframes are renamed from heart-pop to rk-stories-heart-pop, so an app's own heart-pop animation no longer replaces it. A stylesheet that restyled the heart by redefining `@keyframes heart-pop`, or code that checks for that animation name, must use rk-stories-heart-pop.

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.0

## @reelkit/vue-stories-player@0.2.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.1
- Updated @reelkit/core to 0.8.3
- Updated @reelkit/vue to 0.7.1

## @reelkit/vue-stories-player@0.2.0 (2026-09-24)

### 🚀 Features

- New chrome-placement prop: set it to 'group' and every group carries its own progress bar and header, which turn with the group the way they do on Instagram, while the default 'overlay' keeps one copy above the player
- The #progressBar and #header slot scopes now carry groupIndex and isActive, so a custom bar or header can tell a neighbouring group from the one playing
- CanvasProgressBar takes :live="false" to draw a still bar that repaints only when its signals change or it resizes
- useAttachViewedState is exported, for a page that mounts the player only once it opens and so has to read the viewed store itself
- OverlayUrlStateOptions is re-exported beside useOverlayUrlState

### 🩹 Fixes

- CanvasProgressBar now draws from the signals and story count handed to it after mount, not only the ones it was first given
- A duration set on a video story now wins over the one the video reports
- Story rings open from the keyboard with Enter or Space, the way a button does

### ⚠️ Breaking Changes

- The double-tap heart animation's keyframes are renamed from heart-pop to rk-stories-heart-pop, so an app's own heart-pop animation no longer replaces it. A stylesheet that restyled the heart by redefining `@keyframes heart-pop`, or code that checks for that animation name, must use rk-stories-heart-pop.

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.0

## @reelkit/angular-stories-player@0.2.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.1
- Updated @reelkit/angular to 0.8.1
- Updated @reelkit/core to 0.8.3

## @reelkit/angular-stories-player@0.2.0 (2026-09-24)

### 🚀 Features

- New chromePlacement input: set it to 'group' and every group carries its own progress bar and header, which turn with the group the way they do on Instagram, while the default 'overlay' keeps one copy above the player
- The rkStoriesProgressBar and rkStoriesHeader template contexts now carry groupIndex and isActive, so a custom bar or header can tell a neighbouring group from the one playing
- rk-canvas-progress-bar takes [live]="false" to draw a still bar that repaints only when its signals change or it resizes
- Every template slot context names its main value the way the React and Vue slots do (author, story or group, as let-author="author"), beside the implicit value, and the navigation context also carries onPrevStory, onNextStory, onPrevGroup and onNextGroup flat
- SoundStateService is re-exported, so a page that provides the sound state for a video slide drawn outside the player imports it from the stories package

### 🩹 Fixes

- The canvas progress bar no longer leaves its previous animation loop running when the group it shows changes
- Closing the player no longer leaves the video story slides listening to the shared video element, so reopening it no longer stacks up their handlers
- A story that is ready at once no longer starts its timer behind the sliding carousel cards, and a story that fails during the slide is not timed once it ends
- The carousel cards come after the player's own controls in the keyboard order, as in the React and Vue players
- Moving to the next story after a pause now plays it, instead of leaving the header showing a pause nobody is holding
- Closing the player while the carousel cards slide no longer reports the story it was opening as viewed
- Opening a second carousel card during a slide no longer cuts the second slide short, and a player paused mid-slide stays paused when the slide ends
- The footer template renders under the playing story only, so a neighbouring group seen mid-turn shows none
- A video pauses while the viewer drags between users and plays again when the drag ends
- Opening a user from a carousel card moves keyboard focus into the player instead of leaving it on the page
- A video story's timer starts on the same media-ready signals as the React and Vue players, and a duration set on the story wins over the one the video reports
- A carousel card draws its slide-template preview beside the card button rather than inside it, so a slide with buttons or links of its own stays valid markup
- The desktop carousel's viewedState input accepts any Subscribable, the same shape the React and Vue carousels take, rather than only a core signal
- The inner story slider no longer carries the rk-stories-stories class, which no stylesheet used and the React and Vue players never emitted
- The icon-centring rules reach only the lucide-angular icon wrapper, so the error panel's message keeps its own layout

### ⚠️ Breaking Changes

- The double-tap heart animation's keyframes are renamed from heart-pop to rk-stories-heart-pop, so an app's own heart-pop animation no longer replaces it. A stylesheet that restyled the heart by redefining `@keyframes heart-pop`, or code that checks for that animation name, must use rk-stories-heart-pop.
- rk-stories-overlay requires isOpen, as the React and Vue players require it; an overlay written without [isOpen] now fails with Angular's required-input error. Bind it, [isOpen]="false" for a player that starts closed.
- rk-story-header draws its pause and sound buttons only when showPauseButton and showSoundButton are true, the way the React and Vue headers draw them only when given a handler. The player's own header sets both; a header used on its own needs [showPauseButton]="true" and [showSoundButton]="true" to keep them.
- rk-canvas-progress-bar takes gap, barHeight, minSegmentWidth, bgColor and fillColor as separate inputs, like the React and Vue bars, instead of one config object. Replace [config]="{ barHeight: 3 }" with [barHeight]="3".

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.6.0
- Updated @reelkit/angular to 0.8.0

## @reelkit/react-lightbox@0.6.4 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.2
- Updated @reelkit/core to 0.8.3

## @reelkit/vue-lightbox@0.3.2 (2026-09-24)

### 🩹 Fixes

- The README's Live Demo link opens the lightbox demo instead of a page that does not exist

## @reelkit/vue-lightbox@0.3.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.7.1

## @reelkit/angular-lightbox@0.6.2 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.8.1
- Updated @reelkit/core to 0.8.3

## @reelkit/angular-lightbox@0.6.1 (2026-09-24)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.8.0

## @reelkit/stories-core@0.6.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.3

## @reelkit/stories-core@0.6.0 (2026-09-24)

### 🚀 Features

- kStoriesRingSize, kStoriesRingListRingSize and kStoriesCardRingSize export the ring diameters every stories player draws by default (68, 64 and 52 pixels), so a custom ring can match them

## @reelkit/react@0.9.2 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.3

## @reelkit/vue@0.7.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.3

## @reelkit/angular@0.8.1 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.3

## @reelkit/angular@0.8.0 (2026-09-24)

### 🚀 Features

- observeMediaLoading is exported, as it already is from @reelkit/react and @reelkit/vue

## @reelkit/core@0.8.3 (2026-09-24)

### 🩹 Fixes

- The README now opens with a looping clip of the package in action, linked to its live demo

## @reelkit/vue-stories-player@0.1.0 (2026-09-23)

### 🎉 Initial Release

- Instagram-style stories player for Vue 3: StoriesOverlay opens full screen over the page, tap left or right moves through a user's stories, swipe switches user with a 3D cube transition, and an auto-advance timer drives the segmented progress bar
- StoriesUrlOverlay puts the open group and story in one ?story=group.story parameter, so a playing story has a link that can be shared and bookmarked, and the back button closes it
- StoriesRingList draws the row of circular avatar rings that opens the player, each ring carrying the gradient until that user is watched to the end
- Eight scoped slots replace any part of the player — slide, header, footer, progress bar, navigation, group preview, loading and error — and each falls back to the built-in look when it is not given
- Double-tap a story to send a reaction, with a heart animation over the story; hold to pause, release to resume
- desktop-layout="carousel" lays neighbouring users out as preview cards beside the active story, the way Instagram does on the web
- The viewed prop takes a createStoriesViewedStateController, so a user resumes on their first unseen story, every story shown is recorded, and rings mute once a user is watched to the end
- A carousel card whose preview picture fails to load falls back to the plain card — the author, the ring and the time — rather than the browser's broken-image mark
- Themed entirely through `--rk-stories-*` CSS custom properties; import @reelkit/vue-stories-player/styles.css once

## @reelkit/angular-stories-player@0.1.0 (2026-09-23)

### 🎉 Initial Release

- Instagram-style stories player for Angular: rk-stories-overlay opens full screen over the page, tap left or right moves through a user's stories, swipe switches user with a 3D cube transition, and an auto-advance timer drives the segmented progress bar
- rk-stories-url-overlay puts the open group and story in one ?story=group.story parameter, so a playing story has a link that can be shared and bookmarked, and the back button closes it
- rk-stories-ring-list draws the row of circular avatar rings that opens the player, each ring carrying the gradient until that user is watched to the end
- Eight template slot directives replace any part of the player — slide, header, footer, progress bar, navigation, group preview, loading and error — and each falls back to the built-in look when it is not given
- Every slot renders from the player's own injector, so a component drawn inside one reaches the player's providers — a video slide in a slide template finds the same sound state the header button writes
- Double-tap a story to send a reaction, with a heart animation over the story; hold to pause, release to resume
- desktopLayout="carousel" lays neighbouring users out as preview cards beside the active story, the way Instagram does on the web
- The viewed input takes a createStoriesViewedStateController, so a user resumes on their first unseen story, every story shown is recorded, and rings mute once a user is watched to the end
- A carousel card whose preview picture fails to load falls back to the plain card — the author, the ring and the time — rather than the browser's broken-image mark
- Opening captures focus and closing returns it to the element that opened the player; Tab and Shift+Tab cycle inside and wrap, and body scroll is locked while it is open
- Themed entirely through `--rk-stories-*` CSS custom properties; import @reelkit/angular-stories-player/styles.css once

## @reelkit/react-stories-player@0.5.1 (2026-09-23)

### 🩹 Fixes

- A carousel card whose preview picture fails to load now falls back to the plain card — the author, the ring and the time — instead of showing the browser's broken-image mark
- The layout, ring and relative-time helpers now come from @reelkit/stories-core, so the player ships a little less code and lays out exactly like the Vue one
- Editor hovers on the ring, header and slide props say what each one does to the player, in place of restating the prop's own name

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.5.0
- Updated @reelkit/react to 0.9.1
- Updated @reelkit/core to 0.8.2

## @reelkit/react-reel-player@0.6.3 (2026-09-23)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.1
- Updated @reelkit/core to 0.8.2

## @reelkit/vue-reel-player@0.4.0 (2026-09-23)

### 🚀 Features

- A slide reporting itself loaded, failed or ready with a duration no longer redraws the slider and its neighbouring slides — only the overlay above them

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.2
- Updated @reelkit/vue to 0.7.0

## @reelkit/angular-reel-player@0.6.0 (2026-09-23)

### 🚀 Features

- SoundStateService now lives in @reelkit/angular and is shared with the lightbox and the stories player, so a page holding more than one overlay keeps a single sound state; it is still exported from here under the same name, and importing it from either package works

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.7.0
- Updated @reelkit/core to 0.8.2

## @reelkit/react-lightbox@0.6.3 (2026-09-23)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.1
- Updated @reelkit/core to 0.8.2

## @reelkit/vue-lightbox@0.3.0 (2026-09-23)

### 🚀 Features

- Entering or leaving fullscreen, and a slide reporting itself loaded or failed, no longer redraw the gallery and its neighbouring slides — only the controls and the layer above them

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.7.0

## @reelkit/angular-lightbox@0.6.0 (2026-09-23)

### 🚀 Features

- The service is shared with the reel player and the stories player, so a page holding more than one overlay keeps a single sound state
- setLightboxVideoMuted still sets the shared video's muted value directly, and muted still starts true and returns to true when the lightbox closes

### ⚠️ Breaking Changes

- The lightbox sound button now appears only when a SoundStateService is provided above the overlay — provide one in the component that opens the lightbox to keep it. A video slide is rendered from your own rkLightboxSlide template, so it resolves against your injector rather than the overlay's; an instance the overlay provided itself would be invisible to the slide and the button would move nothing. One provided above both is what lets the two meet.

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.7.0
- Updated @reelkit/core to 0.8.2

## @reelkit/stories-core@0.5.0 (2026-09-23)

### 🚀 Features

- The layout helpers a stories player needs are exported here now, so every binding sizes the story canvas and the desktop carousel the same way: getStoriesSize, getCardSize, getCarouselSlot, getCardOffsets, getSlotOffset, isCardShown, getSlideGroupIndexes, isMobileWidth and parseDurationMs
- New getRingPresentation returns the size, border width and gradient of a story ring from the ring size, the story count and how many were seen
- New getPreviewSource answers what picture a desktop carousel card shows for a story — its poster, the image itself, or nothing for a video with no poster — so all three bindings preview alike
- New formatTimeAgo turns a timestamp into the relative label a story header shows

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.2

## @reelkit/react@0.9.1 (2026-09-23)

### 🩹 Fixes

- Observe accepts a readonly array in its signals prop

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.2

## @reelkit/vue@0.7.0 (2026-09-23)

### 🚀 Features

- New Observe component renders a region from a list of core signals and re-renders only that region when one of them changes, instead of the whole component around it

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.2

## @reelkit/angular@0.7.0 (2026-09-23)

### 🚀 Features

- New SoundStateService holds whether overlay video is muted, so the reel player, the lightbox and the stories player all read and write one sound state instead of each keeping its own
- rk-reel gains gesture outputs — tapped, doubleTapped, longPressStarted and longPressEnded — for building tap-to-advance and hold-to-pause on top of the slider
- New interceptNavKeys input hands the arrow keys to the new navKeyPressed output instead of moving the slider, which is what lets a player own both axes and decide where a key press goes
- GestureEvent and GestureCommonEvent are exported, so a handler for the new outputs can be typed without reaching into @reelkit/core

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.2

## @reelkit/core@0.8.2 (2026-09-23)

### 🩹 Fixes

- reaction takes a readonly array of signals, so dependencies held in a readonly array or a framework prop can be passed straight through instead of copied first

## Documentation (2026-09-18)

### 📖 Documentation

- AI agents running in your browser can now use the docs directly through WebMCP: every page on reelkit.dev offers `list_pages`, `search_docs`, `get_page` and `open_page`, so an agent can list every page, search the docs the way the command palette does, read a page as markdown and open one in the current tab, in your language — see [AI / LLM Integration](https://reelkit.dev/docs/llms#webmcp)
- The tools work without a flag in Chrome 149 to 156 through the WebMCP origin trial; browsers without WebMCP load nothing extra, and the tools only read the public docs — no cookies, no storage, no requests to other sites

## @reelkit/react-stories-player@0.5.0 (2026-09-18)

### 🚀 Features

- Stories player on desktop now fills the window height (with a 16px margin) at 9:16 instead of stopping at 480px wide, so the story is noticeably larger on big screens
- New desktopLayout="carousel" option lays the stories player out like Instagram on the web: neighbouring groups show as preview cards beside the active story, clicking one opens that group, and the cards slide across while the group changes
- New viewed prop on StoriesOverlay, StoriesUrlOverlay and StoriesRingList takes a createStoriesViewedStateController and does the whole viewed-state job: groups resume on their first unseen story, every story shown is recorded, and the rings and carousel cards mute a group watched to the end
- New renderGroupPreview render prop replaces the content of a carousel card
- A carousel card previews a story with no image through renderSlide, scaled down and inert
- The groups prop may grow while the player is open: cards for groups paged in later can be opened, and the last group moves on to them instead of closing
- Changing group always resumes a paused player, whether or not the story index changes

### 🩹 Fixes

- Fixed enableKeyboard={false} having no effect: the arrow keys and Escape are now left alone when it is off

### ⚠️ Breaking Changes

- StoriesRingList no longer takes a viewedState map; pass the same viewed controller the player takes
- useViewedState is no longer re-exported; create a viewed controller with createStoriesViewedStateController instead

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.4.0
- Updated @reelkit/react to 0.9.0
- Updated @reelkit/core to 0.8.1

## @reelkit/stories-core@0.4.0 (2026-09-18)

### 🚀 Features

- New createStoriesViewedStateController: everything a feed needs to remember what was seen from one call, with ring counts, resume positions, recording and storage that survives a reload; framework-agnostic, so React, Vue and Angular use it the same way
- New StoriesController.updateConfig({ groupCount, storyCounts }) for a feed that changes while the player is open, so groups paged in later can be reached

### ⚠️ Breaking Changes

- createStoriesViewedState and the StoriesViewedState type are no longer exported; createStoriesViewedStateController covers the same ground and takes the key, storage, ttlMs and maxTracks options directly

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.1

## @reelkit/react@0.9.0 (2026-09-18)

### 🚀 Features

- Observe now follows a different signal handed to it on a later render, in place of the one it replaced

### ⚠️ Breaking Changes

- useViewedState is removed; create the store once with useState(() => createViewedStateController(options)) and attach it in an effect, useEffect(() => store.attach(), [store]), or use createStoriesViewedStateController from @reelkit/stories-core for a stories feed

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.1

## @reelkit/vue@0.6.1 (2026-09-18)

### 🩹 Fixes

- Editor hovers on ReelIndicator and the Reel context no longer show broken links to Reel

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.1

## @reelkit/core@0.8.1 (2026-09-18)

### 🩹 Fixes

- Callable members of the controller, signal and storage adapter interfaces are declared as function-typed properties, so code that implements one of them is now checked strictly: a narrower parameter type than the interface allows is a type error
- SliderController.updateConfig and updateEvents, and GestureController.attach and updateEvents, document what a partial update keeps, what undefined clears and when listeners are attached
- Editor hovers no longer show broken links to symbols from other modules

## @reelkit/angular@0.6.1 (2026-09-18)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.1

## @reelkit/vue-lightbox@0.2.2 (2026-09-18)

### 🩹 Fixes

- LightboxApi, the object api-ready emits and the template ref exposes, is documented member by member: slider methods do nothing while the lightbox is closed, close always works, goTo clamps its index
- LightboxApi members are declared as function-typed properties, so code that implements the interface is now checked strictly

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.6.1

## @reelkit/react-lightbox@0.6.2 (2026-09-18)

### 🩹 Fixes

- Editor hovers no longer show broken links to LightboxOverlay and the sub-components in the render prop types

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.0
- Updated @reelkit/core to 0.8.1

## @reelkit/vue-reel-player@0.3.2 (2026-09-18)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.1
- Updated @reelkit/vue to 0.6.1

## @reelkit/angular-lightbox@0.5.2 (2026-09-18)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.6.1
- Updated @reelkit/core to 0.8.1

## @reelkit/react-reel-player@0.6.2 (2026-09-18)

### 🩹 Fixes

- Editor hovers no longer show broken links to SoundProvider, TimelineProvider and the slide components

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.9.0
- Updated @reelkit/core to 0.8.1

## @reelkit/angular-reel-player@0.5.2 (2026-09-18)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.6.1
- Updated @reelkit/core to 0.8.1

## Documentation (2026-09-16)

### 📖 Documentation

- The docs site now reads in seven languages — Portuguese at [reelkit.dev/pt](https://reelkit.dev/pt), Japanese at [reelkit.dev/ja](https://reelkit.dev/ja), Hindi at [reelkit.dev/hi](https://reelkit.dev/hi) and Spanish at [reelkit.dev/es](https://reelkit.dev/es) join English, Simplified Chinese and Ukrainian, each covering all 24 documentation pages, the home page and the header, sidebar, footer, command palette and not-found page
- The new translations are machine-produced and have not yet been reviewed by native speakers, so wording may be rough in places — corrections are welcome at [GitHub Issues](https://github.com/KonstantinKai/reelkit/issues) or as [pull requests](https://github.com/KonstantinKai/reelkit/pulls); English remains the source of truth
- A first visit to an English page from a browser that prefers one of the site's languages now opens that page in your language; picking a language in the switcher is remembered and always wins, English included, and search engines keep indexing the English pages as before
- The privacy policy describes this browser language check and the language cookie the switcher sets
- The privacy and terms pages load directly as real pages instead of through the not-found fallback
- Search in the command palette ignores accents and full-width letters, so `instalacao` finds `Instalação`, and Hindi keywords accept both common spellings of words such as install
- Typing a search in Japanese or Chinese no longer jumps to a result or closes the palette by accident: while the keyboard's suggestion list is open, Enter picks the character and Escape dismisses the list, as they do in any other text field
- Section anchors are identical in every language, so a `#theming` link works on any translation, and the theming token, CSS class and keyboard tables are now translated in Chinese and Ukrainian too
- Every page carries the full `hreflang` set for all seven languages; the changelog is listed in the sitemap once, in English, since its body is English everywhere
- Page addresses have no trailing slash — the slash form redirects to them — and a missing page now answers with a real 404 status

## @reelkit/vue@0.6.0 (2026-09-08)

### 🚀 Features

- Re-exports the new viewed-state store from core, so a Vue gallery can remember how far a viewer got through it
- Call the store's `attach()` from your own lifecycle hook to start reading storage and following other tabs
- `useVueRouterUrlAdapter` keeps the path, hash, and repeated query keys such as `?tag=a&tag=b` on every write; the query used to read the fragment as part of itself, so `/gallery?photo=2#details` closed on load, and repeated keys collapsed to their last value
- It reports whether the router pushed on the same page, replaced, or stepped through history, so a gallery opened from a `<router-link>` closes with one back step
- Its ownership stamp now travels through the router's own `state` navigation option into `history.state`, replacing the sessionStorage store that could mark an unrelated entry after a back step
- The new `UrlChange` type is re-exported alongside `UrlAdapter`

### ⚠️ Breaking Changes

- `vue-router` peer floor is now `>=4.1.0`, the first release with the `state` navigation option; on an older router the adapter still works but closing clears the parameter in place instead of stepping back

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.0

## @reelkit/core@0.8.0 (2026-09-08)

### 🚀 Features

- New `createViewedStateController` remembers how far a viewer got through a gallery, so a gallery can show what has already been seen and reopen where it was left
- An entry is persisted as the exact text a URL parameter would carry and read back through the same codec and locator, so spreading one key into both `createUrlStateController` and `createViewedStateController` keeps a bookmark and a stored entry the same string
- Durability follows that key: an id-addressed one keeps a place across the collection being reordered, and an entry that cannot be placed right now is kept rather than dropped, so a paginated feed never eats its own history
- Storage is pluggable through the new `StorageAdapter`, with `createLocalStorageAdapter` (the default), `createSessionStorageAdapter` and `createMemoryStorageAdapter`
- A denied or exhausted storage loses that one write and no more, and two open tabs stay in step through the browser's storage event
- Nothing is read until `attach()`, so a server render and the first client render agree and the store is safe to prerender
- `twoAxisViewedTracking` is the ready-made tracking pair for a two-axis player: one entry per outer slot, the inner index measuring progress through it
- `progressOf` is required for any position that is not a plain slide index, since nothing else says which number makes one position further than another — a two-axis player spreads `twoAxisViewedTracking`, which supplies it
- New optional `maxTracks` bounds how many tracks are kept: past it, the least recently recorded track is dropped on the next write, and recording a track, even a position already behind, keeps it from being the next to go
- `createLruCache` now returns a real Map, so it can be iterated, spread, or handed to `new Map()` directly; `LruCache` is an alias for `Map<string, V>`
- New optional `ttlMs` expires what a viewer has seen after a period of inactivity — per track, on a sliding clock, so a gallery still being visited never goes stale beside one abandoned months ago. Leave it out and entries are kept until forgotten explicitly, byte-for-byte as before
- `createUrlStateController`: writing a position while nothing is open now opens at once, without waiting for the adapter to report the write back — with the default History adapter, `set(2)` used to change the URL and leave `position` at `null`. A position past the loaded window still waits for `locateAsync` to page it in, as a shared link does
- Closing a cold deep link with the default History adapter now removes the parameter from the address bar; it used to leave `?photo=2` in place, so a reload reopened the overlay
- Closing never steps back off an entry it cannot prove is safe: only an entry the controller pushed, or one its adapter reported as a same-page push, is popped, and anything else is cleared in place
- `UrlAdapter.subscribe` listeners may now receive an optional `UrlChange` (`{ kind?: 'push' | 'replace' | 'pop' }`) saying how the entry came to be current; an adapter that passes nothing keeps compiling and gets the in-place close
- A lookup still in flight is cancelled the moment the overlay closes, so a late answer no longer opens a slide or writes to the URL after the user has left
- Detaching and reattaching a controller restarts a pending lookup instead of leaving `position` stuck at `null`
- The default History adapter keeps the pathname and fragment through open, swipe, and close; a bare `?photo=2` used to drop `#details`

## @reelkit/react@0.8.0 (2026-09-08)

### 🚀 Features

- New `useViewedState` hook builds a viewed-state store once and follows storage for the life of the component, so a gallery can show what has already been seen and reopen where it was left
- Reads nothing during render, so it is safe to prerender; observe its `entries` signal to repaint when a position is recorded, here or in another tab
- The core viewed-state exports are re-exported alongside it
- `useOverlayUrlState` now reads `codec` and `locator` from the latest render, so a link resolved after the gallery grew or reordered sees the current list; `param` and `adapter` stay fixed for the life of the component
- `useReactRouterUrlAdapter` keeps the pathname and hash on every write, and reports whether the router pushed on the same page, replaced, or stepped through history, so a gallery opened from a `<Link>` closes with one back step
- The new `UrlChange` type is re-exported alongside `UrlAdapter`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.0

## @reelkit/angular@0.6.0 (2026-09-08)

### 🚀 Features

- Re-exports the new viewed-state store from core, so an Angular gallery can remember how far a viewer got through it
- Call the store's `attach()` from your own lifecycle hook to start reading storage and following other tabs
- `createRouterUrlAdapter` keeps the path, fragment, and repeated query keys such as `?tag=a&tag=b` on every write; the query used to read the fragment as part of itself, so `/gallery?photo=2#details` closed on load, and repeated keys collapsed to their last value
- It reports whether the Router pushed on the same page, replaced, or stepped through history, so a gallery opened from a `routerLink` closes with one back step
- The new `UrlChange` type is re-exported alongside `UrlAdapter`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.0

## @reelkit/vue-lightbox@0.2.1 (2026-09-08)

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.6.0

## @reelkit/stories-core@0.3.0 (2026-09-08)

### 🚀 Features

- New `createStoriesViewedState` turns a viewed-state store into what a stories player needs: ring counts by author id, the story a group should resume on, and a recorder to wire to `onStoryViewed`
- `createStoriesController` gains a `resumeStoryIndex` option, consulted for any group reached for the first time in a session, so swiping onward continues where the viewer left off rather than restarting at story one
- That includes the group the player opens on: leave `initialStoryIndex` out and it resumes like every other group, while naming one outright still wins, which is how a shared link keeps opening exactly where it points
- An answer that is fractional or not a number at all is bounded to a real story rather than opening nothing
- New `reportInitialView()` reports the story the player opened on as viewed, so a group holding a single story can be marked seen without navigating
- `getLastStoryIndex` now answers with that resume position for a group not yet visited this session, so a neighbouring group renders the same story it will open on

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.0

## @reelkit/react-lightbox@0.6.1 (2026-09-08)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.8.0
- Updated @reelkit/core to 0.8.0

## @reelkit/vue-reel-player@0.3.1 (2026-09-08)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.8.0
- Updated @reelkit/vue to 0.6.0

## @reelkit/angular-lightbox@0.5.1 (2026-09-08)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.6.0
- Updated @reelkit/core to 0.8.0

## @reelkit/react-reel-player@0.6.1 (2026-09-08)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.8.0
- Updated @reelkit/core to 0.8.0

## @reelkit/angular-reel-player@0.5.1 (2026-09-08)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.6.0
- Updated @reelkit/core to 0.8.0

## @reelkit/react-stories-player@0.4.0 (2026-09-08)

### 🚀 Features

- Rings now show seen and unseen across reloads, and a partly watched group reopens on its first unseen story — wire `useViewedState` and `createStoriesViewedState`, both re-exported here, to the ring list and the overlay
- `StoriesOverlay` and `StoriesUrlOverlay` take a new optional `resumeStoryIndex`, consulted for any group reached for the first time in a session, so swiping onward continues where the viewer left off
- The group the player opens on resumes through the same callback when `initialStoryIndex` is left out, so a ring click needs one prop rather than two — pass `initialStoryIndex` only to name a story outright, which still wins
- With the URL-driven overlay a link still wins: the parameter decides where the player opens, whatever has been stored
- The story the player opens on is now reported through `onStoryViewed` when the overlay mounts, so opening a one-story group and closing marks it watched — a handler that counts views will see one call per open that it did not before

### 🩹 Fixes

- `StoriesRing` now shows two states and only two: a group with stories left to watch keeps the rotating gradient, a fully watched one turns a flat muted ring
- Fixes a part-watched ring rendering as a smeared, arbitrarily rotated arc — the gaps between story segments were painted over by a second, unrotated copy of the ring, so the muted and gradient halves ran together and lined up with no particular story
- `viewedCount` between 1 and `totalStories - 1` now renders the same as an untouched group; per-story progress belongs to the progress bar inside the player, not to the ring

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.3.0
- Updated @reelkit/react to 0.8.0
- Updated @reelkit/core to 0.8.0

## Documentation (2026-07-28)

### 📖 Documentation

- The docs site is now trilingual — Simplified Chinese at [reelkit.dev/zh](https://reelkit.dev/zh) and Ukrainian at [reelkit.dev/uk](https://reelkit.dev/uk), each covering all 24 documentation pages plus the header, sidebar, footer, command palette and not-found page
- Both translations are machine-produced and reviewed rather than written by native speakers, so wording may be rough in places — corrections are welcome at [GitHub Issues](https://github.com/KonstantinKai/reelkit/issues); English remains the source of truth
- New language switcher in the header keeps your place: it swaps only the locale prefix, so the page, query string and anchor all survive the switch
- Search returns results in the active language while keeping the English API names searchable, so `createSliderController` still finds its page from a translated interface
- Code samples, identifiers, prop names and default values stay in English on the translated pages — translation touches prose only
- Every page carries a same-language canonical URL and a bidirectional `hreflang` set (`en`, `zh-Hans`, `uk`, `x-default`), so the three language versions are indexed as alternates rather than duplicates
- English URLs are unchanged — existing links, bookmarks and search results all still resolve
- The changelog and the legal pages stay in English in every locale, since they are generated from release notes and translated legal text would be a second document to keep accurate
- The theme control gains a **System** setting alongside Light and Dark — it follows the operating system's appearance live, and is what a first visit starts on

## @reelkit/vue@0.5.0 (2026-07-28)

### 🚀 Features

- New `useOverlayUrlState` composable — build a URL-state controller for an overlay: mirror a query parameter into a Vue ref and hand the controller to a URL-driven overlay
- Re-exports the core URL-state primitives (`createUrlStateController`, `createHistoryAdapter`, `indexCodec`, `createIndexLocator`, `urlIndexKey`, `urlIndexTwoAxisKey`, `urlStableIdKey`, `urlStableIdTwoAxisKey`) and their types
- New `useVueRouterUrlAdapter` from the `@reelkit/vue/vue-router-url-adapter` subpath — a ready-made `UrlAdapter` that drives a routed app's URL state through Vue Router, carrying the controller's ownership stamp in sessionStorage since Vue Router owns `history.state`; `vue-router` is an optional peer dependency and an app without a router never pulls it in

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.7.0

## @reelkit/core@0.7.0 (2026-07-28)

### 🚀 Features

- New `createUrlStateController` — mirror a query parameter into a signal and write changes back to the URL
- Opening pushes one history entry, paging replaces it — a hundred swipes add none, so one back step always leaves
- New `UrlAdapter` injection point: routed apps drive reads and writes through their own router instead of the History API
- New built-in URL keys: `urlIndexKey` (index gallery), `urlIndexTwoAxisKey` (a two-axis `?p=<outer>.<inner>` player), and the stable-id family `urlStableIdKey` / `urlStableIdTwoAxisKey` that address a gallery by each item's id so a bookmark survives a reorder — with an opt-in `hashCodec` (pass the exported `base64UrlCodec`) to base64url-obscure the id in the parameter, or plug in your own

## @reelkit/react@0.7.0 (2026-07-28)

### 🚀 Features

- New `useOverlayUrlState` hook — build a URL-state controller for an overlay: mirror a query parameter into a signal and hand the controller to a URL-driven overlay
- Opening is a link — the address bar owns the open state, so a shared link opens the overlay, and the back button closes it when it was opened from within the app (a fresh-tab deep link closes with the button or Escape)
- Spread `urlIndexKey(() => count)` for the default index gallery — it returns the matched `codec` and `locator` pair (now both required) so a stale or out-of-range parameter drops itself from the URL; spread `urlStableIdKey({ items })` instead to key links by each item's stable `id` so a bookmark survives a reorder, or supply your own matched `codec` + `locator` for full control
- New `useReactRouterUrlAdapter` from the `@reelkit/react/react-router-url-adapter` subpath — a ready-made `UrlAdapter` that drives a routed app's URL state through React Router, so `history.pushState` never writes behind the router's back; `react-router-dom` is an optional peer dependency and an app without a router never pulls it in

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.7.0

## @reelkit/angular@0.5.0 (2026-07-28)

### 🚀 Features

- New `createOverlayUrlState` — builds a URL-state controller for an overlay, attaching on create and releasing through `DestroyRef`
- Core URL-state API is now reachable from the binding: `createUrlStateController`, `createHistoryAdapter`, `indexCodec`, `createIndexLocator`, `urlIndexKey`, `urlIndexTwoAxisKey`, `urlStableIdKey`, `urlStableIdTwoAxisKey`, and their types
- New `createRouterUrlAdapter` from the `@reelkit/angular/ng-router-url-adapter` entry point — a ready-made `UrlAdapter` that drives a routed app's URL state through the Angular Router, releasing its `NavigationEnd` subscription through `DestroyRef`; `@angular/router` is an optional peer dependency and an app without routing never pulls it in

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.7.0

## @reelkit/vue-lightbox@0.2.0 (2026-07-28)

### 🚀 Features

- New `LightboxUrlOverlay` — a URL-driven lightbox for Vue whose open state lives in the address bar: shareable links, deep links, and a back button that closes the gallery when opened from within the app
- Build its controller with `useOverlayUrlState` from `@reelkit/vue` and pass it as `:controller`; `LightboxOverlay` stays controlled via `v-model:is-open`
- Stale or unresolvable parameters are dropped from the URL instead of asserting a slide that cannot open

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.5.0

## @reelkit/stories-core@0.2.0 (2026-07-28)

### 🚀 Features

### ⚠️ Breaking Changes

- removed `StoriesController.dispose()`. The stories controller owns no timers, listeners, or subscriptions — only references to your event callbacks — so it never needed teardown and is reclaimed once it falls out of scope. Remove any calls to it; disposing the sub-controllers you own (the timer via `createTimerController`, the progress renderer) is unchanged

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.7.0

## @reelkit/react-lightbox@0.6.0 (2026-07-28)

### 🚀 Features

- New `LightboxUrlOverlay` — a URL-driven lightbox whose open state lives in the address bar: shareable links, deep links, and a back button that closes the gallery when opened from within the app
- Build its controller with `useOverlayUrlState` and pass it as `controller`; `LightboxOverlay` stays controlled via `isOpen`
- Stale or unresolvable parameters are dropped from the URL instead of asserting a slide that cannot open

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.7.0
- Updated @reelkit/core to 0.7.0

## @reelkit/vue-reel-player@0.3.0 (2026-07-28)

### 🚀 Features

- New `ReelPlayerUrlOverlay` — a reel player whose open state lives in the address bar: shareable links, deep links, and a back button that closes the player when it was opened from within the app
- Build the controller with `useOverlayUrlState` and pass it as `:controller`; `ReelPlayerOverlay` stays controlled via `v-model:is-open`, so each component carries exactly one open-state driver
- Opening pushes a single history entry and every slide change replaces it, so paging a feed never buries the back button and one back step always leaves
- Choose the URL depth by the controller's key: a one-axis `urlIndexKey` addresses the post only (`?reel=3`), a two-axis `urlIndexTwoAxisKey` also carries a multi-media post's inner media index (`?reel=3.2`) — pick one key per app, the two wire shapes do not cross-decode
- `ReelPlayerOverlay` gains an `initial-inner-index` prop to open a multi-media post at a specific inner image, and an `inner-slide-change` emit reporting the active post's inner media index — the overlay side of two-axis addressing
- Re-exports `urlIndexTwoAxisKey` and the `TwoAxisPosition` type from `@reelkit/vue`, plus the url-state types `UrlAdapter`, `UrlCodec` and `UrlLocator`, for building and typing the controller

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.7.0
- Updated @reelkit/vue to 0.5.0

## @reelkit/angular-lightbox@0.5.0 (2026-07-28)

### 🚀 Features

- New `RkLightboxUrlOverlayComponent` — a URL-driven lightbox whose open state lives in the address bar: shareable links, deep links, and a back button that closes the gallery when opened from within the app
- Build its controller with `createOverlayUrlState` and pass it as `[controller]`; `RkLightboxOverlayComponent` stays controlled via `isOpen`
- Template slot directives work unchanged inside the URL component, which runs the slot queries itself and forwards each template to the gallery
- Opening pushes a single history entry and paging replaces it, so a gallery never buries the back button
- Stale or unresolvable parameters are dropped from the URL instead of asserting a slide that cannot open
- `RkLightboxOverlayComponent` gains optional `controlsTemplate`, `navigationTemplate`, `infoTemplate`, `slideTemplate`, `loadingTemplate` and `errorTemplate` inputs, each falling back to its existing template slot

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.5.0
- Updated @reelkit/core to 0.7.0

## @reelkit/react-reel-player@0.6.0 (2026-07-28)

### 🚀 Features

- New `ReelPlayerUrlOverlay` — a URL-driven reel player whose open state lives in the address bar: shareable links, deep links, and a back button that closes the player when opened from within the app
- Build its controller with `useOverlayUrlState` from `@reelkit/react` and pass it as `controller`; `ReelPlayerOverlay` stays controlled via `isOpen`
- Opening pushes a single history entry and swiping the feed replaces it, so paging never piles up entries and one back step always leaves
- Choose the URL depth by the controller's key: a one-axis `urlIndexKey` addresses the post only (`?reel=3`), a two-axis `urlIndexTwoAxisKey` also carries a multi-media post's inner media index (`?reel=3.2`) — pick one key per app, the two wire shapes do not cross-decode
- Stale or unresolvable parameters are dropped from the URL instead of asserting a slide that cannot open
- `ReelPlayerOverlay` gains `initialInnerIndex` to open a multi-media post at a specific inner image, and an `onInnerSlideChange(outerIndex, innerIndex)` callback reporting the active post's inner media index — the overlay side of two-axis addressing
- New `ReelPlayerOverlayBaseProps`, `ReelPlayerControlledProps`, `ReelPlayerUrlControlledProps`, and `ReelPlayerUrlOverlayProps` types; `ReelPlayerOverlayProps` keeps its existing shape

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.7.0
- Updated @reelkit/core to 0.7.0

## @reelkit/angular-reel-player@0.5.0 (2026-07-28)

### 🚀 Features

- New `RkReelPlayerUrlOverlayComponent` — a reel player whose open state lives in the address bar: shareable links, deep links, and a back button that closes the player when it was opened from within the app
- Build the controller with `createOverlayUrlState` and pass it as `[controller]`; `RkReelPlayerOverlayComponent` stays controlled via `[isOpen]`, so each component carries exactly one open-state driver
- Opening pushes a single history entry and every slide change replaces it, so paging a feed never buries the back button and one back step always leaves
- Choose the URL depth by the controller's key: a one-axis `urlIndexKey` addresses the post only (`?reel=3`), a two-axis `urlIndexTwoAxisKey` also carries a multi-media post's inner media index (`?reel=3.2`) — pick one key per app, the two wire shapes do not cross-decode
- `RkReelPlayerOverlayComponent` gains an `initialInnerIndex` input to open a multi-media post at a specific inner image, and an `innerSlideChange` output (`{ outer, inner }`) reporting the active post's inner media index — the overlay side of two-axis addressing
- `RkReelPlayerOverlayComponent` gains optional `slideTemplate`, `slideOverlayTemplate`, `controlsTemplate`, `timelineTemplate`, `navigationTemplate`, `nestedSlideTemplate`, `nestedNavTemplate`, `loadingTemplate` and `errorTemplate` inputs, each falling back to its existing template slot directive, so the url overlay can forward projected templates through
- Re-exports `urlIndexTwoAxisKey` and the `TwoAxisPosition` type from `@reelkit/angular`, plus the url-state types `UrlAdapter`, `UrlCodec` and `UrlLocator`, for building and typing the controller; build the controller with `createOverlayUrlState` from `@reelkit/angular`

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.5.0
- Updated @reelkit/core to 0.7.0

## @reelkit/react-stories-player@0.3.0 (2026-07-28)

### 🚀 Features

- New `StoriesUrlOverlay` — a stories player whose open group and story live in one `?story=<group>.<story>` URL parameter: shareable links, deep links, and a back button that closes the player when it was opened from within the app
- Inner navigation is carried too — swiping between a user's stories updates the URL — and opening pushes a single history entry that every navigation replaces, so one back step always closes
- Build the controller with `useOverlayUrlState` and the core `urlIndexTwoAxisKey` (outer axis is the group, inner is the story) and pass it as `controller`; `StoriesOverlay` stays controlled via `isOpen`, so each component carries exactly one open-state driver
- Re-exports `useOverlayUrlState`, `urlIndexTwoAxisKey`, `TwoAxisPosition`, and the url-state types (`UrlAdapter`, `UrlCodec`, `UrlLocator`, `UrlKey`, `UrlStateController`) for building and typing the controller
- Fixed the URL-driven stories player freezing the address bar while navigating — moving between stories or groups now updates the `?story=<group>.<story>` parameter as intended

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.2.0
- Updated @reelkit/react to 0.7.0
- Updated @reelkit/core to 0.7.0

## @reelkit/vue-lightbox@0.1.0 (2026-04-27)

### 🎉 Initial Release

- New `@reelkit/vue-lightbox` package — full-screen image and video gallery overlay for Vue 3 with feature parity to `@reelkit/react-lightbox` and `@reelkit/angular-lightbox`
- Virtualized slider renders at most three slides at a time via `@reelkit/vue` `Reel`
- Four tree-shakable built-in transitions: `slideTransition`, `lightboxFadeTransition`, `flipTransition`, `lightboxZoomTransition` — import the one you want and pass it via `transitionFn` (defaults to `slideTransition`)
- Opt-in video support through the `useVideoSlideRenderer` composable plus `SoundProvider` for a shared mute toggle
- Scoped slots for `slide`, `controls`, `navigation`, `info`, `loading`, `error` — omit any slot to fall back to the built-in chrome
- `v-model:is-open` two-way binding alongside the legacy `:is-open` / `@close` API
- Overlay-scoped fullscreen request plus Escape two-step (exit fullscreen first, then close)
- Body-scroll lock and focus trap while the overlay is open
- Themeable through `--rk-lightbox-*` CSS custom properties
- New `swipeToCloseDirection` prop (`'up' | 'down'`, default `'up'`) to flip the mobile close-swipe axis

## @reelkit/react-lightbox@0.5.0 (2026-04-27)

### 🚀 Features

- New `swipeToCloseDirection` prop (`'up' | 'down'`, default `'up'`) to flip the mobile close-swipe axis
- `slideTransition` and `flipTransition` are now re-exported from `@reelkit/react-lightbox` alongside `lightboxFadeTransition` and `lightboxZoomTransition` — import every built-in transition from a single entry

### ⚠️ Breaking Changes

- `transition` string alias (`'slide' \| 'fade' \| 'flip' \| 'zoom-in'`) and `TransitionType` export removed. Pass a `TransitionTransformFn` directly to `transitionFn` (defaults to `slideTransition`). Unused built-ins now tree-shake out (~2 kB gzip saving when you only use one). Migrate `transition="fade"` → `transitionFn={lightboxFadeTransition}` after importing `lightboxFadeTransition` from `@reelkit/react-lightbox`.

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.6.1

## @reelkit/angular-lightbox@0.4.0 (2026-04-27)

### 🚀 Features

- New `swipeToCloseDirection` input (`'up' | 'down'`, default `'up'`) to flip the mobile close-swipe axis
- `slideTransition` and `flipTransition` are now re-exported from `@reelkit/angular-lightbox` alongside `lightboxFadeTransition` and `lightboxZoomTransition` — import every built-in transition from a single entry

### ⚠️ Breaking Changes

- `transition` string input (`'slide' \| 'fade' \| 'flip' \| 'zoom-in'`) and `TransitionType` export removed. Pass a `TransitionTransformFn` directly to the `transitionFn` input (defaults to `slideTransition`). Unused built-ins now tree-shake out (~2 kB gzip saving when you only use one). Migrate `transition="fade"` → `[transitionFn]="fadeTransition"` after binding a class field to the imported `lightboxFadeTransition` from `@reelkit/angular-lightbox`.

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.4.1

## Documentation (2026-04-27)

### 📖 Documentation

- Every `/docs/*` route on [reelkit.dev](https://reelkit.dev) is now pre-rendered to static HTML via React Router v7 framework mode (`prerender + ssr:false`), so AI crawlers and search bots see real prose without executing JS
- New `llms.txt` and `llms-full.txt` published at the docs root ([reelkit.dev/llms.txt](https://reelkit.dev/llms.txt), [reelkit.dev/llms-full.txt](https://reelkit.dev/llms-full.txt)) deliver dense AI-tuned prose for all 23 docs pages

## @reelkit/vue@0.4.0 (2026-04-27)

### 🚀 Features

- New `hasRenderedNodes` helper exported for slot-fallback detection — decides whether a scoped slot has real content or only `v-if`-false placeholder comments, so overlay components can fall back to their built-in defaults cleanly
- `toVueRef` now mirrors lazy signals correctly on first paint (previously a signal that resynced its value inside the subscribe path — e.g. core `fullscreenSignal` — surfaced a stale snapshot until the next emission)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.1

## @reelkit/core@0.6.1 (2026-04-27)

### 🩹 Fixes

- `fullscreenSignal` now resyncs from the live DOM when its first observer attaches, so overlays reopened after a fullscreen close always start with the correct icon and aria state

## @reelkit/react@0.6.1 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.1

## @reelkit/angular@0.4.1 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.1

## @reelkit/stories-core@0.1.4 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.1

## @reelkit/vue-reel-player@0.2.1 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.4.0

## @reelkit/react-reel-player@0.5.1 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.6.1

## @reelkit/angular-reel-player@0.4.1 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.4.1

## @reelkit/react-stories-player@0.2.2 (2026-04-27)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.4
- Updated @reelkit/react to 0.6.1

## @reelkit/vue-reel-player@0.2.0 (2026-04-24)

### 🚀 Features

- Built-in playback timeline bar over the active video with track, buffered segments, progress fill, and draggable pill cursor
- New `timeline` prop (`'auto' | 'always' | 'never'`, default `'auto'`) with `timeline-min-duration-seconds` (default 30) to gate when the bar renders; on multi-media carousels the bar follows the active nested video
- `#timeline` scoped slot for fully custom scrub UI
- `TimelineBar`, `TimelineProvider`, `useTimelineState` exports for composition
- Pointer + keyboard scrubbing on the track (pointer capture, arrows, Home/End, PageUp/PageDown)
- Sound button relocated under the close button for more consistent top-right stacking
- Auto-detect vertical video orientation via `syncVideoObjectFit` so portrait clips with stale declared aspect ratios still render with the correct `object-fit`

### 🧱 Updated Dependencies

- Updated @reelkit/vue to 0.3.0

## @reelkit/react-reel-player@0.5.0 (2026-04-24)

### 🚀 Features

- Built-in playback timeline bar over the active video with track, buffered segments, progress fill, and draggable pill cursor
- New `timeline` prop (`'auto' | 'always' | 'never'`, default `'auto'`) with `timelineMinDurationSeconds` (default 30) to gate when the bar renders; on multi-media carousels the bar follows the active nested video
- `renderTimeline` render prop for fully custom scrub UI
- `TimelineBar`, `TimelineProvider`, `useTimelineState` exports for composition
- Pointer + keyboard scrubbing on the track (pointer capture, arrows, Home/End, PageUp/PageDown)
- Sound button relocated under the close button for more consistent top-right stacking
- Auto-detect vertical video orientation via `syncVideoObjectFit` so portrait clips with stale declared aspect ratios still render with the correct `object-fit`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.6.0

## @reelkit/angular-reel-player@0.4.0 (2026-04-24)

### 🚀 Features

- Built-in playback timeline bar over the active video with track, buffered segments, progress fill, and draggable pill cursor
- New `timeline` input (`'auto' | 'always' | 'never'`, default `'auto'`) with `timelineMinDurationSeconds` (default 30) to gate when the bar renders; on multi-media carousels the bar follows the active nested video
- `rkPlayerTimeline` template slot directive for fully custom scrub UI
- `RkTimelineBarComponent` and `TimelineStateService` exports for composition
- Pointer + keyboard scrubbing on the track (pointer capture, arrows, Home/End, PageUp/PageDown)
- Sound button relocated under the close button for more consistent top-right stacking
- Auto-detect vertical video orientation via `syncVideoObjectFit` so portrait clips with stale declared aspect ratios still render with the correct `object-fit`

### 🩹 Fixes

- Draggable error slides: the error-state overlay no longer swallows pointer events, so broken slides can be swiped away

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.4.0

## @reelkit/vue@0.3.0 (2026-04-24)

### 🚀 Features

- Re-exports `createTimelineController`, `syncVideoObjectFit`, `TimelineController`, `TimelineControllerConfig`, `BufferedRange`, and `Disposer` from `@reelkit/core`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/core@0.6.0 (2026-04-24)

### 🚀 Features

- `createTimelineController` factory with reactive signals (duration, currentTime, progress, bufferedRanges, isScrubbing) plus seek and bindInteractions for pointer + keyboard video scrubbing — pointer capture, arrows, Home/End, PageUp/PageDown
- `syncVideoObjectFit` utility auto-detects video orientation from `loadedmetadata` and keeps `object-fit` aligned (cover for portrait, contain for landscape)

## @reelkit/react@0.6.0 (2026-04-24)

### 🚀 Features

- Re-exports `createTimelineController`, `syncVideoObjectFit`, `TimelineController`, `TimelineControllerConfig`, and `BufferedRange` from `@reelkit/core`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/angular@0.4.0 (2026-04-24)

### 🚀 Features

- Re-exports `createTimelineController`, `syncVideoObjectFit`, `TimelineController`, `TimelineControllerConfig`, and `BufferedRange` from `@reelkit/core`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/stories-core@0.1.3 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.6.0

## @reelkit/react-lightbox@0.4.1 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.6.0

## @reelkit/angular-lightbox@0.3.1 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.4.0

## @reelkit/react-stories-player@0.2.1 (2026-04-24)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.3
- Updated @reelkit/react to 0.6.0

## @reelkit/vue-reel-player@0.1.0 (2026-04-22)

### 🎉 Initial Release

- Full-screen TikTok/Instagram Reels-style vertical video player overlay for Vue 3
- `v-model:is-open` two-way binding; Teleport to body; shared `<SoundProvider>` context
- Full slot customization: slide, slide overlay, controls, navigation, nested slide, nested navigation, loading, error
- Imperative API via template ref or `apiReady` emit
- Generic content types via `BaseContentItem`
- Themeable via `--rk-reel-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

## @reelkit/vue@0.2.0 (2026-04-22)

### 🚀 Features

- Add `toVueRef(source)` composable that bridges core Subscribables into a read-only Vue ref with auto-disposal via `onScopeDispose`
- Re-export core focus management utilities (`captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/core@0.5.0 (2026-04-22)

### 🚀 Features

- Add focus management utilities: `captureFocusForReturn`, `createFocusTrap`, `getFocusableElements` for building accessible modal overlays

## @reelkit/react@0.5.0 (2026-04-22)

### 🚀 Features

- Re-export core focus management utilities (`captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/angular@0.3.0 (2026-04-22)

### 🚀 Features

- Re-export core focus management utilities (`captureFocusForReturn`, `createFocusTrap`, `getFocusableElements`)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/stories-core@0.1.2 (2026-04-22)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.5.0

## @reelkit/react-lightbox@0.4.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-lightbox-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- overlay root class `rk-lightbox-container` → `rk-lightbox-overlay`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.5.0

## @reelkit/angular-lightbox@0.3.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-lightbox-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- overlay root class `rk-lightbox-container` → `rk-lightbox-overlay`

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.3.0

## @reelkit/react-reel-player@0.4.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-reel-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- class renames `rk-player-*` / `rk-video-slide-*` / `rk-nested-*` / `rk-media-error` → `rk-reel-*` — retarget custom CSS overrides

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.5.0

## @reelkit/angular-reel-player@0.3.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-reel-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### ⚠️ Breaking Changes

- class renames `rk-player-*` / `rk-video-slide-*` / `rk-nested-*` / `rk-media-error` → `rk-reel-*` — retarget custom CSS overrides

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.3.0

## @reelkit/react-stories-player@0.2.0 (2026-04-22)

### 🚀 Features

- Themeable via `--rk-stories-*` CSS custom properties
- Dialog a11y: `role="dialog"`, `aria-modal`, focus trap, focus return on close

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.2
- Updated @reelkit/react to 0.5.0

## @reelkit/vue@0.1.0 (2026-04-17)

### 🎉 Initial Release

- Virtualized single-item slider — only 3 slides in the DOM at a time, handles 10,000+ items
- Built-in transitions: slide, cube, fade, flip, zoom (tree-shakeable)
- `<Reel>` component with auto-sizing via `ResizeObserver` — omit `size` prop and the container measures itself
- `<ReelIndicator>` — dot indicators that auto-connect to the parent `<Reel>`; new `indicatorClass` and `indicatorStyle` props for custom styling
- `<SwipeToClose>` — swipe-to-dismiss wrapper for overlays
- `<SoundProvider>` and `useSoundState()` for shared mute/unmute across nested players
- `useBodyLock` composable — locks body scroll with shared reference counting across components
- `useFullscreen` composable — generic over the element type; all methods return `Promise<void>`; safely exits before requesting when another element is already fullscreen
- Full WAI-ARIA carousel accessibility: region role, live announcements, roving tabindex on indicator dots, `inert` on inactive slides
- SSR-safe — works with Nuxt 3 server rendering
- Gesture events via Vue's emits API: `@tap`, `@double-tap`, `@long-press`, `@long-press-end`
- `onNavKeyPress` prop to override default arrow-key navigation
- `ReelProps` type export for consumers building wrappers
- Core utilities re-exported — no separate `@reelkit/core` install needed

## @reelkit/core@0.4.0 (2026-04-17)

### 🚀 Features

- New `sharedBodyLock` singleton export — a shared body scroll lock instance that multiple components can lock/unlock independently without stepping on each other. Use this instead of `createBodyLock()` when you want nested modals and overlays to interleave correctly

## @reelkit/react@0.4.0 (2026-04-17)

### 🚀 Features

- Full WAI-ARIA carousel accessibility on `<Reel>`: `role="region"`, `aria-roledescription="carousel"`, new `ariaLabel` prop, and an `aria-live` region that announces slide changes without re-rendering
- Inactive slides get `inert` to keep keyboard focus and assistive tech on the active slide only
- `<ReelIndicator>` is now a proper tablist: each dot is a `role="tab"` with `aria-selected` and roving `tabindex`; Arrow keys, Home, End move focus, Enter/Space activate
- `useBodyLock` now shares a single reference counter across components — nested overlays (e.g. lightbox inside a modal) interleave correctly and body styles stay locked until the last caller releases
- `useFullscreen.request()` safely exits any other fullscreen element before requesting; all methods (`request`, `exit`, `toggle`) now return `Promise<void>`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.4.0

## @reelkit/angular@0.2.1 (2026-04-17)

### 🩹 Fixes

- `BodyLockService` now shares a single body scroll lock counter across the entire app — nested modals and overlays interleave correctly and body styles stay locked until the last caller releases
- Re-exports `sharedBodyLock` from core for components that want to bypass the service and work with the lock directly

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.4.0

## @reelkit/stories-core@0.1.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.4.0

## @reelkit/react-lightbox@0.3.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.4.0

## @reelkit/react-reel-player@0.3.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.4.0

## @reelkit/react-stories-player@0.1.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/stories-core to 0.1.1
- Updated @reelkit/react to 0.4.0

## @reelkit/angular-lightbox@0.2.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.1

## @reelkit/angular-reel-player@0.2.1 (2026-04-17)

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.1

## @reelkit/stories-core@0.1.0 (2026-04-03)

### 🎉 Initial Release

- Framework-agnostic stories state machine with story and group navigation
- Auto-advance timer with pause/resume
- Tap zone detection (left/center/right)
- Segmented progress bar with sliding window for 50+ stories

## @reelkit/react-stories-player@0.1.0 (2026-04-03)

### 🎉 Initial Release

- Full-screen Instagram-style stories player overlay for React
- 3D cube transition between users
- Tap-to-advance navigation with segmented progress bar
- Double-tap heart animation
- Auto-advance timer with pause on hold

## @reelkit/core@0.3.0 (2026-04-03)

### 🚀 Features

- Transition engine rewrite: transitions are pure functions (`TransitionTransformFn`) that receive slide progress and return CSS transforms
- Built-in transitions: slide, fade, flip, cube, zoom (tree-shakeable imports)
- `getSlideProgress` helper computes normalized slide offsets for custom transitions
- Tap, double-tap, and long-press gesture detection
- Sound controller for shared mute state across framework bindings
- Content loading controller tracks per-slide loading and error states via `isLoading`/`isError` signals
- Content preloader with LRU cache preloads neighbors and caches broken URLs to skip retries
- Fullscreen utilities with Safari vendor-prefix guards
- Reference-counted body scroll lock with SSR guard
- `enableNavKeys` config flag controls keyboard navigation independently from gestures
- `onNavKeyPress` event replaces default arrow-key navigation, receives `-1|1` increment
- `observeMediaLoading` uses `playing` + `canplaythrough` instead of `canplay` as ready signals

### ⚠️ Breaking Changes

- `Escape` key removed from `NavKey` type and keyboard controller

## @reelkit/react@0.3.0 (2026-04-03)

### 🚀 Features

- `Reel` accepts `TransitionTransformFn` for custom slide animations
- Built-in transitions: slide, fade, flip, cube, zoom (tree-shakeable imports)
- `SoundProvider` and `useSoundState` give components shared mute/unmute context
- `enableGestures` prop disables touch/mouse drag on `Reel`
- `onNavKeyPress` callback replaces default arrow-key navigation with custom handler
- Re-exports core utilities: content loading, preloading, sound controller, LRU cache
- `useFullscreen` hook bridges core fullscreen state to React with request/exit/toggle helpers
- `useBodyLock` hook for declarative body scroll locking

### ⚠️ Breaking Changes

- `Reel` `transition` prop no longer accepts string names — pass a `TransitionTransformFn` directly (e.g. `slideTransition` instead of `'slide'`)
- `useNavKeys` prop renamed to `enableNavKeys`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.3.0

## @reelkit/angular@0.2.0 (2026-04-03)

### 🚀 Features

- `Reel` component accepts `TransitionTransformFn` via `transition` input for custom slide animations (slide, fade, flip, cube, zoom as tree-shakeable imports)
- Per-slide absolute positioning replaces flex+translate rendering
- `enableGestures` input disables touch/mouse drag
- Re-exports core utilities: content loading, preloading, sound controller, fullscreen, body lock, transition functions/types, `observeDomEvent`, `createDisposableList`
- `BodyLockService` wraps core `createBodyLock`
- `SwipeToClose` directive moved from lightbox with configurable up/down direction

### ⚠️ Breaking Changes

- `Reel` uses per-slide absolute positioning with `TransitionTransformFn` — custom CSS targeting `.rk-lightbox-slider-track` or `flex-direction` no longer applies
- `enableNavKeys` input renamed from `useNavKeys`

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.3.0

## @reelkit/react-lightbox@0.3.0 (2026-04-03)

### 🚀 Features

- Controls, navigation, info overlay, and loading spinner update independently via signals without full re-renders
- Loading spinner tracks image and video load states; content preloader skips already-cached images
- Flip transition added
- Sound button appears only on video slides with reactive mute toggle
- Top shade gradient improves control visibility on bright images
- Broken image/video shows an error icon; errored URLs stay cached so revisiting skips the retry
- `renderLoading`/`renderError` props accept custom loading and error UI
- All render callbacks include the current `LightboxItem`
- Render props type names simplified: `ControlsRenderProps`, `SlideRenderProps`, `NavigationRenderProps`, `InfoRenderProps` (Lightbox prefix dropped)

### ⚠️ Breaking Changes

- `useFullscreen` hook removed — import from `@reelkit/react` instead
- `renderSlide` accepts a single `SlideRenderProps` object instead of separate parameters
- `LightboxControlsRenderProps` renamed to `ControlsRenderProps`, `currentIndex` renamed to `activeIndex`
- `LightboxSlideRenderProps` renamed to `SlideRenderProps`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.3.0

## @reelkit/angular-lightbox@0.2.0 (2026-04-03)

### 🚀 Features

- Lightbox renders via `ReelComponent` internally with `TransitionTransformFn` (slide, fade, flip, zoom-in)
- Loading spinner and error icon track per-slide load states
- Content preloader caches broken URLs so revisiting skips the retry
- Reactive per-slide sound button via `createSoundController`
- `lightboxFadeTransition` and `lightboxZoomTransition` exported as `TransitionTransformFn`
- `rkLightboxLoading` and `rkLightboxError` template slot directives accept custom loading/error UI
- All template contexts include `item` (`LightboxItem`)
- Top shade gradient improves control visibility

### ⚠️ Breaking Changes

- `FullscreenService` removed — use `fullscreenSignal`/`requestFullscreen`/`exitFullscreen` from `@reelkit/angular`
- `LightboxControlsContext.currentIndex` renamed to `activeIndex`
- `enableWheel` defaults to `true`

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.0

## @reelkit/react-reel-player@0.3.0 (2026-04-03)

### 🚀 Features

- Controls, navigation, and wave loader update independently via signals without full re-renders
- Wave loader tracks image and video load states; content preloader skips already-cached media
- Nested slider forwards loading callbacks to inner slides and clears the loader on video-to-image navigation
- Video frame capture before transition provides seamless poster display
- `onReady`/`onWaiting`/`onError` added to `SlideRenderProps` and `NestedSlideRenderProps`
- Broken image/video shows an error icon; errored URLs stay cached so revisiting skips the retry
- `renderLoading`/`renderError` props accept custom loading and error UI
- All render callbacks include the active content item: `ControlsRenderProps`, `NavigationRenderProps`, `renderLoading`/`renderError` receive `item`
- `NavigationRenderProps` also receives `media` (`MediaItem`) in nested context

### ⚠️ Breaking Changes

- `SoundState` removed — import `SoundProvider` and `useSoundState` from `@reelkit/react` instead
- `NestedSlideRenderProps.item` renamed to `media` (`MediaItem`), new `item` field is the parent `BaseContentItem`

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.3.0

## @reelkit/angular-reel-player@0.2.0 (2026-04-03)

### 🚀 Features

- Loading wave indicator and error icon track per-slide load states
- Content preloader caches broken URLs so revisiting skips the retry
- Nested slider forwards loading callbacks to inner slides and clears the loader on image navigation
- Video frame capture before transition provides seamless poster display
- `onError` propagates through `VideoSlide`, `ImageSlide`, `NestedSlider`, `MediaSlide`
- `SoundStateService` wraps core `createSoundController`
- `rkPlayerLoading` and `rkPlayerError` template slot directives accept custom loading/error UI
- All template contexts include `item`: `PlayerControlsContext` adds `item` and `onClose`, `PlayerNavigationContext` adds `item` and `onPrev`, `PlayerNestedNavigationContext` adds `media` and `onPrev`
- Inline SVG icons replaced with tree-shakeable `lucide-angular` components

### ⚠️ Breaking Changes

- `PlayerControlsContext` adds required `onClose` callback
- `PlayerSlideContext` adds required `onError` callback
- `lucide-angular` >= 0.460.0 required as peer dependency

### 🧱 Updated Dependencies

- Updated @reelkit/angular to 0.2.0

## @reelkit/angular-lightbox@0.1.2 (2026-03-24)

### 🩹 Fixes

- Reset muted state when overlay closes

## @reelkit/angular-reel-player@0.1.2 (2026-03-24)

### 🩹 Fixes

- Reset muted state when overlay closes

## @reelkit/angular-lightbox@0.1.1 (2026-03-24)

### 🩹 Fixes

- Add missing lightbox-video-slide.css to package exports

## @reelkit/angular-reel-player@0.1.1 (2026-03-24)

### 🩹 Fixes

- Fix CSS assets not included in published package

## @reelkit/angular@0.1.0 (2026-03-24)

### 🎉 Initial Release

- Reel component with signal bridge and context injection
- ReelIndicator with auto-connect via RK_REEL_CONTEXT
- BodyLockService for scroll-locking overlays
- Standalone components, OnPush, signal inputs/outputs

### ❤️ Thanks

- [@eurusik](https://github.com/eurusik)

## @reelkit/angular-lightbox@0.1.0 (2026-03-24)

### 🎉 Initial Release

- Full-screen image and video gallery lightbox overlay
- Swipe-to-close, fullscreen toggle, keyboard navigation
- Template slot directives for custom controls, navigation, and info overlays

### ❤️ Thanks

- [@eurusik](https://github.com/eurusik)

## @reelkit/angular-reel-player@0.1.0 (2026-03-24)

### 🎉 Initial Release

- TikTok/Reels-style vertical video player overlay
- Nested horizontal carousel for multi-media posts
- Shared video element for iOS sound continuity
- SoundStateService for mute/unmute management

### ❤️ Thanks

- [@eurusik](https://github.com/eurusik)

## @reelkit/core@0.2.2 (2026-03-24)

### 🩹 Fixes

- Gesture controller improvements and internal refactoring

## @reelkit/core@0.2.1 (2026-03-21)

### 🩹 Fixes

- Custom rangeExtractor output is now clamped to 3 slides to preserve virtualization

## @reelkit/react@0.2.1 (2026-03-21)

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.2.1

## @reelkit/react-lightbox@0.2.1 (2026-03-21)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.1
- Updated @reelkit/core to 0.2.1

## @reelkit/react-reel-player@0.2.1 (2026-03-21)

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.1

## @reelkit/core@0.2.0 (2026-03-18)

### 🚀 Features

- Add createSharedVideo factory and captureFrame utility for framework-agnostic video playback

## @reelkit/react@0.2.0 (2026-03-18)

### 🚀 Features

- Auto-connect ReelIndicator to parent Reel via context — active and count props are now optional

### 🧱 Updated Dependencies

- Updated @reelkit/core to 0.2.0

## @reelkit/react-lightbox@0.2.0 (2026-03-18)

### 🚀 Features

- Add toggle function to useFullscreen hook

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.0
- Updated @reelkit/core to 0.2.0

## @reelkit/react-reel-player@0.2.0 (2026-03-18)

### 🚀 Features

- Add imageProps to ImageSlide, migrate VideoSlide internals to signal-based state

### 🧱 Updated Dependencies

- Updated @reelkit/react to 0.2.0

## @reelkit/core@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Framework-agnostic virtualized slider engine
- Custom signal-based reactive system (Signal, ComputedSignal, batch, reaction)
- Gesture, keyboard, and wheel controllers
- Range extractor for virtualization (renders only 3 DOM nodes)
- Zero dependencies, ~3.7 kB gzip

## @reelkit/react@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Reel component — virtualized slider with auto-sizing via ResizeObserver
- ReelIndicator — Instagram-style scrolling dot indicator
- Observe and AnimatedObserve for signal-to-React bridging
- useBodyLock hook for scroll-locking overlays

## @reelkit/react-reel-player@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Full-screen TikTok/Instagram Reels-style video player overlay
- Shared video element for iOS sound continuity
- Multi-media nested horizontal slider
- Render props for controls, navigation, slides, and overlays
- Generic content types via BaseContentItem

## @reelkit/react-lightbox@0.1.0 (2026-03-13)

### 🎉 Initial Release

- Full-screen image and video gallery lightbox
- Three transition modes: slide, fade, zoom-in
- Swipe-to-close, keyboard navigation, fullscreen API
- Opt-in video support via useVideoSlideRenderer (tree-shakeable)
- Render props for controls, navigation, info overlay, and slides
