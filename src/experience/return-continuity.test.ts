import { describe, expect, it, vi } from 'vitest';

import type { BloomPlacement } from '../attractions/bloomworks-model';
import { createGuestState, reduceGuestState, type GuestState } from './guest-state';
import {
  createBloomReturnDiscovery,
  deriveBloomReplyDiscovery,
  deriveBloomReturnMemory,
  deriveBloomReturnReply,
} from './return-continuity';

function previousNight(
  pattern: 'cluster' | 'bridge' | 'wild',
  pulse: number,
  mastered = false,
): GuestState {
  let state = reduceGuestState(createGuestState(401), { type: 'LIGHT_STAR' });
  state = reduceGuestState(state, {
    type: 'COMPLETE_ATTRACTION',
    trace: { attractionId: 'bloomworks', pattern, pulse },
  });
  if (mastered) {
    state = reduceGuestState(state, {
      type: 'DISCOVER',
      discoveryId: 'bloom-moon-root-chorus',
    });
  }
  state = {
    ...state,
    phase: 'farewell',
    currentScene: 'keepsake',
    finale: {
      recipeVersion: 1,
      title: 'The Remembered Night',
      palette: 'bloom-moon',
      growth: pattern,
      emblem: 'root-memory',
      movement: 'drift',
      motifIds: [],
    },
  };
  return state;
}

function placement(socketId: BloomPlacement['socketId'], gearId: BloomPlacement['gearId']) {
  return { socketId, gearId } as const;
}

describe('return-night continuity', () => {
  it('compresses only a finished night’s bounded Bloom memory into one schema-v1 token', () => {
    expect(createBloomReturnDiscovery(previousNight('bridge', 4))).toBe(
      'carry:bloom:v1:bridge:4:root',
    );
    expect(createBloomReturnDiscovery(previousNight('wild', 99, true))).toBe(
      'carry:bloom:v1:wild:8:chorus',
    );
    expect(createBloomReturnDiscovery(previousNight('cluster', Number.NaN))).toBe(
      'carry:bloom:v1:cluster:1:root',
    );

    const unfinished = reduceGuestState(createGuestState(401), {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'cluster', pulse: 2 },
    });
    expect(createBloomReturnDiscovery(unfinished)).toBeNull();
    expect(createBloomReturnDiscovery({ ...previousNight('cluster', 2), finale: null })).toBeNull();
  });

  it('restores one strict authored reply socket and fails closed on ambiguous or malformed carry text', () => {
    const fixtures = [
      ['carry:bloom:v1:cluster:2:root', 'cluster', 2, false, 'crown'],
      ['carry:bloom:v1:bridge:4:chorus', 'bridge', 4, true, 'crossing'],
      ['carry:bloom:v1:wild:7:root', 'wild', 7, false, 'verge'],
    ] as const;

    for (const [discovery, pattern, pulse, mastered, replySocket] of fixtures) {
      const memory = deriveBloomReturnMemory({ discoveries: ['hush-fern', discovery] });
      expect(memory).toMatchObject({ pattern, pulse, mastered, replySocket });
      expect(memory?.goalTitle.length).toBeGreaterThan(8);
      expect(memory?.goalCopy).toMatch(/yesterday|last night/i);
    }

    for (const invalid of [
      'carry:bloom:v1:copied:4:root',
      'carry:bloom:v1:wild:0:root',
      'carry:bloom:v1:wild:9:root',
      'carry:bloom:v2:wild:4:root',
      'carry:bloom:v1:wild:4:copied',
      'carry:bloom:v1:wild:4:root:extra',
      'revisit:bloomworks:wild',
    ]) {
      expect(deriveBloomReturnMemory({ discoveries: [invalid] })).toBeNull();
    }
    expect(
      deriveBloomReturnMemory({
        discoveries: ['carry:bloom:v1:bridge:4:root', 'carry:bloom:v1:broken'],
      }),
    ).toBeNull();
  });

  it('accepts any expressive gear at the single listening socket and preserves its meaning', () => {
    const memory = deriveBloomReturnMemory({
      discoveries: ['carry:bloom:v1:bridge:4:root'],
    });
    if (!memory) throw new Error('fixture should produce return memory');

    expect(
      deriveBloomReplyDiscovery(
        memory,
        [
          placement('heart', 'wander'),
          placement('reach', 'connect'),
          placement('edge', 'gather'),
          placement('crossing', 'wander'),
        ],
        'wild',
      ),
    ).toBe('return:bloom:v1:bridge:4:root:wild:wander');
    expect(deriveBloomReplyDiscovery(memory, [placement('crown', 'connect')], 'bridge')).toBeNull();

    expect(
      deriveBloomReturnReply({
        discoveries: ['return:bloom:v1:bridge:4:root:wild:wander'],
      }),
    ).toMatchObject({
      currentPattern: 'wild',
      replyGear: 'wander',
      memory: { pattern: 'bridge', pulse: 4, replySocket: 'crossing' },
    });
  });

  it('is deterministic and does not consult the clock or global randomness', () => {
    const state = previousNight('wild', 7);
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('return continuity must not use Math.random');
    });
    const now = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('return continuity must not use Date.now');
    });

    try {
      const discovery = createBloomReturnDiscovery(state);
      expect(discovery).toBe(createBloomReturnDiscovery(state));
      expect(deriveBloomReturnMemory({ discoveries: [discovery!] })).toEqual(
        deriveBloomReturnMemory({ discoveries: [discovery!] }),
      );
    } finally {
      random.mockRestore();
      now.mockRestore();
    }
  });
});
