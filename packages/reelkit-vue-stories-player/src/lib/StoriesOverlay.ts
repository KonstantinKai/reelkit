import {
  Teleport,
  computed,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
  type ExtractPropTypes,
  type PropType,
  type Slots,
  type VNode,
  type VNodeChild,
} from 'vue';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import {
  Observe,
  Reel,
  SoundProvider,
  SwipeToClose,
  captureFocusForReturn,
  createContentLoadingController,
  createContentPreloader,
  createDisposableList,
  createFocusTrap,
  createSignal,
  cubeTransition,
  fadeTransition,
  hasRenderedNodes,
  noop,
  observeDomEvent,
  reaction,
  slideTransition,
  toVueRef,
  useBodyLock,
  useSoundState,
  type GestureCommonEvent,
  type ReelExpose,
  type Signal,
  type TransitionTransformFn,
  type TwoAxisPosition,
  type UrlStateController,
} from '@reelkit/vue';
import {
  createStoriesController,
  createTimerController,
  getStoriesSize,
  getTapAction,
  isMobileWidth,
  parseDurationMs,
  type StoriesGroup,
  type StoriesViewedStateController,
  type StoryItem,
} from '@reelkit/stories-core';
import type {
  DesktopLayout,
  ChromePlacement,
  ErrorSlotScope,
  FooterSlotScope,
  GroupPreviewSlotScope,
  HeaderSlotScope,
  LoadingSlotScope,
  NavigationSlotScope,
  ProgressBarSlotScope,
  SlideSlotScope,
  StoriesApi,
} from './types';
import { CanvasProgressBar } from './CanvasProgressBar';
import { StoryHeader } from './StoryHeader';
import { ImageStorySlide } from './ImageStorySlide';
import { VideoStorySlide, shared as sharedVideo } from './VideoStorySlide';
import { HeartAnimation } from './HeartAnimation';
import { StoriesCarousel, type CarouselSlide } from './StoriesCarousel';
import { useAttachViewedState } from './useAttachViewedState';
import './StoriesOverlay.css';

// The slide normally ends on the transition of the card moving into the
// center. A transition that never runs — the tab hidden mid-slide, a theme
// setting the duration to zero — sends no event, so a time limit ends it
// instead: the duration the cards are themed with, plus this much.
const _kSlideTimeoutMarginMs = 700;

const _kLongPressMs = 500;

const preloader = createContentPreloader();

/**
 * Props shared by {@link StoriesOverlay}, {@link StoriesUrlOverlay} and the
 * inner content both of them render.
 *
 * @internal
 */
const storiesSharedProps = {
  /** Array of story groups to display. */
  groups: {
    type: Array as PropType<StoriesGroup[]>,
    required: true as const,
  },

  /**
   * Accessible label for the dialog region. Announced by screen readers when
   * the overlay opens.
   *
   * @default 'Stories player'
   */
  ariaLabel: { type: String, default: 'Stories player' },

  /**
   * What the viewer has seen, from `createStoriesViewedStateController`. Given
   * this, the player does the whole job: a group opens on its first unseen
   * story, every story shown is recorded, and the carousel cards draw a muted
   * ring for a group watched to the end. Hand the same controller to
   * `StoriesRingList`.
   *
   * The overlay reads storage through it once mounted, whether or not the
   * player is open, so the store is ready by the time it opens. An overlay
   * mounted only at the moment it opens (`v-if="open"`) chooses its opening
   * story before that; call `viewed.attach()` yourself in that case, from
   * `onMounted`, and call the dispose it returns from `onUnmounted`.
   *
   * An explicit `resumeStoryIndex` prop wins over the controller's, and
   * `storyViewed` is still emitted alongside the recording.
   */
  viewed: {
    type: Object as PropType<StoriesViewedStateController>,
    default: undefined,
  },

  /**
   * Which story a group should open on the first time it is reached — how a
   * remembered "seen up to here" reaches the player. The `viewed` controller
   * supplies this by itself; pass a function only to decide differently, it
   * wins over the controller's. Without either, every group starts at its
   * first story.
   *
   * Only consulted for a group not yet visited during this open; a group the
   * viewer already swiped through reopens exactly where they left it. That
   * includes the group the player opens on, unless `initialStoryIndex` names
   * a story outright. It must only read what a viewer has seen.
   *
   * @default undefined
   */
  resumeStoryIndex: {
    type: Function as PropType<(groupIndex: number) => number>,
    default: undefined,
  },

  /**
   * Layout on a desktop screen. `'carousel'` shows neighbouring groups as
   * dimmed preview cards on both sides of the active story, the way the
   * Instagram desktop viewer does, and slides between groups; clicking a card
   * opens that group. Phones always show the active story alone.
   *
   * @default 'single'
   */
  desktopLayout: {
    type: String as PropType<DesktopLayout>,
    default: 'single' as DesktopLayout,
  },

  /**
   * Where the progress bar and the header live. `'overlay'` draws one copy
   * above the player, which switches to the new group once the group changes.
   * `'group'` gives each group its own copy inside its slide, so the bar and
   * the header turn with the group, the way Instagram does it; a neighbouring
   * group shows where it stands. The desktop carousel hides the player while
   * its cards slide, so there the choice shows only once a group is open.
   *
   * With `'group'` a `header` slot sits inside the swipe area, and a tap on it
   * moves between stories unless it lands on a `button`, a link, or an element
   * with `role="button"`.
   *
   * @default 'overlay'
   */
  chromePlacement: {
    type: String as PropType<ChromePlacement>,
    default: 'overlay' as ChromePlacement,
  },

  /**
   * Transition effect for the outer (group) slider. Ignored while the desktop
   * carousel is showing, which slides between groups.
   *
   * @default cubeTransition
   */
  groupTransition: {
    type: Function as PropType<TransitionTransformFn>,
    default: cubeTransition,
  },

  /**
   * Duration of the inner (story) transition animation in milliseconds.
   *
   * @default 200
   */
  innerTransitionDuration: { type: Number, default: 200 },

  /**
   * Default auto-advance duration for image stories in milliseconds.
   *
   * @default 5000
   */
  defaultImageDuration: { type: Number, default: 5000 },

  /**
   * Tap zone split ratio, from 0 to 1. The left portion goes back, the rest
   * goes forward.
   *
   * @default 0.3
   */
  tapZoneSplit: { type: Number, default: 0.3 },

  /**
   * Hide the progress bar and header while paused by a long press. A footer
   * from the `footer` slot stays.
   *
   * @default true
   */
  hideUiOnPause: { type: Boolean, default: true },

  /**
   * Enable keyboard navigation: left and right arrows move between stories,
   * Escape closes.
   *
   * @default true
   */
  enableKeyboard: { type: Boolean, default: true },

  /**
   * Minimum segment width in pixels for the progress bar.
   *
   * @default 8
   */
  minSegmentWidth: { type: Number, default: 8 },
};

/**
 * Where the player opens. The controlled overlay takes them as props; the URL
 * overlay reads them from its controller.
 *
 * @internal
 */
const storiesInitialPositionProps = {
  /**
   * Zero-based index of the initially visible group.
   *
   * @default 0
   */
  initialGroupIndex: { type: Number, default: 0 },

  /**
   * Zero-based index of the initially visible story within the group. Naming
   * one outright wins over anything remembered, which is what makes a shared
   * link open where it points; leave it out and the opening group resumes
   * through `resumeStoryIndex` like every other group.
   *
   * @default resumeStoryIndex(initialGroupIndex), or 0 with no resume callback
   */
  initialStoryIndex: { type: Number, default: undefined },
};

const storiesContentProps = {
  ...storiesSharedProps,
  ...storiesInitialPositionProps,
};

const storiesEmits = {
  close: () => true,
  storyChange: (_groupIndex: number, _storyIndex: number) => true,
  groupChange: (_groupIndex: number) => true,
  storyViewed: (_groupIndex: number, _storyIndex: number) => true,
  storyComplete: (_groupIndex: number, _storyIndex: number) => true,
  doubleTap: (_groupIndex: number, _storyIndex: number) => true,
  pause: () => true,
  resume: () => true,
  apiReady: (_api: StoriesApi) => true,
};

/**
 * Desktop arrow: a click moves one story, holding it for half a second moves
 * a whole group.
 */
const NavButton = defineComponent({
  name: 'RkStoriesNavButton',
  props: {
    label: { type: String, required: true as const },
    onPress: {
      type: Function as PropType<() => void>,
      required: true as const,
    },
    onLongPress: {
      type: Function as PropType<() => void>,
      required: true as const,
    },
  },
  setup(props, { slots }) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let fired = false;

    onUnmounted(() => clearTimeout(timer));

    return () =>
      h(
        'button',
        {
          class: 'rk-stories-nav-btn',
          'aria-label': props.label,
          onPointerdown: () => {
            fired = false;
            timer = setTimeout(() => {
              fired = true;
              props.onLongPress();
            }, _kLongPressMs);
          },
          onPointerup: () => {
            clearTimeout(timer);
            if (!fired) props.onPress();
          },
          onPointerleave: () => clearTimeout(timer),
        },
        slots['default']?.(),
      );
  },
});

/**
 * The open player. Its own component so `useSoundState`, the body lock and
 * the lifecycle hooks resolve inside the `SoundProvider` scope, and so the
 * stories controller lives exactly as long as one open.
 *
 * @internal
 */
const StoriesContent = defineComponent({
  name: 'RkStoriesContent',
  inheritAttrs: false,
  props: storiesContentProps,
  emits: storiesEmits,
  setup(props, { emit, slots, expose }) {
    let overlayEl: HTMLDivElement | null = null;
    let outerReel: ReelExpose | null = null;
    const innerReels = new Map<number, ReelExpose>();
    const soundState = useSoundState();

    // The groups as they are now. Everything that outlives a render reads them
    // through this, so a feed that pages in more groups is never frozen to the
    // ones the player opened with.
    const latestGroups = () => props.groups;

    const reportViewed = (groupIndex: number, storyIndex: number) => {
      props.viewed?.markViewed(groupIndex, storyIndex);
      emit('storyViewed', groupIndex, storyIndex);
    };

    const isCarouselLayout = () =>
      props.desktopLayout === 'carousel' && !isMobileWidth(window.innerWidth);
    const carouselActive = createSignal(isCarouselLayout());
    const slideSignal = createSignal<CarouselSlide | null>(null);
    // The newest story the viewer reached while a slide was running. It is not
    // on screen until the slide ends, so it is reported as viewed only then.
    let pendingViewed: [number, number] | null = null;
    // The newest timer action asked for while a slide was running.
    let pendingTimerAction: (() => void) | null = null;
    let slideTimeout: ReturnType<typeof setTimeout> | undefined;
    let cardTransitionMs = 0;
    let slideFrame = 0;

    const storiesCtrl = createStoriesController(
      {
        groupCount: props.groups.length,
        storyCounts: props.groups.map((group) => group.stories.length),
        initialGroupIndex: props.initialGroupIndex,
        initialStoryIndex: props.initialStoryIndex,
        defaultImageDuration: props.defaultImageDuration,
        // An explicit prop wins over the viewed controller's answer.
        resumeStoryIndex: (groupIndex) =>
          (props.resumeStoryIndex ?? props.viewed?.resumeStoryIndex)?.(
            groupIndex,
          ) ?? 0,
      },
      {
        onStoryChange: (groupIndex, storyIndex) =>
          emit('storyChange', groupIndex, storyIndex),
        onGroupChange: (groupIndex) => {
          emit('groupChange', groupIndex);
          settleGroupChange();
        },
        onStoryViewed: (groupIndex, storyIndex) => {
          if (slideSignal.value) pendingViewed = [groupIndex, storyIndex];
          else reportViewed(groupIndex, storyIndex);
        },
        onStoryComplete: (groupIndex, storyIndex) =>
          emit('storyComplete', groupIndex, storyIndex),
        onClose: () => emit('close'),
      },
    );
    const { activeGroupIndex, activeStoryIndex, isPaused } = storiesCtrl.state;

    // Where the player opened, settled by the controller: an omitted
    // `initialStoryIndex` resolves through the resume callback. Kept apart
    // from the props so a URL that follows every story never reaches the
    // sliders, which only read their starting index once.
    const openGroupIndex = activeGroupIndex.value;
    let activeGroupIndexNow = openGroupIndex;
    let activeStoryIndexNow = activeStoryIndex.value;

    const timerCtrl = createTimerController({
      duration: props.defaultImageDuration,
      onComplete: () => storiesCtrl.onStoryTimerComplete(),
    });

    const sizeSignal = createSignal<[number, number]>(getStoriesSize());
    const heartsSignal = createSignal<{ id: number }[]>([]);
    const longPressSignal = createSignal(false);
    const loadingCtrl = createContentLoadingController();
    const knownDurations = new Map<string, number>();
    let heartId = 0;

    const getDuration = (story: StoryItem | undefined): number => {
      if (!story) return props.defaultImageDuration;
      if (story.duration) return story.duration;
      return knownDurations.get(story.src) ?? props.defaultImageDuration;
    };

    const activeStory = () =>
      latestGroups()[activeGroupIndex.value]?.stories[activeStoryIndex.value];

    const isActiveStory = (groupIndex: number, storyIndex: number) =>
      groupIndex === activeGroupIndex.value &&
      storyIndex === activeStoryIndex.value;

    // While a slide runs the player is hidden behind the moving cards, so the
    // timer waits: the action is kept and run when the slide ends.
    const runTimer = (action: () => void) => {
      if (slideSignal.value) pendingTimerAction = action;
      else action();
    };

    // Stopping the timer also withdraws whatever was waiting for the slide to
    // end. Otherwise a resume asked for first would outlive the reset that
    // followed it and run the timer over a story that is still loading.
    const resetTimer = () => {
      pendingTimerAction = null;
      timerCtrl.reset();
    };

    const pauseTimer = () => {
      pendingTimerAction = null;
      timerCtrl.pause();
    };

    const startOrDeferTimer = (story: StoryItem | undefined) => {
      // A cached story can report itself ready before the player gets here on
      // reopen, which has already started the timer.
      if (timerCtrl.isRunning.value) return;

      loadingCtrl.isError.value = false;

      if (story?.src && preloader.isErrored(story.src)) {
        loadingCtrl.isLoading.value = false;
        loadingCtrl.isError.value = true;
        return;
      }

      if (story?.mediaType === 'image' && story.src) {
        if (preloader.isLoaded(story.src)) {
          loadingCtrl.isLoading.value = false;
          runTimer(() => timerCtrl.start(getDuration(story)));
        } else {
          loadingCtrl.isLoading.value = true;
        }
      } else if (story?.mediaType === 'video' && story.src) {
        loadingCtrl.isLoading.value = true;
      } else {
        loadingCtrl.isLoading.value = false;
        runTimer(() =>
          timerCtrl.start(story?.duration ?? props.defaultImageDuration),
        );
      }
    };

    // Group of the story the timer was last restarted for.
    let timedGroupIndex = activeGroupIndex.value;

    const restartTimer = () => {
      timedGroupIndex = activeGroupIndex.value;
      resetTimer();
      startOrDeferTimer(activeStory());
    };

    // Picks the story's timer up where it stopped, or starts it when it never
    // ran. Content that is still loading, or failed, keeps the timer waiting.
    const resumeTimer = () => {
      if (loadingCtrl.isLoading.value || loadingCtrl.isError.value) return;
      if (timerCtrl.progress.value > 0) timerCtrl.resume();
      else timerCtrl.start(getDuration(activeStory()));
    };

    // Runs once the controller has moved to another group, after the group and
    // story reactions. A group change always sets a paused player going again.
    // A group that opens on the story index the viewer just left changes no
    // story, so the story reaction stayed silent and the timer restarts here.
    function settleGroupChange() {
      if (isPaused.value) storiesCtrl.resume();
      if (timedGroupIndex !== activeGroupIndex.value) restartTimer();
    }

    const stopSlide = () => {
      clearTimeout(slideTimeout);
      cancelAnimationFrame(slideFrame);
      slideSignal.value = null;
    };

    // Ends a slide the player never came out of, on the way out: the story it
    // was opening was not shown, so it is neither reported nor timed.
    const cancelSlide = () => {
      stopSlide();
      pendingViewed = null;
      pendingTimerAction = null;
    };

    const endSlide = () => {
      if (!slideSignal.value) return;

      // The card of the opened group leaves the page now, and the cards around
      // it change places. Focus left on a card would fall to the document body,
      // outside the dialog, so it goes to the player the viewer just opened.
      if (
        overlayEl
          ?.querySelector('.rk-stories-carousel')
          ?.contains(document.activeElement)
      ) {
        overlayEl.focus({ preventScroll: true });
      }

      stopSlide();

      const held = pendingViewed;
      const timerAction = pendingTimerAction;
      pendingViewed = null;
      pendingTimerAction = null;
      if (held) reportViewed(held[0], held[1]);
      if (!isPaused.value) timerAction?.();
    };

    const beginSlide = (from: number, to: number) => {
      clearTimeout(slideTimeout);
      cancelAnimationFrame(slideFrame);
      // A slide that interrupts another also drops what the first one was
      // holding for its own group.
      pauseTimer();
      slideSignal.value = { from, to, phase: 'start' };
      // Two frames: the first paints the cards around the group being left,
      // the second starts the transition from there.
      slideFrame = requestAnimationFrame(() => {
        slideFrame = requestAnimationFrame(() => {
          slideSignal.value = { from, to, phase: 'run' };
        });
      });

      // Read once the overlay is marked as sliding, which is what switches the
      // card transition on. A theme can make the slide as long as it likes
      // through `--rk-stories-card-transition`; the limit waits for all of it.
      // A slide that interrupts another in its first frame finds the cards with
      // their transition still held off, so the last duration seen stands in.
      const card = overlayEl?.querySelector('.rk-stories-card');
      const duration = card
        ? parseDurationMs(getComputedStyle(card).transitionDuration ?? '')
        : 0;
      if (duration > 0) cardTransitionMs = duration;
      slideTimeout = setTimeout(
        endSlide,
        cardTransitionMs + _kSlideTimeoutMarginMs,
      );
    };

    const updateCarouselActive = () => {
      carouselActive.value = isCarouselLayout();
      if (!carouselActive.value) endSlide();
    };

    // How far the story of a group being turned away from had played, by
    // group. The controller moves to the new group before the turn starts, and
    // the timer resets right after, so a progress bar drawn inside the group
    // being left would otherwise empty its segment while it is still in view.
    const frozenProgress = createSignal<ReadonlyMap<number, number>>(new Map());

    // A touch swipe has already moved the player to the new group, so it gets
    // no slide on top.
    let changingByDrag = false;

    const followActiveGroup = () => {
      const previous = activeGroupIndexNow;
      const groupIndex = activeGroupIndex.value;
      activeGroupIndexNow = groupIndex;

      if (!carouselActive.value) {
        // A swipe has already turned the player, so only a turn still to come
        // holds the group being left as it was.
        const frozen: ReadonlyMap<number, number> =
          previous !== groupIndex && !changingByDrag
            ? new Map([[previous, timerCtrl.progress.value]])
            : new Map();
        frozenProgress.value = frozen;
        outerReel?.goTo(groupIndex, true).then(() => {
          if (frozenProgress.value === frozen) frozenProgress.value = new Map();
        });
        return;
      }

      outerReel?.goTo(groupIndex, false);
      if (!changingByDrag && previous !== groupIndex) {
        beginSlide(previous, groupIndex);
      }
    };

    const handleTap = (event: GestureCommonEvent) => {
      const [width] = sizeSignal.value;
      const action = getTapAction(
        event.localPosition[0],
        width,
        props.tapZoneSplit,
      );
      if (action === 'next') storiesCtrl.nextStory();
      else storiesCtrl.prevStory();
    };

    const handleDoubleTap = () => {
      heartsSignal.value = [...heartsSignal.value, { id: ++heartId }];
      emit('doubleTap', activeGroupIndex.value, activeStoryIndex.value);
    };

    const handleLongPressStart = () => {
      longPressSignal.value = true;
      storiesCtrl.pause();
      emit('pause');
    };

    const handleLongPressEnd = () => {
      longPressSignal.value = false;
      storiesCtrl.resume();
      emit('resume');
    };

    const togglePause = () => {
      if (isPaused.value) {
        storiesCtrl.resume();
        emit('resume');
      } else {
        storiesCtrl.pause();
        emit('pause');
      }
    };

    const handleOuterDragStart = () => {
      timerCtrl.pause();
      if (activeStory()?.mediaType === 'video') {
        sharedVideo.getVideo().pause();
      }
    };

    const handleOuterDragEnd = () => {
      if (isPaused.value) return;
      timerCtrl.resume();
      if (activeStory()?.mediaType === 'video') {
        sharedVideo.getVideo().play().catch(noop);
      }
    };

    const handleOuterAfterChange = (index: number) => {
      // The group reaction moves the outer slider itself, which reports the
      // change back here; the controller is already there.
      if (activeGroupIndex.value === index) return;

      changingByDrag = true;
      storiesCtrl.goToGroup(index);
      changingByDrag = false;
    };

    const handleContentReady = (groupIndex: number, storyIndex: number) => {
      const story = latestGroups()[groupIndex]?.stories[storyIndex];
      if (story?.src) preloader.markLoaded(story.src);

      if (isActiveStory(groupIndex, storyIndex)) {
        loadingCtrl.isLoading.value = false;
        runTimer(resumeTimer);
      }
    };

    const handleVideoWaiting = (groupIndex: number, storyIndex: number) => {
      if (isActiveStory(groupIndex, storyIndex)) {
        loadingCtrl.isLoading.value = true;
        pauseTimer();
      }
    };

    const handleDurationReady = (
      groupIndex: number,
      storyIndex: number,
      ms: number,
    ) => {
      const story = latestGroups()[groupIndex]?.stories[storyIndex];
      if (story?.src) knownDurations.set(story.src, ms);
      // A story that names its own duration keeps it, whatever the video
      // reports.
      if (!story?.duration && isActiveStory(groupIndex, storyIndex)) {
        runTimer(() => timerCtrl.start(ms));
      }
    };

    const handleVideoEnded = () => storiesCtrl.onStoryTimerComplete();

    const handleContentError = (groupIndex: number, storyIndex: number) => {
      const story = latestGroups()[groupIndex]?.stories[storyIndex];
      if (story?.src) preloader.markErrored(story.src);

      if (isActiveStory(groupIndex, storyIndex)) {
        loadingCtrl.isLoading.value = false;
        loadingCtrl.isError.value = true;
        pauseTimer();
      }
    };

    const removeHeart = (id: number) => {
      heartsSignal.value = heartsSignal.value.filter(
        (heart) => heart.id !== id,
      );
    };

    const close = () => emit('close');

    const api: StoriesApi = {
      nextStory: () => storiesCtrl.nextStory(),
      prevStory: () => storiesCtrl.prevStory(),
      nextGroup: () => storiesCtrl.nextGroup(),
      prevGroup: () => storiesCtrl.prevGroup(),
      goToGroup: (index) => storiesCtrl.goToGroup(index),
      pause: () => storiesCtrl.pause(),
      resume: () => storiesCtrl.resume(),
    };
    expose(api);

    useBodyLock(true);

    // Set on the element directly: a class in the render would re-render the
    // whole player, both sliders included, on every slide.
    const applyOverlayModifiers = () => {
      const classes = overlayEl?.classList;
      classes?.toggle('rk-stories-overlay--carousel', carouselActive.value);
      classes?.toggle(
        'rk-stories-overlay--sliding',
        slideSignal.value !== null,
      );
    };

    watch(() => props.desktopLayout, updateCarouselActive);

    // The controller copies the counts when it is created. A feed that pages
    // in more groups, or adds a story to one, has to be reported to it, or the
    // new ones are drawn but can never be opened. The counts are watched rather
    // than the array, so a group or a story pushed into the same array counts
    // as much as a new array does.
    watch(
      () =>
        [
          props.groups.length,
          ...props.groups.map((g) => g.stories.length),
        ].join(','),
      () =>
        storiesCtrl.updateConfig({
          groupCount: props.groups.length,
          storyCounts: props.groups.map((group) => group.stories.length),
        }),
    );

    const disposables = createDisposableList();

    onMounted(() => {
      disposables.push(captureFocusForReturn());
      if (overlayEl) {
        overlayEl.focus({ preventScroll: true });
        disposables.push(createFocusTrap(overlayEl));
      }

      disposables.push(
        reaction(() => [activeGroupIndex], followActiveGroup),
        reaction(() => [carouselActive, slideSignal], applyOverlayModifiers),
        reaction(
          () => [activeStoryIndex],
          () => {
            if (isPaused.value) storiesCtrl.resume();

            const storyIndex = activeStoryIndex.value;
            activeStoryIndexNow = storyIndex;
            innerReels.get(activeGroupIndex.value)?.goTo(storyIndex, true);

            restartTimer();
          },
        ),
        reaction(
          () => [isPaused],
          () => {
            const isVideo = activeStory()?.mediaType === 'video';

            if (isPaused.value) {
              pauseTimer();
              if (isVideo) sharedVideo.getVideo().pause();
            } else {
              runTimer(resumeTimer);
              if (isVideo) sharedVideo.getVideo().play().catch(noop);
            }
          },
        ),
        reaction(
          () => [activeGroupIndex, activeStoryIndex],
          () => {
            const groupIndex = activeGroupIndex.value;
            const group = latestGroups()[groupIndex];
            if (!group) return;

            const nextStory = group.stories[activeStoryIndex.value + 1];
            if (nextStory)
              preloader.preload(nextStory.src, nextStory.mediaType);

            const nextGroupStory = latestGroups()[groupIndex + 1]?.stories[0];
            if (nextGroupStory) {
              preloader.preload(nextGroupStory.src, nextGroupStory.mediaType);
            }
          },
        ),
        observeDomEvent(window, 'resize', () => {
          sizeSignal.value = getStoriesSize();
          updateCarouselActive();
          outerReel?.adjust();
        }),
        observeDomEvent(window, 'keydown', (event) => {
          if (
            props.enableKeyboard &&
            (event as KeyboardEvent).key === 'Escape'
          ) {
            close();
          }
        }),
        cancelSlide,
        timerCtrl.dispose,
      );
      applyOverlayModifiers();

      // The stories controller is not disposed on unmount: it holds no timers
      // or listeners of its own, only the callbacks above, and those go with
      // this component.

      // The opening story is on screen without anything having been navigated
      // to, so nothing has announced it yet. Reported once mounted rather than
      // during setup, because a handler is free to write state from it.
      storiesCtrl.reportInitialView();

      startOrDeferTimer(activeStory());

      emit('apiReady', api);
    });

    onUnmounted(disposables.dispose);

    // Draws a slot from `slots`, or the fallback when the slot is missing or
    // renders nothing at all (a slot holding only a false `v-if`).
    const slotOr = <TScope>(
      name: string,
      scope: TScope,
      fallback: () => VNodeChild,
    ): VNodeChild => {
      const custom = (slots as Slots)[name]?.(scope);
      return custom && hasRenderedNodes(custom) ? custom : fallback();
    };

    const renderStory = (
      story: StoryItem,
      groupIndex: number,
      storyIndex: number,
      storySize: [number, number],
    ): VNode => {
      const isActive =
        activeGroupIndexNow === groupIndex &&
        activeStoryIndexNow === storyIndex;
      const onReady = () => handleContentReady(groupIndex, storyIndex);
      const onWaiting = () => handleVideoWaiting(groupIndex, storyIndex);
      const onError = () => handleContentError(groupIndex, storyIndex);
      const onDurationReady = (ms: number) =>
        handleDurationReady(groupIndex, storyIndex, ms);

      const slideScope: SlideSlotScope = {
        story,
        index: storyIndex,
        groupIndex,
        isActive,
        size: storySize,
        activeGroupIndex,
        activeStoryIndex,
        onDurationReady,
        onReady,
        onWaiting,
        onError,
        onEnded: handleVideoEnded,
      };

      const media = slotOr('slide', slideScope, () =>
        story.mediaType === 'video'
          ? h(VideoStorySlide, {
              src: story.src,
              poster: story.poster,
              groupIndex,
              storyIndex,
              activeGroupIndex,
              activeStoryIndex,
              onDurationReady,
              onPlaying: onReady,
              onWaiting,
              onEnded: handleVideoEnded,
              onError,
            })
          : h(ImageStorySlide, {
              src: story.src,
              aspectRatio: story.aspectRatio,
              onLoad: onReady,
              onError,
            }),
      );

      const status = h(
        Observe,
        {
          signals: [
            loadingCtrl.isLoading,
            loadingCtrl.isError,
            activeGroupIndex,
            activeStoryIndex,
          ],
        },
        {
          default: () => {
            if (!isActiveStory(groupIndex, storyIndex)) return null;
            const scope: LoadingSlotScope & ErrorSlotScope = {
              story,
              storyIndex,
              groupIndex,
            };

            if (loadingCtrl.isError.value) {
              return slotOr('error', scope, () =>
                h(
                  'div',
                  {
                    class: 'rk-stories-error',
                    role: 'img',
                    'aria-label': 'Content unavailable',
                  },
                  [
                    h(ImageOff, {
                      size: 48,
                      'stroke-width': 1.5,
                      'aria-hidden': 'true',
                    }),
                    h(
                      'span',
                      { class: 'rk-stories-error-text' },
                      'Content unavailable',
                    ),
                  ],
                ),
              );
            }

            if (loadingCtrl.isLoading.value) {
              return slotOr('loading', scope, () => null);
            }

            return null;
          },
        },
      );

      return h(
        'div',
        {
          class: 'rk-stories-story',
          style: { width: `${storySize[0]}px`, height: `${storySize[1]}px` },
        },
        [media, status],
      );
    };

    const renderGroup = (
      group: StoriesGroup,
      groupIndex: number,
      itemSize: [number, number],
    ): VNode =>
      h(
        'div',
        {
          class: 'rk-stories-slide-wrapper',
          style: { width: `${itemSize[0]}px`, height: `${itemSize[1]}px` },
        },
        [
          h(
            Reel,
            {
              count: group.stories.length,
              size: itemSize,
              direction: 'horizontal',
              transition: fadeTransition,
              enableGestures: false,
              enableNavKeys: false,
              transitionDuration: props.innerTransitionDuration,
              initialIndex: storiesCtrl.getLastStoryIndex(groupIndex),
              ref: (el: unknown) => {
                if (el) innerReels.set(groupIndex, el as ReelExpose);
                else innerReels.delete(groupIndex);
              },
            },
            {
              item: ({
                index: storyIndex,
                size: storySize,
              }: {
                index: number;
                size: [number, number];
              }) => {
                const story = group.stories[storyIndex];
                return story
                  ? renderStory(story, groupIndex, storyIndex, storySize)
                  : null;
              },
            },
          ),
          slots['footer']
            ? h(
                Observe,
                { signals: [activeGroupIndex, activeStoryIndex] },
                {
                  default: () => {
                    if (activeGroupIndex.value !== groupIndex) return null;
                    const storyIndex = activeStoryIndex.value;
                    const story = group.stories[storyIndex];
                    if (!story) return null;
                    const scope: FooterSlotScope = {
                      author: group.author,
                      story,
                      storyIndex,
                    };
                    return slots['footer']?.(scope);
                  },
                },
              )
            : null,
          props.chromePlacement === 'group'
            ? renderGroupChrome(groupIndex)
            : null,
        ],
      );

    const renderOuterReel = () => {
      const groups = props.groups;
      return h(
        Reel,
        {
          count: groups.length,
          size: sizeSignal.value,
          direction: 'horizontal',
          transition: carouselActive.value
            ? slideTransition
            : props.groupTransition,
          enableGestures: true,
          enableNavKeys: props.enableKeyboard,
          onNavKeyPress: (increment: -1 | 1) => {
            if (increment === -1) storiesCtrl.prevStory();
            else storiesCtrl.nextStory();
          },
          initialIndex: openGroupIndex,
          ref: (el: unknown) => {
            outerReel = (el as ReelExpose | null) ?? null;
          },
          onAfterChange: handleOuterAfterChange,
          onSlideDragStart: handleOuterDragStart,
          onSlideDragEnd: handleOuterDragEnd,
          onSlideDragCanceled: handleOuterDragEnd,
          onTap: handleTap,
          onDoubleTap: handleDoubleTap,
          onLongPress: handleLongPressStart,
          onLongPressEnd: handleLongPressEnd,
        },
        {
          item: ({
            index: groupIndex,
            size: itemSize,
          }: {
            index: number;
            size: [number, number];
          }) => {
            const group = groups[groupIndex];
            return group ? renderGroup(group, groupIndex, itemSize) : null;
          },
        },
      );
    };

    const renderGroupProgress = (
      groupIndex: number,
      isActive: boolean,
      activeIndex: Signal<number>,
      progress: Signal<number>,
    ) => {
      const group = props.groups[groupIndex];
      if (!group) return null;

      const scope: ProgressBarSlotScope = {
        totalStories: group.stories.length,
        activeIndex,
        progress,
        group,
        groupIndex,
        isActive,
      };
      return slotOr('progressBar', scope, () =>
        h(CanvasProgressBar, {
          totalStories: group.stories.length,
          activeIndex,
          progress,
          minSegmentWidth: props.minSegmentWidth,
          live: isActive,
        }),
      );
    };

    // A group that is not active shows the story it stands on, not playing.
    const renderGroupHeader = (groupIndex: number, isActive: boolean) => {
      const group = props.groups[groupIndex];
      if (!group) return null;
      const storyIndex = isActive
        ? activeStoryIndex.value
        : storiesCtrl.getLastStoryIndex(groupIndex);
      const story = group.stories[storyIndex];
      const isVideo = story?.mediaType === 'video';
      const paused = isActive && isPaused.value;

      const scope: HeaderSlotScope = {
        author: group.author,
        story: story as StoryItem,
        storyIndex,
        isPaused: paused,
        isMuted: soundState.muted.value,
        isVideo,
        groupIndex,
        isActive,
        onToggleSound: soundState.toggle,
        onTogglePause: togglePause,
        onClose: close,
      };
      return slotOr('header', scope, () =>
        h(StoryHeader, {
          author: group.author,
          createdAt: story?.createdAt,
          onClose: close,
          isPaused: paused,
          onTogglePause: togglePause,
          isMuted: soundState.muted.value,
          onToggleSound: soundState.toggle,
          isVideo,
          isLoading: isActive && loadingCtrl.isLoading.value,
          isError: isActive && loadingCtrl.isError.value,
        }),
      );
    };

    const renderProgress = () =>
      renderGroupProgress(
        activeGroupIndex.value,
        true,
        activeStoryIndex,
        timerCtrl.progress,
      );

    const renderHeader = () => renderGroupHeader(activeGroupIndex.value, true);

    const activeHeaderSignals = [
      activeGroupIndex,
      activeStoryIndex,
      isPaused,
      soundState.muted,
      loadingCtrl.isLoading,
      loadingCtrl.isError,
    ];

    const uiLayerClass = () => [
      'rk-stories-ui-layer',
      props.hideUiOnPause && longPressSignal.value
        ? 'rk-stories-ui-layer--hidden'
        : '',
    ];

    const renderGroupChrome = (groupIndex: number) =>
      h(
        Observe,
        { signals: [longPressSignal, activeGroupIndex, frozenProgress] },
        {
          default: () => {
            const isActive = activeGroupIndex.value === groupIndex;
            return h('div', { class: uiLayerClass() }, [
              isActive
                ? renderGroupProgress(
                    groupIndex,
                    true,
                    activeStoryIndex,
                    timerCtrl.progress,
                  )
                : renderGroupProgress(
                    groupIndex,
                    false,
                    createSignal(storiesCtrl.getLastStoryIndex(groupIndex)),
                    createSignal(frozenProgress.value.get(groupIndex) ?? 0),
                  ),
              h(
                Observe,
                {
                  signals: isActive ? activeHeaderSignals : [soundState.muted],
                },
                { default: () => renderGroupHeader(groupIndex, isActive) },
              ),
            ]);
          },
        },
      );

    const renderCarousel = () => {
      if (!carouselActive.value) return null;
      const slideSlot = slots['slide'];
      const groupPreviewSlot = slots['groupPreview'];

      return h(StoriesCarousel, {
        groups: props.groups,
        activeGroupIndex: activeGroupIndex.value,
        slide: slideSignal.value,
        activeSize: sizeSignal.value,
        storyIndexFor: storiesCtrl.getLastStoryIndex,
        viewedState: props.viewed?.viewedState,
        renderGroupPreview: groupPreviewSlot
          ? (scope: GroupPreviewSlotScope) => groupPreviewSlot(scope)
          : undefined,
        renderFrame: slideSlot
          ? (story: StoryItem, groupIndex: number) => {
              const scope: SlideSlotScope = {
                story,
                index: storiesCtrl.getLastStoryIndex(groupIndex),
                groupIndex,
                isActive: false,
                size: sizeSignal.value,
                activeGroupIndex,
                activeStoryIndex,
                onDurationReady: noop,
                onReady: noop,
                onWaiting: noop,
                onError: noop,
                onEnded: noop,
              };
              return slideSlot(scope);
            }
          : undefined,
        onOpen: (groupIndex: number) => storiesCtrl.goToGroup(groupIndex),
        onSlideEnd: endSlide,
      });
    };

    return () => {
      const navigationScope: NavigationSlotScope = {
        onPrevStory: () => storiesCtrl.prevStory(),
        onNextStory: () => storiesCtrl.nextStory(),
        onPrevGroup: () => storiesCtrl.prevGroup(),
        onNextGroup: () => storiesCtrl.nextGroup(),
      };
      const customNavigation = slots['navigation']?.(navigationScope);
      const hasCustomNavigation =
        !!customNavigation && hasRenderedNodes(customNavigation);

      return h(
        'div',
        {
          ref: (el: unknown) => {
            overlayEl = (el as HTMLDivElement | null) ?? null;
          },
          class: 'rk-stories-overlay',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-label': props.ariaLabel,
          tabindex: -1,
        },
        [
          h(
            SwipeToClose,
            {
              direction: 'down',
              class: 'rk-stories-swipe-wrapper',
              onClose: close,
            },
            {
              default: () => [
                hasCustomNavigation
                  ? customNavigation
                  : h(
                      NavButton,
                      {
                        label: 'Previous story',
                        onPress: () => storiesCtrl.prevStory(),
                        onLongPress: () => storiesCtrl.prevGroup(),
                      },
                      { default: () => [h(ChevronLeft, { size: 28 })] },
                    ),
                h(
                  'div',
                  {
                    class: 'rk-stories-container',
                    onContextmenu: (event: Event) => event.preventDefault(),
                  },
                  [
                    h(
                      Observe,
                      { signals: [sizeSignal, carouselActive] },
                      { default: renderOuterReel },
                    ),
                    props.chromePlacement === 'overlay'
                      ? h(
                          Observe,
                          { signals: [longPressSignal] },
                          {
                            default: () =>
                              h('div', { class: uiLayerClass() }, [
                                h(
                                  Observe,
                                  { signals: [activeGroupIndex] },
                                  { default: renderProgress },
                                ),
                                h(
                                  Observe,
                                  { signals: activeHeaderSignals },
                                  { default: renderHeader },
                                ),
                              ]),
                          },
                        )
                      : null,
                    h(
                      Observe,
                      { signals: [heartsSignal] },
                      {
                        default: () =>
                          heartsSignal.value.map((heart) =>
                            h(HeartAnimation, {
                              key: heart.id,
                              onComplete: () => removeHeart(heart.id),
                            }),
                          ),
                      },
                    ),
                  ],
                ),
                hasCustomNavigation
                  ? null
                  : h(
                      NavButton,
                      {
                        label: 'Next story',
                        onPress: () => storiesCtrl.nextStory(),
                        onLongPress: () => storiesCtrl.nextGroup(),
                      },
                      { default: () => [h(ChevronRight, { size: 28 })] },
                    ),
              ],
            },
          ),
          h(
            Observe,
            {
              signals: [
                carouselActive,
                sizeSignal,
                slideSignal,
                activeGroupIndex,
              ],
            },
            { default: renderCarousel },
          ),
        ],
      );
    };
  },
});

/**
 * Wraps the player content in the shell both overlays share: a `Teleport` to
 * the body, then the sound provider the content reads from. Written once so
 * the controlled and URL-driven overlays cannot drift.
 */
const renderPlayerShell = (content: VNode): VNode =>
  h(Teleport, { to: 'body' }, [
    h(SoundProvider, null, { default: () => [content] }),
  ]);

/**
 * Forwards the open content's API through the overlay's own template ref, so
 * a consumer keeps one ref whether or not the player is open. Calls while it
 * is closed do nothing.
 */
const useForwardedApi = (
  expose: (exposed: Record<string, unknown>) => void,
  emitApiReady: (api: StoriesApi) => void,
) => {
  const inner = shallowRef<StoriesApi | null>(null);
  const forwarded: StoriesApi = {
    nextStory: () => inner.value?.nextStory(),
    prevStory: () => inner.value?.prevStory(),
    nextGroup: () => inner.value?.nextGroup(),
    prevGroup: () => inner.value?.prevGroup(),
    goToGroup: (index) => inner.value?.goToGroup(index),
    pause: () => inner.value?.pause(),
    resume: () => inner.value?.resume(),
  };
  expose(forwarded as unknown as Record<string, unknown>);

  return {
    onApiReady: (api: StoriesApi) => {
      inner.value = api;
      emitApiReady(api);
    },
    clear: () => {
      inner.value = null;
    },
  };
};

/** Props accepted by the public {@link StoriesOverlay} component. */
const storiesOverlayProps = {
  /** When `true`, the overlay renders and body scroll is locked. */
  isOpen: { type: Boolean, required: true as const },

  ...storiesContentProps,
};

/** Public props interface for the {@link StoriesOverlay} component. */
export type StoriesOverlayProps = ExtractPropTypes<typeof storiesOverlayProps>;

/**
 * Full-screen, Instagram-style stories player overlay for Vue 3.
 *
 * Renders a `<Teleport to="body">` holding two nested `Reel` sliders: an
 * outer horizontal slider with a cube transition for group navigation, and
 * inner sliders with a fade for story-to-story navigation within each group.
 * Tap the left or right side to move between stories, swipe to change group,
 * hold to pause, double-tap for a heart, swipe down or press Escape to close.
 *
 * Controlled: bind `v-model:is-open`, or pass `is-open` and handle `close`.
 * Customize through the scoped slots `header`, `footer`, `slide`,
 * `navigation`, `progressBar`, `loading`, `error` and `groupPreview`.
 */
export const StoriesOverlay = defineComponent({
  name: 'StoriesOverlay',
  inheritAttrs: false,
  props: storiesOverlayProps,
  emits: {
    ...storiesEmits,
    // Emitted alongside `close` so the overlay can be driven through
    // `v-model:is-open`.
    'update:isOpen': (_isOpen: boolean) => true,
  },
  setup(props, { emit, slots, expose }) {
    useAttachViewedState(() => props.viewed);

    const forwardedApi = useForwardedApi(expose, (api) =>
      emit('apiReady', api),
    );

    const requestClose = () => {
      emit('close');
      emit('update:isOpen', false);
    };

    return () => {
      if (!props.isOpen) {
        forwardedApi.clear();
        return null;
      }

      const { isOpen: _isOpen, ...contentProps } = props;

      return renderPlayerShell(
        h(
          StoriesContent,
          {
            ...contentProps,
            onClose: requestClose,
            onStoryChange: (groupIndex: number, storyIndex: number) =>
              emit('storyChange', groupIndex, storyIndex),
            onGroupChange: (groupIndex: number) =>
              emit('groupChange', groupIndex),
            onStoryViewed: (groupIndex: number, storyIndex: number) =>
              emit('storyViewed', groupIndex, storyIndex),
            onStoryComplete: (groupIndex: number, storyIndex: number) =>
              emit('storyComplete', groupIndex, storyIndex),
            onDoubleTap: (groupIndex: number, storyIndex: number) =>
              emit('doubleTap', groupIndex, storyIndex),
            onPause: () => emit('pause'),
            onResume: () => emit('resume'),
            onApiReady: forwardedApi.onApiReady,
          },
          slots,
        ),
      );
    };
  },
});

/** Props accepted by the public {@link StoriesUrlOverlay} component. */
const storiesUrlOverlayProps = {
  ...storiesSharedProps,

  /**
   * URL-state controller from `useOverlayUrlState`, spread with
   * `urlIndexTwoAxisKey(...)`. Its `position` — a `{ outer, inner }` object,
   * the outer axis being the group and the inner the story within it — drives
   * whether the player is open and where it opens; the overlay writes back
   * through it on every navigation and on close.
   */
  controller: {
    type: Object as PropType<UrlStateController<TwoAxisPosition>>,
    required: true as const,
  },
};

/** Public props interface for the {@link StoriesUrlOverlay} component. */
export type StoriesUrlOverlayProps = ExtractPropTypes<
  typeof storiesUrlOverlayProps
>;

/**
 * URL-driven stories player. The address bar owns the open state: the player
 * opens when the parameter names a group and story, and closes when it clears.
 * Prefer a link on each ring as the open action — the href does it with no
 * handler, and the open is then shareable and closed by the back button.
 *
 * The position is a two-axis object, so inner (story-within-group) navigation
 * rides in the URL alongside the outer group: a single history entry covers
 * the whole session and one back step always closes. `close` is emitted after
 * the parameter is cleared. Every scoped slot of {@link StoriesOverlay} works
 * the same here.
 */
export const StoriesUrlOverlay = defineComponent({
  name: 'StoriesUrlOverlay',
  inheritAttrs: false,
  props: storiesUrlOverlayProps,
  emits: storiesEmits,
  setup(props, { emit, slots, expose }) {
    useAttachViewedState(() => props.viewed);

    const forwardedApi = useForwardedApi(expose, (api) =>
      emit('apiReady', api),
    );

    const position = toVueRef(props.controller.position);
    // Only opening and closing re-render the overlay. The position moves with
    // every story, and each of those moves would otherwise redraw the player.
    const isOpen = computed(() => position.value !== null);

    const requestClose = () => {
      props.controller.set(null);
      emit('close');
    };

    return () => {
      if (!isOpen.value) {
        forwardedApi.clear();
        return null;
      }

      // Read without tracking: the player takes its opening position once.
      const opening = props.controller.position.value ?? position.value;
      if (!opening) return null;

      const { controller, ...sharedProps } = props;

      return renderPlayerShell(
        h(
          StoriesContent,
          {
            ...sharedProps,
            initialGroupIndex: opening.outer,
            initialStoryIndex: opening.inner,
            onClose: requestClose,
            onStoryChange: (groupIndex: number, storyIndex: number) => {
              controller.set({ outer: groupIndex, inner: storyIndex });
              emit('storyChange', groupIndex, storyIndex);
            },
            onGroupChange: (groupIndex: number) =>
              emit('groupChange', groupIndex),
            onStoryViewed: (groupIndex: number, storyIndex: number) =>
              emit('storyViewed', groupIndex, storyIndex),
            onStoryComplete: (groupIndex: number, storyIndex: number) =>
              emit('storyComplete', groupIndex, storyIndex),
            onDoubleTap: (groupIndex: number, storyIndex: number) =>
              emit('doubleTap', groupIndex, storyIndex),
            onPause: () => emit('pause'),
            onResume: () => emit('resume'),
            onApiReady: forwardedApi.onApiReady,
          },
          slots,
        ),
      );
    };
  },
});
