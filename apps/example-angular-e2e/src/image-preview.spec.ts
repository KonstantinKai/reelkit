import { test, expect, Page } from '@playwright/test';

class ImagePreviewPage {
  constructor(private readonly page: Page) {}

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
    await this.container.focus();
    await this.page.keyboard.press('ArrowRight');
  }

  async pressArrowLeft() {
    await this.container.focus();
    await this.page.keyboard.press('ArrowLeft');
  }

  async selectTransition(name: string) {
    await this.transitionButtons.filter({ hasText: name }).click();
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(600);
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
    // Angular lazy-loads the route component; wait for at least one item to
    // appear in the DOM before calling count() which does not auto-wait.
    await expect(preview.galleryItems.first()).toBeVisible();
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

    // Fullscreen toggle must not break keyboard navigation
    await preview.pressArrowRight();
    await preview.waitForAnimation();

    const counterText = await preview.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);

    await preview.fullscreenButton.click();
    await expect(preview.container).toBeVisible();
  });
});

test.describe('Image Preview - Button Navigation', () => {
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

test.describe('Image Preview - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview');
  });

  test('gallery items are keyboard accessible', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    const firstItem = preview.galleryItems.first();
    await firstItem.focus();

    await expect(firstItem).toBeFocused();
  });

  test('gallery items can be activated with Enter key', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

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
    await expect(img).toHaveAttribute('alt', /.+/);
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

    const afterOverflow = await page.evaluate(
      () => window.getComputedStyle(document.body).overflow,
    );
    expect(afterOverflow).toBe('hidden');
  });

  test('unlocks body scroll when preview is closed', async ({ page }) => {
    const preview = new ImagePreviewPage(page);

    await preview.openPreviewAt(0);
    await preview.closePreview();

    const overflow = await page.evaluate(
      () => window.getComputedStyle(document.body).overflow,
    );
    expect(overflow).not.toBe('hidden');
  });
});
