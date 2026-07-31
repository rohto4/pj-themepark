/* global console, process */

import { lstat, opendir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const DEFAULT_LIMITS = Object.freeze({
  maxFiles: 20_000,
  maxFileBytes: 25 * 1024 * 1024,
});

const RAW_MEDIA_EXTENSIONS = new Set([
  '.3fr',
  '.aif',
  '.aiff',
  '.arw',
  '.avi',
  '.braw',
  '.bmp',
  '.caf',
  '.cr2',
  '.cr3',
  '.dng',
  '.flac',
  '.iiq',
  '.mkv',
  '.mov',
  '.mxf',
  '.nef',
  '.orf',
  '.pcm',
  '.pef',
  '.psb',
  '.psd',
  '.raf',
  '.raw',
  '.r3d',
  '.rgb',
  '.rgba',
  '.rw2',
  '.snd',
  '.srw',
  '.tif',
  '.tiff',
  '.wav',
  '.wave',
  '.xcf',
  '.y4m',
  '.yuv',
]);

const TEST_FIXTURE_SEGMENTS = new Set([
  '__fixtures__',
  '__mocks__',
  '__snapshots__',
  '__tests__',
  'fixture',
  'fixtures',
  'test',
  'tests',
]);

const TEST_FIXTURE_FILENAME = /(?:^|[._-])(?:fixture|fixtures|spec|specs|test|tests)(?:[._-]|$)/i;

export class AssetBudgetError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssetBudgetError';
  }
}

function normalizeLimits(limits = {}) {
  const maxFiles = limits.maxFiles ?? DEFAULT_LIMITS.maxFiles;
  const maxFileBytes = limits.maxFileBytes ?? DEFAULT_LIMITS.maxFileBytes;

  if (!Number.isSafeInteger(maxFiles) || maxFiles < 1) {
    throw new TypeError('maxFiles must be a positive safe integer.');
  }

  if (!Number.isSafeInteger(maxFileBytes) || maxFileBytes < 1) {
    throw new TypeError('maxFileBytes must be a positive safe integer.');
  }

  return { maxFiles, maxFileBytes };
}

function toRelativePath(rootDirectory, entryPath) {
  const relativePath = path.relative(rootDirectory, entryPath);

  if (
    relativePath === '' ||
    path.isAbsolute(relativePath) ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`)
  ) {
    throw new AssetBudgetError(`Asset traversal left its root directory at ${entryPath}.`);
  }

  return relativePath.split(path.sep).join('/');
}

function addViolation(report, code, relativePath, message) {
  report.violations.push({ code, path: relativePath, message });
}

function isTestFixture(relativePath) {
  const segments = relativePath.toLowerCase().split('/');
  const fileName = segments.at(-1) ?? '';

  return (
    segments.some((segment) => TEST_FIXTURE_SEGMENTS.has(segment)) ||
    TEST_FIXTURE_FILENAME.test(fileName)
  );
}

function inspectFile(report, relativePath, fileSize) {
  if (report.fileCount > report.limits.maxFiles) {
    addViolation(
      report,
      'file-count',
      '.',
      `contains more than ${report.limits.maxFiles.toLocaleString('en-US')} files`,
    );
    return true;
  }

  if (fileSize > report.limits.maxFileBytes) {
    addViolation(
      report,
      'file-size',
      relativePath,
      `is ${formatBytes(fileSize)}; maximum is ${formatBytes(report.limits.maxFileBytes)}`,
    );
  }

  if (path.extname(relativePath).toLowerCase() === '.map') {
    addViolation(report, 'source-map', relativePath, 'source maps must not be deployed');
  }

  if (isTestFixture(relativePath)) {
    addViolation(report, 'test-fixture', relativePath, 'test fixtures must not be deployed');
  }

  if (RAW_MEDIA_EXTENSIONS.has(path.extname(relativePath).toLowerCase())) {
    addViolation(report, 'raw-media', relativePath, 'unexpected raw media must not be deployed');
  }

  return false;
}

async function readMetadata(entryPath, relativePath) {
  try {
    return await lstat(entryPath);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new AssetBudgetError(`Could not inspect ${relativePath}: ${detail}`);
  }
}

/**
 * Inspect an asset tree without reading asset contents or following symlinks.
 *
 * The optional limits are intentionally available for fast, deterministic unit tests.
 */
export async function inspectAssets(directory, limits) {
  const normalizedLimits = normalizeLimits(limits);
  const rootDirectory = path.resolve(directory);
  const rootMetadata = await readMetadata(rootDirectory, rootDirectory);

  if (rootMetadata.isSymbolicLink() || !rootMetadata.isDirectory()) {
    throw new AssetBudgetError(`Asset directory must be a real directory: ${rootDirectory}`);
  }

  const report = {
    directory: rootDirectory,
    fileCount: 0,
    totalBytes: 0,
    limits: normalizedLimits,
    violations: [],
  };
  const pendingDirectories = [rootDirectory];
  let reachedFileLimit = false;

  while (pendingDirectories.length > 0 && !reachedFileLimit) {
    const currentDirectory = pendingDirectories.pop();
    let entries;

    try {
      entries = await opendir(currentDirectory);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new AssetBudgetError(`Could not read asset directory ${currentDirectory}: ${detail}`);
    }

    for await (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);
      const relativePath = toRelativePath(rootDirectory, entryPath);
      const metadata = await readMetadata(entryPath, relativePath);

      if (metadata.isSymbolicLink()) {
        addViolation(
          report,
          'symbolic-link',
          relativePath,
          'symbolic links are not deployable assets',
        );
        continue;
      }

      if (metadata.isDirectory()) {
        pendingDirectories.push(entryPath);
        continue;
      }

      if (!metadata.isFile()) {
        addViolation(
          report,
          'unsupported-entry',
          relativePath,
          'only regular files may be deployed',
        );
        continue;
      }

      report.fileCount += 1;
      report.totalBytes += metadata.size;
      reachedFileLimit = inspectFile(report, relativePath, metadata.size);

      if (reachedFileLimit) {
        break;
      }
    }
  }

  return report;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KiB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

export function formatAssetBudgetFailure(report) {
  const header = `Asset build-budget check failed for ${report.directory}:`;
  const details = report.violations.map(
    (violation) => `- ${violation.path}: ${violation.message} [${violation.code}]`,
  );
  return [header, ...details].join('\n');
}

export async function assertAssetBudget(directory, limits) {
  const report = await inspectAssets(directory, limits);

  if (report.violations.length > 0) {
    throw new AssetBudgetError(formatAssetBudgetFailure(report));
  }

  return report;
}

function resolveProjectAssetDirectory(directory) {
  const projectRoot = path.resolve(process.cwd());
  const assetDirectory = path.resolve(projectRoot, directory);
  const projectRelativePath = path.relative(projectRoot, assetDirectory);

  if (
    path.isAbsolute(projectRelativePath) ||
    projectRelativePath === '..' ||
    projectRelativePath.startsWith(`..${path.sep}`)
  ) {
    throw new AssetBudgetError('The asset directory must be inside the current project.');
  }

  return assetDirectory;
}

async function main() {
  const requestedDirectory = process.argv[2] ?? 'dist';
  const assetDirectory = resolveProjectAssetDirectory(requestedDirectory);
  const report = await assertAssetBudget(assetDirectory);

  console.log(
    `[asset-budget] OK: ${report.fileCount.toLocaleString('en-US')} files, ${formatBytes(report.totalBytes)}.`,
  );
}

const invokedAsScript =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedAsScript) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[asset-budget] ${message}`);
    process.exitCode = 1;
  });
}
