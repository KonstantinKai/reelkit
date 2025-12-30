import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the OneItemSlider component
 * Provides methods for interacting with and asserting slider state
 */
export class SliderPage {
  readonly page: Page;
  readonly container: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;
  readonly indicators: Locator;
  readonly slideContainer: Locator;

  // Animation duration in ms (matches slider default)
  private readonly animationDuration = 300;
  // Keyboard throttle in ms (matches slider default)
  private readonly keyboardThrottleMs = 1000;

  constructor(page: Page) {
    this.page = page;
    this.container = page.locator('[style*="overflow: hidden"]').first();
    this.nextButton = page.locator('button', { hasText: 'Next' });
    this.prevButton = page.locator('button', { hasText: 'Previous' });
    // Use data-testid for indicators (each dot has data-testid={index})
    this.indicators = page.locator('span[data-testid]');
    this.slideContainer = page.locator('[style*="translateY"], [style*="translateX"]').first();
  }

  /**
   * Get the title of the currently visible slide
   */
  async getVisibleSlideTitle(): Promise<string> {
    const h1 = this.page.locator('h1').first();
    return (await h1.textContent()) ?? '';
  }

  /**
   * Get the description of the currently visible slide
   */
  async getVisibleSlideDescription(): Promise<string> {
    const p = this.page.locator('p').first();
    return (await p.textContent()) ?? '';
  }

  /**
   * Get the index of the active indicator (0-based)
   */
  async getActiveIndicatorIndex(): Promise<number> {
    const indicators = await this.indicators.all();
    for (let i = 0; i < indicators.length; i++) {
      const isActive = await indicators[i].evaluate((el) => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        // Active indicator has full opacity (white with alpha=1)
        // React uses rgba(255, 255, 255, 1), Vue uses rgba(255, 255, 255, 1)
        // Inactive uses lower alpha (0.44 or 0.4)
        if (bgColor.includes('rgb')) {
          const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (match) {
            const alpha = match[4] ? parseFloat(match[4]) : 1;
            return alpha >= 0.9; // Active has alpha=1, inactive has ~0.4
          }
        }
        return false;
      });
      if (isActive) return i;
    }
    return 0;
  }

  /**
   * Get total number of indicators (= total slides)
   */
  async getIndicatorCount(): Promise<number> {
    return await this.indicators.count();
  }

  /**
   * Click the Next button
   */
  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  /**
   * Click the Previous button
   */
  async clickPrev(): Promise<void> {
    await this.prevButton.click();
  }

  /**
   * Click an indicator dot by index (0-based)
   */
  async clickIndicator(index: number): Promise<void> {
    await this.indicators.nth(index).click();
  }

  /**
   * Press keyboard arrow down
   */
  async pressArrowDown(): Promise<void> {
    await this.page.keyboard.press('ArrowDown');
  }

  /**
   * Press keyboard arrow up
   */
  async pressArrowUp(): Promise<void> {
    await this.page.keyboard.press('ArrowUp');
  }

  /**
   * Press keyboard arrow right (for horizontal sliders)
   */
  async pressArrowRight(): Promise<void> {
    await this.page.keyboard.press('ArrowRight');
  }

  /**
   * Press keyboard arrow left (for horizontal sliders)
   */
  async pressArrowLeft(): Promise<void> {
    await this.page.keyboard.press('ArrowLeft');
  }

  /**
   * Perform a swipe up gesture (for touch devices)
   * Swipe up = scroll down = go to next slide
   */
  async swipeUp(): Promise<void> {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.7;
    const endY = box.y + box.height * 0.3;

    // Use JavaScript to dispatch touch events for proper gesture recognition
    await this.page.evaluate(
      ({ x, startY, endY }) => {
        const element = document.elementFromPoint(x, startY);
        if (!element) return;

        const createTouchEvent = (type: string, clientX: number, clientY: number) => {
          const touch = new Touch({
            identifier: Date.now(),
            target: element,
            clientX,
            clientY,
            pageX: clientX,
            pageY: clientY,
          });
          return new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: type === 'touchend' ? [] : [touch],
            targetTouches: type === 'touchend' ? [] : [touch],
            changedTouches: [touch],
          });
        };

        element.dispatchEvent(createTouchEvent('touchstart', x, startY));

        // Simulate movement in steps
        const steps = 10;
        const deltaY = (endY - startY) / steps;
        for (let i = 1; i <= steps; i++) {
          element.dispatchEvent(createTouchEvent('touchmove', x, startY + deltaY * i));
        }

        element.dispatchEvent(createTouchEvent('touchend', x, endY));
      },
      { x: centerX, startY, endY }
    );
  }

  /**
   * Perform a swipe down gesture (for touch devices)
   * Swipe down = scroll up = go to previous slide
   */
  async swipeDown(): Promise<void> {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.3;
    const endY = box.y + box.height * 0.7;

    // Use JavaScript to dispatch touch events for proper gesture recognition
    await this.page.evaluate(
      ({ x, startY, endY }) => {
        const element = document.elementFromPoint(x, startY);
        if (!element) return;

        const createTouchEvent = (type: string, clientX: number, clientY: number) => {
          const touch = new Touch({
            identifier: Date.now(),
            target: element,
            clientX,
            clientY,
            pageX: clientX,
            pageY: clientY,
          });
          return new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: type === 'touchend' ? [] : [touch],
            targetTouches: type === 'touchend' ? [] : [touch],
            changedTouches: [touch],
          });
        };

        element.dispatchEvent(createTouchEvent('touchstart', x, startY));

        // Simulate movement in steps
        const steps = 10;
        const deltaY = (endY - startY) / steps;
        for (let i = 1; i <= steps; i++) {
          element.dispatchEvent(createTouchEvent('touchmove', x, startY + deltaY * i));
        }

        element.dispatchEvent(createTouchEvent('touchend', x, endY));
      },
      { x: centerX, startY, endY }
    );
  }

  /**
   * Wait for slide animation to complete
   */
  async waitForAnimation(): Promise<void> {
    // Wait for animation duration plus generous buffer for test environment
    await this.page.waitForTimeout(this.animationDuration + 200);
  }

  /**
   * Wait for keyboard throttle to reset (required between consecutive key presses)
   */
  async waitForKeyboardThrottle(): Promise<void> {
    await this.page.waitForTimeout(this.keyboardThrottleMs + 100);
  }

  /**
   * Assert current slide title
   * NOTE: Slider renders multiple slides in DOM, so we find the one most centered in viewport
   */
  async expectSlideTitle(expected: string): Promise<void> {
    // Wait a bit for animation to settle
    await this.page.waitForTimeout(100);

    // Find the h1 that's most centered in viewport
    const h1s = this.page.locator('h1');
    const count = await h1s.count();
    const viewportSize = this.page.viewportSize();

    if (!viewportSize) {
      await expect(h1s.first()).toHaveText(expected, { timeout: 5000 });
      return;
    }

    const viewportCenterY = viewportSize.height / 2;
    let bestH1 = h1s.first();
    let bestDistance = Infinity;

    for (let i = 0; i < count; i++) {
      const h1 = h1s.nth(i);
      const box = await h1.boundingBox();
      if (box) {
        const h1CenterY = box.y + box.height / 2;
        const distance = Math.abs(h1CenterY - viewportCenterY);

        // Only consider h1s that are somewhat visible
        if (box.y + box.height > 0 && box.y < viewportSize.height && distance < bestDistance) {
          bestDistance = distance;
          bestH1 = h1;
        }
      }
    }

    await expect(bestH1).toHaveText(expected, { timeout: 5000 });
  }

  /**
   * Assert active indicator index
   */
  async expectActiveIndicator(index: number): Promise<void> {
    const activeIndex = await this.getActiveIndicatorIndex();
    expect(activeIndex).toBe(index);
  }

  /**
   * Get the current transform value of the slide container
   */
  async getTransformValue(): Promise<number> {
    const transform = await this.slideContainer.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });

    // Parse translateY or translateX value from matrix
    const match = transform.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/);
    if (match) {
      return parseFloat(match[1]);
    }

    // Alternative: parse from translateY/translateX
    const translateMatch = transform.match(/translate[XY]\(([^)]+)\)/);
    if (translateMatch) {
      return parseFloat(translateMatch[1]);
    }

    return 0;
  }

  /**
   * Check if animation is in progress by comparing transform values
   */
  async isAnimating(): Promise<boolean> {
    const value1 = await this.getTransformValue();
    await this.page.waitForTimeout(50);
    const value2 = await this.getTransformValue();
    return value1 !== value2;
  }
}
