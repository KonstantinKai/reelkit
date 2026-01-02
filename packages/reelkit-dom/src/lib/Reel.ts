import {
  createSliderController,
  animate,
  type SliderController,
} from '@reelkit/core';
import type { ReelConfig, ReelEvents } from './types';

export class Reel {
  private controller: SliderController;
  private element: HTMLElement;
  private trackElement: HTMLElement;
  private config: Required<Omit<ReelConfig, 'rangeExtractor'>> & Pick<ReelConfig, 'rangeExtractor'>;
  private events: ReelEvents;
  private disposers: (() => void)[] = [];
  private cancelAnimation: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private renderedIndexes: number[] = [];

  constructor(config: ReelConfig, events: ReelEvents = {}) {
    this.element = config.element;
    this.events = events;

    // Merge with defaults
    this.config = {
      element: config.element,
      count: config.count,
      itemBuilder: config.itemBuilder,
      direction: config.direction ?? 'vertical',
      initialIndex: config.initialIndex ?? 0,
      loop: config.loop ?? false,
      transitionDuration: config.transitionDuration ?? 300,
      swipeDistanceFactor: config.swipeDistanceFactor ?? 0.12,
      enableGestures: config.enableGestures ?? true,
      enableKeyboard: config.enableKeyboard ?? true,
      enableWheel: config.enableWheel ?? false,
      wheelDebounceMs: config.wheelDebounceMs ?? 200,
      rangeExtractor: config.rangeExtractor,
    };

    // Setup container styles
    this.setupContainerStyles();

    // Create track element
    this.trackElement = document.createElement('div');
    this.setupTrackStyles();
    this.element.appendChild(this.trackElement);

    // Create slider controller
    this.controller = createSliderController(
      {
        count: this.config.count,
        initialIndex: this.config.initialIndex,
        direction: this.config.direction,
        loop: this.config.loop,
        transitionDuration: this.config.transitionDuration,
        swipeDistanceFactor: this.config.swipeDistanceFactor,
        rangeExtractor: this.config.rangeExtractor,
        enableWheel: this.config.enableWheel,
        wheelDebounceMs: this.config.wheelDebounceMs,
      },
      {
        onBeforeChange: (index, nextIndex) => {
          this.events.onBeforeChange?.(index, nextIndex);
        },
        onAfterChange: (index) => {
          this.events.onChange?.(index);
        },
        onDragStart: (index) => {
          this.events.onDragStart?.(index);
        },
        onDragEnd: () => {
          this.events.onDragEnd?.();
        },
        onDragCanceled: (index) => {
          this.events.onDragCanceled?.(index);
        },
      }
    );

    // Set primary size
    this.updatePrimarySize();

    // Subscribe to state changes
    this.subscribeToState();

    // Setup resize observer
    this.setupResizeObserver();

    // Attach controller to element
    this.controller.attach(this.element);

    // Start observing if enabled
    if (this.config.enableGestures || this.config.enableKeyboard) {
      this.controller.observe();
    }
  }

  private setupContainerStyles(): void {
    this.element.style.overflow = 'hidden';
    this.element.style.position = 'relative';
    this.element.style.userSelect = 'none';
    this.element.style.setProperty('-webkit-user-select', 'none');
    this.element.style.touchAction = 'none';
  }

  private setupTrackStyles(): void {
    const isHorizontal = this.config.direction === 'horizontal';

    this.trackElement.style.position = 'absolute';
    this.trackElement.style.top = '0';
    this.trackElement.style.left = '0';
    this.trackElement.style.display = 'flex';
    this.trackElement.style.flexDirection = isHorizontal ? 'row' : 'column';
    this.trackElement.style.transform = 'translate3d(0, 0, 0)';
  }

  private updatePrimarySize(): void {
    const isHorizontal = this.config.direction === 'horizontal';
    const primarySize = isHorizontal
      ? this.element.clientWidth
      : this.element.clientHeight;

    this.controller.setPrimarySize(primarySize);
  }

  private subscribeToState(): void {
    // Subscribe to indexes changes
    this.disposers.push(
      this.controller.state.indexes.observe(() => {
        this.renderSlides();
      })
    );

    // Subscribe to axis value changes
    this.disposers.push(
      this.controller.state.axisValue.observe(() => {
        this.updateTransform();
      })
    );
  }

  private renderSlides(): void {
    const indexes = this.controller.state.indexes.value;

    // Check if indexes actually changed
    if (
      indexes.length === this.renderedIndexes.length &&
      indexes.every((idx, i) => idx === this.renderedIndexes[i])
    ) {
      return;
    }

    this.renderedIndexes = [...indexes];

    // Clear existing slides
    this.trackElement.innerHTML = '';

    // Get dimensions
    const isHorizontal = this.config.direction === 'horizontal';
    const width = this.element.clientWidth;
    const height = this.element.clientHeight;

    // Create slide wrappers
    indexes.forEach((dataIndex) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-reel-index', String(dataIndex));
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
      wrapper.style.flexShrink = '0';

      // Call itemBuilder to get slide content
      const content = this.config.itemBuilder(dataIndex);
      wrapper.appendChild(content);

      this.trackElement.appendChild(wrapper);
    });

    // Update track size
    const trackSize = indexes.length * (isHorizontal ? width : height);
    if (isHorizontal) {
      this.trackElement.style.width = `${trackSize}px`;
      this.trackElement.style.height = '100%';
    } else {
      this.trackElement.style.width = '100%';
      this.trackElement.style.height = `${trackSize}px`;
    }
  }

  private updateTransform(): void {
    const { value, duration, done } = this.controller.state.axisValue.value;
    const isHorizontal = this.config.direction === 'horizontal';

    // Cancel any in-progress animation
    if (this.cancelAnimation) {
      this.cancelAnimation();
      this.cancelAnimation = null;
    }

    if (duration > 0) {
      // Get current transform value
      const currentValue = this.getCurrentTransformValue();

      // Animate to new value
      this.cancelAnimation = animate({
        from: currentValue,
        to: value,
        duration,
        onUpdate: (v) => {
          this.trackElement.style.transform = isHorizontal
            ? `translate3d(${v}px, 0, 0)`
            : `translate3d(0, ${v}px, 0)`;
        },
        onComplete: () => {
          this.cancelAnimation = null;
          if (done) {
            setTimeout(() => done(), 0);
          }
        },
      });
      return;
    }

    // Instant update
    this.trackElement.style.transform = isHorizontal
      ? `translate3d(${value}px, 0, 0)`
      : `translate3d(0, ${value}px, 0)`;

    if (done) {
      setTimeout(() => done(), 0);
    }
  }

  private getCurrentTransformValue(): number {
    const transform = this.trackElement.style.transform;
    const match = transform.match(/translate3d\(([^,]+)(?:px)?, ([^,]+)(?:px)?/);

    if (match) {
      const isHorizontal = this.config.direction === 'horizontal';
      return parseFloat(isHorizontal ? match[1] : match[2]) || 0;
    }

    return 0;
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.updatePrimarySize();
      this.renderSlides();
      this.controller.adjust();
    });

    this.resizeObserver.observe(this.element);
  }

  /** Current slide index */
  get index(): number {
    return this.controller.state.index.value;
  }

  /** Currently visible slide indexes */
  get indexes(): number[] {
    return this.controller.state.indexes.value;
  }

  /** Navigate to next slide */
  next(): Promise<void> {
    return this.controller.next();
  }

  /** Navigate to previous slide */
  prev(): Promise<void> {
    return this.controller.prev();
  }

  /** Navigate to specific slide */
  goTo(index: number, animated = false): Promise<void> {
    return this.controller.goTo(index, animated);
  }

  /** Adjust position after resize */
  adjust(): void {
    this.controller.adjust();
  }

  /** Start observing gestures and keyboard */
  observe(): void {
    this.controller.observe();
  }

  /** Stop observing gestures and keyboard */
  unobserve(): void {
    this.controller.unobserve();
  }

  /** Cleanup and destroy instance */
  destroy(): void {
    // Cancel animation
    if (this.cancelAnimation) {
      this.cancelAnimation();
      this.cancelAnimation = null;
    }

    // Disconnect resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Call disposers
    this.disposers.forEach((dispose) => dispose());
    this.disposers = [];

    // Dispose controller
    this.controller.dispose();

    // Remove track element
    this.trackElement.remove();
  }
}
