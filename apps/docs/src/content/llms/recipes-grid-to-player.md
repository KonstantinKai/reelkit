---
title: Grid to Player
url: https://reelkit.dev/docs/recipes/grid-to-player
section: Recipes
order: 3
desc: A thumbnail grid that opens the full-screen reel player at the tapped item and returns the viewer to the last item they watched.
---

# Grid to Player

Profile page / search result = grid of thumbnails. Tap one → full-screen player at that post, swipe on through rest. Close → viewer lands on post they stopped at, not the one they started from.

`./api` = stand-in for backend: `posts` (shape of player's `ContentItem`) + `thumbnailOf(post)` (video poster or image). Page shows `api.ts` above demo. **Warning:** `cdnUrl` builds cdn.reelkit.dev links, served only to ReelKit sites → point `media` + `avatar` at own files before copying.

## Why it works

- **Opens where viewer tapped.** `initialIndex` = thumbnail index, whole list to `content` → swipe past chosen post.
- **Grid knows where viewer stopped.** Slide change callback (`onSlideChange` / `@slide-change` / `(slideChange)`) reports each post reached; keep last.
- **Focus back to right thumbnail.** Player returns focus to opener as it closes, after close handler ran → focus set in handler gets undone. Recipe waits one task (`setTimeout`), then `scrollIntoView({ block: 'nearest' })` + `focus({ preventScroll: true })` on last post's thumbnail.
- **Thumbnails = buttons** with label → Tab/Enter work, screen reader names post.
- **Grid cell needs picture, not video.** `thumbnailOf` → video poster or image → grid never loads video it does not play.
- **Open post in address bar?** Use URL state player (`ReelPlayerUrlOverlay`): shareable, closes with back button.

## React

```tsx
export default function GridToPlayer() {
  const [{ open, startIndex, lastViewed }] = useState(() => ({
    open: createSignal(false),
    startIndex: createSignal(0),
    lastViewed: createSignal(0),
  }));
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);

  const openAt = (index: number) => {
    startIndex.value = index;
    lastViewed.value = index;
    open.value = true;
  };

  const close = () => {
    open.value = false;
    setTimeout(() => {
      const thumbnail = thumbnails.current[lastViewed.value];
      thumbnail?.scrollIntoView({ block: 'nearest' });
      thumbnail?.focus({ preventScroll: true });
    });
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}
      >
        {posts.map((post, index) => (
          <button
            key={post.id}
            ref={(element) => {
              thumbnails.current[index] = element;
            }}
            aria-label={`Open ${post.description}`}
            onClick={() => openAt(index)}
          >
            <img src={thumbnailOf(post)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <Observe signals={[open]}>
        {() => (
          <ReelPlayerOverlay
            isOpen={open.value}
            content={posts}
            initialIndex={startIndex.value}
            onSlideChange={(index) => (lastViewed.value = index)}
            onClose={close}
          />
        )}
      </Observe>
    </div>
  );
}
```

## Vue

`open = ref(false)`, `startIndex = ref(0)`, plain `lastViewed`, thumbnail array filled by function refs `:ref="(element) => (thumbnails[index] = element)"`. `<ReelPlayerOverlay :is-open="open" :content="posts" :initial-index="startIndex" @slide-change="(index) => (lastViewed = index)" @close="close" />`; `close` same `setTimeout` focus move.

## Angular

`open = signal(false)`, `startIndex = signal(0)`, `lastViewed` field, thumbnails via `viewChildren<ElementRef<HTMLButtonElement>>('thumbnail')`. `<rk-reel-player-overlay [isOpen]="open()" [content]="posts" [initialIndex]="startIndex()" (slideChange)="lastViewed = $event" (closed)="close()" />`; `close` same `setTimeout` focus move.
