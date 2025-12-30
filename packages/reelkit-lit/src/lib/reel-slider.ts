import { LitElement, html, css, PropertyValues, TemplateResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import {
  createSliderController,
  animate,
  type SliderController,
  type SliderDirection,
  type RangeExtractor,
} from '@reelkit/core';

/**
 * Reel slider Web Component
 *
 * @slot - Default slot for slide content (use slot="slide" with data-index attribute)
 *
 * @fires reel-change - Fired after slide change completes
 * @fires reel-before-change - Fired before slide change starts
 * @fires reel-drag-start - Fired when drag gesture starts
 * @fires reel-drag-end - Fired when drag gesture ends
 * @fires reel-drag-canceled - Fired when drag is canceled
 */
@customElement('reel-slider')
export class ReelSlider extends LitElement {
  static override styles = css`
    :host {
      display: block;
      overflow: hidden;
      position: relative;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }

    .track {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      transform: translate3d(0, 0, 0);
    }

    .track.horizontal {
      flex-direction: row;
    }

    .track.vertical {
      flex-direction: column;
    }

    .slide-wrapper {
      flex-shrink: 0;
      box-sizing: border-box;
    }
  `;

  /** Total items count */
  @property({ type: Number })
  count = 0;

  /** Slider direction */
  @property({ type: String })
  direction: SliderDirection = 'vertical';

  /** Initial slide index */
  @property({ type: Number, attribute: 'initial-index' })
  initialIndex = 0;

  /** Enable loop mode */
  @property({ type: Boolean })
  loop = false;

  /** Transition duration in milliseconds */
  @property({ type: Number, attribute: 'transition-duration' })
  transitionDuration = 300;

  /** Swipe distance factor (0-1) to trigger slide change */
  @property({ type: Number, attribute: 'swipe-distance-factor' })
  swipeDistanceFactor = 0.12;

  /** Enable touch/mouse gestures */
  @property({ type: Boolean, attribute: 'enable-gestures' })
  enableGestures = true;

  /** Enable keyboard navigation */
  @property({ type: Boolean, attribute: 'enable-keyboard' })
  enableKeyboard = true;

  /** Custom range extractor for virtualization */
  @property({ attribute: false })
  rangeExtractor?: RangeExtractor;

  /** Item builder function (called with index, returns TemplateResult) */
  @property({ attribute: false })
  itemBuilder?: (index: number) => TemplateResult;

  @state()
  private _indexes: number[] = [];

  @state()
  private _transformValue = 0;

  @query('.track')
  private _trackElement!: HTMLDivElement;

  private _controller: SliderController | null = null;
  private _disposers: (() => void)[] = [];
  private _cancelAnimation: (() => void) | null = null;
  private _resizeObserver: ResizeObserver | null = null;
  private _initialized = false;

  /** Current slide index */
  get index(): number {
    return this._controller?.state.index.value ?? 0;
  }

  /** Currently visible slide indexes */
  get indexes(): number[] {
    return this._indexes;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    // Initialize after first render when we have dimensions
    this.updateComplete.then(() => {
      this._tryInitController();
    });
  }

  private _tryInitController(): void {
    if (this._initialized) return;

    const primarySize = this._getPrimarySize();
    if (primarySize <= 0) {
      // Element has no dimensions yet, use ResizeObserver to wait
      const observer = new ResizeObserver(() => {
        const size = this._getPrimarySize();
        if (size > 0) {
          observer.disconnect();
          this._initController();
        }
      });
      observer.observe(this);
      return;
    }

    this._initController();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._destroyController();
  }

  protected override updated(changedProps: PropertyValues): void {
    super.updated(changedProps);

    // Reinitialize controller when critical props change
    if (
      this._initialized &&
      (changedProps.has('count') ||
        changedProps.has('direction') ||
        changedProps.has('loop') ||
        changedProps.has('transitionDuration') ||
        changedProps.has('swipeDistanceFactor') ||
        changedProps.has('rangeExtractor'))
    ) {
      this._destroyController();
      this._initController();
    }

    // Update gesture/keyboard observation
    if (changedProps.has('enableGestures') || changedProps.has('enableKeyboard')) {
      if (this._controller) {
        if (this.enableGestures || this.enableKeyboard) {
          this._controller.observe();
        } else {
          this._controller.unobserve();
        }
      }
    }
  }

  private _initController(): void {
    if (this.count <= 0) return;

    const primarySize = this._getPrimarySize();
    if (primarySize <= 0) {
      // Should not happen since _tryInitController waits for dimensions
      return;
    }

    this._controller = createSliderController(
      {
        count: this.count,
        initialIndex: this.initialIndex,
        direction: this.direction,
        loop: this.loop,
        transitionDuration: this.transitionDuration,
        swipeDistanceFactor: this.swipeDistanceFactor,
        rangeExtractor: this.rangeExtractor,
      },
      {
        onBeforeChange: (index, nextIndex) => {
          this.dispatchEvent(
            new CustomEvent('reel-before-change', {
              detail: { index, nextIndex },
              bubbles: true,
              composed: true,
            })
          );
        },
        onAfterChange: (index) => {
          this.dispatchEvent(
            new CustomEvent('reel-change', {
              detail: { index },
              bubbles: true,
              composed: true,
            })
          );
        },
        onDragStart: (index) => {
          this.dispatchEvent(
            new CustomEvent('reel-drag-start', {
              detail: { index },
              bubbles: true,
              composed: true,
            })
          );
        },
        onDragEnd: () => {
          this.dispatchEvent(
            new CustomEvent('reel-drag-end', {
              bubbles: true,
              composed: true,
            })
          );
        },
        onDragCanceled: (index) => {
          this.dispatchEvent(
            new CustomEvent('reel-drag-canceled', {
              detail: { index },
              bubbles: true,
              composed: true,
            })
          );
        },
      }
    );

    this._controller.setPrimarySize(primarySize);

    // Subscribe to state changes
    this._disposers.push(
      this._controller.state.indexes.observe(() => {
        this._indexes = [...this._controller!.state.indexes.value];
      })
    );

    // Sync initial state (observer doesn't fire for initial value)
    this._indexes = [...this._controller.state.indexes.value];

    this._disposers.push(
      this._controller.state.axisValue.observe(() => {
        this._updateTransform();
      })
    );

    // Sync initial transform after render completes (track element must exist)
    this.updateComplete.then(() => {
      this._updateTransform();
    });

    // Setup resize observer
    this._setupResizeObserver();

    // Attach to host element
    this._controller.attach(this);

    // Start observing
    if (this.enableGestures || this.enableKeyboard) {
      this._controller.observe();
    }

    this._initialized = true;
  }

  private _destroyController(): void {
    if (this._cancelAnimation) {
      this._cancelAnimation();
      this._cancelAnimation = null;
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    this._disposers.forEach((dispose) => dispose());
    this._disposers = [];

    if (this._controller) {
      this._controller.dispose();
      this._controller = null;
    }

    this._initialized = false;
    this._indexes = [];
  }

  private _getPrimarySize(): number {
    return this.direction === 'horizontal' ? this.clientWidth : this.clientHeight;
  }

  private _updateTransform(): void {
    if (!this._controller) return;

    const { value, duration, done } = this._controller.state.axisValue.value;

    // Cancel any in-progress animation
    if (this._cancelAnimation) {
      this._cancelAnimation();
      this._cancelAnimation = null;
    }

    if (duration > 0) {
      const currentValue = this._transformValue;

      this._cancelAnimation = animate({
        from: currentValue,
        to: value,
        duration,
        onUpdate: (v) => {
          this._transformValue = v;
          this.requestUpdate();
        },
        onComplete: () => {
          this._cancelAnimation = null;
          if (done) {
            setTimeout(() => done(), 0);
          }
        },
      });
      return;
    }

    // Instant update
    this._transformValue = value;
    this.requestUpdate();

    if (done) {
      setTimeout(() => done(), 0);
    }
  }

  private _setupResizeObserver(): void {
    this._resizeObserver = new ResizeObserver(() => {
      if (this._controller) {
        const primarySize = this._getPrimarySize();
        this._controller.setPrimarySize(primarySize);
        this._controller.adjust();
        this.requestUpdate();
      }
    });

    this._resizeObserver.observe(this);
  }

  /** Navigate to next slide */
  next(): Promise<void> {
    return this._controller?.next() ?? Promise.resolve();
  }

  /** Navigate to previous slide */
  prev(): Promise<void> {
    return this._controller?.prev() ?? Promise.resolve();
  }

  /** Navigate to specific slide */
  goTo(index: number, animated = false): Promise<void> {
    return this._controller?.goTo(index, animated) ?? Promise.resolve();
  }

  /** Adjust position after resize */
  adjust(): void {
    this._controller?.adjust();
  }

  /** Start observing gestures and keyboard */
  observe(): void {
    this._controller?.observe();
  }

  /** Stop observing gestures and keyboard */
  unobserve(): void {
    this._controller?.unobserve();
  }

  protected override render() {
    const width = this.clientWidth;
    const height = this.clientHeight;
    const isHorizontal = this.direction === 'horizontal';

    const trackSize = this._indexes.length * (isHorizontal ? width : height);
    const transform = isHorizontal
      ? `translate3d(${this._transformValue}px, 0, 0)`
      : `translate3d(0, ${this._transformValue}px, 0)`;
    const trackStyle = isHorizontal
      ? `width: ${trackSize}px; height: 100%; transform: ${transform};`
      : `width: 100%; height: ${trackSize}px; transform: ${transform};`;

    return html`
      <div class="track ${this.direction}" style=${trackStyle}>
        ${this._indexes.map(
          (dataIndex) => html`
            <div
              class="slide-wrapper"
              data-reel-index=${dataIndex}
              style="width: ${width}px; height: ${height}px;"
            >
              ${this.itemBuilder ? this.itemBuilder(dataIndex) : html`<slot name="slide-${dataIndex}"></slot>`}
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reel-slider': ReelSlider;
  }
}
