import { clamp } from '@reelkit/core';
import type { ReelIndicatorConfig } from './types';

interface RequiredConfig {
  element: HTMLElement;
  count: number;
  activeIndex: number;
  direction: 'horizontal' | 'vertical';
  visible: number;
  radius: number;
  gap: number;
  edgeScale: number;
  activeColor: string;
  inactiveColor: string;
}

/**
 * Instagram-style indicator with scrolling dots.
 * - Shows `visible` normal-sized dots
 * - Adds 1 small dot at start if there are more items before
 * - Adds 1 small dot at end if there are more items after
 * - Slides when navigating to edge dots with smooth animation
 */
export class ReelIndicator {
  private element: HTMLElement;
  private config: RequiredConfig;
  private activeIndex: number;
  private windowStart: number;
  private clickHandler: ((index: number) => void) | null = null;
  private boundClickHandler: ((e: Event) => void) | null = null;

  constructor(config: ReelIndicatorConfig) {
    this.element = config.element;
    this.activeIndex = config.activeIndex ?? 0;

    // Merge with defaults
    this.config = {
      element: config.element,
      count: config.count,
      activeIndex: this.activeIndex,
      direction: config.direction ?? 'vertical',
      visible: config.visible ?? 5,
      radius: config.radius ?? 3,
      gap: config.gap ?? 4,
      edgeScale: config.edgeScale ?? 0.5,
      activeColor: config.activeColor ?? '#fff',
      inactiveColor: config.inactiveColor ?? 'rgba(255, 255, 255, 0.5)',
    };

    // Initialize window start
    if (this.config.count <= this.config.visible) {
      this.windowStart = 0;
    } else {
      this.windowStart = clamp(
        this.activeIndex - Math.floor(this.config.visible / 2),
        0,
        this.config.count - this.config.visible
      );
    }

    this.setupContainer();
    this.render();
  }

  private setupContainer(): void {
    const isVertical = this.config.direction === 'vertical';
    const dotSize = this.config.radius * 2;
    const itemSize = dotSize + this.config.gap;

    // Calculate container size
    const normalDotsCount = Math.min(this.config.visible, this.config.count);
    let containerSize = normalDotsCount * itemSize;
    if (this.config.count > this.config.visible) {
      // Reserve space for both edge dots
      containerSize += itemSize * 2;
    }

    this.element.style.position = 'relative';
    this.element.style.overflow = 'hidden';

    if (isVertical) {
      this.element.style.height = `${containerSize}px`;
      this.element.style.width = `${itemSize}px`;
    } else {
      this.element.style.width = `${containerSize}px`;
      this.element.style.height = `${itemSize}px`;
    }
  }

  private updateWindowStart(): void {
    if (this.config.count <= this.config.visible) {
      this.windowStart = 0;
      return;
    }

    // If active is before the window
    if (this.activeIndex < this.windowStart) {
      this.windowStart = Math.max(0, this.activeIndex);
      return;
    }

    // If active is after the window
    if (this.activeIndex >= this.windowStart + this.config.visible) {
      this.windowStart = Math.min(
        this.config.count - this.config.visible,
        this.activeIndex - this.config.visible + 1
      );
    }
  }

  private render(): void {
    const isVertical = this.config.direction === 'vertical';
    const dotSize = this.config.radius * 2;
    const itemSize = dotSize + this.config.gap;

    const windowEnd = Math.min(this.windowStart + this.config.visible, this.config.count);
    const hasLeadingSmall = this.windowStart > 0;

    // Render from (windowStart - 1) to (windowEnd + 1) to ensure smooth transitions
    const renderStart = Math.max(0, this.windowStart - 1);
    const renderEnd = Math.min(this.config.count, windowEnd + 1);

    // Clear existing dots
    this.element.innerHTML = '';

    for (let i = renderStart; i < renderEnd; i++) {
      const isActive = i === this.activeIndex;

      // Determine dot scale based on position relative to window
      let scale = 1;
      if (i < this.windowStart) {
        scale = this.config.edgeScale;
      } else if (i >= windowEnd) {
        scale = this.config.edgeScale;
      }

      // Calculate slot index for this dot
      let slotIndex: number;
      if (i < this.windowStart) {
        // Leading edge dot - always slot 0
        slotIndex = 0;
      } else if (i >= windowEnd) {
        // Trailing edge dot - last slot
        slotIndex = this.config.visible + 1;
      } else {
        // Visible dot - slots 1 to visible
        slotIndex = i - this.windowStart + 1;
      }

      // If no leading small, shift all visible and trailing left by 1
      if (!hasLeadingSmall && slotIndex > 0) {
        slotIndex -= 1;
      }

      const position = slotIndex * itemSize;

      // Create wrapper - put data-reel-indicator on wrapper for click handling
      const wrapper = document.createElement('span');
      wrapper.setAttribute('data-reel-indicator', String(i));
      wrapper.style.position = 'absolute';
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = 'center';
      wrapper.style.alignItems = 'center';
      wrapper.style.width = `${itemSize}px`;
      wrapper.style.height = `${itemSize}px`;
      wrapper.style.transition = 'top 0.2s ease, left 0.2s ease';
      wrapper.style.cursor = 'pointer';

      if (isVertical) {
        wrapper.style.top = `${position}px`;
        wrapper.style.left = '0';
      } else {
        wrapper.style.left = `${position}px`;
        wrapper.style.top = '0';
      }

      // Create dot
      const dot = document.createElement('span');
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.borderRadius = '50%';
      dot.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
      dot.style.flexShrink = '0';
      dot.style.backgroundColor = isActive
        ? this.config.activeColor
        : this.config.inactiveColor;
      dot.style.transform = `scale(${scale})`;

      wrapper.appendChild(dot);
      this.element.appendChild(wrapper);
    }
  }

  /** Set the active dot index */
  setActive(index: number): void {
    if (index < 0 || index >= this.config.count) return;
    if (index === this.activeIndex) return;

    this.activeIndex = index;
    this.updateWindowStart();
    this.render();
  }

  /** Register click handler for dots */
  onClick(handler: (index: number) => void): void {
    // Remove previous handler if exists
    if (this.boundClickHandler) {
      this.element.removeEventListener('click', this.boundClickHandler);
    }

    this.clickHandler = handler;

    this.boundClickHandler = (e: Event) => {
      let target = e.target as HTMLElement;

      // Check target itself, then parent (in case click was on inner dot)
      let indexAttr = target.getAttribute('data-reel-indicator');
      if (indexAttr === null && target.parentElement) {
        indexAttr = target.parentElement.getAttribute('data-reel-indicator');
      }

      if (indexAttr !== null) {
        const index = parseInt(indexAttr, 10);
        this.clickHandler?.(index);
      }
    };

    this.element.addEventListener('click', this.boundClickHandler);
  }

  /** Cleanup and destroy instance */
  destroy(): void {
    if (this.boundClickHandler) {
      this.element.removeEventListener('click', this.boundClickHandler);
      this.boundClickHandler = null;
    }

    this.clickHandler = null;
    this.element.innerHTML = '';
  }
}
