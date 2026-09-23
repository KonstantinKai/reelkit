import { useEffect, useRef, useState } from 'react';
import {
  createDisposableList,
  createSignal,
  defaultRangeExtractor,
  Observe,
  observeDomEvent,
  reaction,
  Reel,
  type ReelApi,
} from '@reelkit/react';
import { Pause, Play } from 'lucide-react';

const count = 9;
const initialIndex = 2;
const size: [number, number] = [132, 200];
const rangeFor = (index: number) => defaultRangeExtractor(index, count, false);
const titles = ['Find your flow.', 'Stay in motion.', 'Keep exploring.'];
const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed';

function Slide({ index, active }: { index: number; active: boolean }) {
  return (
    <div
      className="flex items-center"
      style={{ width: size[0], height: size[1] }}
    >
      <div
        data-feed-item={index + 1}
        className="relative overflow-hidden rounded-2xl bg-indigo-950 text-white transition-opacity duration-300"
        style={{
          width: size[0],
          height: size[1],
          opacity: active ? 1 : 0.42,
        }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-600 to-indigo-950"
          style={{ filter: `hue-rotate(${index * 17}deg)` }}
        />
        <div className="absolute -right-8 top-10 h-32 w-32 rotate-[-25deg] rounded-[2rem] border-[18px] border-white/25 shadow-xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-950/80 to-transparent" />
        <span className="absolute left-3 top-3 font-mono text-[11px] tracking-widest">
          ITEM {String(index + 1).padStart(2, '0')}
        </span>
        <span className="absolute bottom-10 left-3 right-3 text-2xl font-semibold leading-none tracking-tight">
          {titles[index % titles.length]}
        </span>
        <span className="absolute bottom-4 left-3 text-[11px] text-indigo-100">
          Feed item {index + 1}
        </span>
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/25" />
      </div>
    </div>
  );
}

export function VirtualizationDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReelApi>(null);
  const [{ index, playing, moving, visible, ready, status, changes }] =
    useState(() => ({
      index: createSignal(initialIndex),
      playing: createSignal(true),
      moving: createSignal(false),
      visible: createSignal(false),
      ready: createSignal(false),
      status: createSignal(`Slide ${initialIndex + 1} of ${count}`),
      changes: createSignal(
        `In the DOM: ${rangeFor(initialIndex)
          .map((item) => item + 1)
          .join(', ')}`,
      ),
    }));

  useEffect(() => {
    ready.value = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let direction = 1;
    const schedule = () => {
      clearTimeout(timer);
      if (!playing.value || moving.value || !visible.value || document.hidden)
        return;
      timer = setTimeout(() => {
        if (index.value === count - 1) direction = -1;
        if (index.value === 0) direction = 1;
        apiRef.current?.[direction === 1 ? 'next' : 'prev']();
      }, 1800);
    };
    const disposables = createDisposableList();
    disposables.push(
      () => clearTimeout(timer),
      reaction(() => [index, playing, moving, visible], schedule),
    );

    // Observing is what first sets `visible`, and the reaction above only runs
    // on a change — so it has to already be listening, or the first frame the
    // observer reports is the one nothing schedules and autoplay never starts.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.value = entry.isIntersecting;
      },
      { threshold: 0.15 },
    );
    if (containerRef.current) observer.observe(containerRef.current);

    disposables.push(
      () => observer.disconnect(),
      observeDomEvent(document, 'visibilitychange', schedule),
    );

    return disposables.dispose;
  }, [index, playing, moving, visible, ready]);

  const step = (direction: 'next' | 'prev') => {
    playing.value = false;
    apiRef.current?.[direction]();
  };

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-md">
      <Observe signals={[index]}>
        {() => {
          const range = rangeFor(index.value);
          return (
            <>
              <p className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {count}
                </strong>{' '}
                items in the feed
                <strong className="ml-2 font-semibold text-primary-600 dark:text-primary-400">
                  {range.length}
                </strong>{' '}
                mounted
              </p>
              <ol
                className="my-4 flex justify-center gap-1.5"
                aria-label="Feed items"
              >
                {Array.from({ length: count }, (_, item) => (
                  <li
                    key={item}
                    aria-label={`Item ${item + 1}: ${item === index.value ? 'visible' : range.includes(item) ? 'mounted offscreen' : 'not mounted'}`}
                    aria-current={item === index.value ? 'true' : undefined}
                    className={`flex h-9 w-7 items-center justify-center rounded-lg border font-mono text-xs ${
                      item === index.value
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : range.includes(item)
                          ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                          : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item + 1}
                  </li>
                ))}
              </ol>
            </>
          );
        }}
      </Observe>

      <div className="relative h-[620px] overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_70%)]" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute left-1/2 top-[210px] -translate-x-1/2"
          aria-hidden="true"
        >
          <Observe signals={[ready]}>
            {() =>
              ready.value ? (
                <Reel
                  count={count}
                  initialIndex={initialIndex}
                  size={size}
                  apiRef={apiRef}
                  transitionDuration={1100}
                  enableGestures={false}
                  enableNavKeys={false}
                  style={{ overflow: 'visible' }}
                  beforeChange={(current, target) => {
                    moving.value = true;
                    status.value = `${target > current ? '↑ Swipe up' : '↓ Swipe down'} · ${current + 1} to ${target + 1}`;
                    changes.value = `Same ${rangeFor(current).length} items stay mounted during the slide`;
                  }}
                  afterChange={(current) => {
                    if (current === index.value) return;
                    const previousRange = rangeFor(index.value);
                    const nextRange = rangeFor(current);
                    const removed = previousRange.filter(
                      (item) => !nextRange.includes(item),
                    );
                    const added = nextRange.filter(
                      (item) => !previousRange.includes(item),
                    );
                    changes.value = [
                      removed.length
                        ? `Item ${removed.map((item) => item + 1).join(', ')} unmounted`
                        : '',
                      added.length
                        ? `Item ${added.map((item) => item + 1).join(', ')} mounted`
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' · ');
                    index.value = current;
                    status.value = `Slide ${current + 1} of ${count}`;
                    moving.value = false;
                  }}
                  itemBuilder={(item) => (
                    <Observe signals={[index]}>
                      {() => (
                        <Slide index={item} active={item === index.value} />
                      )}
                    </Observe>
                  )}
                />
              ) : (
                <div style={{ width: size[0], height: size[1] }}>
                  {rangeFor(initialIndex).map((item) => (
                    <div
                      key={item}
                      className="absolute inset-0"
                      style={{
                        transform: `translateY(${(item - initialIndex) * size[1]}px)`,
                      }}
                    >
                      <Slide index={item} active={item === initialIndex} />
                    </div>
                  ))}
                </div>
              )
            }
          </Observe>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[204px] h-[212px] w-36 -translate-x-1/2 rounded-[1.5rem] border-2 border-accent-400 shadow-lg shadow-accent-500/10" />
        <span className="absolute left-1/2 top-[193px] -translate-x-1/2 rounded-full bg-slate-50 px-3 py-1 font-mono text-[11px] tracking-wider text-accent-700 dark:bg-slate-800 dark:text-accent-300">
          VIEWPORT
        </span>
        <Observe signals={[index]}>
          {() => (
            <>
              {['Previous', 'Current', 'Next'].map((label, position) => (
                <div
                  key={label}
                  className="absolute left-[calc(50%+82px)] text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"
                  style={{
                    top: 100 + position * size[1],
                    visibility:
                      (position === 0 && index.value === 0) ||
                      (position === 2 && index.value === count - 1)
                        ? 'hidden'
                        : 'visible',
                  }}
                >
                  <span className="block font-medium text-slate-700 dark:text-slate-200">
                    {label}
                  </span>
                  {position === 1 ? 'Visible' : 'Offscreen'}
                </div>
              ))}
            </>
          )}
        </Observe>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-slate-50 dark:from-slate-900 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent" />
      </div>

      <Observe signals={[index, playing, moving, status, changes]}>
        {() => (
          <>
            <div
              className="mt-5 text-center"
              aria-live={playing.value ? 'off' : 'polite'}
              aria-atomic="true"
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {status.value}
              </p>
              <p className="mt-1 min-h-10 text-xs text-slate-500 dark:text-slate-400">
                {changes.value}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                className={buttonClass}
                disabled={moving.value || index.value === 0}
                onClick={() => step('prev')}
              >
                Previous
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-20 items-center justify-center gap-2 rounded-xl bg-primary-500 px-3 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-primary-600"
                onClick={() => {
                  playing.value = !playing.value;
                }}
              >
                {playing.value ? (
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {playing.value ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                className={buttonClass}
                disabled={moving.value || index.value === count - 1}
                onClick={() => step('next')}
              >
                Next
              </button>
            </div>
          </>
        )}
      </Observe>
      <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Expanded view · Neighbors are hidden in the actual slider
      </p>
    </div>
  );
}
