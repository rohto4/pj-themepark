import { describe, expect, it, vi } from 'vitest';

import { createGuestState, reduceGuestState, type GuestState } from './guest-state';
import { deriveWorldProjection } from './world-projection';

function bloomState(
  pattern: 'cluster' | 'bridge' | 'wild',
  pulse: number,
  mastered = false,
): GuestState {
  let state = reduceGuestState(createGuestState(44), {
    type: 'COMPLETE_ATTRACTION',
    trace: { attractionId: 'bloomworks', pattern, pulse },
  });
  if (mastered) {
    state = reduceGuestState(state, {
      type: 'DISCOVER',
      discoveryId: 'bloom-moon-root-chorus',
    });
  }
  return state;
}

describe('world projection', () => {
  it('stays dormant before Bloomworks leaves a trace', () => {
    expect(deriveWorldProjection(createGuestState(44)).bloom).toBeNull();
  });

  it('projects two Bloom strategies into different non-text geometry on three later surfaces', () => {
    const cluster = deriveWorldProjection(bloomState('cluster', 2)).bloom;
    const wild = deriveWorldProjection(bloomState('wild', 7)).bloom;

    expect(cluster).not.toBeNull();
    expect(wild).not.toBeNull();
    for (const surface of ['map', 'hushgarden', 'constellary'] as const) {
      expect(cluster?.[surface].paths.length).toBeGreaterThan(0);
      expect(wild?.[surface].paths.length).toBeGreaterThan(0);
      expect(cluster?.[surface].geometryId).not.toBe(wild?.[surface].geometryId);
      expect(cluster?.[surface].paths.map((path) => path.d)).not.toEqual(
        wild?.[surface].paths.map((path) => path.d),
      );
    }
  });

  it('lets pulse density and moon-root mastery change the projection without unbounded events', () => {
    const quiet = deriveWorldProjection(bloomState('bridge', 4)).bloom;
    const chorus = deriveWorldProjection(bloomState('bridge', 8, true)).bloom;

    expect(quiet?.pulse).toBe(4);
    expect(chorus).toMatchObject({ pulse: 8, mastered: true });
    expect(chorus?.map.nodes.length).toBeGreaterThan(quiet?.map.nodes.length ?? 0);
    for (const surface of ['map', 'hushgarden', 'constellary'] as const) {
      expect(chorus?.[surface].paths).toEqual(
        expect.arrayContaining([expect.objectContaining({ role: 'chorus' })]),
      );
      expect(quiet?.[surface].paths.some((path) => path.role === 'chorus')).toBe(false);
    }
    expect(chorus?.hushgarden.discoveryId).toBe('afterlight:bloom:bridge:chorus');
  });

  it('uses bounded pulse density on every surface without changing the pattern family', () => {
    const quieter = deriveWorldProjection(bloomState('wild', 4)).bloom;
    const brighter = deriveWorldProjection(bloomState('wild', 7)).bloom;

    for (const surface of ['map', 'hushgarden', 'constellary'] as const) {
      expect(brighter?.[surface].nodes.length).toBeGreaterThan(
        quieter?.[surface].nodes.length ?? 0,
      );
      expect(brighter?.[surface].viewBox).toMatch(/^0 0 /);
    }
  });

  it('is a deterministic pure projection', () => {
    const state = bloomState('wild', 7, true);
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('world projection must not use Math.random');
    });
    const now = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('world projection must not use Date.now');
    });

    try {
      expect(deriveWorldProjection(state)).toEqual(deriveWorldProjection(state));
    } finally {
      random.mockRestore();
      now.mockRestore();
    }
  });
});
