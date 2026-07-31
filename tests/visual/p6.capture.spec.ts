import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { format } from 'prettier';

const storageKey = 'morrowlight:guest-state:v1';
const evidenceDirectory = path.resolve('docs/evidence/screenshots');

const preferences = {
  audio: 'off',
  motion: 'full',
  contrast: 'standard',
  power: 'auto',
} as const;

const returnState = {
  schemaVersion: 1,
  nightId: 'night-00000063',
  seed: 99,
  phase: 'explore',
  currentScene: 'bloomworks',
  preferences,
  completedAttractions: [],
  traces: {},
  discoveries: ['carry:bloom:v1:bridge:5:root'],
  finale: null,
  revision: 1,
};

const finaleState = {
  schemaVersion: 1,
  nightId: 'night-00000063',
  seed: 99,
  phase: 'finale',
  currentScene: 'constellary',
  preferences,
  completedAttractions: ['bloomworks', 'driftglass', 'cabinet', 'windthread'],
  traces: {
    bloomworks: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
    driftglass: {
      attractionId: 'driftglass',
      route: 'horizon',
      companions: ['bell', 'comet', 'moonray'],
    },
    cabinet: { attractionId: 'cabinet', nearThing: 'weather-loom' },
    windthread: { attractionId: 'windthread', flight: 'soar', rings: 7 },
  },
  discoveries: ['carry:bloom:v1:bridge:5:root', 'return:bloom:v1:bridge:5:root:bridge:wander'],
  finale: {
    recipeVersion: 1,
    title: 'The Bridged Far Horizon',
    palette: 'horizon',
    growth: 'bridge',
    emblem: 'weather-loom',
    movement: 'soar',
    motifIds: [
      'bloom:bridge:4',
      'drift:horizon:bell+comet+moonray',
      'near:weather-loom',
      'wind:soar:7',
      'memory:bloom:bridge:5:root',
      'dawn-root:bridge:bridge:wander',
    ],
  },
  revision: 18,
};

async function loadState(page: Page, state: object) {
  await page.goto('/');
  await page.evaluate(
    ({ key, value }: { key: string; value: string }) => window.localStorage.setItem(key, value),
    { key: storageKey, value: JSON.stringify(state) },
  );
  await page.reload();
}

test('captures the P6 return hook and five-act recognition as one visual batch', async ({
  page,
}, testInfo) => {
  await mkdir(evidenceDirectory, { recursive: true });
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];
  const pageErrors: string[] = [];
  const failedResponses: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
    if (message.type() === 'warning') consoleWarnings.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.failure()?.errorText ?? 'request failed'} ${request.url()}`);
  });

  await loadState(page, returnState);
  await expect(page.getByRole('heading', { name: 'A root remembered overnight' })).toBeVisible();
  await expect(page.getByTestId('bloom-return-afterimage')).toHaveAttribute(
    'data-return-pattern',
    'bridge',
  );
  expect(await page.getByTestId('bloom-return-afterimage').locator('path').count()).toBeGreaterThan(
    0,
  );
  const returnAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(returnAxe.violations).toEqual([]);
  const returnOverflow = await page.locator('html').evaluate((html) => ({
    clientWidth: html.clientWidth,
    scrollWidth: html.scrollWidth,
    clientHeight: html.clientHeight,
    scrollHeight: html.scrollHeight,
  }));
  expect(returnOverflow.scrollWidth).toBeLessThanOrEqual(returnOverflow.clientWidth + 1);
  await page.screenshot({
    path: path.join(evidenceDirectory, `p6-return-${testInfo.project.name}.png`),
    fullPage: true,
  });

  await loadState(page, finaleState);
  const acts = page
    .getByRole('list', { name: 'Constellary performance sequence' })
    .getByRole('button');
  const stage = page.getByTestId('constellary-performance-stage');
  const observedBeats: Array<{ beat: string | null; geometry: string | null; marks: number }> = [];
  async function observeBeat(expectedBeat: string) {
    await expect(stage).toHaveAttribute('data-beat', expectedBeat);
    const marks = await stage.locator('svg path, svg circle').count();
    expect(marks).toBeGreaterThan(0);
    observedBeats.push({
      beat: await stage.getAttribute('data-beat'),
      geometry: await stage.getAttribute('data-geometry'),
      marks,
    });
  }

  await observeBeat('awakening');
  await acts.nth(0).click();
  await observeBeat('gathering');
  await acts.nth(1).click();
  await observeBeat('recognition');
  const skipLinkState = await page.locator('.skip-link').evaluate((link) => {
    const rect = link.getBoundingClientRect();
    const style = window.getComputedStyle(link);
    return {
      focused: document.activeElement === link,
      activeElement: document.activeElement?.textContent?.trim().slice(0, 80) ?? null,
      transform: style.transform,
      clipPath: style.clipPath,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      bottom: rect.bottom,
    };
  });
  const finaleAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(finaleAxe.violations).toEqual([]);
  await page.screenshot({
    path: path.join(evidenceDirectory, `p6-finale-${testInfo.project.name}.png`),
    fullPage: true,
  });

  await acts.nth(2).click();
  await observeBeat('climax');
  await acts.nth(3).click();
  await observeBeat('release');
  await acts.nth(4).click();
  await expect(page.getByRole('status', { name: 'Constellary conductor status' })).toContainText(
    'The five-act sky is complete',
  );
  await page.getByText('6 traces are woven into this sky', { exact: true }).click();
  await expect(page.locator('.motif-receipt')).toHaveAttribute('open', '');
  const receiptAxe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(receiptAxe.violations).toEqual([]);
  const receiptOverflow = await page.locator('html').evaluate((html) => ({
    clientWidth: html.clientWidth,
    scrollWidth: html.scrollWidth,
    clientHeight: html.clientHeight,
    scrollHeight: html.scrollHeight,
  }));
  expect(receiptOverflow.scrollWidth).toBeLessThanOrEqual(receiptOverflow.clientWidth + 1);
  await page.screenshot({
    path: path.join(evidenceDirectory, `p6-finale-receipt-${testInfo.project.name}.png`),
    fullPage: true,
  });

  const finaleOverflow = await page.locator('html').evaluate((html) => ({
    clientWidth: html.clientWidth,
    scrollWidth: html.scrollWidth,
    clientHeight: html.clientHeight,
    scrollHeight: html.scrollHeight,
  }));
  expect(finaleOverflow.scrollWidth).toBeLessThanOrEqual(finaleOverflow.clientWidth + 1);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedResponses).toEqual([]);
  expect(failedRequests).toEqual([]);
  const report = {
    project: testInfo.project.name,
    viewport: page.viewportSize(),
    scenes: [
      'Bloomworks return hook',
      'Constellary recognition beat',
      'Constellary release with open night receipt',
    ],
    observedBeats,
    axeViolations: {
      returnHook: returnAxe.violations.length,
      finale: finaleAxe.violations.length,
      openReceipt: receiptAxe.violations.length,
    },
    consoleErrors,
    consoleWarnings,
    pageErrors,
    failedResponses,
    failedRequests,
    overflow: {
      returnHook: returnOverflow,
      finale: finaleOverflow,
      openReceipt: receiptOverflow,
    },
    skipLinkState,
  };
  await writeFile(
    path.join(evidenceDirectory, `p6-browser-qa-${testInfo.project.name}.json`),
    await format(JSON.stringify(report), { parser: 'json' }),
    'utf8',
  );
});
