import { describe, expect, it, vi } from 'vitest';

import {
  createGuestState,
  deriveFinaleRecipe,
  reduceGuestState,
  type AttractionTrace,
  type GuestState,
} from '../experience/guest-state';
import { createScorePlan } from './score-plan';

const complete = (state: GuestState, trace: AttractionTrace) =>
  reduceGuestState(state, { type: 'COMPLETE_ATTRACTION', trace });

const beginFinale = (state: GuestState) => reduceGuestState(state, { type: 'BEGIN_FINALE' });

function createMeasuredHistory(): GuestState {
  let state = reduceGuestState(createGuestState(901), { type: 'LIGHT_STAR' });
  state = complete(state, { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 });
  state = complete(state, {
    attractionId: 'driftglass',
    route: 'horizon',
    companions: ['flicker', 'bell'],
  });
  state = complete(state, { attractionId: 'cabinet', nearThing: 'weather-loom' });
  return beginFinale(state);
}

describe('score plan', () => {
  it('creates the same four-note plan from the same guest state and finale recipe', () => {
    const state = createMeasuredHistory();
    const recipe = state.finale ?? deriveFinaleRecipe(state);

    const first = createScorePlan(state, recipe);
    const second = createScorePlan(state, recipe);

    expect(first).toEqual(second);
    expect(createScorePlan(state)).toEqual(first);
    expect(first.tempoBpm).toBeGreaterThanOrEqual(72);
    expect(first.tempoBpm).toBeLessThanOrEqual(132);
    expect(first.emberIdentity).toHaveLength(4);
    expect(first.visiblePulseSequence).toHaveLength(4);
    expect(first.visiblePulseSequence.map((pulse) => pulse.note)).toEqual(first.emberIdentity);
    expect(first.visiblePulseSequence.every((pulse) => pulse.caption.length > 0)).toBe(true);
    expect(first.realmLayers.map((layer) => layer.realm)).toEqual([
      'bloomworks',
      'driftglass',
      'cabinet',
    ]);
    expect(first.equivalence).toMatchObject({
      audio: { mode: 'muted' },
      motion: { mode: 'animated' },
    });
  });

  it('makes plans materially different for the existing gentle and daring domain histories', () => {
    let gentle = createGuestState(901);
    gentle = complete(gentle, { attractionId: 'bloomworks', pattern: 'cluster', pulse: 2 });
    gentle = complete(gentle, {
      attractionId: 'driftglass',
      route: 'cove',
      companions: ['flicker'],
    });
    gentle = complete(gentle, { attractionId: 'cabinet', nearThing: 'enough-clock' });

    let daring = createGuestState(901);
    daring = complete(daring, { attractionId: 'bloomworks', pattern: 'wild', pulse: 5 });
    daring = complete(daring, {
      attractionId: 'driftglass',
      route: 'horizon',
      companions: ['bell', 'comet'],
    });
    daring = complete(daring, { attractionId: 'windthread', flight: 'soar', rings: 7 });

    const gentlePlan = createScorePlan(gentle, deriveFinaleRecipe(gentle));
    const daringPlan = createScorePlan(daring, deriveFinaleRecipe(daring));

    expect(daringPlan).not.toEqual(gentlePlan);
    expect({
      tempoBpm: daringPlan.tempoBpm,
      emberIdentity: daringPlan.emberIdentity,
      layers: daringPlan.realmLayers,
      pulses: daringPlan.visiblePulseSequence,
    }).not.toEqual({
      tempoBpm: gentlePlan.tempoBpm,
      emberIdentity: gentlePlan.emberIdentity,
      layers: gentlePlan.realmLayers,
      pulses: gentlePlan.visiblePulseSequence,
    });
    expect(daringPlan.realmLayers.map((layer) => layer.realm)).toContain('windthread');
    expect(gentlePlan.realmLayers.map((layer) => layer.realm)).toContain('cabinet');
  });

  it('keeps the score structure while exposing muted and reduced-motion visual equivalents', () => {
    const full = reduceGuestState(
      reduceGuestState(createMeasuredHistory(), {
        type: 'SET_PREFERENCE',
        key: 'audio',
        value: 'on',
      }),
      { type: 'SET_PREFERENCE', key: 'motion', value: 'full' },
    );
    const accessible = reduceGuestState(
      reduceGuestState(full, { type: 'SET_PREFERENCE', key: 'audio', value: 'off' }),
      { type: 'SET_PREFERENCE', key: 'motion', value: 'reduced' },
    );

    const fullPlan = createScorePlan(full);
    const accessiblePlan = createScorePlan(accessible);

    expect(accessiblePlan.tempoBpm).toBe(fullPlan.tempoBpm);
    expect(accessiblePlan.emberIdentity).toEqual(fullPlan.emberIdentity);
    expect(accessiblePlan.realmLayers).toEqual(fullPlan.realmLayers);
    expect(accessiblePlan.visiblePulseSequence).toEqual(fullPlan.visiblePulseSequence);
    expect(fullPlan.equivalence).toMatchObject({
      audio: { mode: 'audible' },
      motion: { mode: 'animated' },
    });
    expect(accessiblePlan.equivalence).toMatchObject({
      audio: { mode: 'muted', visibleLabel: expect.any(String) },
      motion: { mode: 'step', visibleLabel: expect.any(String) },
    });
  });

  it('clamps unsafe trace numbers before they influence intensity, tempo, or visible pulses', () => {
    const base = createMeasuredHistory();
    const unsafe: GuestState = {
      ...base,
      completedAttractions: ['bloomworks', 'driftglass', 'windthread'],
      traces: {
        bloomworks: {
          attractionId: 'bloomworks',
          pattern: 'wild',
          pulse: Number.POSITIVE_INFINITY,
        },
        driftglass: { attractionId: 'driftglass', route: 'current', companions: ['flicker'] },
        windthread: { attractionId: 'windthread', flight: 'soar', rings: -999 },
      },
    };

    const plan = createScorePlan(unsafe, deriveFinaleRecipe(unsafe));
    const bloom = plan.realmLayers.find((layer) => layer.realm === 'bloomworks');
    const wind = plan.realmLayers.find((layer) => layer.realm === 'windthread');

    expect(plan.tempoBpm).toBeGreaterThanOrEqual(72);
    expect(plan.tempoBpm).toBeLessThanOrEqual(132);
    expect(Number.isFinite(plan.tempoBpm)).toBe(true);
    expect(bloom?.intensity).toBe(1);
    expect(wind?.intensity).toBe(0);
    expect(plan.visiblePulseSequence.every((pulse) => Number.isFinite(pulse.beat))).toBe(true);
  });

  it('does not consult clock or random global state', () => {
    const state = createMeasuredHistory();
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('score plan must not use Math.random');
    });
    const now = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('score plan must not use Date.now');
    });

    try {
      expect(() => createScorePlan(state)).not.toThrow();
    } finally {
      random.mockRestore();
      now.mockRestore();
    }
  });
});
