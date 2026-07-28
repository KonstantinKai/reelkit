import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { ReelPlayerUrlOverlay } from '@reelkit/react-reel-player';
import {
  createSignal,
  Observe,
  Signal,
  useOverlayUrlState,
  indexCodec,
  urlStableIdKey,
  urlIndexTwoAxisKey,
  type UrlCodec,
  type UrlLocator,
  type UrlKey,
  type UrlStateController,
  type TwoAxisPosition,
} from '@reelkit/react';
import '@reelkit/react-reel-player/styles.css';
import {
  generateContent,
  getThumbnail,
  type ContentItem,
} from '../components/reel-player/mockContent';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { persistedSignal } from '../components/persistedSignal';

const _kParam = 'reel';
const _kCount = 24;
/** How many posts this feed pretends to have loaded so far. */
const _kPageSize = 6;
/** Stand-in for the round trip that fetches the next page. */
const _kFetchDelayMs = 900;

/** How the URL addresses the outer (post) axis. */
type Addressing = 'index' | 'stableId';
/** One-axis (post only) or two-axis (post + inner media index). */
type Axis = 'one' | 'two';
/** How the URL addresses the inner (media) axis, in two-axis mode. */
type InnerKey = 'index' | 'stableId';

const tileStyle: React.CSSProperties = {
  position: 'relative',
  aspectRatio: '9 / 16',
  borderRadius: 12,
  overflow: 'hidden',
  background: '#000',
  display: 'block',
};

const chipStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(0,0,0,0.55)',
  color: '#fff',
  fontSize: '0.7rem',
  textDecoration: 'none',
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

const segButton = (active: boolean, disabled = false): React.CSSProperties => ({
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  background: active ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.06)',
  color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
  fontSize: '0.8rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

const Segmented = ({
  legend,
  options,
}: {
  legend: string;
  options: {
    label: string;
    active: boolean;
    disabled?: boolean;
    onClick: () => void;
  }[];
}) => (
  <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
    <legend
      style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.72rem',
        marginBottom: 6,
      }}
    >
      {legend}
    </legend>
    <div style={{ display: 'flex', gap: 6 }}>
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          disabled={o.disabled}
          style={segButton(o.active, o.disabled)}
          onClick={o.onClick}
        >
          {o.label}
        </button>
      ))}
    </div>
  </fieldset>
);

/**
 * The reel player with its open state in the URL, switchable across every
 * built-in key shape so one page shows them all:
 *
 * - Index vs stable id — `?reel=3` versus `?reel=<post-id>`, the id surviving a
 *   reorder a positional link would not.
 * - One vs two axis — the post only, or the post plus a multi-media carousel's
 *   inner index (`?reel=3.2`).
 * - Hash — base64url-obscure the id in the address bar (stable id only).
 *
 * The feed is windowed: only part has "arrived", and a link past that window
 * pages the rest in through the locator's `locateAsync` — the index locator
 * pages by position, the id locator scans the feed for the shared id. This
 * application is routed, so a router-backed adapter drives every read and write.
 */
export function ReelPlayerUrlPage() {
  // Feed + windowing signals and the switcher signals, all created once. The
  // switchers are reactive UI state (the reelkit way); the `Observe` below
  // bridges them into React's render — the switcher chrome + the keyed remount.
  const [feed, loaded, fetching, addressing, axis, innerKey, hash] = useState(
    () => {
      const feed = generateContent(_kCount);
      return [
        feed,
        createSignal(feed.slice(0, _kPageSize)),
        createSignal(false),
        persistedSignal<Addressing>(
          'reelkit-reel-player-url-addressing',
          'index',
        ),
        persistedSignal<Axis>('reelkit-reel-player-url-axis', 'one'),
        persistedSignal<InnerKey>('reelkit-reel-player-url-inner-key', 'index'),
        persistedSignal('reelkit-reel-player-url-hash', false),
      ] as [
        ContentItem[],
        Signal<ContentItem[]>,
        Signal<boolean>,
        Signal<Addressing>,
        Signal<Axis>,
        Signal<InnerKey>,
        Signal<boolean>,
      ];
    },
  )[0];

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
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          URL Reel Player
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 20,
          }}
        >
          Every thumbnail is an ordinary link — open one in a new tab, copy its
          address, or press back to close. The switches rebuild the URL key, so
          the address bar changes shape while the player stays the same. Only
          the first {_kPageSize} posts have loaded; the buttons point past them,
          so a shared link pages the rest in through the locator before it
          opens.
        </p>

        <Observe signals={[addressing, axis, innerKey, hash]}>
          {() => {
            const a = addressing.value;
            const ax = axis.value;
            const ik = innerKey.value;
            const h = hash.value;
            const innerSwitchable = ax === 'two';
            const hashable =
              a === 'stableId' || (innerSwitchable && ik === 'stableId');

            return (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: 20,
                    flexWrap: 'wrap',
                    marginBottom: 24,
                  }}
                >
                  <Segmented
                    legend="Addressing"
                    options={[
                      {
                        label: 'Index — ?reel=3',
                        active: a === 'index',
                        onClick: () => (addressing.value = 'index'),
                      },
                      {
                        label: 'Stable id — ?reel=<id>',
                        active: a === 'stableId',
                        onClick: () => (addressing.value = 'stableId'),
                      },
                    ]}
                  />
                  <Segmented
                    legend="Axis"
                    options={[
                      {
                        label: 'One — post',
                        active: ax === 'one',
                        onClick: () => (axis.value = 'one'),
                      },
                      {
                        label: 'Two — post.media',
                        active: ax === 'two',
                        onClick: () => (axis.value = 'two'),
                      },
                    ]}
                  />
                  <Segmented
                    legend="Inner key (2-axis)"
                    options={[
                      {
                        label: 'Index — .2',
                        active: innerSwitchable && ik === 'index',
                        disabled: !innerSwitchable,
                        onClick: () => (innerKey.value = 'index'),
                      },
                      {
                        label: 'Stable id — .<media-id>',
                        active: innerSwitchable && ik === 'stableId',
                        disabled: !innerSwitchable,
                        onClick: () => (innerKey.value = 'stableId'),
                      },
                    ]}
                  />
                  <Segmented
                    legend="Hash (stable id)"
                    options={[
                      {
                        label: 'Raw',
                        active: hashable && !h,
                        disabled: !hashable,
                        onClick: () => (hash.value = false),
                      },
                      {
                        label: 'base64url',
                        active: hashable && h,
                        disabled: !hashable,
                        onClick: () => (hash.value = true),
                      },
                    ]}
                  />
                </div>

                {/* Remount when the key shape changes: `useOverlayUrlState`
                    builds its controller once, so a fresh key needs a fresh
                    instance. The stale parameter self-heals out of the URL. */}
                <ReelUrlDemo
                  key={`${a}.${ax}.${ik}.${h ? 'hash' : 'raw'}`}
                  feed={feed}
                  loaded={loaded}
                  fetching={fetching}
                  addressing={a}
                  axis={ax}
                  innerKey={ik}
                  hash={h}
                />
              </>
            );
          }}
        </Observe>
      </div>
    </div>
  );
}

/** The wide key shape the four built-ins collapse to for this demo. */
type ReelKey = UrlKey<number | string, number | TwoAxisPosition>;

function ReelUrlDemo({
  feed,
  loaded,
  fetching,
  addressing,
  axis,
  innerKey,
  hash,
}: {
  feed: ContentItem[];
  loaded: Signal<ContentItem[]>;
  fetching: Signal<boolean>;
  addressing: Addressing;
  axis: Axis;
  innerKey: InnerKey;
  hash: boolean;
}) {
  const adapter = useReactRouterUrlAdapter();
  const innerIsId = axis === 'two' && innerKey === 'stableId';

  const { key, encodeOuter, encodeInner } = useState(() => {
    // One id codec for whichever axes are id-addressed — items-independent, so
    // pairing it with a paging (or inner) locator is fair game. `hash`
    // base64url-obscures the id.
    const idCodec = urlStableIdKey({ items: () => [], hash }).codec as UrlCodec<
      number | string
    >;
    const outerCodec = (
      addressing === 'index' ? indexCodec : idCodec
    ) as UrlCodec<number | string>;

    const pageTo = async (index: number) => {
      fetching.value = true;
      await new Promise((done) => setTimeout(done, _kFetchDelayMs));
      loaded.value = feed.slice(0, index + 1);
      fetching.value = false;
      return index;
    };

    // Both outer locators window `loaded` and page the rest in on a miss. The
    // index locator names a position; the id locator scans the full feed for
    // the shared id — a link can only name an id the feed will eventually hold.
    const indexLocator: UrlLocator<number> = {
      locate: (i) => (i >= 0 && i < loaded.value.length ? i : null),
      identify: (i) => i,
      locateAsync: (i) =>
        i < 0 || i >= feed.length ? Promise.resolve(null) : pageTo(i),
    };
    const idLocator: UrlLocator<string> = {
      locate: (id) => {
        const i = loaded.value.findIndex((x) => x.id === id);
        return i === -1 ? null : i;
      },
      identify: (i) => loaded.value[i].id,
      locateAsync: (id) => {
        const i = feed.findIndex((x) => x.id === id);
        return i === -1 ? Promise.resolve(null) : pageTo(i);
      },
    };
    const outerLocator = (
      addressing === 'index' ? indexLocator : idLocator
    ) as UrlLocator<number | string>;

    // The inner axis is index by default; opt into ids by scanning the outer
    // slot's media for a matching id. `innerLocate` receives the resolved outer
    // index, so it scans the right post's media.
    const innerOptions = innerIsId
      ? {
          innerCodec: idCodec,
          innerLocate: (outerIndex: number, id: number | string) => {
            const post = loaded.value[outerIndex];
            if (!post) return null;
            const i = post.media.findIndex((m) => m.id === id);
            return i === -1 ? null : i;
          },
          innerIdentify: (outerIndex: number, i: number): number | string =>
            loaded.value[outerIndex].media[i].id,
        }
      : {};

    // The conditional-type guard wants concrete axis identities; this demo picks
    // them at runtime, so build the key through a widened call.
    const buildTwoAxis = urlIndexTwoAxisKey as unknown as (
      options: unknown,
    ) => ReelKey;
    const key: ReelKey =
      axis === 'one'
        ? ({ codec: outerCodec, locator: outerLocator } as ReelKey)
        : buildTwoAxis({
            outerCodec,
            outerLocator,
            outerCount: () => loaded.value.length,
            innerCounts: () => loaded.value.map((item) => item.media.length),
            ...innerOptions,
          });

    // Exact wire value for each axis, straight from the active codec. `feed`
    // holds every id, so a deep link past the window can still be spelled.
    const encodeOuter = (index: number) =>
      outerCodec.encode(addressing === 'index' ? index : feed[index].id);
    const encodeInner = (index: number, inner: number) =>
      innerIsId ? idCodec.encode(feed[index].media[inner].id) : String(inner);

    return { key, encodeOuter, encodeInner };
  })[0];

  const reel = useOverlayUrlState({ param: _kParam, adapter, ...key }) as
    | UrlStateController<number>
    | UrlStateController<TwoAxisPosition>;

  const wireFor = (index: number, inner: number) =>
    axis === 'two'
      ? `${encodeOuter(index)}.${encodeInner(index, inner)}`
      : encodeOuter(index);

  const last = feed.length - 1;

  return (
    <>
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}
      >
        <Link to={`?${_kParam}=${wireFor(last, 0)}`} style={buttonStyle}>
          Open post {feed.length} (link, past the window)
        </Link>
        <button
          type="button"
          style={buttonStyle}
          // Pass the raw wire string: `set` writes it verbatim, so it works even
          // for a post past the window whose id `identify` could not yet read.
          onClick={() => reel.set(wireFor(last, 0))}
        >
          Open post {feed.length} (controller.set)
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
                Loading post…
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
              const multi = axis === 'two' && item.media.length > 1;

              return (
                <div key={item.id}>
                  <Link
                    to={`?${_kParam}=${wireFor(index, 0)}`}
                    style={tileStyle}
                    aria-label={`Open post ${index + 1}`}
                  >
                    <img
                      src={getThumbnail(item)}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                    {hasVideo && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: '#fff',
                        }}
                      >
                        <Play size={18} fill="#fff" />
                      </span>
                    )}
                  </Link>

                  {multi && (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginTop: 6,
                      }}
                    >
                      {item.media.map((_, inner) => (
                        <Link
                          key={inner}
                          to={`?${_kParam}=${wireFor(index, inner)}`}
                          style={chipStyle}
                        >
                          {index}.{inner}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Observe>

      <Observe signals={[loaded]}>
        {() => (
          <ReelPlayerUrlOverlay controller={reel} content={loaded.value} />
        )}
      </Observe>
    </>
  );
}

export default ReelPlayerUrlPage;
