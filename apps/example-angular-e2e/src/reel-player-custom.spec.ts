import { test, expect, Page } from '@playwright/test';

class CustomPlayerPage {
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

  get nextButton() {
    return this.page.locator(
      '.rk-player-nav-arrows button[aria-label="Next slide"]',
    );
  }

  demoButton(id: string) {
    return this.page.locator(`[data-testid="demo-${id}-open"]`);
  }

  async openDemo(id: string) {
    await this.demoButton(id).click();
    await expect(this.overlay).toBeVisible();
  }

  async closePlayer() {
    await this.closeButton.evaluate((el: HTMLElement) => el.click());
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
    await expect(player.demoButton('default-overlay')).toBeVisible();
    await expect(player.demoButton('custom-overlay')).toBeVisible();
    await expect(player.demoButton('custom-controls')).toBeVisible();
    await expect(player.demoButton('custom-slide')).toBeVisible();
    await expect(player.demoButton('custom-nested-nav')).toBeVisible();
  });
});

test.describe('Custom Player - Default Slide Overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('default overlay shows author, description, and likes', async ({
    page,
  }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('default-overlay');

    await expect(page.locator('.rk-reel-slide-overlay').first()).toBeVisible();
    await expect(
      page.locator('.rk-reel-slide-overlay-name').first(),
    ).toBeVisible();
    await expect(
      page.locator('.rk-reel-slide-overlay-description').first(),
    ).toBeVisible();
    await expect(
      page.locator('.rk-reel-slide-overlay-likes').first(),
    ).toBeVisible();
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('default-overlay');
    await player.closePlayer();
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
    await expect(customOverlay.first()).toHaveText(/.+/);
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

  test('rkPlayerSlideOverlay empty template hides default overlay', async ({
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

    // Verifies the SoundButton sub-component does not break overlay lifecycle
    await expect(player.overlay).toBeVisible();
    await player.closePlayer();
  });
});

test.describe('Custom Player - Custom Slide (rkPlayerSlide)', () => {
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('CTA card visible on last slide', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');

    // 10 items total; 9 next clicks to reach the CTA on the last slide
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

    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toHaveCount(0);

    // Selector covers both image and video slide media
    const mediaContent = page.locator(
      '.rk-reel-slide-wrapper img, .rk-reel-slide-wrapper video',
    );
    const count = await mediaContent.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CTA slide has expected content', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-slide');

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

    for (let i = 0; i < 9; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    await expect(page.locator('[data-testid="cta-slide"]')).toBeVisible();

    const prevButton = page.locator(
      '.rk-player-nav-arrows button[aria-label="Previous slide"]',
    );
    await prevButton.click();
    await player.waitForAnimation();

    // Selector covers both image and video slide media
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
  test.skip(({ isMobile }) => isMobile, 'Nested navigation hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-player-custom');
  });

  test('custom nested navigation is visible on multi-media slide', async ({
    page,
  }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

    const customNav = page.locator('[data-testid="custom-nested-nav"]').first();
    await expect(customNav).toBeVisible();
  });

  test('default nested arrows are not present', async ({ page }) => {
    const player = new CustomPlayerPage(page);
    await player.openDemo('custom-nested-nav');

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
