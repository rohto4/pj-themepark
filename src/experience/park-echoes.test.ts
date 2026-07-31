import { describe, expect, it } from 'vitest';

import { createGuestState, reduceGuestState } from './guest-state';
import { deriveParkEchoes } from './park-echoes';

describe('cross-realm park echoes', () => {
  it('turns earlier traces into authored changes in later destinations', () => {
    let state = reduceGuestState(createGuestState(44), { type: 'LIGHT_STAR' });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
    });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'cabinet', nearThing: 'weather-loom' },
    });
    state = reduceGuestState(state, { type: 'DISCOVER', discoveryId: 'hush-listening-fern' });

    const echoes = deriveParkEchoes(state, 'driftglass');

    expect(echoes.map((echo) => echo.id)).toEqual([
      'bloom-bridge',
      'cabinet-weather-loom',
      'hush-listening-fern',
    ]);
    expect(echoes[0]?.line).toMatch(/vines/i);
    expect(echoes[1]?.line).toMatch(/forecast/i);
  });

  it('does not explain a realm to itself and stays empty on a new night', () => {
    const newNight = createGuestState(5);
    expect(deriveParkEchoes(newNight, 'bloomworks')).toEqual([]);

    const traced = reduceGuestState(newNight, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'wild', pulse: 5 },
    });
    expect(deriveParkEchoes(traced, 'bloomworks')).toEqual([]);
    expect(deriveParkEchoes(traced, 'cabinet')).toHaveLength(1);
  });

  it('lets a genuinely different replay echo into the wider park', () => {
    let state = reduceGuestState(createGuestState(61), { type: 'LIGHT_STAR' });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
    });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'wild', pulse: 5 },
    });

    expect(deriveParkEchoes(state, 'cabinet')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'revisit:bloomworks:wild',
          line: expect.stringMatching(/second way/i),
        }),
      ]),
    );
  });
});
