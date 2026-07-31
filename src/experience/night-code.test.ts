import { describe, expect, it } from 'vitest';

import { createGuestState, type GuestState } from './guest-state';
import { decodeNightCode, encodeNightCode } from './night-code';

describe('night code', () => {
  it.each([0, 0x1a2b3c4d, 0xffffffff])(
    'round-trips the unsigned 32-bit seed %s in the compact human-typable format',
    (seed) => {
      const code = encodeNightCode(createGuestState(seed));

      expect(code).toMatch(/^ML-[0-9A-F]{8}-[0-9A-F]{2}$/);
      expect(decodeNightCode(code)).toEqual({ seed });
    },
  );

  it('uses only the seed and accepts normalized case or omitted separators', () => {
    const state = createGuestState(0x12ab34cd);
    const alteredState: GuestState = {
      ...state,
      preferences: { ...state.preferences, audio: 'on', motion: 'reduced' },
      discoveries: ['revisit:driftglass:horizon'],
      revision: 99,
    };
    const code = encodeNightCode(state);

    expect(encodeNightCode(alteredState)).toBe(code);
    expect(decodeNightCode(code.toLowerCase())).toEqual({ seed: 0x12ab34cd });
    expect(decodeNightCode(code.replace('-', ''))).toEqual({ seed: 0x12ab34cd });
    expect(decodeNightCode(code.replaceAll('-', ''))).toEqual({ seed: 0x12ab34cd });
  });

  it('rejects a seed or checksum that has been tampered with', () => {
    const code = encodeNightCode(createGuestState(0x12ab34cd));
    const replacementSeedDigit = code[3] === '0' ? '1' : '0';
    const replacementChecksumDigit = code.endsWith('0') ? '1' : '0';
    const tamperedSeed = `${code.slice(0, 3)}${replacementSeedDigit}${code.slice(4)}`;
    const tamperedChecksum = `${code.slice(0, -1)}${replacementChecksumDigit}`;

    expect(decodeNightCode(tamperedSeed)).toBeNull();
    expect(decodeNightCode(tamperedChecksum)).toBeNull();
  });

  it.each([
    '',
    'ML-1234567-AB',
    'ML-123456789-AB',
    'ML-1234567G-AB',
    'MM-12345678-AB',
    'ML--12345678-AB',
    'ML-12345678-A',
    'ML-12345678-ABC',
    ' ML-12345678-AB',
  ])('strictly rejects malformed code %j', (code) => {
    expect(decodeNightCode(code)).toBeNull();
  });
});
