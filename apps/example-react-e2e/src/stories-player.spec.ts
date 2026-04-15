import { test, expect, Page } from '@playwright/test';

class StoriesPage {
  constructor(private readonly page: Page) {}

  get overlay() {
    return this.page.locator('.rk-stories-overlay');
  }

  get closeButton() {
    return this.page.locator('button[aria-label="Close"]');
  }

  get rings() {
    return this.page.locator('.rk-stories-ring');
  }

  get header() {
    return this.page.locator('.rk-stories-header');
  }

  get authorName() {
    return this.page.locator('.rk-stories-header-name');
  }

  get prevButton() {
    return this.page.locator('button[aria-label="Previous story"]');
  }

  get nextButton() {
    return this.page.locator('button[aria-label="Next story"]');
  }

  async openGroup(index: number) {
    await this.rings.nth(index).click();
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

test.describe('Stories Player - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stories-player');
  });

  test('renders page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Stories Player Demo');
  });

  test('renders story rings', async ({ page }) => {
    const stories = new StoriesPage(page);
    const count = await stories.rings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('renders transition buttons', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'cube' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'fade' })).toBeVisible();
  });
});

test.describe('Stories Player - Overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stories-player');
  });

  test('opens overlay on ring click', async ({ page }) => {
    const stories = new StoriesPage(page);
    await stories.openGroup(0);

    await expect(stories.header).toBeVisible();
    await expect(stories.authorName).toBeVisible();
  });

  test('closes with close button', async ({ page }) => {
    const stories = new StoriesPage(page);
    await stories.openGroup(0);
    await stories.closePlayer();
  });

  test('closes with Escape key', async ({ page }) => {
    const stories = new StoriesPage(page);
    await stories.openGroup(0);

    await page.keyboard.press('Escape');
    await expect(stories.overlay).not.toBeVisible();
  });

  test('shows author name in header', async ({ page }) => {
    const stories = new StoriesPage(page);
    await stories.openGroup(0);

    const name = await stories.authorName.textContent();
    expect(name!.length).toBeGreaterThan(0);
  });
});

test.describe('Stories Player - Navigation', () => {
  // Nav arrows hidden on mobile
  test.skip(({ isMobile }) => isMobile, 'Navigation arrows hidden on mobile');

  test.beforeEach(async ({ page }) => {
    await page.goto('/stories-player');
  });

  test('next button advances story', async ({ page }) => {
    const stories = new StoriesPage(page);
    await stories.openGroup(0);

    await stories.nextButton.click();
    await stories.waitForAnimation();

    await expect(stories.overlay).toBeVisible();
  });

  test('prev button goes back', async ({ page }) => {
    const stories = new StoriesPage(page);
    await stories.openGroup(0);

    // Go forward then back
    await stories.nextButton.click();
    await stories.waitForAnimation();
    await stories.prevButton.click();
    await stories.waitForAnimation();

    await expect(stories.overlay).toBeVisible();
  });
});

test.describe('Stories Player - Different groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/stories-player');
  });

  test('opening second group shows different author', async ({ page }) => {
    const stories = new StoriesPage(page);

    // Open first group, get author name
    await stories.openGroup(0);
    const firstName = await stories.authorName.textContent();
    await stories.closePlayer();

    // Open second group
    await stories.openGroup(1);
    const secondName = await stories.authorName.textContent();

    expect(firstName).not.toBe(secondName);
  });
});
