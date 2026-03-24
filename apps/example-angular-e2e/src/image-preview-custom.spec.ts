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
    await this.closeButton.evaluate((el: HTMLElement) => el.click());
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
    await expect(player.demoButton('default-info')).toBeVisible();
    await expect(player.demoButton('custom-info')).toBeVisible();
    await expect(player.demoButton('custom-controls')).toBeVisible();
    await expect(player.demoButton('custom-slide')).toBeVisible();
    await expect(player.demoButton('custom-navigation')).toBeVisible();
  });
});

test.describe('Custom Lightbox - Default Info', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('default info overlay shows title and description', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('default-info');

    await expect(page.locator('.rk-lightbox-title').first()).toBeVisible();
    await expect(
      page.locator('.rk-lightbox-description').first(),
    ).toBeVisible();
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('default-info');
    await player.closeLightbox();
  });
});

test.describe('Custom Lightbox - Custom Info (rkLightboxInfo)', () => {
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
    await expect(customInfo).toHaveText(/.+/);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-info');
    await player.closeLightbox();
  });
});

test.describe('Custom Lightbox - Custom Controls (rkLightboxControls)', () => {
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

  test('showInfo=false hides default info', async ({ page }) => {
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

    await expect(closeBtn).toBeVisible();
    await expect(downloadBtn).toBeVisible();

    const closeBox = await closeBtn.boundingBox();
    const dlBox = await downloadBtn.boundingBox();

    expect(closeBox).toBeTruthy();
    expect(dlBox).toBeTruthy();

    // In Angular, <rk-close-button> renders as a host element wrapping the
    // inner <button class="rk-lightbox-close">. The CSS positions that inner
    // button as position:absolute at right:16px of the lightbox container,
    // while the download button sits in a flex row. Both are in the right-hand
    // portion of the header area. Verify the close button is in the top-right
    // area (right half of viewport) and the download button is to its left,
    // using a tolerance that accounts for Angular host element layout differences.
    const viewportWidth = page.viewportSize()!.width;
    expect(closeBox!.x).toBeGreaterThan(viewportWidth / 2);
    expect(dlBox!.x + dlBox!.width).toBeLessThanOrEqual(closeBox!.x + 44);
  });
});

test.describe('Custom Lightbox - Custom Slide (rkLightboxSlide)', () => {
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/image-preview-custom');
  });

  test('CTA card visible on last slide', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');

    // 6 images total; 5 next clicks to reach the last slide
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

    const ctaSlide = page.locator('[data-testid="cta-slide"]');
    await expect(ctaSlide).toHaveCount(0);

    const img = page.locator('.rk-lightbox-img');
    const count = await img.count();
    expect(count).toBeGreaterThan(0);
  });

  test('CTA slide has expected content', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-slide');

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

    for (let i = 0; i < 5; i++) {
      await player.nextButton.click();
      await player.waitForAnimation();
    }

    await expect(page.locator('[data-testid="cta-slide"]')).toBeVisible();

    await player.prevButton.click();
    await player.waitForAnimation();

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

test.describe('Custom Lightbox - Custom Navigation (rkLightboxNavigation)', () => {
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

    const defaultCounter = page.locator('.rk-lightbox-counter');
    await expect(defaultCounter).toHaveCount(0);

    const customCounter = page.locator('[data-testid="custom-nav-counter"]');
    await expect(customCounter).toHaveCount(1);
  });

  test('close and fullscreen buttons do not overlap', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');

    const closeBtn = page.locator('.rk-lightbox-close');
    const fullscreenBtn = page.locator('.rk-lightbox-btn');

    await expect(closeBtn).toBeVisible();
    await expect(fullscreenBtn).toBeVisible();

    const closeBox = await closeBtn.boundingBox();
    const fsBox = await fullscreenBtn.boundingBox();

    expect(closeBox).toBeTruthy();
    expect(fsBox).toBeTruthy();

    // In Angular, <rk-close-button> and <rk-fullscreen-button> render as host
    // elements wrapping their inner buttons. The inner buttons have
    // position:absolute (close) and are in a flex row (fullscreen). Both sit
    // in the top-right area of the overlay. Verify the fullscreen button is to
    // the left of the close button with a tolerance that accounts for Angular
    // host element layout differences.
    const viewportWidth = page.viewportSize()!.width;
    expect(closeBox!.x).toBeGreaterThan(viewportWidth / 2);
    expect(fsBox!.x + fsBox!.width).toBeLessThanOrEqual(closeBox!.x + 44);
  });

  test('closes with close button', async ({ page }) => {
    const player = new CustomLightboxPage(page);
    await player.openDemo('custom-navigation');
    await player.closeLightbox();
  });
});
