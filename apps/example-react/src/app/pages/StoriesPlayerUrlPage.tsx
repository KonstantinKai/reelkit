import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  StoriesRingList,
  StoriesUrlOverlay,
  type StoriesGroup,
  type StoryItem,
} from '@reelkit/react-stories-player';
import {
  createSignal,
  Observe,
  Signal,
  useOverlayUrlState,
  indexCodec,
  urlStableIdKey,
  base64UrlCodec,
  urlIndexTwoAxisKey,
  type UrlCodec,
  type UrlLocator,
  type UrlStateController,
  type TwoAxisPosition,
} from '@reelkit/react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import { persistedSignal } from '../components/persistedSignal';
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
  const [allGroups, loaded, fetching, viewedState, addressing, innerKey, hash] =
    useState(() => {
      const allGroups = generateGroups();
      return [
        allGroups,
        createSignal(allGroups.slice(0, _kPageSize)),
        createSignal(false),
        new Map<string, number>(),
        persistedSignal<Addressing>(
          'reelkit-stories-player-url-addressing',
          'index',
        ),
        persistedSignal<InnerKey>(
          'reelkit-stories-player-url-inner-key',
          'index',
        ),
        persistedSignal('reelkit-stories-player-url-hash', false),
      ] as [
        StoriesGroup<StoryItem>[],
        Signal<StoriesGroup<StoryItem>[]>,
        Signal<boolean>,
        Map<string, number>,
        Signal<Addressing>,
        Signal<InnerKey>,
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

        <Observe signals={[addressing, innerKey, hash]}>
          {() => {
            const a = addressing.value;
            const ik = innerKey.value;
            const h = hash.value;
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
                </div>

                {/* Remount when the key shape changes so `useOverlayUrlState`
                    builds a fresh controller; the stale parameter self-heals. */}
                <StoriesUrlDemo
                  key={`${a}.${ik}.${h ? 'hash' : 'raw'}`}
                  allGroups={allGroups}
                  loaded={loaded}
                  fetching={fetching}
                  viewedState={viewedState}
                  addressing={a}
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

function StoriesUrlDemo({
  allGroups,
  loaded,
  fetching,
  viewedState,
  addressing,
  innerKey,
  hash,
}: {
  allGroups: StoriesGroup<StoryItem>[];
  loaded: Signal<StoriesGroup<StoryItem>[]>;
  fetching: Signal<boolean>;
  viewedState: Map<string, number>;
  addressing: Addressing;
  innerKey: InnerKey;
  hash: boolean;
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

  const paramFor = (groupIndex: number) =>
    `${encodeGroup(groupIndex)}.${encodeStory(groupIndex, 0)}`;
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

      <Observe signals={[loaded]}>
        {() => (
          <StoriesRingList
            groups={loaded.value}
            viewedState={viewedState}
            onSelect={(groupIndex) =>
              navigate(`?${_kParam}=${paramFor(groupIndex)}`)
            }
          />
        )}
      </Observe>

      <Observe signals={[loaded]}>
        {() => (
          <StoriesUrlOverlay<StoryItem>
            controller={stories}
            groups={loaded.value}
            onStoryViewed={(gi, si) => {
              const author = loaded.value[gi]?.author;
              if (!author) return;
              const current = viewedState.get(author.id) ?? 0;
              viewedState.set(author.id, Math.max(current, si + 1));
            }}
          />
        )}
      </Observe>
    </>
  );
}

export default StoriesPlayerUrlPage;
