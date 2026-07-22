import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageOff, Play } from 'lucide-react';
import {
  ReelPlayerUrlOverlay,
  type UrlLocator,
} from '@reelkit/react-reel-player';
import {
  createSignal,
  Observe,
  Signal,
  useOverlayUrlState,
  indexCodec,
} from '@reelkit/react';
import '@reelkit/react-reel-player/styles.css';
import {
  generateContent,
  getThumbnail,
  type ContentItem,
} from '../components/reel-player/mockContent';
import { useReactRouterUrlAdapter } from '../hooks/useReactRouterUrlAdapter';

const _kParam = 'reel';

const CONTENT_COUNT = 24;

/** How many posts this feed pretends to have loaded so far. */
const _kPageSize = 6;

/** Stand-in for the round trip that fetches the next page. */
const _kFetchDelayMs = 900;

const Thumbnail: React.FC<{ src: string }> = ({ src }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        <ImageOff size={32} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: '0.85rem',
  textDecoration: 'none',
  cursor: 'pointer',
};

/**
 * The reel player with its open state in the URL: the address bar names the
 * playing slide, the link can be shared, and the back button closes.
 *
 * This application is routed, so the router drives every read and write — the
 * default History adapter would leave the router's own location stale.
 */
export function ReelPlayerUrlPage() {
  const adapter = useReactRouterUrlAdapter();
  const navigate = useNavigate();

  const [loaded, fetching, feed, locator] = useState(() => {
    const feed = generateContent(CONTENT_COUNT);

    // Only part of the feed has "arrived" — the rest stands in for pages this
    // feed has not fetched yet.
    const loaded = createSignal(feed.slice(0, _kPageSize));
    const fetching = createSignal(false);

    return [
      loaded,
      fetching,
      feed,
      // The parameter is a plain index, so the identity is the index — no codec
      // needed. The locator windows it: `locate` answers only for what has
      // loaded, and `locateAsync` fetches the rest. A supplied locator owns its
      // own validity, so `locate` rejects anything outside the loaded window
      // itself.
      {
        // Within the loaded window? Then it is at exactly that index.
        locate: (index) =>
          index >= 0 && index < loaded.value.length ? index : null,
        identify: (index) => index,
        locateAsync: async (index) => {
          // Nothing left to fetch: this link names a post the feed does not have.
          if (index < 0 || index >= feed.length) return null;

          fetching.value = true;
          await new Promise((done) => setTimeout(done, _kFetchDelayMs));
          loaded.value = feed.slice(0, index + 1);
          fetching.value = false;

          // The index the fetch just established — the player takes it as-is,
          // never re-reading `content` (which React has not re-rendered yet).
          return index;
        },
      } satisfies UrlLocator<number>,
    ] as [
      Signal<ContentItem[]>,
      Signal<boolean>,
      ContentItem[],
      UrlLocator<number>,
    ];
  })[0];

  // Build the controller once from the windowed locator, then hand it to the
  // overlay. Keeping it here (not inside the overlay) leaves `reel.set` on hand
  // for programmatic control. The parameter is a plain index, so it pairs with
  // the built-in indexCodec.
  const reel = useOverlayUrlState({
    param: _kParam,
    adapter,
    codec: indexCodec,
    locator,
  });

  const last = feed.length - 1;

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#111',
        padding: '56px 16px 16px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            color: '#fff',
            fontSize: '1.5rem',
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          URL Reel Player
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 16,
          }}
        >
          Every thumbnail is an ordinary link to{' '}
          <code>?reel=&lt;index&gt;</code>— open one in a new tab, copy its
          address, or press back to close. Swiping through the feed never piles
          up history entries.
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}
        >
          Back closes the player when you opened it from here — the link pushed
          an entry, so back pops to the grid. A shared link opened directly in a
          fresh tab has no history behind it, so back leaves the site; close
          with the ✕ button or Escape to stay on the grid.
        </p>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 24,
          }}
        >
          Only the first {_kPageSize} posts have loaded. The buttons below all
          point past them, the way a shared link into a long feed does — the
          player waits for the post to arrive instead of discarding the address.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 32,
          }}
        >
          {/* All three open the same slide. They differ only in what the
              browser gets to know about it. */}

          {/* A link, so the browser's own behaviour comes free: new tab, copy
              address, hover target, keyboard reach. */}
          <Link to={`?${_kParam}=${last}`} style={buttonStyle}>
            Open reel {feed.length} (link)
          </Link>
          {/* Navigating through the router. No href, so the browser affordances
              are gone, but the URL still changes and back still closes. */}
          <button
            type="button"
            style={buttonStyle}
            onClick={() => navigate(`?${_kParam}=${last}`)}
          >
            Open reel {feed.length} (router)
          </button>
          {/* Straight through the controller. The adapter routes the write, so
              this ends up in the same place as the other two — the difference
              is that the open started in code rather than from something the
              user could copy or middle-click. */}
          <button
            type="button"
            style={buttonStyle}
            onClick={() => reel.set(last)}
          >
            Open reel {feed.length} (controller.set)
          </button>
          <Observe signals={[fetching]}>
            {() =>
              fetching.value ? (
                <span
                  style={{
                    alignSelf: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.85rem',
                  }}
                >
                  Loading reel…
                </span>
              ) : null
            }
          </Observe>
        </div>

        <Observe signals={[loaded]}>
          {() => (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: 8,
              }}
            >
              {loaded.value.map((item, index) => {
                const hasVideo = item.media.some((m) => m.type === 'video');

                return (
                  // The open state is a URL, so opening is a link. That buys the
                  // browser's own behaviour for free: open in a new tab, copy the
                  // address, see the target on hover, reach it by keyboard.
                  <Link
                    key={item.id}
                    to={`?${_kParam}=${index}`}
                    style={{
                      position: 'relative',
                      aspectRatio: '9 / 16',
                      borderRadius: 8,
                      overflow: 'hidden',
                      backgroundColor: '#222',
                      display: 'block',
                    }}
                  >
                    <Thumbnail src={getThumbnail(item)} />

                    {hasVideo && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Play size={14} fill="#fff" color="#fff" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </Observe>
      </div>

      <Observe signals={[loaded]}>
        {() => (
          <ReelPlayerUrlOverlay controller={reel} content={loaded.value} />
        )}
      </Observe>
    </div>
  );
}

export default ReelPlayerUrlPage;
