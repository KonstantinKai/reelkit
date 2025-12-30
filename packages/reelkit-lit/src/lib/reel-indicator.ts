import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { type SliderDirection } from '@reelkit/core';

/**
 * Instagram-style indicator Web Component with scrolling dots.
 * - Shows `visible` normal-sized dots
 * - Adds 1 small dot at start if there are more items before
 * - Adds 1 small dot at end if there are more items after
 * - Slides when navigating to edge dots
 *
 * @fires reel-indicator-click - Fired when a dot is clicked
 */
@customElement('reel-indicator')
export class ReelIndicator extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      overflow: hidden;
    }

    .dot-wrapper {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: top 0.2s ease, left 0.2s ease;
    }

    .dot {
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s ease, background-color 0.2s ease;
      flex-shrink: 0;
    }
  `;

  /** Total number of items */
  @property({ type: Number })
  count = 0;

  /** Active index */
  @property({ type: Number, attribute: 'active-index' })
  activeIndex = 0;

  /** Indicator direction */
  @property({ type: String, reflect: true })
  direction: SliderDirection = 'vertical';

  /** Number of normal-sized visible dots */
  @property({ type: Number })
  visible = 5;

  /** Dot radius in pixels */
  @property({ type: Number })
  radius = 3;

  /** Gap between dots in pixels */
  @property({ type: Number })
  gap = 4;

  /** Scale for edge dots (0-1) */
  @property({ type: Number, attribute: 'edge-scale' })
  edgeScale = 0.5;

  /** Active dot color */
  @property({ type: String, attribute: 'active-color' })
  activeColor = '#fff';

  /** Inactive dot color */
  @property({ type: String, attribute: 'inactive-color' })
  inactiveColor = 'rgba(255, 255, 255, 0.5)';

  @state()
  private _windowStart = 0;

  protected override willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);

    if (changedProps.has('activeIndex') || changedProps.has('count') || changedProps.has('visible')) {
      this._updateWindowStart();
    }
  }

  private _updateWindowStart(): void {
    if (this.count <= this.visible) {
      this._windowStart = 0;
      return;
    }

    const prev = this._windowStart;

    // If active is before the window (on the small leading dot)
    if (this.activeIndex < prev) {
      this._windowStart = Math.max(0, this.activeIndex);
      return;
    }

    // If active is after the window (on the small trailing dot)
    if (this.activeIndex >= prev + this.visible) {
      this._windowStart = Math.min(this.count - this.visible, this.activeIndex - this.visible + 1);
      return;
    }
  }

  /** Set the active dot index programmatically */
  setActive(index: number): void {
    if (index >= 0 && index < this.count) {
      this.activeIndex = index;
    }
  }

  private _handleClick(index: number): void {
    this.dispatchEvent(
      new CustomEvent('reel-indicator-click', {
        detail: { index },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected override render() {
    const dotSize = this.radius * 2;
    const itemSize = dotSize + this.gap;
    const isVertical = this.direction === 'vertical';

    const windowEnd = Math.min(this._windowStart + this.visible, this.count);
    const hasLeadingSmall = this._windowStart > 0;

    // Calculate container size - fixed size with space for both edge dots
    const normalDotsCount = Math.min(this.visible, this.count);
    let containerSize = normalDotsCount * itemSize;
    if (this.count > this.visible) {
      // Always reserve space for both edge dots to prevent size jumping
      containerSize += itemSize * 2;
    }

    // Render from (windowStart - 1) to (windowEnd + 1) to ensure smooth transitions
    const renderStart = Math.max(0, this._windowStart - 1);
    const renderEnd = Math.min(this.count, windowEnd + 1);

    const dots = [];

    for (let i = renderStart; i < renderEnd; i++) {
      const isActive = i === this.activeIndex;

      // Determine dot scale based on position relative to window
      let scale = 1;
      if (i < this._windowStart) {
        scale = this.edgeScale;
      } else if (i >= windowEnd) {
        scale = this.edgeScale;
      }

      // Calculate slot index for this dot
      let slotIndex: number;
      if (i < this._windowStart) {
        // Leading edge dot - always slot 0
        slotIndex = 0;
      } else if (i >= windowEnd) {
        // Trailing edge dot - last slot
        slotIndex = this.visible + 1;
      } else {
        // Visible dot - slots 1 to visible
        slotIndex = (i - this._windowStart) + 1;
      }

      // If no leading small, shift all visible and trailing left by 1
      if (!hasLeadingSmall && slotIndex > 0) {
        slotIndex -= 1;
      }

      const position = slotIndex * itemSize;

      dots.push(html`
        <span
          class="dot-wrapper"
          style="
            ${isVertical ? 'top' : 'left'}: ${position}px;
            ${isVertical ? 'left' : 'top'}: 0;
            width: ${itemSize}px;
            height: ${itemSize}px;
          "
        >
          <span
            class="dot"
            data-reel-indicator=${i}
            style="
              width: ${dotSize}px;
              height: ${dotSize}px;
              background-color: ${isActive ? this.activeColor : this.inactiveColor};
              transform: scale(${scale});
            "
            @click=${() => this._handleClick(i)}
          ></span>
        </span>
      `);
    }

    return html`
      <style>
        :host {
          ${isVertical ? `height: ${containerSize}px; width: ${itemSize}px;` : `width: ${containerSize}px; height: ${itemSize}px;`}
        }
      </style>
      ${dots}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'reel-indicator': ReelIndicator;
  }
}
