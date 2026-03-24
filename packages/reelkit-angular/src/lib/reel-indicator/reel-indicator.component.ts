import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { clamp } from '@reelkit/core';
import { RK_REEL_CONTEXT } from '../context/reel-context';

interface DotDescriptor {
  index: number;
  wrapperStyle: Record<string, string>;
  dotStyle: Record<string, string>;
}

/**
 * Instagram-style scrolling dot indicator for `rk-reel`.
 *
 * Shows a sliding window of normal-sized dots with smaller edge dots indicating
 * overflow. The window slides smoothly as the active index changes.
 *
 * When rendered inside a `rk-reel`, `active` and `count` are auto-connected
 * from the parent reel's context signals. Explicit inputs take precedence.
 *
 * @example
 * ```html
 * <rk-reel [count]="items.length">
 *   <rk-reel-indicator />
 * </rk-reel>
 * ```
 */
@Component({
  selector: 'rk-reel-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="tablist"
      [attr.aria-label]="tablistLabel()"
      style="position: relative; overflow: hidden;"
      [style.height]="
        direction() === 'vertical'
          ? containerSize() + 'px'
          : radius() * 2 + gap() + 'px'
      "
      [style.width]="
        direction() === 'vertical'
          ? radius() * 2 + gap() + 'px'
          : containerSize() + 'px'
      "
    >
      @for (dot of dots(); track dot.index) {
        <span
          role="tab"
          [attr.aria-selected]="dot.index === resolvedActive()"
          [attr.aria-label]="'Go to slide ' + (dot.index + 1)"
          [attr.tabindex]="dot.index === resolvedActive() ? '0' : '-1'"
          [attr.data-reel-indicator]="dot.index"
          [attr.data-testid]="'indicator-dot-' + dot.index"
          [style]="dot.wrapperStyle"
          (click)="handleDotClick(dot.index)"
          (keydown)="handleDotKeydown($event, dot.index)"
        >
          <span aria-hidden="true" [style]="dot.dotStyle"></span>
        </span>
      } @empty {
        <!-- count is 0: render nothing but keep the container accessible. -->
        <span
          style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
          >No slides</span
        >
      }
    </div>
  `,
})
export class ReelIndicatorComponent {
  private readonly reelContext = inject(RK_REEL_CONTEXT, { optional: true });
  private _destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._destroyed = true;
    });
  }

  /**
   * Total number of items. Auto-resolved from the parent Reel context when
   * omitted. Required if used outside a `rk-reel`.
   */
  count = input<number | undefined>(undefined);

  /**
   * Index of the currently active item. Auto-resolved from the parent Reel
   * context when omitted. Required if used outside a `rk-reel`.
   */
  active = input<number | undefined>(undefined);

  /** Axis along which dots are arranged. */
  direction = input<'horizontal' | 'vertical'>('vertical');

  /** Dot radius in pixels. */
  radius = input<number>(3);

  /** Maximum number of normal-sized dots visible at once. */
  visible = input<number>(5);

  /** Space between dots in pixels. */
  gap = input<number>(4);

  /** CSS color for the active dot. */
  activeColor = input<string>('#fff');

  /** CSS color for inactive dots. */
  inactiveColor = input<string>('rgba(255, 255, 255, 0.5)');

  /** Scale factor (0-1) applied to edge dots that overflow the visible window. */
  edgeScale = input<number>(0.5);

  /** Optional CSS class applied to the indicator container. */
  className = input<string>('');

  /**
   * Accessible label for the `tablist` container, announced by screen readers
   * as the name of the navigation landmark. Defaults to "Slide navigation".
   */
  tablistLabel = input<string>('Slide navigation');

  dotClick = output<number>();

  /**
   * Guards against double-invocation while a `goTo` animation is in flight.
   * Reset to `false` once the Promise resolves (animation complete or no-op).
   */
  private readonly _isNavigating = signal<boolean>(false);

  private readonly resolvedCount = computed<number>(() => {
    const explicit = this.count();
    if (explicit !== undefined) return explicit;
    if (this.reelContext) return this.reelContext.count();
    return 0;
  });

  readonly resolvedActive = computed<number>(() => {
    const explicit = this.active();
    if (explicit !== undefined) return explicit;
    if (this.reelContext) return this.reelContext.index();
    return 0;
  });

  /**
   * Start index of the visible window — the first normal-sized dot.
   *
   * Uses `linkedSignal` with a source/computation pair so the window slides
   * incrementally (only when the active dot reaches a window edge), matching
   * the React reference implementation. The `computation` receives the
   * previous window position so changes to `count`/`visible` reset it while
   * changes to `active` alone apply the edge-sliding logic.
   */
  private readonly windowStart = linkedSignal<
    { count: number; active: number; visible: number },
    number
  >({
    source: () => ({
      count: this.resolvedCount(),
      active: this.resolvedActive(),
      visible: this.visible(),
    }),
    computation: ({ count, active, visible }, previous) => {
      if (count <= visible) return 0;

      const prev =
        previous?.value ??
        clamp(active - Math.floor(visible / 2), 0, count - visible);

      if (active < prev) {
        return Math.max(0, active);
      }
      if (active >= prev + visible) {
        return Math.min(count - visible, active - visible + 1);
      }
      return prev;
    },
  });

  readonly containerSize = computed<number>(() => {
    const count = this.resolvedCount();
    const visible = this.visible();
    const itemSize = this.radius() * 2 + this.gap();
    const normalDotsCount = Math.min(visible, count);
    const hasOverflow = count > visible;
    return normalDotsCount * itemSize + (hasOverflow ? itemSize * 2 : 0);
  });

  readonly dots = computed<DotDescriptor[]>(() => {
    const count = this.resolvedCount();
    const active = this.resolvedActive();
    const visible = this.visible();
    const windowStart = this.windowStart();
    const windowEnd = Math.min(windowStart + visible, count);
    const hasLeadingSmall = windowStart > 0;
    const renderStart = Math.max(0, windowStart - 1);
    const renderEnd = Math.min(count, windowEnd + 1);

    const descriptors: DotDescriptor[] = [];
    for (let dotIndex = renderStart; dotIndex < renderEnd; dotIndex++) {
      descriptors.push(
        this.buildDotDescriptor(
          dotIndex,
          active,
          windowStart,
          windowEnd,
          hasLeadingSmall,
          visible,
        ),
      );
    }
    return descriptors;
  });

  protected handleDotClick(index: number): void {
    // Always emit the output event — callers should always be notified of
    // the user's intent regardless of whether a navigation is in-flight.
    this.dotClick.emit(index);

    if (this.reelContext && !this._isNavigating()) {
      this._isNavigating.set(true);
      this.reelContext.goTo(index, true).finally(() => {
        // Guard against setting signal state after the component is destroyed
        // (e.g. the Promise resolves after the component is removed from the DOM).
        if (!this._destroyed) {
          this._isNavigating.set(false);
        }
      });
    }
  }

  /**
   * Keyboard handler implementing the WAI-ARIA roving tabindex pattern for
   * the tablist. Arrow keys move focus between dots; Enter/Space activate.
   *
   * Horizontal indicator: ArrowLeft / ArrowRight move between dots.
   * Vertical indicator:   ArrowUp / ArrowDown move between dots.
   *
   * IMPORTANT: Arrow / Home / End keys only move DOM focus — they do NOT
   * call handleDotClick and do NOT trigger goTo(). This matches the React
   * reference implementation.
   */
  protected handleDotKeydown(event: KeyboardEvent, index: number): void {
    const count = this.resolvedCount();
    if (count === 0) return;

    const isHorizontal = this.direction() === 'horizontal';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleDotClick(index);
      return;
    }

    let targetIndex: number | null = null;

    if (event.key === prevKey) {
      targetIndex = index > 0 ? index - 1 : count - 1;
    } else if (event.key === nextKey) {
      targetIndex = index < count - 1 ? index + 1 : 0;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = count - 1;
    }

    if (targetIndex !== null) {
      event.preventDefault();
      // Only move focus — do NOT trigger goTo() for pure focus navigation.
      this.focusDot(event, targetIndex);
    }
  }

  /** Moves DOM focus to the dot at `targetIndex` without triggering navigation. */
  private focusDot(event: KeyboardEvent, targetIndex: number): void {
    const tablist = (event.target as HTMLElement).closest('[role="tablist"]');
    if (tablist) {
      const targetDot = tablist.querySelector<HTMLElement>(
        `[data-reel-indicator="${targetIndex}"]`,
      );
      targetDot?.focus();
    }
  }

  private buildDotDescriptor(
    dotIndex: number,
    active: number,
    windowStart: number,
    windowEnd: number,
    hasLeadingSmall: boolean,
    visible: number,
  ): DotDescriptor {
    const isActive = dotIndex === active;
    const isEdge = dotIndex < windowStart || dotIndex >= windowEnd;
    const scale = isEdge ? this.edgeScale() : 1;
    const position = this.calculateDotPosition(
      dotIndex,
      windowStart,
      windowEnd,
      hasLeadingSmall,
      visible,
    );
    // Matches React: cursor is 'pointer' when an onDotClick handler is provided.
    const isClickable = this.reelContext !== null;

    return {
      index: dotIndex,
      wrapperStyle: this.buildWrapperStyle(position, isClickable),
      dotStyle: this.buildDotStyle(isActive, scale, isClickable),
    };
  }

  private calculateDotPosition(
    dotIndex: number,
    windowStart: number,
    windowEnd: number,
    hasLeadingSmall: boolean,
    visible: number,
  ): number {
    const itemSize = this.radius() * 2 + this.gap();
    let slotIndex: number;

    if (dotIndex < windowStart) {
      slotIndex = 0;
    } else if (dotIndex >= windowEnd) {
      slotIndex = visible + 1;
    } else {
      slotIndex = dotIndex - windowStart + 1;
    }

    if (!hasLeadingSmall && slotIndex > 0) {
      slotIndex -= 1;
    }

    return slotIndex * itemSize;
  }

  private buildWrapperStyle(
    position: number,
    isClickable: boolean,
  ): Record<string, string> {
    const isVertical = this.direction() === 'vertical';
    const itemSize = this.radius() * 2 + this.gap();
    return {
      position: 'absolute',
      [isVertical ? 'top' : 'left']: `${position}px`,
      [isVertical ? 'left' : 'top']: '0',
      width: `${itemSize}px`,
      height: `${itemSize}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'top 0.2s ease, left 0.2s ease',
      cursor: isClickable ? 'pointer' : 'default',
    };
  }

  private buildDotStyle(
    isActive: boolean,
    scale: number,
    isClickable: boolean,
  ): Record<string, string> {
    const dotSize = this.radius() * 2;
    return {
      width: `${dotSize}px`,
      height: `${dotSize}px`,
      borderRadius: '50%',
      backgroundColor: isActive ? this.activeColor() : this.inactiveColor(),
      transition: 'transform 0.2s ease, background-color 0.2s ease',
      transform: `scale(${scale})`,
      cursor: isClickable ? 'pointer' : 'default',
    };
  }
}
