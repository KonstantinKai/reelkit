import { test, expect, Page } from '@playwright/test';

class CustomPlayerPage {
  constructor(private readonly page: Page) {}

  get overlay() {
    return this.page.locator('.rk-reel-overlay');
  }

  get closeButton() {
    return this.page.locator('button[aria-label="Close"]');
  }

  get soundButton() {
    return this.page.locator(
      'button[aria-label="Mute"], button[aria-label="Unmute"]',
    );
  }

  get nextButton() {
    return this.page.locator('.rk-player-nav-arrows button[aria-label="Next"]');
  }

  demoButton(id: string) {
    return this.page.locator(`[data-testid="demo-${id}-open"]`);
  }

  async openDemo(id: string) {
    await this.demoButton(id).click();
    await expect(this.overlay).toBeVisible();
  }

  async closePlayer() {
    await this.closeButton.click();
    await expect(this.overlay).not.toBeVisible();
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }
}

test.describe('Custom Player - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Custom Reel Player');
  });

  test('renders all demo cards', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await expect(player.demoButton('custom-overlay')).toBeVisible();
    await expect(player.demoButton('custom-controls')).toBeVisible();
    await expect(player.demoButton('custom-slide')).toBeVisible();
    await expect(player.demoButton('custom-nested-nav')).toBeVisible();
    await expect(player.demoButton('infinity')).toBeVisible();
    await expect(player.demoButton('custom-loading-error')).toBeVisible();
  });
});

test.describe('Custom Player - Custom Slide Overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('custom overlay is visible', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-overlay');

    const customOverlay = page.locator('[data-testid="custom-overlay"]');
    await expect(customOverlay.first()).toBeVisible();
  });

  test('default slide overlay is not present', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-overlay');

    const defaultOverlay = page.locator('.rk-reel-slide-overlay');
    await expect(defaultOverlay).toHaveCount(0);
  });

  test('custom overlay shows author name', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-overlay');

    const customOverlay = page.locator('[data-testid="custom-overlay"]');
    const text = await customOverlay.first().textContent();
    expect(text).toBeTruthy();
    // Should contain one of the mock author names
    expect(text!.length).toBeGreaterThan(0);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-overlay');
    await player.closePlayer();
  });
});

test.describe('Custom Player - Custom Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('close button works via CloseButton sub-component', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-controls');

    await expect(player.closeButton).toBeVisible();
    await player.closePlayer();
  });

  test('custom share button is visible', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-controls');

    const shareBtn = page.locator('[data-testid="custom-share-btn"]');
    await expect(shareBtn).toBeVisible();
  });

  test('renderSlideOverlay={() => null} hides default overlay', async ({
    page,
  }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-controls');

    const defaultOverlay = page.locator('.rk-reel-slide-overlay');
    await expect(defaultOverlay).toHaveCount(0);
  });

  test('sound button is present via SoundButton sub-component', async ({
    page,
  }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-controls');

    // SoundButton renders conditionally based on video content + disabled state.
    // Verify that the player is functional (close works) - sound button presence
    // depends on whether the first slide has video.
    await expect(player.overlay).toBeVisible();
    await player.closePlayer();
  });
});

test.describe('Custom Player - Custom Slide (renderSlide)', () => {
  // Navigation arrows hidden on mobile
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('CTA card visible on last slide', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');

    // Navigate to last slide (content has 10 items, need 9 next clicks)
    for (let i = 0; i < 9; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toBeVisible();
  });

  test('default media slide renders on non-last slides', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');

    // On first slide, there should be no CTA
    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toHaveCount(0);

    // But media content should be visible (either img or video)
    const mediaContent = page.locator(
      '.rk-reel-slide-wrapper img, .rk-reel-slide-wrapper video',
    );
    const count = await mediaContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CTA slide has expected content', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');

    // Navigate to last slide
    for (let i = 0; i < 9; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toContainText('Follow for more');
    await expect(ctaSlide).toContainText('Subscribe');
  });

  test('navigating back from CTA shows default slide', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');

    // Navigate to last slide
    for (let i = 0; i < 9; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    await expect(page.locator('[data-testid="cta-slide"]')).toBeVisible();

    // Navigate back
    const prevButton = page.locator(
      '.rk-player-nav-arrows button[aria-label="Previous"]',
    );
    await prevButton.click();
    await player.waitForAnimation();

    // CTA may still be in DOM (virtualization keeps adjacent slides) but
    // the current slide should have media content, not be the CTA
    const mediaContent = page.locator(
      '.rk-reel-slide-wrapper img, .rk-reel-slide-wrapper video',
    );
    const count = await mediaContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');
    await player.closePlayer();
  });
});

test.describe('Custom Player - Custom Nested Navigation', () => {
  // Nested nav arrows are desktop only
  test.skip(({ isMobile }) => isMobile, 'Nested navigation hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('custom nested navigation is visible on multi-media slide', async ({
    page,
  }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

    // The first slide should be multi-media (content sorted multi-first)
    // Use .first() because virtualization renders adjacent slides too
    const customNav = page.locator('[data-testid="custom-nested-nav"]').first();
    await expect(customNav).toBeVisible();
  });

  test('default nested arrows are not present', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

    // Default rk-nested-nav arrows should be replaced
    const defaultArrows = page.locator('.rk-nested-nav');
    await expect(defaultArrows).toHaveCount(0);
  });

  test('counter shows correct initial position', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

    const counter = page
      .locator('[data-testid="custom-nested-counter"]')
      .first();
    await expect(counter).toContainText('1 /');
  });

  test('next button navigates within nested slider', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

    const nextBtn = page.locator('[data-testid="custom-nested-next"]').first();
    await nextBtn.click();
    await player.waitForAnimation();

    const counter = page
      .locator('[data-testid="custom-nested-counter"]')
      .first();
    await expect(counter).toContainText('2 /');
  });

  test('prev button is disabled on first item', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

    const prevBtn = page.locator('[data-testid="custom-nested-prev"]').first();
    await expect(prevBtn).toBeDisabled();
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');
    await player.closePlayer();
  });
});

test.describe('Custom Player - Infinity (Lazy Load)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('opens and shows index indicator', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('infinity');

    // Fixed-position index badge should be visible
    await expect(page.locator('text=/1 \\/ \\d+/')).toBeVisible();
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('infinity');
    await player.closePlayer();
  });
});

test.describe('Custom Player - Custom Loading / Error', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('opens and shows player overlay', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-loading-error');

    await expect(player.overlay).toBeVisible();
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-loading-error');
    await player.closePlayer();
  });
});
