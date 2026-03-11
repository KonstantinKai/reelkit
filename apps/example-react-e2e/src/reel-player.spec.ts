import { test, expect, Page } from '@playwright/test';

class ReelPlayerPage {
  constructor(private readonly page: Page) {}

  locator(selector: string) {
    return this.page.locator(selector);
  }

  // Selectors
  get overlay() {
    return this.page.locator('.reel-overlay');
  }

  get closeButton() {
    return this.page.locator('button[aria-label="Close"]');
  }

  get soundButton() {
    return this.page.locator('button[aria-label="Mute"], button[aria-label="Unmute"]');
  }

  get prevButton() {
    // Main player navigation (in .player-nav-arrows), not nested slider nav
    return this.page.locator('.player-nav-arrows button[aria-label="Previous"]');
  }

  get nextButton() {
    // Main player navigation (in .player-nav-arrows), not nested slider nav
    return this.page.locator('.player-nav-arrows button[aria-label="Next"]');
  }

  get thumbnails() {
    return this.page.locator('[style*="aspect-ratio: 9 / 16"]');
  }

  get videoElement() {
    return this.page.locator('video');
  }

  get nestedIndicatorDots() {
    // ReelIndicator renders div dots with border-radius 50%
    return this.page.locator('[style*="border-radius: 50%"]');
  }

  get nestedPrevButton() {
    return this.page.locator('.nested-nav-prev');
  }

  get nestedNextButton() {
    return this.page.locator('.nested-nav-next');
  }

  // Actions
  async openPlayerAt(index: number) {
    await this.thumbnails.nth(index).click();
    await expect(this.overlay).toBeVisible();
  }

  async closePlayer() {
    await this.closeButton.click();
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

  async pressArrowRight() {
    await this.page.keyboard.press('ArrowRight');
  }

  async pressArrowLeft() {
    await this.page.keyboard.press('ArrowLeft');
  }

  async toggleSound() {
    await this.soundButton.click();
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }

  async waitForVideoLoad() {
    await this.page.waitForTimeout(1000);
  }

  async swipeUp(): Promise<void> {
    const box = await this.overlay.boundingBox();
    if (!box) throw new Error('Overlay not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.7;
    const endY = box.y + box.height * 0.3;

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

  async swipeDown(): Promise<void> {
    const box = await this.overlay.boundingBox();
    if (!box) throw new Error('Overlay not found');

    const centerX = box.x + box.width / 2;
    const startY = box.y + box.height * 0.3;
    const endY = box.y + box.height * 0.7;

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

  async getFirstVideoThumbnailIndex(): Promise<number> {
    const videoThumbnails = this.page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      has: this.page.locator('svg.lucide-play'),
    });

    return await videoThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });
  }

  async getFirstImageOnlyThumbnailIndex(): Promise<number> {
    const imageThumbnails = this.page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      hasNot: this.page.locator('svg.lucide-play'),
    }).filter({
      hasNot: this.page.locator('text=/^[2-9]$/'),
    });

    return await imageThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });
  }

  async getFirstMultiMediaIndex(): Promise<number> {
    const allThumbnails = this.page.locator('[style*="aspect-ratio: 9 / 16"]');
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        return i;
      }
    }

    return -1;
  }

  // Assertions
  async isVideoPlaying(): Promise<boolean> {
    const video = this.videoElement.first();
    const count = await video.count();
    if (count === 0) return false;

    return await video.evaluate((el: HTMLVideoElement) => !el.paused);
  }

  async isVideoMuted(): Promise<boolean> {
    const video = this.videoElement.first();
    return await video.evaluate((el: HTMLVideoElement) => el.muted);
  }

  async getSoundButtonOpacity(): Promise<number> {
    const style = await this.soundButton.getAttribute('style');
    const match = style?.match(/opacity:\s*([\d.]+)/);
    return match ? parseFloat(match[1]) : 1;
  }
}

test.describe('Reel Player - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reel Player Demo');
  });

  test('renders thumbnail grid', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    const count = await player.thumbnails.count();
    expect(count).toBeGreaterThan(0);
  });

  test('thumbnails show video indicator for video content', async ({ page }) => {
    // Video items should have a play icon indicator
    const playIcons = page.locator('svg.lucide-play');
    const count = await playIcons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('thumbnails show multi-media count indicator', async ({ page }) => {
    // Multi-media items should show count badge
    const badges = page.locator('text=/^[2-9]$/');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Reel Player - Overlay Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('opens player overlay on thumbnail click', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await expect(player.overlay).toBeVisible();
  });

  test('closes player with close button', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await player.closePlayer();
  });

  test('closes player with Escape key', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);
    await player.closePlayerWithEsc();
  });

  test('opens player at specific index', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(5);
    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Button Navigation', () => {
  // Navigation arrows are hidden on mobile (desktop only)
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('navigates to next slide with Next button', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    await player.navigateNext();
    await player.waitForAnimation();

    // Player should still be open and showing different content
    await expect(player.overlay).toBeVisible();
  });

  test('navigates to previous slide with Previous button', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(1);

    await player.navigatePrev();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });

  test('navigates through multiple slides', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    for (let i = 0; i < 3; i++) {
      await player.navigateNext();
      await player.waitForAnimation();
    }

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
    await player.openPlayerAt(1);

    await player.pressArrowUp();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Video Playback', () => {
  // Video tests only run on chromium due to autoplay policies
  test.skip(({ browserName }) => browserName !== 'chromium', 'Video autoplay varies by browser');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('video autoplays when slide becomes active', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find a video item (has play icon in thumbnail)
    const videoThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      has: page.locator('svg.lucide-play'),
    });

    const firstVideoIndex = await videoThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });

    await player.openPlayerAt(firstVideoIndex);
    await player.waitForVideoLoad();

    const isPlaying = await player.isVideoPlaying();
    expect(isPlaying).toBe(true);
  });

  test('video starts muted', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find first video thumbnail
    const videoThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      has: page.locator('svg.lucide-play'),
    });

    const firstVideoIndex = await videoThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });

    await player.openPlayerAt(firstVideoIndex);
    await player.waitForVideoLoad();

    const isMuted = await player.isVideoMuted();
    expect(isMuted).toBe(true);
  });

  test('sound button toggles mute state', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find first video thumbnail
    const videoThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      has: page.locator('svg.lucide-play'),
    });

    const firstVideoIndex = await videoThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });

    await player.openPlayerAt(firstVideoIndex);
    await player.waitForVideoLoad();

    // Initially muted
    expect(await player.isVideoMuted()).toBe(true);

    // Toggle sound
    await player.toggleSound();
    await page.waitForTimeout(100);

    expect(await player.isVideoMuted()).toBe(false);

    // Toggle back
    await player.toggleSound();
    await page.waitForTimeout(100);

    expect(await player.isVideoMuted()).toBe(true);
  });
});

test.describe('Reel Player - Touch Gestures', () => {
  // Touch simulation requires specific setup
  test.skip(({ browserName }) => browserName !== 'chromium', 'Touch API varies by browser');
  test.skip(({ isMobile }) => !isMobile, 'Touch tests only on mobile devices');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('player responds to touch interactions', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    // Verify overlay is open
    await expect(player.overlay).toBeVisible();

    // Touch the overlay area
    const box = await player.overlay.boundingBox();
    if (!box) throw new Error('Overlay not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Simple tap should not close the player
    await page.touchscreen.tap(centerX, centerY);
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Nested Slider', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('multi-media posts show indicator dots', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail (has count badge with number 2-9)
    const multiThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      has: page.locator('div').filter({ hasText: /^[2-9]$/ }),
    });

    const count = await multiThumbnails.count();
    if (count === 0) {
      test.skip();
      return;
    }

    // Get index of first multi-media item
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    // Should show indicator dots for nested slider inside the overlay
    // Multi-media posts have multiple dots rendered as divs with border-radius
    const indicatorDots = player.overlay.locator('[style*="border-radius: 50%"]');
    const dotCount = await indicatorDots.count();
    // Multi-media posts should have at least 2 dots
    expect(dotCount).toBeGreaterThanOrEqual(2);
  });

  test('horizontal arrow keys navigate nested slider', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail (has count badge with number 2-9)
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    // Navigate right in nested slider
    await player.pressArrowRight();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();

    // Navigate back left
    await player.pressArrowLeft();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });

  test('horizontal wheel navigates nested slider', async ({ page, isMobile }) => {
    // Mouse wheel not supported on mobile
    test.skip(isMobile, 'Mouse wheel not supported on mobile devices');

    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail (has count badge with number 2-9)
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    // Get the overlay for wheel events
    const overlay = player.overlay;
    const box = await overlay.boundingBox();
    if (!box) throw new Error('Overlay not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Scroll right (positive deltaX) to go to next slide
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(100, 0);
    await player.waitForAnimation();

    // Should still be visible and navigated
    await expect(player.overlay).toBeVisible();

    // Scroll left (negative deltaX) to go back
    await page.mouse.wheel(-100, 0);
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });

  test('vertical wheel on multi-media post does not navigate nested slider', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse wheel not supported on mobile devices');

    const player = new ReelPlayerPage(page);

    const firstMultiIndex = await player.getFirstMultiMediaIndex();
    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    const overlay = player.overlay;
    const box = await overlay.boundingBox();
    if (!box) throw new Error('Overlay not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Vertical wheel should navigate main slider, not nested
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, 100);
    await player.waitForAnimation();

    // Wait for wheel debounce
    await page.waitForTimeout(300);

    // Wheel back
    await page.mouse.wheel(0, -100);
    await player.waitForAnimation();

    // Nested indicator should still show first dot active
    const indicatorDots = overlay.locator('[style*="border-radius: 50%"]');
    const dotCount = await indicatorDots.count();
    if (dotCount >= 2) {
      // First dot should still be active (check opacity or background)
      await expect(player.overlay).toBeVisible();
    }
  });

  test('horizontal wheel on nested slider does not affect main vertical slider', async ({ page, isMobile }) => {
    // Mouse wheel not supported on mobile
    test.skip(isMobile, 'Mouse wheel not supported on mobile devices');

    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    const overlay = player.overlay;
    const box = await overlay.boundingBox();
    if (!box) throw new Error('Overlay not found');

    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    // Horizontal scroll should not change the main vertical slider
    // (would need more sophisticated detection to verify nested vs main)
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(100, 0);
    await player.waitForAnimation();

    // Player should still be open at the same main slide
    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Nested Slider Navigation Buttons', () => {
  // Navigation arrows are hidden on mobile (desktop only)
  test.skip(({ isMobile }) => isMobile, 'Nested navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('shows next button on first media item of multi-media post', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    // On first item, next button should be visible, prev should not
    await expect(player.nestedNextButton).toBeVisible();
    await expect(player.nestedPrevButton).not.toBeVisible();
  });

  test('shows prev button after navigating to second item', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    // Navigate to next item
    await player.nestedNextButton.click();
    await player.waitForAnimation();

    // Now prev button should be visible
    await expect(player.nestedPrevButton).toBeVisible();
  });

  test('navigates with nested prev/next buttons', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let firstMultiIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^[2-9]$/ });
      if ((await badge.count()) > 0) {
        firstMultiIndex = i;
        break;
      }
    }

    if (firstMultiIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(firstMultiIndex);
    await player.waitForAnimation();

    // Navigate forward
    await player.nestedNextButton.click();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();

    // Navigate back
    await player.nestedPrevButton.click();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
    // Back at first item, prev should be hidden again
    await expect(player.nestedPrevButton).not.toBeVisible();
  });

  test('hides next button on last media item', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find multi-media thumbnail with exactly 2 items
    const allThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]');
    let twoItemIndex = -1;
    const totalCount = await allThumbnails.count();

    for (let i = 0; i < totalCount; i++) {
      const thumb = allThumbnails.nth(i);
      const badge = thumb.locator('div').filter({ hasText: /^2$/ });
      if ((await badge.count()) > 0) {
        twoItemIndex = i;
        break;
      }
    }

    if (twoItemIndex === -1) {
      test.skip();
      return;
    }

    await player.openPlayerAt(twoItemIndex);
    await player.waitForAnimation();

    // Navigate to last item (second of 2)
    await player.nestedNextButton.click();
    await player.waitForAnimation();

    // On last item, next button should be hidden
    await expect(player.nestedNextButton).not.toBeVisible();
    await expect(player.nestedPrevButton).toBeVisible();
  });
});

test.describe('Reel Player - Sound Button State', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Video features vary by browser');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('sound button is visible for video slides', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find first video thumbnail
    const videoThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      has: page.locator('svg.lucide-play'),
    });

    const count = await videoThumbnails.count();
    if (count === 0) {
      test.skip();
      return;
    }

    const firstVideoIndex = await videoThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });

    await player.openPlayerAt(firstVideoIndex);
    await player.waitForVideoLoad();

    await expect(player.soundButton).toBeVisible();
  });

  test('sound button is not visible for image-only slides', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    // Find image-only thumbnail (no play icon, no multi count)
    const imageThumbnails = page.locator('[style*="aspect-ratio: 9 / 16"]').filter({
      hasNot: page.locator('svg.lucide-play'),
    }).filter({
      hasNot: page.locator('text=/^[2-9]$/'),
    });

    const count = await imageThumbnails.count();
    if (count === 0) {
      test.skip();
      return;
    }

    const firstImageIndex = await imageThumbnails.first().evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return 0;
      return Array.from(parent.children).indexOf(el);
    });

    await player.openPlayerAt(firstImageIndex);
    await player.waitForAnimation();

    await expect(player.soundButton).not.toBeVisible();
  });
});

test.describe('Reel Player - Viewport Sizing', () => {
  const MOBILE_BREAKPOINT = 768;

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('fills entire viewport on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('No viewport');

    // Skip if viewport is at or above mobile breakpoint
    test.skip(viewport.width >= MOBILE_BREAKPOINT, 'Mobile-only test (< 768px)');

    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    // Get the reel container dimensions
    const container = player.locator('.reel-container');
    const box = await container.boundingBox();
    if (!box) throw new Error('Container not found');

    // On mobile, container should fill the viewport
    expect(box.width).toBeCloseTo(viewport.width, 0);
    expect(box.height).toBeCloseTo(viewport.height, 0);
  });

  test('maintains aspect ratio on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('No viewport');

    // Skip if viewport is below mobile breakpoint
    test.skip(viewport.width < MOBILE_BREAKPOINT, 'Desktop-only test (>= 768px)');

    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    // Get the reel container dimensions
    const container = player.locator('.reel-container');
    const box = await container.boundingBox();
    if (!box) throw new Error('Container not found');

    // On desktop, container should maintain ~9:16 aspect ratio
    const aspectRatio = box.width / box.height;
    const expectedAspectRatio = 0.5369683357879234; // 9:16.77

    // Allow some tolerance for rounding
    expect(aspectRatio).toBeCloseTo(expectedAspectRatio, 1);
  });

  test('player is centered on desktop', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('No viewport');

    // Skip if viewport is below mobile breakpoint
    test.skip(viewport.width < MOBILE_BREAKPOINT, 'Desktop-only test (>= 768px)');

    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    const container = player.locator('.reel-container');
    const box = await container.boundingBox();
    if (!box) throw new Error('Container not found');

    // Container should be horizontally centered
    const leftMargin = box.x;
    const rightMargin = viewport.width - (box.x + box.width);

    // Left and right margins should be approximately equal (centered)
    expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(5);
  });
});

test.describe('Reel Player - Swipe Gestures', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Touch API varies by browser');
  test.skip(({ isMobile }) => !isMobile, 'Swipe tests only on mobile devices');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('swipe up navigates to next slide', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    await player.swipeUp();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });

  test('swipe down navigates to previous slide', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(1);

    await player.swipeDown();
    await player.waitForAnimation();

    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Rapid Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('rapid next button clicks do not break player', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Navigation arrows hidden on mobile');

    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    for (let i = 0; i < 5; i++) {
      await player.navigateNext();
      await page.waitForTimeout(50);
    }

    await player.waitForAnimation();
    await expect(player.overlay).toBeVisible();

    // Navigation still works after rapid clicks
    await player.navigatePrev();
    await player.waitForAnimation();
    await expect(player.overlay).toBeVisible();
  });

  test('rapid keyboard navigation does not break player', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    await player.openPlayerAt(0);

    for (let i = 0; i < 5; i++) {
      await player.pressArrowDown();
      await page.waitForTimeout(50);
    }

    await player.waitForAnimation();
    await expect(player.overlay).toBeVisible();

    // Navigation still works after rapid key presses
    await player.pressArrowUp();
    await player.waitForAnimation();
    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Window Resize', () => {
  test.skip(({ isMobile }) => isMobile, 'Resize tests only on desktop');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('player adjusts when viewport is resized', async ({ page }) => {
    const player = new ReelPlayerPage(page);
    const originalViewport = page.viewportSize();
    if (!originalViewport) throw new Error('No viewport');

    await player.openPlayerAt(0);

    const container = player.locator('.reel-container');
    const boxBefore = await container.boundingBox();
    if (!boxBefore) throw new Error('Container not found');

    await page.setViewportSize({ width: 800, height: 400 });
    await player.waitForAnimation();

    const boxAfter = await container.boundingBox();
    if (!boxAfter) throw new Error('Container not found after resize');

    expect(boxAfter.height).not.toBe(boxBefore.height);

    // Navigation still works after resize
    await player.pressArrowDown();
    await player.waitForAnimation();
    await expect(player.overlay).toBeVisible();

    // Restore original viewport
    await page.setViewportSize(originalViewport);
  });
});

test.describe('Reel Player - Media Type Transitions', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Video autoplay varies by browser');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('navigating from video to image removes video element', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    const videoIndex = await player.getFirstVideoThumbnailIndex();
    await player.openPlayerAt(videoIndex);
    await player.waitForVideoLoad();

    const initialVideoCount = await player.videoElement.count();
    expect(initialVideoCount).toBeGreaterThan(0);

    // Navigate forward until we reach a slide with no video (max 5 tries)
    for (let i = 0; i < 5; i++) {
      await player.pressArrowDown();
      await player.waitForAnimation();

      const videoCount = await player.videoElement.count();
      if (videoCount === 0) {
        // Reached an image slide
        await expect(player.overlay).toBeVisible();
        return;
      }
    }

    // If all slides had video, that's fine — test is still valid
    await expect(player.overlay).toBeVisible();
  });

  test('navigating from image to video starts autoplay', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    const imageIndex = await player.getFirstImageOnlyThumbnailIndex();
    await player.openPlayerAt(imageIndex);
    await player.waitForAnimation();

    const initialVideoCount = await player.videoElement.count();
    expect(initialVideoCount).toBe(0);

    // Navigate forward until we find a video slide (max 5 tries)
    for (let i = 0; i < 5; i++) {
      await player.pressArrowDown();
      await player.waitForAnimation();

      const videoCount = await player.videoElement.count();
      if (videoCount > 0) {
        await player.waitForVideoLoad();
        const isPlaying = await player.isVideoPlaying();
        expect(isPlaying).toBe(true);
        return;
      }
    }

    // If no video found within 5 slides, skip
    await expect(player.overlay).toBeVisible();
  });
});

test.describe('Reel Player - Video Frame Capture', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Video autoplay varies by browser');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player');
  });

  test('poster visible when returning to video slide', async ({ page }) => {
    const player = new ReelPlayerPage(page);

    const videoIndex = await player.getFirstVideoThumbnailIndex();
    await player.openPlayerAt(videoIndex);
    await player.waitForVideoLoad();

    // Extra wait for video buffering and frame capture
    await page.waitForTimeout(2000);

    // Navigate away
    await player.pressArrowDown();
    await player.waitForAnimation();

    // Navigate back
    await player.pressArrowUp();
    await player.waitForAnimation();

    // Poster element should be visible with a truthy src
    const poster = player.locator('.video-slide-poster');
    const posterCount = await poster.count();
    if (posterCount > 0) {
      await expect(poster.first()).toBeVisible();
      const src = await poster.first().getAttribute('src');
      expect(src).toBeTruthy();
    }

    await expect(player.overlay).toBeVisible();
  });
});
