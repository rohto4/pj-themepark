import type { GuestState } from './guest-state';

const NORMALIZED_CODE = /^ML-?([0-9A-F]{8})-?([0-9A-F]{2})$/;
const MAX_UNSIGNED_32_BIT = 0xffffffff;

function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) return 0;
  return Math.trunc(seed) >>> 0;
}

function checksumFor(seedText: string): string {
  let checksum = 0x5a;
  const source = `ML${seedText}`;

  for (let index = 0; index < source.length; index += 1) {
    checksum ^= source.charCodeAt(index);

    for (let bit = 0; bit < 8; bit += 1) {
      checksum = (checksum & 0x80) === 0 ? (checksum << 1) & 0xff : ((checksum << 1) ^ 0x1d) & 0xff;
    }
  }

  return checksum.toString(16).toUpperCase().padStart(2, '0');
}

function parseCode(code: string): { seedText: string; checksum: string } | null {
  if (typeof code !== 'string') return null;

  const normalized = code.toUpperCase();
  const match = NORMALIZED_CODE.exec(normalized);
  const seedText = match?.[1];
  const checksum = match?.[2];

  if (!seedText || !checksum) return null;
  return { seedText, checksum };
}

export function encodeNightCode(state: GuestState): string {
  const seedText = normalizeSeed(state.seed).toString(16).toUpperCase().padStart(8, '0');

  return `ML-${seedText}-${checksumFor(seedText)}`;
}

export function decodeNightCode(code: string): { seed: number } | null {
  const parsed = parseCode(code);
  if (!parsed || parsed.checksum !== checksumFor(parsed.seedText)) return null;

  const seed = Number.parseInt(parsed.seedText, 16);
  if (!Number.isInteger(seed) || seed < 0 || seed > MAX_UNSIGNED_32_BIT) return null;

  return { seed };
}
