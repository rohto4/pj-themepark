import { describe, expect, it } from 'vitest';

import { createGuestState, reduceGuestState, type GuestState } from './guest-state';
import { buildNightChartSvg, nightChartFilename } from './keepsake';

function completedNight(): GuestState {
  let state = reduceGuestState(createGuestState(901), { type: 'LIGHT_STAR' });
  state = reduceGuestState(state, {
    type: 'COMPLETE_ATTRACTION',
    trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
  });
  state = reduceGuestState(state, {
    type: 'COMPLETE_ATTRACTION',
    trace: { attractionId: 'driftglass', route: 'horizon', companions: ['bell', 'comet'] },
  });
  state = reduceGuestState(state, {
    type: 'COMPLETE_ATTRACTION',
    trace: { attractionId: 'cabinet', nearThing: 'weather-loom' },
  });
  return reduceGuestState(state, { type: 'BEGIN_FINALE' });
}

describe('Morrowlight Night Chart', () => {
  it('builds a self-contained, deterministic SVG keepsake from the guest history', () => {
    const state = completedNight();
    const first = buildNightChartSvg(state);

    expect(first).toBe(buildNightChartSvg(state));
    expect(first).toContain('<svg');
    expect(first).toContain('The Bridged Far Horizon');
    expect(first).toContain('bloom:bridge');
    expect(first).toContain(state.nightId);
    expect(first).not.toMatch(/(?:href|src)="https?:\/\//);
  });

  it('escapes guest-derived text and creates a portable filename', () => {
    const state = completedNight();
    const unsafe = {
      ...state,
      finale: state.finale && { ...state.finale, title: '<night & sky>' },
    };

    expect(buildNightChartSvg(unsafe)).toContain('&lt;night &amp; sky&gt;');
    expect(buildNightChartSvg(unsafe)).not.toContain('<night & sky>');
    expect(nightChartFilename(unsafe)).toBe('morrowlight-night-00000385.svg');
  });
});
