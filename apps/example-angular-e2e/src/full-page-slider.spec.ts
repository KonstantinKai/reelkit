import { test, expect } from '@playwright/test';

class SliderPage {
  constructor(private readonly page: import('@playwright/test').Page) {}

  get counter() {
    return this.page.locator('text=/\\d+ \\/ 10,000/').first();
  }

  get nextButton() {
    return this.page.locator('button', { hasText: 'Next' });
  }

  get prevButton() {
    return this.page.locator('button', { hasText: 'Previous' });
  }

  get goToInput() {
    return this.page.locator('input[placeholder="Slide #"]');
  }

  get goToButton() {
    return this.page.locator('button', { hasText: 'Go' });
  }

  get sizeModeToggle() {
    return this.page.locator('button', { hasText: /size:/ });
  }

  get indicatorModeToggle() {
    return this.page.locator('[data-testid="indicator-mode-toggle"]');
  }

  get slideTitle() {
    // The reel virtualizes 3 slides (prev, current, next) in the DOM at once.
    // Active slide has no aria-hidden; surrounding slides have aria-hidden="true".
    // Targeting h1 inside the non-hidden slide group avoids picking up the
    // previous or next buffered slide that h1.first() would match instead.
    return this.page.locator('[role="group"]:not([aria-hidden="true"]) h1');
  }

  async waitForAnimation() {
    await this.page.waitForTimeout(400);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async clickPrev() {
    await this.prevButton.click();
  }

  async pressArrowDown() {
    // Wait for the reel to be fully rendered and keyboard controller attached
    // before dispatching the key event. Without this, a key press fired
    // immediately after page load may arrive before Angular's ngAfterViewInit
    // has called controller.observe() and attached the keydown listener.
    await this.slideTitle.waitFor({ state: 'visible' });
    await this.page.keyboard.press('ArrowDown');
  }

  async pressArrowUp() {
    await this.slideTitle.waitFor({ state: 'visible' });
    await this.page.keyboard.press('ArrowUp');
  }

  async goToSlide(number: number) {
    await this.goToInput.fill(String(number));
    await this.goToButton.click();
  }
}

test.describe('Full Page Slider - Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders initial slide correctly', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.slideTitle).toContainText('Slide 1');
  });

  test('displays position counter', async ({ page }) => {
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('renders Previous and Next navigation buttons', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.prevButton).toBeVisible();
    await expect(slider.nextButton).toBeVisible();
  });

  test('renders GoTo input and button', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.goToInput).toBeVisible();
    await expect(slider.goToButton).toBeVisible();
  });

  test('renders indicator mode toggle button', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.indicatorModeToggle).toBeVisible();
  });
});

test.describe('Full Page Slider - Button Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to next slide with Next button', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.slideTitle).toContainText('Slide 1');
    await slider.clickNext();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 2');
    await expect(page.locator('text=2 / 10,000')).toBeVisible();
  });

  test('navigates to previous slide with Previous button', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.clickNext();
    await slider.waitForAnimation();
    await expect(slider.slideTitle).toContainText('Slide 2');

    await slider.clickPrev();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 1');
    await expect(page.locator('text=1 / 10,000')).toBeVisible();
  });

  test('navigates through multiple slides', async ({ page }) => {
    const slider = new SliderPage(page);

    for (let i = 1; i <= 5; i++) {
      await expect(slider.slideTitle).toContainText(`Slide ${i}`);
      await slider.clickNext();
      await slider.waitForAnimation();
    }

    await expect(slider.slideTitle).toContainText('Slide 6');
  });

  test('cannot navigate before first slide', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.slideTitle).toContainText('Slide 1');
    await slider.clickPrev();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 1');
  });
});

test.describe('Full Page Slider - Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates with ArrowDown key', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.slideTitle).toContainText('Slide 1');
    await slider.pressArrowDown();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 2');
  });

  test('navigates with ArrowUp key', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.pressArrowDown();
    await slider.waitForAnimation();
    await expect(slider.slideTitle).toContainText('Slide 2');

    await slider.pressArrowUp();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 1');
  });

  test('navigates through multiple slides with keyboard', async ({ page }) => {
    const slider = new SliderPage(page);

    for (let i = 0; i < 4; i++) {
      await slider.pressArrowDown();
      await slider.waitForAnimation();
    }

    await expect(slider.slideTitle).toContainText('Slide 5');
  });
});

test.describe('Full Page Slider - GoTo Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigates to specific slide via GoTo input and button', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    await slider.goToSlide(100);
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 100');
    await expect(page.locator('text=100 / 10,000')).toBeVisible();
  });

  test('navigates to specific slide via GoTo input with Enter key', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    await slider.goToInput.fill('50');
    await slider.goToInput.press('Enter');
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 50');
  });

  test('navigates to last slide via GoTo input', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.goToSlide(10000);
    await slider.waitForAnimation();

    await expect(page.locator('text=10,000 / 10,000')).toBeVisible();
  });
});

test.describe('Full Page Slider - Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('indicator mode toggle button is visible', async ({ page }) => {
    const slider = new SliderPage(page);

    await expect(slider.indicatorModeToggle).toBeVisible();
  });

  test('indicator mode toggle cycles between auto and controlled', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    const initialText = (await slider.indicatorModeToggle.textContent()) ?? '';

    await slider.indicatorModeToggle.click();

    await expect(slider.indicatorModeToggle).not.toHaveText(initialText);

    await slider.indicatorModeToggle.click();
    await expect(slider.indicatorModeToggle).toHaveText(initialText);
  });
});

test.describe('Full Page Slider - Size Mode Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('switching from explicit to auto size keeps slide visible', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    await expect(slider.slideTitle).toContainText('Slide 1');
    await expect(slider.sizeModeToggle).toContainText('size:');

    await slider.sizeModeToggle.click();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 1');
    await expect(slider.sizeModeToggle).toContainText('auto');
  });

  test('switching back to explicit size keeps slide visible', async ({
    page,
  }) => {
    const slider = new SliderPage(page);

    await slider.sizeModeToggle.click();
    await slider.waitForAnimation();
    await expect(slider.sizeModeToggle).toContainText('auto');

    await slider.sizeModeToggle.click();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 1');
    await expect(slider.sizeModeToggle).not.toContainText('auto');
  });

  test('navigation works after switching to auto size', async ({ page }) => {
    const slider = new SliderPage(page);

    await slider.sizeModeToggle.click();
    await slider.waitForAnimation();

    await slider.clickNext();
    await slider.waitForAnimation();

    await expect(slider.slideTitle).toContainText('Slide 2');
  });
});
