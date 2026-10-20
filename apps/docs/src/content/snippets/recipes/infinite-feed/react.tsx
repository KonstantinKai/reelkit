import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Observe, Reel, createSignal, type ReelApi } from '@reelkit/react';
import { fetchPosts, type Post } from './api';

// Start fetching this many slides before the end, so the next page is usually
// in place before the viewer gets there.
const kLoadAhead = 3;

type Status = 'idle' | 'loading' | 'error';

// Text laid over a photo needs its own backdrop to stay readable on a light one.
const titleStyle: CSSProperties = {
  position: 'absolute',
  left: 16,
  bottom: 16,
  margin: 0,
  padding: '6px 12px',
  borderRadius: 8,
  background: 'rgba(0, 0, 0, 0.55)',
  color: '#fff',
  fontSize: 18,
};

const retryButtonStyle: CSSProperties = {
  padding: '6px 14px',
  border: 'none',
  borderRadius: 8,
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#fff',
  fontSize: 14,
  cursor: 'pointer',
};

const navButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  border: 'none',
  borderRadius: '50%',
  background: 'rgba(0, 0, 0, 0.55)',
  color: '#fff',
  fontSize: 18,
  cursor: 'pointer',
};

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
        // Only three slides are ever mounted, so an image further down is
        // fetched now and comes from the cache when its slide mounts.
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
    // A failed page waits for Retry, so swiping back and forth does not
    // fire a request each time.
    if (status.value === 'idle' && index >= posts.value.length - kLoadAhead) {
      load();
    }
  };

  return (
    <Observe signals={[posts, status]}>
      {() => (
        <Reel
          // One slide past the posts shows the loading or error state.
          count={posts.value.length + 1}
          style={{ width: '100%', height: '100%' }}
          direction="vertical"
          // Arrow keys are heard window-wide and the wheel would hold the
          // page's scroll. This feed sits inside a page, so both stay off and
          // the buttons step through it; turn them on when the feed fills the
          // screen.
          enableNavKeys={false}
          apiRef={apiRef}
          afterChange={loadNearEnd}
          keyExtractor={(index) => posts.value[index]?.id ?? 'status'}
          itemBuilder={(index, _indexInRange, [width, height]) => {
            const post = posts.value[index];
            if (post) {
              return (
                <div style={{ width, height, position: 'relative' }}>
                  <img
                    src={post.image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <h2 style={titleStyle}>{post.title}</h2>
                </div>
              );
            }
            return (
              <div
                style={{
                  width,
                  height,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  color: '#fff',
                }}
              >
                {status.value === 'error' ? (
                  <>
                    <p style={{ margin: 0 }}>The feed could not be loaded.</p>
                    <button type="button" onClick={load} style={retryButtonStyle}>
                      Retry
                    </button>
                  </>
                ) : (
                  <p style={{ margin: 0 }}>Loading…</p>
                )}
              </div>
            );
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              zIndex: 1,
            }}
          >
            <button
              type="button"
              aria-label="Previous post"
              style={navButtonStyle}
              onClick={() => apiRef.current?.prev()}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Next post"
              style={navButtonStyle}
              onClick={() => apiRef.current?.next()}
            >
              ↓
            </button>
          </div>
        </Reel>
      )}
    </Observe>
  );
}
