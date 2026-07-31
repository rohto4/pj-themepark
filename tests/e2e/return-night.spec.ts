import { expect, test, type Locator, type Page } from '@playwright/test';

const storageKey = 'morrowlight:guest-state:v1';

async function activateByTab(page: Page, target: Locator, key: 'Enter' | 'Space', maxTabs = 80) {
  await expect(target).toBeVisible();
  for (let index = 0; index < maxTabs; index += 1) {
    if (await target.evaluate((element) => document.activeElement === element)) break;
    await page.keyboard.press('Tab');
  }
  await expect(target).toBeFocused();
  await page.keyboard.press(key);
}

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
    await page.getByText(/traces are woven into this sky/).click();
    await expect(page.locator('[data-motif-id="memory:bloom:bridge:5:root"]')).toBeVisible();
    await expect(page.locator('[data-motif-id="dawn-root:bridge:bridge:wander"]')).toBeVisible();
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

  test('keeps the overnight reply and all five acts operable by keyboard', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(
      ({ key, value }) => window.localStorage.setItem(key, JSON.stringify(value)),
      {
        key: storageKey,
        value: {
          schemaVersion: 1,
          nightId: 'night-00000063',
          seed: 99,
          phase: 'explore',
          currentScene: 'bloomworks',
          preferences: {
            audio: 'off',
            motion: 'reduced',
            contrast: 'standard',
            power: 'low',
          },
          completedAttractions: [],
          traces: {},
          discoveries: ['carry:bloom:v1:bridge:5:root'],
          finale: null,
          revision: 1,
        },
      },
    );
    await page.reload();

    await expect(page.getByRole('heading', { name: 'A root remembered overnight' })).toBeVisible();
    for (const [gear, key] of [
      ['Gather seed gear', 'Enter'],
      ['Connect seed gear', 'Space'],
      ['Wander seed gear', 'Enter'],
    ] as const) {
      await activateByTab(page, page.getByRole('button', { name: gear, exact: true }), key);
    }
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Tend the moon roots', exact: true }),
      'Space',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Choose Crossing socket', exact: true }),
      'Enter',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Wander seed gear', exact: true }),
      'Space',
    );
    await expect(page.getByRole('status')).toContainText('old rhythm bends toward a new answer');
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Wake Bloomworks', exact: true }),
      'Enter',
    );

    await activateByTab(
      page,
      page.getByRole('button', { name: 'Enter Driftglass Sea', exact: true }),
      'Space',
    );
    for (let index = 0; index < 3; index += 1) {
      await activateByTab(
        page,
        page.getByRole('button', { name: 'Starboard', exact: true }),
        index % 2 === 0 ? 'Enter' : 'Space',
      );
    }
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Enter the Cabinet of Near Things', exact: true }),
      'Enter',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Inspect weather loom drawer', exact: true }),
      'Space',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Inspect enough clock drawer', exact: true }),
      'Enter',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Let it follow me', exact: true }),
      'Space',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Open the Constellary', exact: true }),
      'Enter',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Conduct the sky', exact: true }),
      'Space',
    );

    const acts = page
      .getByRole('list', { name: 'Constellary performance sequence' })
      .getByRole('button');
    await expect(acts).toHaveCount(5);
    for (let index = 0; index < 5; index += 1) {
      await activateByTab(page, acts.nth(index), index % 2 === 0 ? 'Enter' : 'Space');
    }
    await expect(page.getByRole('status', { name: 'Constellary conductor status' })).toContainText(
      'The five-act sky is complete',
    );
    await activateByTab(
      page,
      page.getByRole('button', { name: 'Carry this night with me', exact: true }),
      'Space',
    );
    await expect(page.getByRole('heading', { name: 'This night can wait here.' })).toBeVisible();
  });
});
