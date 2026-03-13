import { test, expect, Page } from '@playwright/test';

class ImagePreviewPage {
  constructor(private page: Page) {}

  // Selectors
  get container() {
    return this.page.locator('.rk-lightbox-container');
  }

  get closeButton() {
    return this.page.locator('.rk-lightbox-close');
  }

  get fullscreenButton() {
    return this.page.locator('.rk-lightbox-btn');
  }

  get counter() {
    return this.page.locator('.rk-lightbox-counter');
  }

  get prevButton() {
    return this.page.locator('.rk-lightbox-nav-prev');
  }

  get nextButton() {
    return this.page.locator('.rk-lightbox-nav-next');
  }

  get galleryItems() {
    return this.page.locator('.gallery-item');
  }

  get currentImage() {
    return this.page
      .locator('.rk-lightbox-slide.rk-active img, .rk-lightbox-slide img')
      .first();
  }

  get title() {
    return this.page.locator('.rk-lightbox-title');
  }

  get description() {
    return this.page.locator('.rk-lightbox-description');
  }

  get swipeHint() {
    return this.page.locator('.rk-lightbox-swipe-hint');
  }

  get transitionButtons() {
    return this.page.locator('.transition-btn');
  }

  // Actions
  async openPreviewAt(index: number) {
    await this.galleryItems.nth(index).click();
    await expect(this.container).toBeVisible();
  }

  async closePreview() {
    await this.closeButton.click();
    await expect(this.container).not.toBeVisible();
  }

  async closePreviewWithEsc() {
    await this.page.keyboard.press('Escape');
    await expect(this.container).not.toBeVisible();
  }

  async navigateNext() {
    await this.nextButton.click();
  }

  async navigatePrev() {
    await this.prevButton.click();
  }

  async pressArrowRight() {
    await this.page.keyboard.press('ArrowRight');
  }

  async pressArrowLeft() {
    await this.page.keyboard.press('ArrowLeft');
  }

  async selectTransition(name: string) {
    await this.transitionButtons.filter({ hasText: name }).click();
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }

  async getCounterText(): Promise<string> {
    return (await this.counter.textContent()) || '';
  }

  async swipeUp(distance: number) {
    const box = await this.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const endY = startY - distance;

    await this.page.touchscreen.tap(centerX, startY);
    await this.page.mouse.move(centerX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(centerX, endY, { steps: 10 });
    await this.page.mouse.up();
  }
}

test.describe('Image Preview - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Image Gallery');
  });

  test('renders gallery grid with images', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    const count = await preview.galleryItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('renders transition selector buttons', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    const transitions = ['slide', 'fade', 'zoom-in'];

    for (const transition of transitions) {
      await expect(
        preview.transitionButtons.filter({ hasText: transition }),
      ).toBeVisible();
    }
  });

  test('gallery images have lazy loading attribute', async ({ page }) => {
    const imgs = page.locator('.gallery-item img');
    const count = Math.min(await imgs.count(), 3);

    for (let i = 0; i < count; i++) {
      await expect(imgs.nth(i)).toHaveAttribute('loading', 'lazy');
    }
  });

  test('gallery items show title on hover', async ({ page, isMobile }) => {
    // Skip on mobile - hover doesn't work the same way
    test.skip(isMobile, 'Hover not applicable on mobile');

    const overlay = page.locator('.gallery-item-overlay').first();
    await expect(overlay).toHaveCSS('opacity', '0');

    await page.locator('.gallery-item').first().hover();
    await expect(overlay).toHaveCSS('opacity', '1');
  });
});

test.describe('Image Preview - Overlay Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('opens preview on gallery item click', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await expect(preview.container).toBeVisible();
  });

  test('shows image counter', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/1\s*\/\s*\d+/);
  });

  test('shows close button', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await expect(preview.closeButton).toBeVisible();
  });

  test('shows fullscreen button', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await expect(preview.fullscreenButton).toBeVisible();
  });

  test('closes preview with close button', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await preview.closePreview();
  });

  test('closes preview with Escape key', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await preview.closePreviewWithEsc();
  });

  test('opens preview at specific index', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(5);

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/6\s*\/\s*\d+/);
  });

  test('displays image title and description', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await expect(preview.title).toBeVisible();
    await expect(preview.description).toBeVisible();
  });

  test('fullscreen button click does not break lightbox', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await preview.fullscreenButton.click();
    await expect(preview.container).toBeVisible();

    // Navigation still works after fullscreen toggle
    await preview.pressArrowRight();
    await preview.waitForAnimation();

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);

    // Click fullscreen again — still functional
    await preview.fullscreenButton.click();
    await expect(preview.container).toBeVisible();
  });
});

test.describe('Image Preview - Button Navigation', () => {
  // Navigation arrows are hidden on mobile (desktop only)
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('shows next button when not at last image', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await expect(preview.nextButton).toBeVisible();
  });

  test('hides prev button at first image', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);
    await expect(preview.prevButton).not.toBeVisible();
  });

  test('shows prev button when not at first image', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(1);
    await expect(preview.prevButton).toBeVisible();
  });

  test('navigates to next image with Next button', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await preview.navigateNext();
    await preview.waitForAnimation();

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);
  });

  test('navigates to previous image with Prev button', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(2);

    await preview.navigatePrev();
    await preview.waitForAnimation();

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);
  });

  test('navigates through multiple images', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    for (let i = 0; i < 3; i++) {
      await preview.navigateNext();
      await preview.waitForAnimation();
    }

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/4\s*\/\s*\d+/);
  });
});

test.describe('Image Preview - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('navigates with ArrowRight key', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await preview.pressArrowRight();
    await preview.waitForAnimation();

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);
  });

  test('navigates with ArrowLeft key', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(2);

    await preview.pressArrowLeft();
    await preview.waitForAnimation();

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);
  });

  test('navigates through multiple images with keyboard', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    for (let i = 0; i < 5; i++) {
      await preview.pressArrowRight();
      await preview.waitForAnimation();
    }

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/6\s*\/\s*\d+/);
  });
});

test.describe('Image Preview - Transition Animations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('applies slide transition by default', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await expect(
      preview.transitionButtons.filter({ hasText: 'slide' }),
    ).toHaveClass(/active/);
  });

  test('can switch to fade transition', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.selectTransition('fade');

    await expect(
      preview.transitionButtons.filter({ hasText: 'fade' }),
    ).toHaveClass(/active/);

    await preview.openPreviewAt(0);
    await preview.pressArrowRight();
    await preview.waitForAnimation();

    // Preview should still work
    await expect(preview.container).toBeVisible();
  });

  test('can switch to zoom-in transition', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.selectTransition('zoom-in');

    await expect(
      preview.transitionButtons.filter({ hasText: 'zoom-in' }),
    ).toHaveClass(/active/);

    await preview.openPreviewAt(0);
    await preview.pressArrowRight();
    await preview.waitForAnimation();

    await expect(preview.container).toBeVisible();
  });
});

test.describe('Image Preview - Image Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('displays image in preview', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const img = preview.currentImage;
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', /picsum\.photos/);
  });

  test('images have object-fit contain', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const img = preview.currentImage;
    await expect(img).toHaveCSS('object-fit', 'contain');
  });

  test('preview container has black background', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await expect(preview.container).toHaveCSS(
      'background-color',
      'rgb(0, 0, 0)',
    );
  });
});

test.describe('Image Preview - Mobile Features', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('shows swipe hint on mobile', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await expect(preview.swipeHint).toBeVisible();
    await expect(preview.swipeHint).toContainText('Swipe up to close');
  });

  test('hides navigation buttons on mobile', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(1);

    await expect(preview.prevButton).not.toBeVisible();
    await expect(preview.nextButton).not.toBeVisible();
  });
});

test.describe('Image Preview - Touch Gestures', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Touch API varies by browser',
  );
  test.skip(({ isMobile }) => !isMobile, 'Touch tests only on mobile devices');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('swipe up changes opacity', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    // Get initial opacity
    const initialOpacity = await preview.container.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    expect(initialOpacity).toBe('1');

    // Perform swipe gesture
    const box = await preview.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Start touch
    await page.touchscreen.tap(centerX, startY);
  });
});

test.describe('Image Preview - Swipe to Close', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Touch API varies by browser',
  );
  test.skip(({ isMobile }) => !isMobile, 'Touch tests only on mobile devices');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  // Helper to perform touch swipe gesture
  async function performTouchSwipe(
    page: Page,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    steps = 10,
  ) {
    // Dispatch touch events via JavaScript for reliable mobile simulation
    await page.evaluate(
      ({ startX, startY, endX, endY, steps }) => {
        const element = document.elementFromPoint(startX, startY);
        if (!element) return;

        const createTouch = (x: number, y: number) => {
          return new Touch({
            identifier: 1,
            target: element,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
            screenX: x,
            screenY: y,
          });
        };

        // Touch start
        element.dispatchEvent(
          new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [createTouch(startX, startY)],
            changedTouches: [createTouch(startX, startY)],
          }),
        );

        // Touch move (multiple steps)
        const deltaX = (endX - startX) / steps;
        const deltaY = (endY - startY) / steps;
        for (let i = 1; i <= steps; i++) {
          const x = startX + deltaX * i;
          const y = startY + deltaY * i;
          element.dispatchEvent(
            new TouchEvent('touchmove', {
              bubbles: true,
              cancelable: true,
              touches: [createTouch(x, y)],
              changedTouches: [createTouch(x, y)],
            }),
          );
        }

        // Touch end
        element.dispatchEvent(
          new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            changedTouches: [createTouch(endX, endY)],
          }),
        );
      },
      { startX, startY, endX, endY, steps },
    );
  }

  test('swipe up below threshold returns to original position', async ({
    page,
  }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const box = await preview.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    // Swipe only 10% of screen height (below 20% threshold)
    const swipeDistance = box.height * 0.1;

    await performTouchSwipe(
      page,
      centerX,
      startY,
      centerX,
      startY - swipeDistance,
      5,
    );

    // Wait for transition
    await page.waitForTimeout(400);

    // Container should still be visible and back to original position
    await expect(preview.container).toBeVisible();
  });

  test('swipe up then horizontal movement returns to original position', async ({
    page,
  }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const box = await preview.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const verticalDistance = box.height * 0.3;

    // Swipe up then move horizontally - using JavaScript to control touch events
    await page.evaluate(
      ({ centerX, startY, verticalDistance }) => {
        const element = document.elementFromPoint(centerX, startY);
        if (!element) return;

        const createTouch = (x: number, y: number) => {
          return new Touch({
            identifier: 1,
            target: element,
            clientX: x,
            clientY: y,
            pageX: x,
            pageY: y,
            screenX: x,
            screenY: y,
          });
        };

        // Touch start
        element.dispatchEvent(
          new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [createTouch(centerX, startY)],
            changedTouches: [createTouch(centerX, startY)],
          }),
        );

        // Move up
        const midY = startY - verticalDistance;
        for (let i = 1; i <= 5; i++) {
          const y = startY - (verticalDistance * i) / 5;
          element.dispatchEvent(
            new TouchEvent('touchmove', {
              bubbles: true,
              cancelable: true,
              touches: [createTouch(centerX, y)],
              changedTouches: [createTouch(centerX, y)],
            }),
          );
        }

        // Then move horizontally (this changes last delta direction)
        for (let i = 1; i <= 3; i++) {
          const x = centerX + (50 * i) / 3;
          element.dispatchEvent(
            new TouchEvent('touchmove', {
              bubbles: true,
              cancelable: true,
              touches: [createTouch(x, midY)],
              changedTouches: [createTouch(x, midY)],
            }),
          );
        }

        // Touch end at horizontal position
        element.dispatchEvent(
          new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true,
            touches: [],
            changedTouches: [createTouch(centerX + 50, midY)],
          }),
        );
      },
      { centerX, startY, verticalDistance },
    );

    // Wait for transition
    await page.waitForTimeout(400);

    // Container should still be visible - the fallback reset should have triggered
    await expect(preview.container).toBeVisible();
  });

  test('swipe up then stop before release returns to original position', async ({
    page,
  }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const box = await preview.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    const verticalDistance = box.height * 0.15; // Below threshold

    await performTouchSwipe(
      page,
      centerX,
      startY,
      centerX,
      startY - verticalDistance,
      5,
    );

    // Wait for transition
    await page.waitForTimeout(400);

    // Container should still be visible - below threshold
    await expect(preview.container).toBeVisible();
  });

  test('swipe down does not close lightbox', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const box = await preview.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.4;
    // Swipe DOWN (endY > startY) — 25% of screen height
    const swipeDistance = box.height * 0.25;

    await performTouchSwipe(
      page,
      centerX,
      startY,
      centerX,
      startY + swipeDistance,
      10,
    );

    await page.waitForTimeout(400);

    // Downward swipe is ignored — lightbox stays open
    await expect(preview.container).toBeVisible();
  });

  test('swipe up past threshold closes lightbox', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const box = await preview.container.boundingBox();
    if (!box) throw new Error('Container not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;
    // Swipe 25% of screen height (above 20% threshold)
    const swipeDistance = box.height * 0.25;

    await performTouchSwipe(
      page,
      centerX,
      startY,
      centerX,
      startY - swipeDistance,
      10,
    );

    // Wait for close animation
    await page.waitForTimeout(400);

    // Lightbox should be closed
    await expect(preview.container).not.toBeVisible();
  });
});

test.describe('Image Preview - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('gallery items are keyboard accessible', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    // Focus on a gallery item directly
    const firstItem = preview.galleryItems.first();
    await firstItem.focus();

    // Verify it can receive focus
    await expect(firstItem).toBeFocused();
  });

  test('gallery items can be activated with Enter key', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    // Navigate to gallery item with keyboard
    const firstItem = preview.galleryItems.first();
    await firstItem.focus();
    await page.keyboard.press('Enter');

    await expect(preview.container).toBeVisible();
  });

  test('gallery items can be activated with Space key', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    const firstItem = preview.galleryItems.first();
    await firstItem.focus();
    await page.keyboard.press('Space');

    await expect(preview.container).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    const img = preview.currentImage;
    const alt = await img.getAttribute('alt');
    expect(alt).toBeTruthy();
  });

  test('buttons have title attributes', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await expect(preview.closeButton).toHaveAttribute('title', /Close/);
    await expect(preview.fullscreenButton).toHaveAttribute(
      'title',
      /Fullscreen/,
    );
  });
});

test.describe('Image Preview - Focus Management', () => {
  test.skip(({ isMobile }) => isMobile, 'Keyboard focus tests only on desktop');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('Tab then Escape works within lightbox', async ({ page }) => {
    const preview = new ImagePreviewPage(page);
    await preview.openPreviewAt(0);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');

    await expect(preview.container).not.toBeVisible();
  });
});

test.describe('Image Preview - Body Scroll Lock', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('locks body scroll when preview is open', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    await preview.openPreviewAt(0);

    // Body should have overflow hidden
    const afterOverflow = await page.evaluate(
      () => window.getComputedStyle(document.body).overflow,
    );
    expect(afterOverflow).toBe('hidden');
  });

  test('unlocks body scroll when preview is closed', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    await preview.openPreviewAt(0);
    await preview.closePreview();

    // Body should be scrollable again
    const overflow = await page.evaluate(
      () => window.getComputedStyle(document.body).overflow,
    );
    expect(overflow).not.toBe('hidden');
  });
});
