import { expect, test, type Page } from '@playwright/test';

type AttractionStep = {
  entry: string;
  choice: string;
  completion: string;
};

const threeAttractionRoute: AttractionStep[] = [
  {
    entry: 'Enter Bloomworks',
    choice: 'Grow bridges',
    completion: 'Wake Bloomworks',
  },
  {
    entry: 'Enter Driftglass Sea',
    choice: 'Follow the far horizon',
    completion: 'Set the current',
  },
  {
    entry: 'Enter the Cabinet of Near Things',
    choice: 'Adopt the enough clock',
    completion: 'Let it follow me',
  },
];

async function completeAttraction(page: Page, step: AttractionStep, completed: number) {
  await page.getByRole('button', { name: step.entry, exact: true }).click();
  await expect(page.getByRole('button', { name: step.choice, exact: true })).toBeVisible();

  await page.getByRole('button', { name: step.choice, exact: true }).click();
  const complete = page.getByRole('button', { name: step.completion, exact: true });
  await expect(complete).toBeEnabled();
  await complete.click();

  await expect(page.getByRole('heading', { name: 'Where will your light go?' })).toBeVisible();
  await expect(page.getByText(completed + ' of 3 lights gathered', { exact: true })).toBeVisible();
}

test.describe('Morrowlight guest journey', () => {
  test('takes a first-time guest from arrival through three choices to a keepsake', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(
      page.getByRole('button', { name: 'Touch the last light of today', exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Touch the last light of today', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Where will your light go?' })).toBeVisible();

    for (const [index, step] of threeAttractionRoute.entries()) {
      await completeAttraction(page, step, index + 1);
    }

    await page.getByRole('button', { name: 'Open the Constellary', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'The Constellary remembers' })).toBeVisible();

    await page.getByRole('button', { name: 'Conduct this night', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'This night can wait here.' })).toBeVisible();
    await expect(page.getByText('The park closes gently', { exact: true })).toBeVisible();
  });

  test('keeps arrival, destination, choice, and completion controls keyboard reachable', async ({
    page,
  }) => {
    await page.goto('/');

    const skip = page.getByRole('link', { name: 'Skip to the current scene', exact: true });
    const enter = page.getByRole('button', {
      name: 'Touch the last light of today',
      exact: true,
    });

    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(enter).toBeFocused();

    await page.keyboard.press('Enter');
    const mapHeading = page.getByRole('heading', { name: 'Where will your light go?' });
    await expect(mapHeading).toBeFocused();

    const bloomworks = page.getByRole('button', { name: 'Enter Bloomworks', exact: true });
    await page.keyboard.press('Tab');
    await expect(bloomworks).toBeFocused();
    await page.keyboard.press('Enter');

    const bloomworksHeading = page.getByRole('heading', { name: 'Bloomworks' });
    await expect(bloomworksHeading).toBeFocused();

    const choice = page.getByRole('button', { name: 'Gather close', exact: true });
    await page.keyboard.press('Tab');
    await expect(choice).toBeFocused();
    await page.keyboard.press('Space');
    await expect(choice).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const completion = page.getByRole('button', { name: 'Wake Bloomworks', exact: true });
    await expect(completion).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(mapHeading).toBeFocused();
  });

  test.describe('mobile', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });

    test('keeps the arrival and map controls available at a compact viewport', async ({ page }) => {
      await page.goto('/');
      await expect(
        page.getByRole('button', { name: 'Touch the last light of today', exact: true }),
      ).toBeVisible();

      await page
        .getByRole('button', { name: 'Touch the last light of today', exact: true })
        .click();

      await expect(page.getByRole('heading', { name: 'Where will your light go?' })).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Enter Bloomworks', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Enter the Cabinet of Near Things', exact: true }),
      ).toBeVisible();
    });
  });

  test('starts with reduced motion when requested and can switch to low-power state', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const park = page.getByTestId('park-root');
    await expect(park).toHaveAttribute('data-motion', 'reduced');

    await page.getByRole('button', { name: 'Visit settings', exact: true }).click();
    await page.getByRole('button', { name: 'Use low power mode', exact: true }).click();

    await expect(park).toHaveAttribute('data-power', 'low');
    await expect(page.getByText('Static illustrated scenes', { exact: true })).toBeVisible();
  });
});
