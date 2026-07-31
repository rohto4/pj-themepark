import { describe, expect, it, vi } from 'vitest';

import { createFinaleTimeline } from './finale-timeline';
import {
  createGuestState,
  reduceGuestState,
  type AttractionTrace,
  type GuestState,
} from './guest-state';

function complete(state: GuestState, trace: AttractionTrace): GuestState {
  return reduceGuestState(state, { type: 'COMPLETE_ATTRACTION', trace });
}

function history(kind: 'gentle' | 'daring'): GuestState {
  let state = reduceGuestState(createGuestState(901), { type: 'LIGHT_STAR' });
  if (kind === 'gentle') {
    state = complete(state, { attractionId: 'bloomworks', pattern: 'cluster', pulse: 2 });
    state = complete(state, {
      attractionId: 'driftglass',
      route: 'cove',
      companions: ['flicker'],
    });
    state = complete(state, { attractionId: 'cabinet', nearThing: 'enough-clock' });
  } else {
    state = complete(state, { attractionId: 'bloomworks', pattern: 'wild', pulse: 7 });
    state = complete(state, {
      attractionId: 'driftglass',
      route: 'horizon',
      companions: ['bell', 'comet', 'moonray'],
    });
    state = complete(state, { attractionId: 'windthread', flight: 'soar', rings: 7 });
  }
  return reduceGuestState(state, { type: 'BEGIN_FINALE' });
}

describe('five-beat finale timeline', () => {
  it('authors a visible beginning, development, recognition, climax, and release', () => {
    const plan = createFinaleTimeline(history('gentle'));

    expect(plan.beats.map((beat) => beat.id)).toEqual([
      'awakening',
      'gathering',
      'recognition',
      'climax',
      'release',
    ]);
    expect(plan.beats.map((beat) => beat.act)).toEqual([1, 2, 3, 4, 5]);
    expect(plan.beats.every((beat) => beat.title.length > 0 && beat.caption.length > 0)).toBe(true);
    expect(plan.recognition?.geometryId).toBe('bloom-constellary-cluster-2');
    expect(plan.resultFingerprint).toMatch(/^finale:/);
  });

  it('turns different histories into different recognition, companionship, pace, and geometry', () => {
    const gentle = createFinaleTimeline(history('gentle'));
    const daring = createFinaleTimeline(history('daring'));

    expect(gentle.resultFingerprint).not.toBe(daring.resultFingerprint);
    expect(gentle.beats[2]?.geometryId).not.toBe(daring.beats[2]?.geometryId);
    expect(gentle.beats[3]).not.toEqual(daring.beats[3]);
    expect(gentle.beats[3]?.caption).toMatch(/flicker/i);
    expect(daring.beats[3]?.caption).toMatch(/bell.*comet.*moonray/i);
    expect(daring.beats[3]?.pace).toBe('soaring');
  });

  it('keeps semantic beats and result identical across audible, muted, animated, and step modes', () => {
    const base = history('daring');
    const full = reduceGuestState(
      reduceGuestState(base, { type: 'SET_PREFERENCE', key: 'audio', value: 'on' }),
      { type: 'SET_PREFERENCE', key: 'motion', value: 'full' },
    );
    const quiet = reduceGuestState(
      reduceGuestState(full, { type: 'SET_PREFERENCE', key: 'audio', value: 'off' }),
      { type: 'SET_PREFERENCE', key: 'power', value: 'low' },
    );
    const fullPlan = createFinaleTimeline(full);
    const quietPlan = createFinaleTimeline(quiet);

    expect(quietPlan.beats).toEqual(fullPlan.beats);
    expect(quietPlan.recognition).toEqual(fullPlan.recognition);
    expect(quietPlan.resultFingerprint).toBe(fullPlan.resultFingerprint);
    expect(fullPlan.presentation).toEqual({ audio: 'audible', motion: 'animated' });
    expect(quietPlan.presentation).toEqual({ audio: 'muted', motion: 'step' });
  });

  it('does not consult clock or global randomness', () => {
    const state = history('daring');
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('finale timeline must not use Math.random');
    });
    const now = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('finale timeline must not use Date.now');
    });

    try {
      expect(createFinaleTimeline(state)).toEqual(createFinaleTimeline(state));
    } finally {
      random.mockRestore();
      now.mockRestore();
    }
  });
});
