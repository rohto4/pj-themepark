import { expect, test, type Page } from '@playwright/test';

async function enterBloomworks(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Touch the last light of today', exact: true }).click();
  await page.getByRole('button', { name: 'Enter Bloomworks', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Wake the root garden' })).toBeVisible();
}

async function placeCorePhrase(page: Page) {
  for (const gear of ['Gather seed gear', 'Connect seed gear', 'Wander seed gear']) {
    await page.getByRole('button', { name: gear, exact: true }).click();
  }
}

async function placeMoonChorus(page: Page) {
  await page.getByRole('button', { name: 'Tend the moon roots', exact: true }).click();
  const phrase = [
    ['Choose Crown socket', 'Gather seed gear'],
    ['Choose Crossing socket', 'Connect seed gear'],
    ['Choose Verge socket', 'Wander seed gear'],
  ] as const;

  for (const [socket, gear] of phrase) {
    await page.getByRole('button', { name: socket, exact: true }).click();
    await page.getByRole('button', { name: gear, exact: true }).click();
  }
}

test.describe('Bloomworks root instrument depth', () => {
  test('preserves the three-root exit and rewards the optional spatial chorus', async ({
    page,
  }) => {
    await enterBloomworks(page);
    const graph = page.getByRole('img', { name: 'Living root network' });

    await page.getByRole('button', { name: 'Gather seed gear', exact: true }).click();
    await expect(graph).toHaveAttribute('data-node-count', '1');
    await expect(page.getByRole('status')).toContainText('first living point');

    await page.getByRole('button', { name: 'Connect seed gear', exact: true }).click();
    await page.getByRole('button', { name: 'Wander seed gear', exact: true }).click();
    await expect(graph).toHaveAttribute('data-node-count', '3');
    await expect(page.getByRole('button', { name: 'Wake Bloomworks', exact: true })).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Tend the moon roots', exact: true }),
    ).toBeEnabled();

    await placeMoonChorus(page);

    await expect(graph).toHaveAttribute('data-node-count', '6');
    expect(await page.locator('[data-edge-role]').count()).toBeGreaterThanOrEqual(5);
    await expect(page.getByRole('status')).toContainText('Moon-root chorus found');
    await expect(graph).toHaveAttribute(
      'data-topology',
      'bloom:heart-gather.reach-connect.edge-wander.crown-gather.crossing-connect.verge-wander',
    );

    await page.getByRole('button', { name: 'Wake Bloomworks', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Where will your light go?' })).toBeFocused();
    await expect(page.getByText('1 of 3 lights gathered', { exact: true })).toBeVisible();
  });

  test.describe('mobile quiet route', () => {
    test.use({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });

    test('keeps the six-root meaning in reduced-motion low-power mode without clipping', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.getByRole('button', { name: 'Visit settings', exact: true }).click();
      await page.getByRole('button', { name: 'Use low power mode', exact: true }).click();
      await page.getByRole('button', { name: 'Close settings', exact: true }).click();
      await page
        .getByRole('button', { name: 'Touch the last light of today', exact: true })
        .click();
      await page.getByRole('button', { name: 'Enter Bloomworks', exact: true }).click();

      await placeCorePhrase(page);
      await placeMoonChorus(page);

      const graph = page.getByRole('img', { name: 'Living root network' });
      await expect(graph).toHaveAttribute('data-node-count', '6');
      await expect(page.getByTestId('park-root')).toHaveAttribute('data-motion', 'reduced');
      await expect(page.getByTestId('park-root')).toHaveAttribute('data-power', 'low');
      expect(
        await graph.evaluate(
          (element) =>
            element
              .getAnimations({ subtree: true })
              .filter((animation) => animation.playState === 'running').length,
        ),
      ).toBe(0);

      const clipped = await page.locator('.bloom-play__experience').evaluate((experience) => {
        const viewportWidth = document.documentElement.clientWidth;
        return Array.from(experience.querySelectorAll('svg, button, p, legend'))
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              text: element.textContent?.trim().slice(0, 42),
              left: rect.left,
              right: rect.right,
            };
          })
          .filter(({ left, right }) => left < -1 || right > viewportWidth + 1);
      });
      expect(clipped).toEqual([]);
    });
  });
});
