import {
  createSliderController,
  animate,
  type SliderController,
  type SliderDirection,
  type RangeExtractor,
} from '@reelkit/core';

export type ItemBuilder = (index: number) => HTMLElement;

export interface ReelSliderEvents {
  onChange?: (index: number) => void;
  onBeforeChange?: (index: number, nextIndex: number) => void;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDragCanceled?: (index: number) => void;
}

/**
 * Web Component for a full-screen vertical/horizontal slider with virtualization.
 *
 * @example
 * ```html
 * <reel-slider count="100" direction="vertical"></reel-slider>
 * <script>
 *   const slider = document.querySelector('reel-slider');
 *   slider.itemBuilder = (index) => {
 *     const div = document.createElement('div');
 *     div.textContent = `Slide ${index + 1}`;
 *     return div;
 *   };
 * </script>
 * ```
 *
 * @fires reel-change - Fired when slide changes, detail: { index: number }
 * @fires reel-before-change - Fired before slide changes, detail: { index: number, nextIndex: number }
 */
export class ReelSlider extends HTMLElement {
  static get observedAttributes() {
    return [
      'count',
      'direction',
      'initial-index',
      'loop',
      'transition-duration',
      'swipe-distance-factor',
      'enable-gestures',
      'enable-keyboard',
      'enable-wheel',
      'wheel-debounce-ms',
    ];
  }

  private controller: SliderController | null = null;
  private trackElement: HTMLElement | null = null;
  private disposers: (() => void)[] = [];
  private cancelAnimation: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private renderedIndexes: number[] = [];
  private _itemBuilder: ItemBuilder | null = null;
  private _rangeExtractor: RangeExtractor | undefined;
  private _events: ReelSliderEvents = {};
  private initialized = false;

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.initialized) {
      this.initialize();
    }
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue === newValue) return;

    // If already initialized and count changes, reinitialize
    if (this.initialized && name === 'count') {
      this.cleanup();
      this.initialize();
    }
  }

  private initialize() {
    const count = this.getCount();
    if (count === 0 || !this._itemBuilder) {
      // Wait for itemBuilder to be set
      return;
    }

    this.setupContainerStyles();
    this.createTrackElement();
    this.createController();
    this.subscribeToState();
    this.setupResizeObserver();

    this.controller!.attach(this);

    if (this.enableGestures || this.enableKeyboard) {
      this.controller!.observe();
    }

    this.initialized = true;
  }

  private cleanup() {
    if (this.cancelAnimation) {
      this.cancelAnimation();
      this.cancelAnimation = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.disposers.forEach((dispose) => dispose());
    this.disposers = [];

    if (this.controller) {
      this.controller.dispose();
      this.controller = null;
    }

    if (this.trackElement) {
      this.trackElement.remove();
      this.trackElement = null;
    }

    this.renderedIndexes = [];
    this.initialized = false;
  }

  private setupContainerStyles() {
    this.style.display = 'block';
    this.style.overflow = 'hidden';
    this.style.position = 'relative';
    this.style.userSelect = 'none';
    this.style.setProperty('-webkit-user-select', 'none');
    this.style.touchAction = 'none';
  }

  private createTrackElement() {
    this.trackElement = document.createElement('div');
    this.trackElement.style.position = 'absolute';
    this.trackElement.style.top = '0';
    this.trackElement.style.left = '0';
    this.trackElement.style.display = 'flex';
    this.trackElement.style.flexDirection = this.isHorizontal ? 'row' : 'column';
    this.trackElement.style.transform = 'translate3d(0, 0, 0)';
    this.appendChild(this.trackElement);
  }

  private createController() {
    this.controller = createSliderController(
      {
        count: this.getCount(),
        initialIndex: this.initialIndex,
        direction: this.direction,
        loop: this.loop,
        transitionDuration: this.transitionDuration,
        swipeDistanceFactor: this.swipeDistanceFactor,
        rangeExtractor: this._rangeExtractor,
        enableWheel: this.enableWheel,
        wheelDebounceMs: this.wheelDebounceMs,
      },
      {
        onBeforeChange: (index, nextIndex) => {
          this._events.onBeforeChange?.(index, nextIndex);
          this.dispatchEvent(
            new CustomEvent('reel-before-change', {
              detail: { index, nextIndex },
              bubbles: true,
            })
          );
        },
        onAfterChange: (index) => {
          this._events.onChange?.(index);
          this.dispatchEvent(
            new CustomEvent('reel-change', {
              detail: { index },
              bubbles: true,
            })
          );
        },
        onDragStart: (index) => {
          this._events.onDragStart?.(index);
        },
        onDragEnd: () => {
          this._events.onDragEnd?.();
        },
        onDragCanceled: (index) => {
          this._events.onDragCanceled?.(index);
        },
      }
    );

    this.controller.setPrimarySize(this.primarySize);
  }

  private subscribeToState() {
    if (!this.controller) return;

    this.disposers.push(
      this.controller.state.indexes.observe(() => {
        this.renderSlides();
      })
    );

    this.disposers.push(
      this.controller.state.axisValue.observe(() => {
        this.updateTransform();
      })
    );
  }

  private renderSlides() {
    if (!this.controller || !this.trackElement || !this._itemBuilder) return;

    const indexes = this.controller.state.indexes.value;

    if (
      indexes.length === this.renderedIndexes.length &&
      indexes.every((idx, i) => idx === this.renderedIndexes[i])
    ) {
      return;
    }

    this.renderedIndexes = [...indexes];
    this.trackElement.innerHTML = '';

    const width = this.clientWidth;
    const height = this.clientHeight;

    indexes.forEach((dataIndex) => {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('data-reel-index', String(dataIndex));
      wrapper.style.width = `${width}px`;
      wrapper.style.height = `${height}px`;
      wrapper.style.flexShrink = '0';

      const content = this._itemBuilder!(dataIndex);
      wrapper.appendChild(content);

      this.trackElement!.appendChild(wrapper);
    });

    const trackSize = indexes.length * (this.isHorizontal ? width : height);
    if (this.isHorizontal) {
      this.trackElement.style.width = `${trackSize}px`;
      this.trackElement.style.height = '100%';
    } else {
      this.trackElement.style.width = '100%';
      this.trackElement.style.height = `${trackSize}px`;
    }
  }

  private updateTransform() {
    if (!this.controller || !this.trackElement) return;

    const { value, duration, done } = this.controller.state.axisValue.value;

    if (this.cancelAnimation) {
      this.cancelAnimation();
      this.cancelAnimation = null;
    }

    if (duration > 0) {
      const currentValue = this.getCurrentTransformValue();

      this.cancelAnimation = animate({
        from: currentValue,
        to: value,
        duration,
        onUpdate: (v) => {
          if (this.trackElement) {
            this.trackElement.style.transform = this.isHorizontal
              ? `translate3d(${v}px, 0, 0)`
              : `translate3d(0, ${v}px, 0)`;
          }
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

    this.trackElement.style.transform = this.isHorizontal
      ? `translate3d(${value}px, 0, 0)`
      : `translate3d(0, ${value}px, 0)`;

    if (done) {
      setTimeout(() => done(), 0);
    }
  }

  private getCurrentTransformValue(): number {
    if (!this.trackElement) return 0;

    const transform = this.trackElement.style.transform;
    const match = transform.match(/translate3d\(([^,]+)(?:px)?, ([^,]+)(?:px)?/);

    if (match) {
      return parseFloat(this.isHorizontal ? match[1] : match[2]) || 0;
    }

    return 0;
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.controller) {
        this.controller.setPrimarySize(this.primarySize);
        this.renderSlides();
        this.controller.adjust();
      }
    });

    this.resizeObserver.observe(this);
  }

  // Getters for attributes
  private getCount(): number {
    return parseInt(this.getAttribute('count') || '0', 10);
  }

  private get isHorizontal(): boolean {
    return this.direction === 'horizontal';
  }

  private get primarySize(): number {
    return this.isHorizontal ? this.clientWidth : this.clientHeight;
  }

  get direction(): SliderDirection {
    return (this.getAttribute('direction') as SliderDirection) || 'vertical';
  }

  set direction(value: SliderDirection) {
    this.setAttribute('direction', value);
  }

  get initialIndex(): number {
    return parseInt(this.getAttribute('initial-index') || '0', 10);
  }

  set initialIndex(value: number) {
    this.setAttribute('initial-index', String(value));
  }

  get loop(): boolean {
    return this.hasAttribute('loop');
  }

  set loop(value: boolean) {
    if (value) {
      this.setAttribute('loop', '');
    } else {
      this.removeAttribute('loop');
    }
  }

  get transitionDuration(): number {
    return parseInt(this.getAttribute('transition-duration') || '300', 10);
  }

  set transitionDuration(value: number) {
    this.setAttribute('transition-duration', String(value));
  }

  get swipeDistanceFactor(): number {
    return parseFloat(this.getAttribute('swipe-distance-factor') || '0.12');
  }

  set swipeDistanceFactor(value: number) {
    this.setAttribute('swipe-distance-factor', String(value));
  }

  get enableGestures(): boolean {
    return !this.hasAttribute('disable-gestures');
  }

  set enableGestures(value: boolean) {
    if (value) {
      this.removeAttribute('disable-gestures');
    } else {
      this.setAttribute('disable-gestures', '');
    }
  }

  get enableKeyboard(): boolean {
    return !this.hasAttribute('disable-keyboard');
  }

  set enableKeyboard(value: boolean) {
    if (value) {
      this.removeAttribute('disable-keyboard');
    } else {
      this.setAttribute('disable-keyboard', '');
    }
  }

  get enableWheel(): boolean {
    return this.hasAttribute('enable-wheel');
  }

  set enableWheel(value: boolean) {
    if (value) {
      this.setAttribute('enable-wheel', '');
    } else {
      this.removeAttribute('enable-wheel');
    }
  }

  get wheelDebounceMs(): number {
    return parseInt(this.getAttribute('wheel-debounce-ms') || '200', 10);
  }

  set wheelDebounceMs(value: number) {
    this.setAttribute('wheel-debounce-ms', String(value));
  }

  // Public API

  /** Set the item builder function (required before rendering) */
  set itemBuilder(builder: ItemBuilder) {
    this._itemBuilder = builder;
    if (!this.initialized && this.isConnected) {
      this.initialize();
    } else if (this.initialized) {
      this.renderSlides();
    }
  }

  get itemBuilder(): ItemBuilder | null {
    return this._itemBuilder;
  }

  /** Set custom range extractor for virtualization */
  set rangeExtractor(extractor: RangeExtractor | undefined) {
    this._rangeExtractor = extractor;
  }

  /** Set event handlers */
  set events(handlers: ReelSliderEvents) {
    this._events = handlers;
  }

  /** Current slide index */
  get index(): number {
    return this.controller?.state.index.value ?? 0;
  }

  /** Currently visible slide indexes */
  get indexes(): number[] {
    return this.controller?.state.indexes.value ?? [];
  }

  /** Navigate to next slide */
  next(): Promise<void> {
    return this.controller?.next() ?? Promise.resolve();
  }

  /** Navigate to previous slide */
  prev(): Promise<void> {
    return this.controller?.prev() ?? Promise.resolve();
  }

  /** Navigate to specific slide */
  goTo(index: number, animated = false): Promise<void> {
    return this.controller?.goTo(index, animated) ?? Promise.resolve();
  }

  /** Adjust position after resize */
  adjust(): void {
    this.controller?.adjust();
  }

  /** Start observing gestures and keyboard */
  observe(): void {
    this.controller?.observe();
  }

  /** Stop observing gestures and keyboard */
  unobserve(): void {
    this.controller?.unobserve();
  }
}

// Register the custom element
if (typeof customElements !== 'undefined' && !customElements.get('reel-slider')) {
  customElements.define('reel-slider', ReelSlider);
}
