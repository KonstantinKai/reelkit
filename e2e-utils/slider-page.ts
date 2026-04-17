import { Page, Locator, expect } from '@playwright/test';

export class SliderPage {
  readonly page: Page;
  readonly container: Locator;
  readonly nextButton: Locator;
  readonly prevButton: Locator;

  private readonly animationDuration = 300;

  constructor(page: Page) {
    this.page = page;
    this.container = page
      .locator('[style*="user-select: none"][style*="overflow: hidden"]')
      .first();
    this.nextButton = page.locator('button', { hasText: 'Next' });
    this.prevButton = page.locator('button', { hasText: 'Previous' });
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async clickPrev(): Promise<void> {
    await this.prevButton.click();
  }

  async clickIndicatorByIndex(index: number): Promise<void> {
    await this.page
      .locator(`[data-reel-indicator="${index}"]`)
      .evaluate((el: HTMLElement) => el.click());
  }

  async pressArrowDown(): Promise<void> {
    await this.page.keyboard.press('ArrowDown');
  }

  async pressArrowUp(): Promise<void> {
    await this.page.keyboard.press('ArrowUp');
  }

  async pressArrowRight(): Promise<void> {
    await this.page.keyboard.press('ArrowRight');
  }

  async swipeUp(): Promise<void> {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.7;
    const endY = box.y + box.height * 0.3;

    await this.page.evaluate(
      ({ x, startY, endY }) => {
        const element = document.elementFromPoint(x, startY);
        if (!element) return;

        const createTouchEvent = (
          type: string,
          clientX: number,
          clientY: number,
        ) => {
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
        const steps = 10;
        const deltaY = (endY - startY) / steps;
        for (let i = 1; i <= steps; i++) {
          element.dispatchEvent(
            createTouchEvent('touchmove', x, startY + deltaY * i),
          );
        }
        element.dispatchEvent(createTouchEvent('touchend', x, endY));
      },
      { x: centerX, startY, endY },
    );
  }

  async swipeDown(): Promise<void> {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.3;
    const endY = box.y + box.height * 0.7;

    await this.page.evaluate(
      ({ x, startY, endY }) => {
        const element = document.elementFromPoint(x, startY);
        if (!element) return;

        const createTouchEvent = (
          type: string,
          clientX: number,
          clientY: number,
        ) => {
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
        const steps = 10;
        const deltaY = (endY - startY) / steps;
        for (let i = 1; i <= steps; i++) {
          element.dispatchEvent(
            createTouchEvent('touchmove', x, startY + deltaY * i),
          );
        }
        element.dispatchEvent(createTouchEvent('touchend', x, endY));
      },
      { x: centerX, startY, endY },
    );
  }

  async wheelUp(): Promise<void> {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await this.page.mouse.move(centerX, centerY);
    await this.page.mouse.wheel(0, -100);
  }

  async wheelDown(): Promise<void> {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    await this.page.mouse.move(centerX, centerY);
    await this.page.mouse.wheel(0, 100);
  }

  async waitForAnimation(): Promise<void> {
    await this.page.waitForTimeout(this.animationDuration + 200);
  }

  async expectSlideTitle(expected: string): Promise<void> {
    await this.page.waitForTimeout(100);

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

        if (
          box.y + box.height > 0 &&
          box.y < viewportSize.height &&
          distance < bestDistance
        ) {
          bestDistance = distance;
          bestH1 = h1;
        }
      }
    }

    const text = (await bestH1.textContent({ timeout: 5000 }))?.trim();
    if (!expected.includes('.') && text?.startsWith(expected + '.')) {
      return;
    }

    await expect(bestH1).toHaveText(expected, { timeout: 5000 });
  }
}
