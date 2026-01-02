import { clamp, type SliderDirection } from '@reelkit/core';

/**
 * Web Component for Instagram-style indicator with scrolling dots.
 *
 * @example
 * ```html
 * <reel-indicator
 *   count="100"
 *   active-index="0"
 *   direction="vertical"
 *   visible="5"
 * ></reel-indicator>
 * ```
 *
 * @fires reel-indicator-click - Fired when a dot is clicked, detail: { index: number }
 */
export class ReelIndicator extends HTMLElement {
  static get observedAttributes() {
    return [
      'count',
      'active-index',
      'direction',
      'visible',
      'radius',
      'gap',
      'edge-scale',
      'active-color',
      'inactive-color',
    ];
  }

  private windowStart = 0;
  private initialized = false;
  private boundClickHandler: ((e: Event) => void) | null = null;

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

    if (this.initialized) {
      if (name === 'active-index') {
        this.updateWindowStart();
      }
      this.render();
    }
  }

  private initialize() {
    this.updateWindowStart();
    this.setupContainer();
    this.setupClickHandler();
    this.render();
    this.initialized = true;
  }

  private cleanup() {
    if (this.boundClickHandler) {
      this.removeEventListener('click', this.boundClickHandler);
      this.boundClickHandler = null;
    }
    this.innerHTML = '';
    this.initialized = false;
  }

  private setupContainer() {
    const isVertical = this.direction === 'vertical';
    const dotSize = this.radius * 2;
    const itemSize = dotSize + this.gap;

    const normalDotsCount = Math.min(this.visible, this.count);
    let containerSize = normalDotsCount * itemSize;
    if (this.count > this.visible) {
      containerSize += itemSize * 2;
    }

    this.style.display = 'block';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';

    if (isVertical) {
      this.style.height = `${containerSize}px`;
      this.style.width = `${itemSize}px`;
    } else {
      this.style.width = `${containerSize}px`;
      this.style.height = `${itemSize}px`;
    }
  }

  private setupClickHandler() {
    this.boundClickHandler = (e: Event) => {
      let target = e.target as HTMLElement;

      let indexAttr = target.getAttribute('data-reel-indicator');
      if (indexAttr === null && target.parentElement) {
        indexAttr = target.parentElement.getAttribute('data-reel-indicator');
      }

      if (indexAttr !== null) {
        const index = parseInt(indexAttr, 10);
        this.dispatchEvent(
          new CustomEvent('reel-indicator-click', {
            detail: { index },
            bubbles: true,
          })
        );
      }
    };

    this.addEventListener('click', this.boundClickHandler);
  }

  private updateWindowStart() {
    if (this.count <= this.visible) {
      this.windowStart = 0;
      return;
    }

    const activeIndex = this.activeIndex;

    if (activeIndex < this.windowStart) {
      this.windowStart = Math.max(0, activeIndex);
      return;
    }

    if (activeIndex >= this.windowStart + this.visible) {
      this.windowStart = Math.min(
        this.count - this.visible,
        activeIndex - this.visible + 1
      );
    }
  }

  private render() {
    const isVertical = this.direction === 'vertical';
    const dotSize = this.radius * 2;
    const itemSize = dotSize + this.gap;
    const activeIndex = this.activeIndex;

    const windowEnd = Math.min(this.windowStart + this.visible, this.count);
    const hasLeadingSmall = this.windowStart > 0;

    const renderStart = Math.max(0, this.windowStart - 1);
    const renderEnd = Math.min(this.count, windowEnd + 1);

    this.innerHTML = '';

    for (let i = renderStart; i < renderEnd; i++) {
      const isActive = i === activeIndex;

      let scale = 1;
      if (i < this.windowStart) {
        scale = this.edgeScale;
      } else if (i >= windowEnd) {
        scale = this.edgeScale;
      }

      let slotIndex: number;
      if (i < this.windowStart) {
        slotIndex = 0;
      } else if (i >= windowEnd) {
        slotIndex = this.visible + 1;
      } else {
        slotIndex = i - this.windowStart + 1;
      }

      if (!hasLeadingSmall && slotIndex > 0) {
        slotIndex -= 1;
      }

      const position = slotIndex * itemSize;

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

      const dot = document.createElement('span');
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.borderRadius = '50%';
      dot.style.transition = 'transform 0.2s ease, background-color 0.2s ease';
      dot.style.flexShrink = '0';
      dot.style.backgroundColor = isActive ? this.activeColor : this.inactiveColor;
      dot.style.transform = `scale(${scale})`;

      wrapper.appendChild(dot);
      this.appendChild(wrapper);
    }
  }

  // Attribute getters/setters

  get count(): number {
    return parseInt(this.getAttribute('count') || '0', 10);
  }

  set count(value: number) {
    this.setAttribute('count', String(value));
  }

  get activeIndex(): number {
    return parseInt(this.getAttribute('active-index') || '0', 10);
  }

  set activeIndex(value: number) {
    this.setAttribute('active-index', String(value));
  }

  get direction(): SliderDirection {
    return (this.getAttribute('direction') as SliderDirection) || 'vertical';
  }

  set direction(value: SliderDirection) {
    this.setAttribute('direction', value);
  }

  get visible(): number {
    return parseInt(this.getAttribute('visible') || '5', 10);
  }

  set visible(value: number) {
    this.setAttribute('visible', String(value));
  }

  get radius(): number {
    return parseInt(this.getAttribute('radius') || '3', 10);
  }

  set radius(value: number) {
    this.setAttribute('radius', String(value));
  }

  get gap(): number {
    return parseInt(this.getAttribute('gap') || '4', 10);
  }

  set gap(value: number) {
    this.setAttribute('gap', String(value));
  }

  get edgeScale(): number {
    return parseFloat(this.getAttribute('edge-scale') || '0.5');
  }

  set edgeScale(value: number) {
    this.setAttribute('edge-scale', String(value));
  }

  get activeColor(): string {
    return this.getAttribute('active-color') || '#fff';
  }

  set activeColor(value: string) {
    this.setAttribute('active-color', value);
  }

  get inactiveColor(): string {
    return this.getAttribute('inactive-color') || 'rgba(255, 255, 255, 0.5)';
  }

  set inactiveColor(value: string) {
    this.setAttribute('inactive-color', value);
  }

  // Public API

  /** Set the active dot index */
  setActive(index: number): void {
    if (index < 0 || index >= this.count) return;
    this.activeIndex = index;
  }
}

// Register the custom element
if (typeof customElements !== 'undefined' && !customElements.get('reel-indicator')) {
  customElements.define('reel-indicator', ReelIndicator);
}
