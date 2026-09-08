import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  StoriesRingList,
  StoriesUrlOverlay,
  createStoriesViewedState,
  type StoriesGroup,
  type StoryItem,
} from '@reelkit/react-stories-player';
import {
  createSignal,
  Observe,
  Signal,
  useOverlayUrlState,
  useViewedState,
  twoAxisViewedTracking,
  indexCodec,
  urlStableIdKey,
  base64UrlCodec,
  urlIndexTwoAxisKey,
  type UrlCodec,
  type UrlLocator,
  type UrlStateController,
  type TwoAxisPosition,
  type ViewedStateController,
} from '@reelkit/react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { persistedSignal } from '../components/persistedSignal';
import { Segmented } from '../components/Segmented';
import { cdnUrl } from '@reelkit/example-data';
import '@reelkit/react-stories-player/styles.css';

const _kParam = 'story';
const _kPageSize = 3;
const _kFetchDelayMs = 600;
const _kGroupCount = 8;

/** How the URL addresses the group axis. */
type Addressing = 'index' | 'stableId';
/** How the URL addresses the inner (story) axis. */
type InnerKey = 'index' | 'stableId';

const NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Heidi',
];

const generateGroups = (): StoriesGroup<StoryItem>[] =>
  NAMES.slice(0, _kGroupCount).map((name, i) => ({
    author: {
      id: `user-${i}`,
      name,
      avatar: cdnUrl(
        `samples/avatars/avatar-${String(6 + i).padStart(2, '0')}.jpg`,
      ),
      verified: i % 3 === 0,
    },
    stories: Array.from({ length: 2 + (i % 3) }, (_, j) => ({
      id: `story-${i}-${j}`,
      mediaType: 'image' as const,
      src: cdnUrl(
        `samples/images/stories/story-${String(((i * 10 + j) % 100) + 1).padStart(3, '0')}.jpg`,
      ),
      createdAt: new Date(Date.now() - (i * 3 + j) * 3600_000).toISOString(),
    })),
  }));

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  fontSize: '0.85rem',
  textDecoration: 'none',
  cursor: 'pointer',
};

/**
 * URL-driven stories player over a windowed feed. The open group and story ride
 * one `?story=<group>.<story>` parameter — the outer group switchable between a
 * bare index and the author's stable id (raw or base64url), the inner story
 * always a local index. Only the first few groups have "arrived"; a link past
 * the window pages the rest in through the group locator's `locateAsync`.
 */
export function StoriesPlayerUrlPage() {
  // Feed + windowing state and the switcher signals, all created once. The
  // switchers are reactive UI state, bridged into React by the `Observe` below
  // (switcher chrome + keyed remount).
  const [
    allGroups,
    loaded,
    fetching,
    addressing,
    innerKey,
    hash,
    rememberSeen,
  ] = useState(() => {
    const allGroups = generateGroups();
    return [
      allGroups,
      createSignal(allGroups.slice(0, _kPageSize)),
      createSignal(false),
      persistedSignal<Addressing>(
        'reelkit-stories-player-url-addressing',
        'index',
      ),
      persistedSignal<InnerKey>(
        'reelkit-stories-player-url-inner-key',
        'index',
      ),
      persistedSignal('reelkit-stories-player-url-hash', false),
      persistedSignal('reelkit-stories-player-url-remember-seen', true),
    ] as [
      StoriesGroup<StoryItem>[],
      Signal<StoriesGroup<StoryItem>[]>,
      Signal<boolean>,
      Signal<Addressing>,
      Signal<InnerKey>,
      Signal<boolean>,
      Signal<boolean>,
    ];
  })[0];

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
          URL Stories Player
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.9rem',
            marginBottom: 20,
          }}
        >
          The open group and story live in one{' '}
          <code>?story=&lt;group&gt;.&lt;story&gt;</code> parameter. Tapping a
          ring opens that user; swiping only replaces the entry, so one back
          step always closes. The switches rebuild the group half of the URL
          key. Only the first {_kPageSize} groups have loaded — a link past them
          pages the rest in first.
        </p>

        <Observe signals={[addressing, innerKey, hash, rememberSeen]}>
          {() => {
            const a = addressing.value;
            const ik = innerKey.value;
            const h = hash.value;
            const remember = rememberSeen.value;
            const hashable = a === 'stableId' || ik === 'stableId';

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
                    legend="Group addressing"
                    options={[
                      {
                        label: 'Index — 2.…',
                        active: a === 'index',
                        onClick: () => (addressing.value = 'index'),
                      },
                      {
                        label: 'Stable id — user-2.…',
                        active: a === 'stableId',
                        onClick: () => (addressing.value = 'stableId'),
                      },
                    ]}
                  />
                  <Segmented
                    legend="Story addressing"
                    options={[
                      {
                        label: 'Index — .0',
                        active: ik === 'index',
                        onClick: () => (innerKey.value = 'index'),
                      },
                      {
                        label: 'Stable id — .story-2-0',
                        active: ik === 'stableId',
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
                  {/* Off, the page behaves as if nothing had ever been seen:
                      rings all unseen, every group opens on its first story,
                      nothing recorded. The store stays attached, so switching
                      back on shows what was stored all along. */}
                  <Segmented
                    legend="Remember seen"
                    options={[
                      {
                        label: 'On',
                        active: remember,
                        onClick: () => (rememberSeen.value = true),
                      },
                      {
                        label: 'Off',
                        active: !remember,
                        onClick: () => (rememberSeen.value = false),
                      },
                    ]}
                  />
                </div>

                {/* Remount when the key shape changes so `useOverlayUrlState`
                    builds a fresh controller; the stale parameter self-heals. */}
                <StoriesUrlDemo
                  key={`${a}.${ik}.${h ? 'hash' : 'raw'}`}
                  allGroups={allGroups}
                  loaded={loaded}
                  fetching={fetching}
                  addressing={a}
                  innerKey={ik}
                  hash={h}
                  rememberSeen={rememberSeen}
                />
              </>
            );
          }}
        </Observe>
      </div>
    </div>
  );
}

function StoriesUrlDemo({
  allGroups,
  loaded,
  fetching,
  addressing,
  innerKey,
  hash,
  rememberSeen,
}: {
  allGroups: StoriesGroup<StoryItem>[];
  loaded: Signal<StoriesGroup<StoryItem>[]>;
  fetching: Signal<boolean>;
  addressing: Addressing;
  innerKey: InnerKey;
  hash: boolean;
  rememberSeen: Signal<boolean>;
}) {
  const adapter = useReactRouterUrlAdapter();
  const navigate = useNavigate();
  const innerIsId = innerKey === 'stableId';

  const { key, encodeGroup, encodeStory } = useState(() => {
    // One id codec for whichever axes are id-addressed (group by author id,
    // story by story id). Items-independent, so it pairs with a paging locator.
    const idCodec = urlStableIdKey({
      items: () => [],
      hashCodec: hash ? base64UrlCodec : undefined,
    }).codec as UrlCodec<number | string>;
    const outerCodec = (
      addressing === 'index' ? indexCodec : idCodec
    ) as UrlCodec<number | string>;

    const pageTo = async (index: number) => {
      fetching.value = true;
      await new Promise((done) => setTimeout(done, _kFetchDelayMs));
      loaded.value = allGroups.slice(0, index + 1);
      fetching.value = false;
      return index;
    };

    const indexLocator: UrlLocator<number> = {
      locate: (i) => (i >= 0 && i < loaded.value.length ? i : null),
      identify: (i) => i,
      locateAsync: (i) =>
        i < 0 || i >= allGroups.length ? Promise.resolve(null) : pageTo(i),
    };
    const idLocator: UrlLocator<string> = {
      locate: (id) => {
        const i = loaded.value.findIndex((g) => g.author.id === id);
        return i === -1 ? null : i;
      },
      identify: (i) => loaded.value[i].author.id,
      locateAsync: (id) => {
        const i = allGroups.findIndex((g) => g.author.id === id);
        return i === -1 ? Promise.resolve(null) : pageTo(i);
      },
    };
    const outerLocator = (
      addressing === 'index' ? indexLocator : idLocator
    ) as UrlLocator<number | string>;

    // The inner (story) axis is an index by default; opt into ids by scanning
    // the resolved group's stories for a matching id.
    const innerOptions = innerIsId
      ? {
          innerCodec: idCodec,
          innerLocate: (outerIndex: number, id: number | string) => {
            const group = loaded.value[outerIndex];
            if (!group) return null;
            const i = group.stories.findIndex((s) => s.id === id);
            return i === -1 ? null : i;
          },
          innerIdentify: (outerIndex: number, i: number): number | string =>
            loaded.value[outerIndex].stories[i].id,
        }
      : {};

    // The conditional-type guard wants concrete axis identities; this demo picks
    // them at runtime, so build the key through a widened call.
    const buildTwoAxis = urlIndexTwoAxisKey as unknown as (
      options: unknown,
    ) => ReturnType<typeof urlIndexTwoAxisKey>;
    const key = buildTwoAxis({
      outerCodec,
      outerLocator,
      outerCount: () => loaded.value.length,
      innerCounts: () => loaded.value.map((g) => g.stories.length),
      ...innerOptions,
    });

    // Exact wire per axis, from the active codec. `allGroups` holds every id, so
    // a deep link past the loaded window can still be spelled.
    const encodeGroup = (groupIndex: number) =>
      outerCodec.encode(
        addressing === 'index' ? groupIndex : allGroups[groupIndex].author.id,
      );
    const encodeStory = (groupIndex: number, storyIndex: number) =>
      innerIsId
        ? idCodec.encode(allGroups[groupIndex].stories[storyIndex].id)
        : String(storyIndex);

    return { key, encodeGroup, encodeStory };
  })[0];

  const stories = useOverlayUrlState({
    param: _kParam,
    adapter,
    ...key,
  }) as UrlStateController<TwoAxisPosition>;

  // The same key drives the address bar and what is remembered, so a stored
  // entry reads exactly like the parameter of a shared link. The wire changes
  // with the switchers above, so the storage key carries the shape too — index
  // entries would otherwise be read back under id addressing and name nothing.
  const seen = useViewedState({
    storageKey: `reelkit-stories-url-seen-${addressing}.${innerKey}${hash ? '.hash' : ''}`,
    ...key,
    ...twoAxisViewedTracking,
  }) as ViewedStateController<TwoAxisPosition>;
  const viewed = createStoriesViewedState(seen, () => loaded.value);

  const paramFor = (groupIndex: number, storyIndex = 0) =>
    `${encodeGroup(groupIndex)}.${encodeStory(groupIndex, storyIndex)}`;
  const lastGroup = allGroups.length - 1;

  return (
    <>
      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}
      >
        <Link to={`?${_kParam}=${paramFor(lastGroup)}`} style={buttonStyle}>
          Open group {lastGroup + 1} (link, past the window)
        </Link>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => navigate(`?${_kParam}=${paramFor(lastGroup)}`)}
        >
          Open group {lastGroup + 1} (router)
        </button>
        <button
          type="button"
          style={buttonStyle}
          // Pass the raw wire string: `set` writes it verbatim, so it works even
          // for a group past the window whose id `identify` could not yet read.
          onClick={() => stories.set(paramFor(lastGroup))}
        >
          Open group {lastGroup + 1} (controller.set)
        </button>
        {/* Seen state outlives the page, so without this the rings fill up
            once and the demo can never be watched a second time. Clears the
            store for the switcher combination on screen, which is the one key
            the controller above holds. */}
        <button
          type="button"
          style={{ ...buttonStyle, marginLeft: 'auto' }}
          onClick={() => seen.forget()}
        >
          clear seen
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
                Loading group…
              </span>
            ) : null
          }
        </Observe>
      </div>

      <Observe signals={[loaded, seen.entries, rememberSeen]}>
        {() => (
          <StoriesRingList
            groups={loaded.value}
            viewedState={rememberSeen.value ? viewed.viewedCounts() : new Map()}
            onSelect={(groupIndex) =>
              navigate(
                `?${_kParam}=${paramFor(
                  groupIndex,
                  rememberSeen.value ? viewed.resumeStoryIndex(groupIndex) : 0,
                )}`,
              )
            }
          />
        )}
      </Observe>

      <Observe signals={[loaded]}>
        {() => (
          <StoriesUrlOverlay<StoryItem>
            controller={stories}
            groups={loaded.value}
            resumeStoryIndex={(groupIndex) =>
              rememberSeen.value ? viewed.resumeStoryIndex(groupIndex) : 0
            }
            onStoryViewed={(groupIndex, storyIndex) => {
              if (rememberSeen.value) viewed.markViewed(groupIndex, storyIndex);
            }}
          />
        )}
      </Observe>
    </>
  );
}

export default StoriesPlayerUrlPage;
