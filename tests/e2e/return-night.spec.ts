import { expect, test, type Page } from '@playwright/test';

async function growBridgeWithCrossing(page: Page, replyGear: 'Connect' | 'Wander') {
  await page.getByRole('button', { name: 'Enter Bloomworks', exact: true }).click();
  for (const gear of ['Gather seed gear', 'Connect seed gear', 'Wander seed gear']) {
    await page.getByRole('button', { name: gear, exact: true }).click();
  }
  await page.getByRole('button', { name: 'Tend the moon roots', exact: true }).click();
  await page.getByRole('button', { name: 'Choose Crossing socket', exact: true }).click();
  await page.getByRole('button', { name: `${replyGear} seed gear`, exact: true }).click();
  await page.getByRole('button', { name: 'Wake Bloomworks', exact: true }).click();
}

async function completeTwoMoreRealms(page: Page) {
  await page.getByRole('button', { name: 'Enter Driftglass Sea', exact: true }).click();
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: 'Starboard', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Enter the Cabinet of Near Things', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect weather loom drawer', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect enough clock drawer', exact: true }).click();
  await page.getByRole('button', { name: 'Let it follow me', exact: true }).click();
}

test.describe('return-night continuity', () => {
  test('lets one local root survive a new night without carrying old progress', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Visit settings', exact: true }).click();
    await page.getByRole('button', { name: 'Use low power mode', exact: true }).click();
    await page.getByRole('button', { name: 'Visit settings', exact: true }).click();
    await page.getByRole('button', { name: 'Touch the last light of today', exact: true }).click();

    await growBridgeWithCrossing(page, 'Connect');
    const firstAfterlight = page.getByTestId('bloom-map-afterlight');
    const firstGeometry = await firstAfterlight.getAttribute('data-geometry');
    const firstPathCount = await firstAfterlight.locator('path').count();
    expect(firstGeometry).toBe('bloom-map-bridge-5');

    await completeTwoMoreRealms(page);
    await page.getByRole('button', { name: 'Open the Constellary', exact: true }).click();
    await page.getByRole('button', { name: 'Let the park remember for me', exact: true }).click();
    await page.getByRole('button', { name: 'Begin another night', exact: true }).click();

    await expect(
      page.getByRole('button', { name: 'Touch the last light of today', exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('park-root')).toHaveAttribute('data-motion', 'reduced');
    await expect(page.getByTestId('park-root')).toHaveAttribute('data-power', 'low');
    await page.getByRole('button', { name: 'Touch the last light of today', exact: true }).click();
    await expect(page.getByText('0 of 3 lights gathered', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open the Constellary' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Enter Bloomworks', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'A root remembered overnight' })).toBeVisible();
    await expect(page.getByText(/pale crossing with one rail unfinished/i)).toBeVisible();
    const afterimage = page.getByTestId('bloom-return-afterimage');
    await expect(afterimage).toHaveAttribute('data-return-pattern', 'bridge');
    expect(await afterimage.locator('path').count()).toBeGreaterThan(0);
    const runningMemoryAnimations = await afterimage.evaluate(
      (memory) =>
        memory
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running').length,
    );
    expect(runningMemoryAnimations).toBe(0);

    for (const gear of ['Gather seed gear', 'Connect seed gear', 'Wander seed gear']) {
      await page.getByRole('button', { name: gear, exact: true }).click();
    }
    await page.getByRole('button', { name: 'Tend the moon roots', exact: true }).click();
    const listeningSocket = page.getByRole('button', { name: 'Choose Crossing socket' });
    await expect(listeningSocket).toHaveAttribute('data-return-reply', 'true');
    await listeningSocket.click();
    await page.getByRole('button', { name: 'Wander seed gear', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('old rhythm bends toward a new answer');
    await page.getByRole('button', { name: 'Wake Bloomworks', exact: true }).click();

    const returnedAfterlight = page.getByTestId('bloom-map-afterlight');
    await expect(returnedAfterlight).toHaveAttribute(
      'data-geometry',
      'bloom-map-bridge-4-dawn-bridge-wander',
    );
    expect(await returnedAfterlight.locator('path').count()).toBeGreaterThan(firstPathCount);
    expect(await returnedAfterlight.getAttribute('data-geometry')).not.toBe(firstGeometry);

    await completeTwoMoreRealms(page);
    await page.getByRole('button', { name: 'Open the Constellary', exact: true }).click();
    await expect(page.getByText('memory:bloom:bridge:5:root', { exact: true })).toBeVisible();
    await expect(page.getByText('dawn-root:bridge:bridge:wander', { exact: true })).toBeVisible();
    await expect(page.getByText(/carry:bloom:/)).toHaveCount(0);
    const recognition = page.locator('.finale-recognition');
    await expect(recognition).toHaveAttribute(
      'data-geometry',
      'bloom-constellary-bridge-4-dawn-bridge-wander',
    );
    expect(await recognition.locator('[data-projection-role="memory"]').count()).toBe(1);

    const acts = page
      .getByRole('list', { name: 'Constellary performance sequence' })
      .getByRole('button');
    await acts.nth(0).click();
    await acts.nth(1).click();
    await expect(page.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-beat',
      'recognition',
    );
    await expect(page.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-geometry',
      'bloom-constellary-bridge-4-dawn-bridge-wander',
    );

    const noHorizontalClipping = await page
      .locator('html')
      .evaluate((html) => html.scrollWidth <= html.clientWidth + 1);
    expect(noHorizontalClipping).toBe(true);
  });
});
