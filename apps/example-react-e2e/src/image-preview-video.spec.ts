import { test, expect, Page } from '@playwright/test';

class VideoGalleryPage {
  constructor(private page: Page) {}

  get container() {
    return this.page.locator('.rk-lightbox-container');
  }

  get closeButton() {
    return this.page.locator('.rk-lightbox-close');
  }

  get counter() {
    return this.page.locator('.rk-lightbox-counter');
  }

  get galleryItems() {
    return this.page.locator('.gallery-item');
  }

  get soundButton() {
    return this.page.locator('button[title="Unmute"], button[title="Mute"]');
  }

  get muteButton() {
    return this.page.locator('button[title="Unmute"]');
  }

  get unmuteButton() {
    return this.page.locator('button[title="Mute"]');
  }

  get videoContainer() {
    return this.page.locator('.rk-lightbox-video-container');
  }

  get videoElement() {
    return this.page.locator('.rk-lightbox-video-element');
  }

  get imageElement() {
    return this.page.locator('.rk-lightbox-img');
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

  async pressArrowRight() {
    await this.page.keyboard.press('ArrowRight');
  }

  async pressArrowLeft() {
    await this.page.keyboard.press('ArrowLeft');
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }

  async getCounterText(): Promise<string> {
    return (await this.counter.textContent()) || '';
  }
}

test.describe('Video Gallery - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-video');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Mixed Gallery');
  });

  test('renders gallery grid with items', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    const count = await gallery.galleryItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('renders transition selector buttons', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    const transitions = ['slide', 'fade', 'zoom-in'];

    for (const transition of transitions) {
      await expect(
        gallery.transitionButtons.filter({ hasText: transition }),
      ).toBeVisible();
    }
  });
});

test.describe('Video Gallery - Lightbox Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-video');
  });

  test('opens lightbox on thumbnail click', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);
    await expect(gallery.container).toBeVisible();
  });

  test('shows counter', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);

    const counterText = await gallery.getCounterText();
    expect(counterText).toMatch(/1\s*\/\s*\d+/);
  });

  test('shows close button', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);
    await expect(gallery.closeButton).toBeVisible();
  });

  test('closes lightbox with close button', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);
    await gallery.closePreview();
  });

  test('closes lightbox with Escape key', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);

    await page.keyboard.press('Escape');
    await expect(gallery.container).not.toBeVisible();
  });

  test('sound button is visible in controls', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);
    await expect(gallery.soundButton).toBeVisible();
  });

  test('sound button defaults to muted state', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);
    await expect(gallery.muteButton).toBeVisible();
  });

  test('sound button toggles mute state', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(0);

    // Initially muted
    await expect(gallery.muteButton).toBeVisible();

    // Click to unmute
    await gallery.muteButton.click();
    await expect(gallery.unmuteButton).toBeVisible();

    // Click to mute again
    await gallery.unmuteButton.click();
    await expect(gallery.muteButton).toBeVisible();
  });
});

test.describe('Video Gallery - Image Slides', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-video');
  });

  test('displays image for image items (first item)', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    // First item is an image
    await gallery.openPreviewAt(0);
    await expect(gallery.imageElement).toBeVisible();
  });
});

test.describe('Video Gallery - Video Slides', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-video');
  });

  test('displays video container for video items', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    // Second item (index 1) is a video
    await gallery.openPreviewAt(1);
    await expect(gallery.videoContainer).toBeVisible();
  });

  test('video element is present when video slide is active', async ({
    page,
  }) => {
    const gallery = new VideoGalleryPage(page);
    await gallery.openPreviewAt(1);

    // Wait a moment for the shared video element to be appended
    await page.waitForTimeout(500);
    await expect(gallery.videoElement).toBeVisible();
  });
});

test.describe('Video Gallery - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-video');
  });

  test('navigates between mixed media with arrow keys', async ({ page }) => {
    const gallery = new VideoGalleryPage(page);
    // Start at image (index 0)
    await gallery.openPreviewAt(0);

    let counterText = await gallery.getCounterText();
    expect(counterText).toMatch(/1\s*\/\s*\d+/);

    // Navigate right to video (index 1)
    await gallery.pressArrowRight();
    await gallery.waitForAnimation();

    counterText = await gallery.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);

    // Navigate right to image (index 2)
    await gallery.pressArrowRight();
    await gallery.waitForAnimation();

    counterText = await gallery.getCounterText();
    expect(counterText).toMatch(/3\s*\/\s*\d+/);

    // Navigate left back to video (index 1)
    await gallery.pressArrowLeft();
    await gallery.waitForAnimation();

    counterText = await gallery.getCounterText();
    expect(counterText).toMatch(/2\s*\/\s*\d+/);
  });
});
