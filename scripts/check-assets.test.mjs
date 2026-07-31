import { afterEach, describe, expect, it } from 'vitest';
import { mkdir, mkdtemp, rm, truncate, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  AssetBudgetError,
  DEFAULT_LIMITS,
  assertAssetBudget,
  inspectAssets,
} from './check-assets.mjs';

const temporaryDirectories = [];

async function createAssetDirectory() {
  const directory = await mkdtemp(path.join(tmpdir(), 'morrowlight-asset-check-'));
  temporaryDirectories.push(directory);
  return directory;
}

async function writeAsset(directory, relativePath, contents = '') {
  const filePath = path.join(directory, ...relativePath.split('/'));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
  return filePath;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('asset build-budget check', () => {
  it('accepts ordinary deployable assets', async () => {
    const directory = await createAssetDirectory();
    await writeAsset(directory, 'index.html', '<!doctype html>');
    await writeAsset(directory, 'assets/app-a1b2c3.js', 'console.log("ready")');
    await writeAsset(directory, 'assets/morrowlight-c4d5e6.woff2', 'font-data');

    const report = await assertAssetBudget(directory);

    expect(report.fileCount).toBe(3);
    expect(report.totalBytes).toBeGreaterThan(0);
    expect(report.violations).toEqual([]);
  });

  it('rejects source maps, test fixtures, and raw media', async () => {
    const directory = await createAssetDirectory();
    await writeAsset(directory, 'assets/app.js.map', '{}');
    await writeAsset(directory, '__fixtures__/arrival.json', '{}');
    await writeAsset(directory, 'audio/arrival.wav', 'not a release audio asset');

    const report = await inspectAssets(directory);
    const violations = report.violations.map(
      ({ code, path: relativePath }) => `${code}:${relativePath}`,
    );

    expect(violations).toEqual(
      expect.arrayContaining([
        'source-map:assets/app.js.map',
        'test-fixture:__fixtures__/arrival.json',
        'raw-media:audio/arrival.wav',
      ]),
    );
    await expect(assertAssetBudget(directory)).rejects.toBeInstanceOf(AssetBudgetError);
  });

  it('rejects one file that exceeds the 25 MiB maximum', async () => {
    const directory = await createAssetDirectory();
    const filePath = await writeAsset(directory, 'assets/oversize.bin');
    await truncate(filePath, DEFAULT_LIMITS.maxFileBytes + 1);

    const report = await inspectAssets(directory);

    expect(report.violations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'file-size', path: 'assets/oversize.bin' }),
      ]),
    );
  });

  it('rejects an asset tree with more files than its configured maximum', async () => {
    const directory = await createAssetDirectory();
    await writeAsset(directory, 'assets/one.js');
    await writeAsset(directory, 'assets/two.js');
    await writeAsset(directory, 'assets/three.js');

    const report = await inspectAssets(directory, { maxFiles: 2 });

    expect(report.fileCount).toBe(3);
    expect(report.violations).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'file-count', path: '.' })]),
    );
  });
});
