import { Callout } from '../../components/ui/Callout';
import { CodeBlock } from '../../components/ui/CodeBlock';
import { FeatureCardGrid } from '../../components/ui/FeatureCard';
import {
  Layers,
  Timer,
  Minus,
  MousePointerClick,
  Cog,
  Cpu,
} from 'lucide-react';

const features = [
  {
    icon: Cpu,
    label: 'Framework-Agnostic',
    desc: 'Pure TypeScript, zero DOM framework deps',
  },
  {
    icon: Layers,
    label: 'Two-Level Navigation',
    desc: 'Groups + stories within each group',
  },
  {
    icon: Timer,
    label: 'RAF Timer',
    desc: 'requestAnimationFrame auto-advance with pause/resume',
  },
  {
    icon: Minus,
    label: 'Canvas Progress',
    desc: 'Retina-ready segmented progress bar with sliding window',
  },
  {
    icon: MousePointerClick,
    label: 'Tap Zones',
    desc: 'Configurable left/right tap detection',
  },
  {
    icon: Cog,
    label: 'Reactive Signals',
    desc: 'Built on @reelkit/core signal primitives',
  },
];

const configRows = [
  {
    name: 'groupCount',
    type: 'number',
    default: 'required',
    desc: 'Total number of story groups',
  },
  {
    name: 'storyCounts',
    type: 'number[]',
    default: 'required',
    desc: 'Number of stories in each group',
  },
  {
    name: 'initialGroupIndex',
    type: 'number',
    default: '0',
    desc: 'Initial group index',
  },
  {
    name: 'initialStoryIndex',
    type: 'number',
    default: '0',
    desc: 'Initial story index within the group',
  },
  {
    name: 'defaultImageDuration',
    type: 'number',
    default: '5000',
    desc: 'Default auto-advance duration for image stories in ms',
  },
];

const eventsRows = [
  {
    name: 'onStoryChange',
    type: '(groupIndex, storyIndex) => void',
    desc: 'Fired when the active story changes',
  },
  {
    name: 'onGroupChange',
    type: '(groupIndex) => void',
    desc: 'Fired when the active group changes',
  },
  {
    name: 'onStoryViewed',
    type: '(groupIndex, storyIndex) => void',
    desc: 'Fired when a story becomes visible',
  },
  {
    name: 'onStoryComplete',
    type: '(groupIndex, storyIndex) => void',
    desc: "Fired when a story's timer completes (before advancing)",
  },
  {
    name: 'onComplete',
    type: '() => void',
    desc: 'Fired when the last story of the last group finishes',
  },
  {
    name: 'onClose',
    type: '() => void',
    desc: 'Fired when the overlay should close',
  },
];

const stateRows = [
  {
    name: 'state.activeGroupIndex',
    type: 'Signal<number>',
    desc: 'Currently active group index',
  },
  {
    name: 'state.activeStoryIndex',
    type: 'Signal<number>',
    desc: 'Currently active story index within the group',
  },
  {
    name: 'state.isPaused',
    type: 'Signal<boolean>',
    desc: 'Whether auto-advance is paused',
  },
];

const methodsRows = [
  {
    name: 'nextStory()',
    type: '() => void',
    desc: 'Advance within group; crosses boundary to next group',
  },
  {
    name: 'prevStory()',
    type: '() => void',
    desc: 'Go back within group; crosses boundary to prev group',
  },
  {
    name: 'nextGroup()',
    type: '() => void',
    desc: 'Switch to next group, resuming at last viewed story',
  },
  {
    name: 'prevGroup()',
    type: '() => void',
    desc: 'Switch to previous group, resuming at last viewed story',
  },
  {
    name: 'goToGroup(index)',
    type: '(number) => void',
    desc: 'Jump to a specific group by index',
  },
  {
    name: 'pause()',
    type: '() => void',
    desc: 'Pause auto-advance',
  },
  {
    name: 'resume()',
    type: '() => void',
    desc: 'Resume auto-advance',
  },
  {
    name: 'onStoryTimerComplete()',
    type: '() => void',
    desc: 'Called when the timer finishes; fires onStoryComplete then advances',
  },
  {
    name: 'getLastStoryIndex(groupIndex)',
    type: '(number) => number',
    desc: 'Last viewed story index for a group (0 if never visited)',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: 'Clean up resources',
  },
];

const timerConfigRows = [
  {
    name: 'duration',
    type: 'number',
    default: 'required',
    desc: 'Default duration in milliseconds',
  },
  {
    name: 'onComplete',
    type: '() => void',
    default: 'undefined',
    desc: 'Called when the timer reaches 100%',
  },
];

const timerStateRows = [
  {
    name: 'progress',
    type: 'Signal<number>',
    desc: 'Progress signal (0 to 1)',
  },
  {
    name: 'isRunning',
    type: 'Signal<boolean>',
    desc: 'Whether the timer is currently running',
  },
];

const timerMethodsRows = [
  {
    name: 'start(duration?)',
    type: '(number?) => void',
    desc: 'Start (or restart) the timer with an optional duration override',
  },
  {
    name: 'pause()',
    type: '() => void',
    desc: 'Freeze progress at the current position',
  },
  {
    name: 'resume()',
    type: '() => void',
    desc: 'Continue from the frozen position',
  },
  {
    name: 'reset()',
    type: '() => void',
    desc: 'Reset progress to 0 and stop',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: 'Clean up resources',
  },
];

const canvasConfigRows = [
  {
    name: 'gap',
    type: 'number',
    default: '2',
    desc: 'Gap in pixels between segments',
  },
  {
    name: 'barHeight',
    type: 'number',
    default: '2',
    desc: 'Bar height in pixels',
  },
  {
    name: 'minSegmentWidth',
    type: 'number',
    default: '8',
    desc: 'Minimum segment width before the sliding window kicks in',
  },
  {
    name: 'bgColor',
    type: 'string',
    default: "'rgba(255,255,255,0.3)'",
    desc: 'Background color of unfilled segments',
  },
  {
    name: 'fillColor',
    type: 'string',
    default: "'#ffffff'",
    desc: 'Fill color of completed/active segments',
  },
];

const canvasMethodsRows = [
  {
    name: 'attach(canvas)',
    type: '(HTMLCanvasElement) => void',
    desc: 'Attach to a canvas element; starts ResizeObserver on parent',
  },
  {
    name: 'draw(totalStories, activeIndex, progress)',
    type: '(number, number, number) => void',
    desc: 'Draw the progress bar for the given state',
  },
  {
    name: 'width',
    type: 'number (readonly)',
    desc: 'Current measured width in CSS pixels',
  },
  {
    name: 'dispose()',
    type: '() => void',
    desc: 'Clean up ResizeObserver and internal state',
  },
];

const utilityRows = [
  {
    name: 'getTapAction(tapX, containerWidth, splitRatio?)',
    type: "(number, number, number?) => 'prev' | 'next'",
    desc: "Determines whether a tap triggers 'prev' or 'next' based on position. Default splitRatio is 0.3.",
  },
  {
    name: 'getSegments(totalStories, activeIndex, progress)',
    type: '(number, number, number) => SegmentState[]',
    desc: 'Computes status and fill percentage of each segment in a progress bar',
  },
  {
    name: 'getVisibleWindow(totalStories, activeIndex, progress, containerWidth, minSegmentWidth?, gap?)',
    type: '(number, number, number, number, number?, number?) => VisibleWindow',
    desc: 'Computes the visible sliding window of segments when total count exceeds container capacity',
  },
];

const typesCode = `type MediaType = 'image' | 'video';

interface StoryItem {
  id: string;
  mediaType: MediaType;
  src: string;
  poster?: string;
  duration?: number;
  createdAt?: string | Date;
  aspectRatio?: number;
}

interface AuthorInfo {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface StoriesGroup<T extends StoryItem = StoryItem> {
  author: AuthorInfo;
  stories: T[];
}

type SegmentStatus = 'completed' | 'active' | 'upcoming';

interface SegmentState {
  status: SegmentStatus;
  fillPercentage: number; // 0-100
}

interface VisibleWindow {
  startIndex: number;
  endIndex: number;
  segments: SegmentState[];
}

type TapAction = 'prev' | 'next';`;

const controllerExample = `import {
  createStoriesController,
  createTimerController,
} from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const groups = [
  { stories: ['s1', 's2', 's3'] },
  { stories: ['s4', 's5'] },
];

const controller = createStoriesController(
  {
    groupCount: groups.length,
    storyCounts: groups.map((g) => g.stories.length),
    defaultImageDuration: 5000,
  },
  {
    onStoryChange(groupIndex, storyIndex) {
      console.log('Story changed:', groupIndex, storyIndex);
    },
    onComplete() {
      console.log('All stories viewed');
    },
    onClose() {
      console.log('Overlay closed');
    },
  },
);

// Wire up a timer for auto-advance
const timer = createTimerController({
  duration: 5000,
  onComplete: () => controller.onStoryTimerComplete(),
});

// React to story changes and restart the timer
const dispose = reaction(
  () => [
    controller.state.activeGroupIndex,
    controller.state.activeStoryIndex,
  ],
  () => timer.start(),
);

// Start playback
timer.start();

// Navigation
controller.nextStory();
controller.pause();
controller.resume();

// Cleanup
dispose();
timer.dispose();
controller.dispose();`;

const timerExample = `import { createTimerController } from '@reelkit/stories-core';
import { reaction } from '@reelkit/core';

const timer = createTimerController({
  duration: 5000,
  onComplete: () => console.log('Timer finished!'),
});

// Observe progress (0 to 1)
const dispose = reaction(
  () => [timer.progress],
  () => {
    console.log('Progress:', timer.progress.value);
  },
);

// Start with default duration
timer.start();

// Or override duration for a specific story
timer.start(8000);

// Pause/resume preserves exact position
timer.pause();
timer.resume();

// Reset to 0
timer.reset();

// Cleanup
dispose();
timer.dispose();`;

const canvasExample = `import { createCanvasProgressRenderer } from '@reelkit/stories-core';

const renderer = createCanvasProgressRenderer({
  gap: 2,
  barHeight: 2,
  fillColor: '#ffffff',
  bgColor: 'rgba(255, 255, 255, 0.3)',
});

// Attach to a canvas element
const canvas = document.querySelector('canvas')!;
renderer.attach(canvas);

// Draw on each animation frame
let frameId: number;

function loop() {
  const totalStories = 5;
  const activeIndex = 2;
  const progress = timer.progress.value; // 0-1

  renderer.draw(totalStories, activeIndex, progress);
  frameId = requestAnimationFrame(loop);
}

frameId = requestAnimationFrame(loop);

// Cleanup
cancelAnimationFrame(frameId);
renderer.dispose();`;

function Table3Col({
  headers,
  rows,
}: {
  headers: [string, string, string];
  rows: { name: string; type: string; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 px-4 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">
                {r.type}
              </td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Table4Col({
  rows,
}: {
  rows: { name: string; type: string; default: string; desc: string }[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-semibold">Property</th>
            <th className="text-left py-3 px-4 font-semibold">Type</th>
            <th className="text-left py-3 px-4 font-semibold">Default</th>
            <th className="text-left py-3 px-4 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.name}
              className="border-b border-slate-100 dark:border-slate-800"
            >
              <td className="py-3 px-4 font-mono text-sm text-primary-600 dark:text-primary-400">
                {r.name}
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-500">
                {r.type}
              </td>
              <td className="py-3 px-4 text-slate-500 text-sm">{r.default}</td>
              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">
                {r.desc}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StoriesCorePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Overview */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Stories Core</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          The engine behind{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/react-stories-player
          </code>
          . Pure TypeScript, no framework deps. Use it to build stories
          players for Angular, Vue, or vanilla JS.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        <FeatureCardGrid items={features} />
      </div>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock
          code="npm i @reelkit/stories-core"
          language="bash"
        />
      </section>

      {/* Stories Controller */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Stories Controller</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createStoriesController(config, events?)
          </code>{' '}
          manages navigation across groups and stories. Tracks pause/resume
          state, remembers the last viewed story per group, and fires callbacks
          on each transition.
        </p>

        <h3 className="text-lg font-semibold mb-3">
          Config (StoriesControllerConfig)
        </h3>
        <Table4Col rows={configRows} />

        <h3 className="text-lg font-semibold mt-8 mb-3">
          Events (StoriesControllerEvents)
        </h3>
        <Table3Col
          headers={['Event', 'Type', 'Description']}
          rows={eventsRows}
        />

        <h3 className="text-lg font-semibold mt-8 mb-3">
          State (reactive signals)
        </h3>
        <Table3Col
          headers={['Signal', 'Type', 'Description']}
          rows={stateRows}
        />

        <h3 className="text-lg font-semibold mt-8 mb-3">Methods</h3>
        <Table3Col
          headers={['Method', 'Type', 'Description']}
          rows={methodsRows}
        />

        <h3 className="text-lg font-semibold mt-8 mb-3">Example</h3>
        <CodeBlock code={controllerExample} />
      </section>

      {/* Timer Controller */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Timer Controller</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createTimerController(config)
          </code>{' '}
          drives auto-advance with a{' '}
          <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
            requestAnimationFrame
          </code>{' '}
          loop. The progress signal (0 to 1) feeds the progress bar. Pause and
          resume preserve the exact position.
        </p>

        <h3 className="text-lg font-semibold mb-3">
          Config (TimerControllerConfig)
        </h3>
        <Table4Col rows={timerConfigRows} />

        <h3 className="text-lg font-semibold mt-8 mb-3">State</h3>
        <Table3Col
          headers={['Signal', 'Type', 'Description']}
          rows={timerStateRows}
        />

        <h3 className="text-lg font-semibold mt-8 mb-3">Methods</h3>
        <Table3Col
          headers={['Method', 'Type', 'Description']}
          rows={timerMethodsRows}
        />

        <h3 className="text-lg font-semibold mt-8 mb-3">Example</h3>
        <CodeBlock code={timerExample} />
      </section>

      {/* Canvas Progress Renderer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Canvas Progress Renderer</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            createCanvasProgressRenderer(config?)
          </code>{' '}
          draws segmented progress bars on a canvas. Scales for Retina displays,
          measures its container via ResizeObserver, and uses a sliding window
          when segments don't fit.
        </p>

        <h3 className="text-lg font-semibold mb-3">
          Config (CanvasProgressRendererConfig)
        </h3>
        <Table4Col rows={canvasConfigRows} />

        <h3 className="text-lg font-semibold mt-8 mb-3">Methods</h3>
        <Table3Col
          headers={['Member', 'Type', 'Description']}
          rows={canvasMethodsRows}
        />

        <h3 className="text-lg font-semibold mt-8 mb-3">Example</h3>
        <CodeBlock code={canvasExample} />
      </section>

      {/* Utility Functions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Utility Functions</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Pure functions for tap zone detection and progress bar math.
        </p>
        <Table3Col
          headers={['Function', 'Type', 'Description']}
          rows={utilityRows}
        />
      </section>

      {/* Types */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Types</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          All type definitions exported from{' '}
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
            @reelkit/stories-core
          </code>
          .
        </p>
        <CodeBlock code={typesCode} />
      </section>
    </div>
  );
}
