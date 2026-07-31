import { expect, test, type Page } from '@playwright/test';

type AttractionStep = {
  entry: string;
  actions: string[];
  completion?: string;
};

const threeAttractionRoute: AttractionStep[] = [
  {
    entry: 'Enter Bloomworks',
    actions: ['Gather seed gear', 'Connect seed gear', 'Wander seed gear'],
    completion: 'Wake Bloomworks',
  },
  {
    entry: 'Enter Driftglass Sea',
    actions: ['Starboard', 'Starboard', 'Starboard'],
  },
  {
    entry: 'Enter the Cabinet of Near Things',
    actions: ['Inspect weather loom drawer', 'Inspect enough clock drawer'],
    completion: 'Let it follow me',
  },
];

async function completeAttraction(page: Page, step: AttractionStep, completed: number) {
  await page.getByRole('button', { name: step.entry, exact: true }).click();
  for (const action of step.actions) {
    const control = page.getByRole('button', { name: action, exact: true });
    await expect(control).toBeVisible();
    await control.click();
  }
  if (step.completion) {
    const complete = page.getByRole('button', { name: step.completion, exact: true });
    await expect(complete).toBeEnabled();
    await complete.click();
  }

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

    await page.getByRole('button', { name: 'Let the park remember for me', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'This night can wait here.' })).toBeVisible();
    await expect(page.getByText('The park closes gently', { exact: true })).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download my Night Chart', exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^morrowlight-night-[0-9a-f]{8}\.svg$/);
  });

  test('rewards the four-realm discovery route, a replay, and active conducting', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Touch the last light of today', exact: true }).click();

    for (const [index, step] of threeAttractionRoute.entries()) {
      await completeAttraction(page, step, index + 1);
    }

    await page.getByRole('button', { name: 'Enter Windthread', exact: true }).click();
    await page.getByRole('button', { name: 'High climb mark', exact: true }).click();
    await page.getByRole('button', { name: 'High climb mark', exact: true }).click();
    await page.getByRole('button', { name: 'Low straight mark', exact: true }).click();
    await page.getByRole('button', { name: 'Tie off the sky-thread', exact: true }).click();

    await page.getByRole('button', { name: /Enter Bloomworks/ }).click();
    await page.getByRole('button', { name: 'Gather seed gear', exact: true }).click();
    await page.getByRole('button', { name: 'Wander seed gear', exact: true }).click();
    await page.getByRole('button', { name: 'Connect seed gear', exact: true }).click();
    await page.getByRole('button', { name: 'Wake Bloomworks', exact: true }).click();
    await expect(page.getByText(/learned a second way through bloomworks/i)).toBeVisible();

    await page.getByRole('button', { name: 'Rest in Hushgarden', exact: true }).click();
    await page.getByRole('button', { name: 'Read the bench constellation', exact: true }).click();
    await page.getByRole('button', { name: 'Return to the Morrowspire' }).click();

    await page.getByRole('button', { name: 'Open the Constellary', exact: true }).click();
    await expect(page.getByText('secret:revisit:bloomworks:wild', { exact: true })).toBeVisible();
    await expect(page.getByText('secret:hush-bench-constellation', { exact: true })).toBeVisible();

    const pulses = page
      .getByRole('list', { name: 'Constellary pulse sequence' })
      .getByRole('button');
    await expect(pulses).toHaveCount(4);
    for (let index = 0; index < 4; index += 1) await pulses.nth(index).click();

    await page.getByRole('button', { name: 'Resolve my constellation', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Begin another night' })).toBeVisible();
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

    const gather = page.getByRole('button', { name: 'Gather seed gear', exact: true });
    await page.keyboard.press('Tab');
    await expect(gather).toBeFocused();
    await page.keyboard.press('Space');
    await expect(gather).toHaveAttribute('aria-pressed', 'true');

    const connect = page.getByRole('button', { name: 'Connect seed gear', exact: true });
    await page.keyboard.press('Tab');
    await expect(connect).toBeFocused();
    await page.keyboard.press('Space');

    const wander = page.getByRole('button', { name: 'Wander seed gear', exact: true });
    await page.keyboard.press('Tab');
    await expect(wander).toBeFocused();
    await page.keyboard.press('Space');

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

  test('treats a quiet Hushgarden discovery as participation without a gate', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Touch the last light of today', exact: true }).click();
    await page.getByRole('button', { name: 'Rest in Hushgarden', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Nothing needs completing here.' }),
    ).toBeFocused();
    await page.getByRole('button', { name: 'Listen to the patient fern', exact: true }).click();
    await expect(page.getByText('1 quiet detail noticed', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Return to the Morrowspire' })).toBeVisible();
  });
});
