import { test, expect, Page } from '@playwright/test';

class CustomLightboxPage {
  constructor(private readonly page: Page) {}

  get container() {
    return this.page.locator('.rk-lightbox-container');
  }

  get closeButton() {
    return this.page.locator('.rk-lightbox-close');
  }

  get counter() {
    return this.page.locator('.rk-lightbox-counter');
  }

  get nextButton() {
    return this.page.locator('.rk-lightbox-nav-next');
  }

  get prevButton() {
    return this.page.locator('.rk-lightbox-nav-prev');
  }

  demoButton(id: string) {
    return this.page.locator(`[data-testid="demo-${id}-open"]`);
  }

  async openDemo(id: string) {
    await this.demoButton(id).click();
    await expect(this.container).toBeVisible();
  }

  async closeLightbox() {
    await this.closeButton.click();
    await expect(this.container).not.toBeVisible();
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }
}

test.describe('Custom Lightbox - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Custom Lightbox');
  });

  test('renders all demo cards', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await expect(player.demoButton('custom-info')).toBeVisible();
    await expect(player.demoButton('custom-controls')).toBeVisible();
    await expect(player.demoButton('custom-slide')).toBeVisible();
    await expect(player.demoButton('custom-navigation')).toBeVisible();
    await expect(player.demoButton('custom-loading-error')).toBeVisible();
  });
});

test.describe('Custom Lightbox - Custom Info (renderInfo)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('custom info element is visible', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-info');

    const customInfo = page.locator('[data-testid="custom-info"]');
    await expect(customInfo).toBeVisible();
  });

  test('default lightbox-info is not present', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-info');

    const defaultInfo = page.locator('.rk-lightbox-info');
    await expect(defaultInfo).toHaveCount(0);
  });

  test('custom info shows image title', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-info');

    const customInfo = page.locator('[data-testid="custom-info"]');
    const text = await customInfo.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-info');
    await player.closeLightbox();
  });
});

test.describe('Custom Lightbox - Custom Controls (renderControls)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('close button works via CloseButton sub-component', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-controls');

    await expect(player.closeButton).toBeVisible();
    await player.closeLightbox();
  });

  test('custom download button is visible', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-controls');

    const downloadBtn = page.locator('[data-testid="custom-download-btn"]');
    await expect(downloadBtn).toBeVisible();
  });

  test('renderInfo={() => null} hides default info', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-controls');

    const defaultInfo = page.locator('.rk-lightbox-info');
    await expect(defaultInfo).toHaveCount(0);
  });

  test('counter sub-component shows correct text', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-controls');

    await expect(player.counter).toContainText('1 / 6');
  });

  test('close button does not overlap download button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-controls');

    const closeBtn = page.locator('.rk-lightbox-close');
    const downloadBtn = page.locator('[data-testid="custom-download-btn"]');

    const closeBox = await closeBtn.boundingBox();
    const dlBox = await downloadBtn.boundingBox();

    expect(closeBox).toBeTruthy();
    expect(dlBox).toBeTruthy();

    // Download button should be to the left of close button
    expect(dlBox!.x + dlBox!.width).toBeLessThanOrEqual(closeBox!.x + 2);
  });
});

test.describe('Custom Lightbox - Custom Slide (renderSlide)', () => {
  // Navigation arrows hidden on mobile
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('CTA card visible on last slide', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');

    // Navigate to last slide (6 images, need 5 next clicks)
    for (let i = 0; i < 5; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toBeVisible();
  });

  test('default image renders on non-last slides', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');

    // On first slide, no CTA
    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toHaveCount(0);

    // Default image should be visible
    const img = page.locator('.rk-lightbox-img');
    const count = await img.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CTA slide has expected content', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');

    // Navigate to last slide
    for (let i = 0; i < 5; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toContainText('View all photos');
    await expect(ctaSlide).toContainText('Browse Gallery');
  });

  test('navigating back from CTA shows default slide', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');

    // Navigate to last slide
    for (let i = 0; i < 5; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    await expect(page.locator('[data-testid="cta-slide"]')).toBeVisible();

    // Navigate back
    await player.prevButton.click();
    await player.waitForAnimation();

    // Image content should be present
    const img = page.locator('.rk-lightbox-img');
    const count = await img.count();
    expect(count).toBeGreaterThan(0);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');
    await player.closeLightbox();
  });
});

test.describe('Custom Lightbox - Custom Navigation (renderNavigation)', () => {
  // Custom navigation arrows might be hidden on mobile by default
  test.skip(({ isMobile }) => isMobile, 'Navigation test on desktop only');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('custom navigation is visible', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const customNav = page.locator('[data-testid="custom-nav"]');
    await expect(customNav).toBeVisible();
  });

  test('default navigation is not present', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const defaultNav = page.locator('.rk-lightbox-nav');
    await expect(defaultNav).toHaveCount(0);
  });

  test('counter shows correct initial position', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const counter = page.locator('[data-testid="custom-nav-counter"]');
    await expect(counter).toContainText('1 / 6');
  });

  test('next button navigates', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const nextBtn = page.locator('[data-testid="custom-nav-next"]');
    await nextBtn.click();
    await player.waitForAnimation();

    const counter = page.locator('[data-testid="custom-nav-counter"]');
    await expect(counter).toContainText('2 / 6');
  });

  test('prev button is disabled on first item', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const prevBtn = page.locator('[data-testid="custom-nav-prev"]');
    await expect(prevBtn).toBeDisabled();
  });

  test('only one counter is visible', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    // Default counter from LightboxControls should not be present
    const defaultCounter = page.locator('.rk-lightbox-counter');
    await expect(defaultCounter).toHaveCount(0);

    // Only the custom nav counter should exist
    const customCounter = page.locator('[data-testid="custom-nav-counter"]');
    await expect(customCounter).toHaveCount(1);
  });

  test('close and fullscreen buttons do not overlap', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const closeBtn = page.locator('.rk-lightbox-close');
    const fullscreenBtn = page.locator('.rk-lightbox-btn');

    const closeBox = await closeBtn.boundingBox();
    const fsBox = await fullscreenBtn.boundingBox();

    expect(closeBox).toBeTruthy();
    expect(fsBox).toBeTruthy();

    // Boxes should not overlap: close should be to the right of fullscreen
    expect(fsBox!.x + fsBox!.width).toBeLessThanOrEqual(closeBox!.x + 2);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');
    await player.closeLightbox();
  });
});

test.describe('Custom Lightbox - Custom Loading / Error', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('opens and shows lightbox', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-loading-error');

    await expect(player.container).toBeVisible();
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-loading-error');
    await player.closeLightbox();
  });
});
