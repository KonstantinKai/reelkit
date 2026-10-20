---
title: Infinite Feed
url: https://reelkit.dev/docs/recipes/infinite-feed
section: Recipes
order: 2
desc: A vertical feed that loads the next page as the viewer nears the end, with loading and error slides, request cancellation, and preloading.
---

# Infinite Feed

Endless vertical feed. Fetch while viewer watches, early enough that next post already there. Show state while page loads or failed. No request left running after feed gone. `./api` = stand-in for backend: `fetchPosts(page, signal)` returns one page of posts, stops when signal aborts. Page shows `api.ts` above demo; replace with real API call, drop `failNextRequest` (drives demo failure switch only). **Warning:** `cdnUrl` builds cdn.reelkit.dev links, served only to ReelKit sites → images fail in your app; point `image` at own media before copying.

```ts
export interface Post {
  id: string;
  title: string;
  image: string;
}

export function fetchPosts(page: number, signal: AbortSignal): Promise<Post[]>;
```

## Why it works

- **Count grows, slides do not.** `count` = posts + 1. Only 3 slides in DOM → feed of thousands costs same as ten. See https://reelkit.dev/docs/core/guide#virtualization.
- **Last slide = status.** Extra slide past posts shows "Loading…" while page in flight, error + Retry when failed. Viewer never swipes into nothing.
- **Fetch ahead from slide change.** `afterChange` requests next page when viewer 3 posts from end. Failed page waits for Retry → swiping back and forth does not repeat failing request.
- **Keys follow posts.** `keyExtractor` returns post id → slide keeps element when page lands behind it, not rebuilt from index.
- **Images load before slide.** Slide further down not mounted yet → new page images requested when page arrives (`new Image().src`), served from cache on mount.
- **Keys and wheel off on purpose.** `enableNavKeys` listens on whole window, `enableWheel` holds page scroll while pointer over feed → both fine for full-screen feed, fight page holding embedded feed. Here off; two buttons call `prev()` / `next()` on Reel API. Swipe works either way.
- **Nothing outlives feed.** Each request carries `AbortController`, aborted on unmount → late response never writes into gone feed.

## React

```tsx
const kLoadAhead = 3;
type Status = 'idle' | 'loading' | 'error';

function createFeed() {
  const posts = createSignal<Post[]>([]);
  const status = createSignal<Status>('idle');
  let nextPage = 0;
  let request: AbortController | null = null;

  const load = () => {
    if (status.value === 'loading') return;
    const current = new AbortController();
    request = current;
    status.value = 'loading';
    fetchPosts(nextPage, current.signal).then(
      (page) => {
        nextPage += 1;
        for (const post of page) new Image().src = post.image;
        posts.value = [...posts.value, ...page];
        status.value = 'idle';
      },
      () => {
        if (!current.signal.aborted) status.value = 'error';
      },
    );
  };
  const cancel = () => {
    request?.abort();
    request = null;
    status.value = 'idle';
  };
  return { posts, status, load, cancel };
}

export default function InfiniteFeed() {
  const [{ posts, status, load, cancel }] = useState(createFeed);
  const apiRef = useRef<ReelApi>(null);
  useEffect(() => {
    load();
    return cancel;
  }, []);

  const loadNearEnd = (index: number) => {
    if (status.value === 'idle' && index >= posts.value.length - kLoadAhead)
      load();
  };

  return (
    <Observe signals={[posts, status]}>
      {() => (
        <Reel
          count={posts.value.length + 1}
          style={{ width: '100%', height: '100%' }}
          direction="vertical"
          enableNavKeys={false}
          apiRef={apiRef}
          afterChange={loadNearEnd}
          keyExtractor={(index) => posts.value[index]?.id ?? 'status'}
          itemBuilder={(index, _i, [width, height]) =>
            posts.value[index] ? (
              <PostSlide post={posts.value[index]} />
            ) : (
              <StatusSlide />
            )
          }
        >
          <button
            aria-label="Previous post"
            onClick={() => apiRef.current?.prev()}
          >
            ↑
          </button>
          <button aria-label="Next post" onClick={() => apiRef.current?.next()}>
            ↓
          </button>
        </Reel>
      )}
    </Observe>
  );
}
```

## Vue

`posts = shallowRef<Post[]>([])`, `status = ref('idle')`, same `load`. `reel = shallowRef<ReelExpose | null>(null)`. `onMounted(load)`, `onBeforeUnmount(() => request?.abort())`. Template: `<Reel ref="reel" :count="posts.length + 1" :enable-nav-keys="false" :key-extractor="keyOf" @after-change="loadNearEnd">`, buttons in default slot call `reel?.prev()` / `reel?.next()`, with `#item="{ index, size }"` slot; `v-if="posts[index]"` post, `v-else` status slide.

## Angular

`posts = signal<Post[]>([])`, `status = signal('idle')`, same `load` using `posts.update`. `ngOnInit` loads, `ngOnDestroy` aborts. Template: `<rk-reel [count]="posts().length + 1" [enableNavKeys]="false" [keyExtractor]="keyOf" (apiReady)="reel = $event" (afterChange)="loadNearEnd($event.index)">`, projected buttons call `reel?.prev()` / `reel?.next()`, with `<ng-template rkReelItem let-i let-size="size">`, `@if (posts()[i]; as post)` post, `@else` status slide.
