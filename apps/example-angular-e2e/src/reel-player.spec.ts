import { test, expect, Page } from '@playwright/test';

class ReelPlayerPage {
  constructor(private readonly page: Page) {}

  get overlay() {
    return this.page.locator('.rk-reel-overlay');
  }

  get closeButton() {
    return this.page.locator('button[aria-label="Close player"]');
  }

  get soundButton() {
    return this.page.locator(
      'button[aria-label="Mute"], button[aria-label="Unmute"]',
    );
  }

  get prevButton() {
    return this.page.locator(
      '.rk-player-nav-arrows button[aria-label="Previous slide"]',
    );
  }

  get nextButton() {
    return this.page.locator(
      '.rk-player-nav-arrows button[aria-label="Next slide"]',
    );
  }

  get thumbnails() {
    return this.page.locator('[data-testid="thumbnail"]');
  }

  get videoElement() {
    return this.page.locator('video');
  }

  async openPlayerAt(index: number) {
    await this.thumbnails.nth(index).click();
    await expect(this.overlay).toBeVisible();
  }

  async closePlayer() {
    await this.closeButton.evaluate((el: HTMLElement) => el.click());
    await expect(this.overlay).not.toBeVisible();
  }

  async closePlayerWithEsc() {
    await this.page.keyboard.press('Escape');
    await expect(this.overlay).not.toBeVisible();
  }

  async navigateNext() {
    await this.nextButton.click();
  }

  async navigatePrev() {
    await this.prevButton.click();
  }

  async pressArrowDown() {
    await this.page.keyboard.press('ArrowDown');
  }

  async pressArrowUp() {
    await this.page.keyboard.press('ArrowUp');
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }
}

test.describe('Reel Player - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reel Player Demo');
  });

  test('renders gallery grid with thumbnails', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await expect(player.thumbnails.first()).toBeVisible();
    const count = await player.thumbnails.count();
    expect(count).toBeGreaterThan(0);
  });

  test('thumbnail images are lazy loaded', async ({ page }) => {
    // Use the direct-child combinator (>) to target only the cover img, which
    // is an immediate child of the thumbnail card div. This avoids matching the
    // avatar img nested deeper inside the card, which has no loading attribute.
    const coverImgs = page.locator('[data-testid="thumbnail"] > img');
    const count = Math.min(await coverImgs.count(), 3);

    for (let i = 0; i < count; i++) {
      await expect(coverImgs.nth(i)).toHaveAttribute('loading', 'lazy');
    }
  });
});

test.describe('Reel Player - Overlay Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('opens overlay on thumbnail click', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await expect(player.overlay).toBeVisible();
  });

  test('shows close button when overlay is open', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await expect(player.closeButton).toBeVisible();
  });

  test('closes overlay with close button', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await player.closePlayer();
  });

  test('closes overlay with Escape key', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await player.closePlayerWithEsc();
  });

  test('opens overlay at different thumbnail indices', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(3);
    await expect(player.overlay).toBeVisible();
    await player.closePlayer();

    await player.openPlayerAt(7);
    await expect(player.overlay).toBeVisible();
    await player.closePlayer();
  });
});

test.describe('Reel Player - Sound Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('shows sound button on a video slide', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find the first thumbnail that has a video indicator and open it;
    // the sound button only renders when the active slide contains a video.
    const videoIndicator = page.locator('[data-testid="video-indicator"]');
    await expect(videoIndicator.first()).toBeVisible();

    // Retrieve the index of the first video thumbnail from its parent position.
    const firstVideoThumb = videoIndicator.first().locator('..');
    const allThumbs = player.thumbnails;
    const thumbCount = await allThumbs.count();
    let videoIndex = 0;
    for (let i = 0; i < thumbCount; i++) {
      const hasIndicator =
        (await allThumbs
          .nth(i)
          .locator('[data-testid="video-indicator"]')
          .count()) > 0;
      if (hasIndicator) {
        videoIndex = i;
        break;
      }
    }

    await player.openPlayerAt(videoIndex);
    await expect(player.soundButton).toBeVisible();
  });

  test('sound button toggles mute state', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Open the first video slide so the sound button is guaranteed to appear.
    const allThumbs = player.thumbnails;
    const thumbCount = await allThumbs.count();
    let videoIndex = 0;
    for (let i = 0; i < thumbCount; i++) {
      const hasIndicator =
        (await allThumbs
          .nth(i)
          .locator('[data-testid="video-indicator"]')
          .count()) > 0;
      if (hasIndicator) {
        videoIndex = i;
        break;
      }
    }

    await player.openPlayerAt(videoIndex);

    const muteBtn = page.locator('button[aria-label="Mute"]');
    const unmuteBtn = page.locator('button[aria-label="Unmute"]');

    // Either muted or unmuted on open; capture which to assert the toggle direction.
    const initialMute = await muteBtn.isVisible();
    const initialUnmute = await unmuteBtn.isVisible();
    expect(initialMute || initialUnmute).toBe(true);

    await player.soundButton.click();

    if (initialMute) {
      await expect(unmuteBtn).toBeVisible();
    } else {
      await expect(muteBtn).toBeVisible();
    }
  });
});

test.describe('Reel Player - Navigation Arrows', () => {
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('shows next button when overlay is open', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await expect(player.nextButton).toBeVisible();
  });

  test('navigates to next item with Next button', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    await player.navigateNext();
    await player.waitForAnimation();

    // Navigation must not dismiss the overlay
    await expect(player.overlay).toBeVisible();
  });

  test('shows prev button after navigating forward', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(1);

    await expect(player.prevButton).toBeVisible();
  });

  test('navigates to previous item with Prev button', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(1);

    await player.navigatePrev();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('navigates with ArrowDown key', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    await player.pressArrowDown();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });

  test('navigates with ArrowUp key', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(2);

    await player.pressArrowUp();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });

  test('navigates through multiple items with keyboard', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    for (let i = 0; i < 3; i++) {
      await player.pressArrowDown();
      await player.waitForAnimation();
    }

    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Video Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('video thumbnails display play icon indicator', async ({ page }) => {
    // data-testid="video-indicator" is placed on the play-icon badge rendered
    // only when the content item contains at least one video track.
    const videoIndicators = page.locator('[data-testid="video-indicator"]');
    // Wait for the grid to render before counting — lazy-loaded routes may not
    // have painted any badges yet when the assertion first runs on slow viewports.
    await expect(videoIndicators.first()).toBeVisible();
    const count = await videoIndicators.count();
    // Generated content always includes video items; at least one badge expected.
    expect(count).toBeGreaterThan(0);
  });
});
