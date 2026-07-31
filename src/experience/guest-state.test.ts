import { describe, expect, it } from 'vitest';

import {
  createGuestState,
  deriveFinaleRecipe,
  reduceGuestState,
  type AttractionTrace,
  type GuestAction,
  type GuestState,
} from './guest-state';

const complete = (state: GuestState, trace: AttractionTrace) =>
  reduceGuestState(state, { type: 'COMPLETE_ATTRACTION', trace });

const play = (seed: number, actions: GuestAction[]) =>
  actions.reduce(reduceGuestState, createGuestState(seed));

describe('guest state', () => {
  it('creates a deterministic, accessible default night', () => {
    const first = createGuestState(1147);
    const second = createGuestState(1147);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      schemaVersion: 1,
      seed: 1147,
      phase: 'arrival',
      currentScene: 'arrival',
      completedAttractions: [],
      preferences: {
        audio: 'off',
        motion: 'full',
        contrast: 'standard',
        power: 'auto',
      },
      revision: 0,
    });
    expect(first.nightId).toBe('night-0000047b');
  });

  it('records each attraction once without mutating earlier state', () => {
    const arrival = reduceGuestState(createGuestState(22), { type: 'LIGHT_STAR' });
    const completed = complete(arrival, {
      attractionId: 'bloomworks',
      pattern: 'bridge',
      pulse: 3,
    });
    const replayed = complete(completed, {
      attractionId: 'bloomworks',
      pattern: 'wild',
      pulse: 5,
    });

    expect(arrival.completedAttractions).toEqual([]);
    expect(completed.completedAttractions).toEqual(['bloomworks']);
    expect(replayed.completedAttractions).toEqual(['bloomworks']);
    expect(replayed.traces.bloomworks).toMatchObject({ pattern: 'wild', pulse: 5 });
    expect(replayed.revision).toBe(completed.revision + 1);
  });

  it('keeps the finale locked until three different attractions leave traces', () => {
    let state = reduceGuestState(createGuestState(45), { type: 'LIGHT_STAR' });
    state = complete(state, { attractionId: 'bloomworks', pattern: 'cluster', pulse: 2 });
    state = complete(state, {
      attractionId: 'driftglass',
      route: 'cove',
      companions: ['flicker'],
    });

    expect(reduceGuestState(state, { type: 'BEGIN_FINALE' })).toBe(state);

    state = complete(state, { attractionId: 'cabinet', nearThing: 'enough-clock' });
    const finale = reduceGuestState(state, { type: 'BEGIN_FINALE' });

    expect(finale.phase).toBe('finale');
    expect(finale.currentScene).toBe('constellary');
    expect(finale.finale).not.toBeNull();
  });

  it('produces the same finale for the same seed and action history', () => {
    const actions: GuestAction[] = [
      { type: 'LIGHT_STAR' },
      {
        type: 'COMPLETE_ATTRACTION',
        trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
      },
      {
        type: 'COMPLETE_ATTRACTION',
        trace: {
          attractionId: 'driftglass',
          route: 'horizon',
          companions: ['flicker', 'bell'],
        },
      },
      {
        type: 'COMPLETE_ATTRACTION',
        trace: { attractionId: 'cabinet', nearThing: 'weather-loom' },
      },
      { type: 'BEGIN_FINALE' },
    ];

    expect(play(901, actions).finale).toEqual(play(901, actions).finale);
  });

  it('makes different histories visibly different in the finale recipe', () => {
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

    expect(deriveFinaleRecipe(gentle)).not.toEqual(deriveFinaleRecipe(daring));
    expect(deriveFinaleRecipe(gentle).title).not.toBe(deriveFinaleRecipe(daring).title);
    expect(deriveFinaleRecipe(gentle).motifIds).not.toEqual(deriveFinaleRecipe(daring).motifIds);
  });

  it('deduplicates discoveries and ignores invalid preference values at runtime', () => {
    const started = createGuestState(88, { motion: 'reduced', power: 'low' });
    const found = reduceGuestState(started, { type: 'DISCOVER', discoveryId: 'hush-fern' });
    const repeated = reduceGuestState(found, { type: 'DISCOVER', discoveryId: 'hush-fern' });
    const invalid = reduceGuestState(repeated, {
      type: 'SET_PREFERENCE',
      key: 'motion',
      value: 'spinning',
    } as unknown as GuestAction);

    expect(started.preferences).toMatchObject({ motion: 'reduced', power: 'low' });
    expect(repeated.discoveries).toEqual(['hush-fern']);
    expect(repeated).toBe(found);
    expect(invalid).toBe(repeated);
  });

  it('lets a completed guest revisit the living map without erasing the night', () => {
    let state = reduceGuestState(createGuestState(132), { type: 'LIGHT_STAR' });
    state = complete(state, { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 });
    state = complete(state, {
      attractionId: 'driftglass',
      route: 'horizon',
      companions: ['bell', 'comet'],
    });
    state = complete(state, { attractionId: 'cabinet', nearThing: 'weather-loom' });
    state = reduceGuestState(state, { type: 'BEGIN_FINALE' });
    state = reduceGuestState(state, { type: 'COMPLETE_FINALE' });
    const returned = reduceGuestState(state, { type: 'ENTER_SCENE', scene: 'map' });

    expect(returned.phase).toBe('explore');
    expect(returned.currentScene).toBe('map');
    expect(returned.finale).toEqual(state.finale);
    expect(returned.completedAttractions).toEqual(state.completedAttractions);
  });

  it('treats Hushgarden rest as valid exploration without a completion gate', () => {
    const started = reduceGuestState(createGuestState(19), { type: 'LIGHT_STAR' });
    const resting = reduceGuestState(started, { type: 'ENTER_SCENE', scene: 'hushgarden' });
    const noticed = reduceGuestState(resting, {
      type: 'DISCOVER',
      discoveryId: 'hush-listening-fern',
    });

    expect(resting).toMatchObject({ phase: 'explore', currentScene: 'hushgarden' });
    expect(noticed.discoveries).toContain('hush-listening-fern');
    expect(noticed.completedAttractions).toEqual([]);
  });

  it('rewards a genuinely different replay with a discoverable finale layer', () => {
    let state = reduceGuestState(createGuestState(80), { type: 'LIGHT_STAR' });
    state = complete(state, { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 });
    const same = complete(state, { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 });
    const replayed = complete(same, { attractionId: 'bloomworks', pattern: 'wild', pulse: 5 });

    expect(same).toBe(state);
    expect(replayed.discoveries).toContain('revisit:bloomworks:wild');
    expect(deriveFinaleRecipe(replayed).motifIds).toContain('secret:revisit:bloomworks:wild');
  });

  it('begins another night with preferences intact and progress cleared', () => {
    let state = createGuestState(12, { motion: 'reduced', audio: 'on' });
    state = reduceGuestState(state, { type: 'LIGHT_STAR' });
    state = complete(state, { attractionId: 'cabinet', nearThing: 'enough-clock' });

    const another = reduceGuestState(state, { type: 'BEGIN_NEW_NIGHT', seed: 99 });

    expect(another).toMatchObject({
      seed: 99,
      nightId: 'night-00000063',
      phase: 'arrival',
      currentScene: 'arrival',
      completedAttractions: [],
      discoveries: [],
      traces: {},
      preferences: { motion: 'reduced', audio: 'on' },
    });
  });

  it('carries one bounded Bloom memory only from a finished local night', () => {
    let state = createGuestState(12, { motion: 'reduced', audio: 'on' });
    state = reduceGuestState(state, { type: 'LIGHT_STAR' });
    state = complete(state, { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 });
    state = reduceGuestState(state, {
      type: 'DISCOVER',
      discoveryId: 'bloom-moon-root-chorus',
    });
    state = complete(state, {
      attractionId: 'driftglass',
      route: 'horizon',
      companions: ['bell'],
    });
    state = complete(state, { attractionId: 'cabinet', nearThing: 'weather-loom' });
    state = reduceGuestState(state, { type: 'BEGIN_FINALE' });
    state = reduceGuestState(state, { type: 'COMPLETE_FINALE' });

    const another = reduceGuestState(state, { type: 'BEGIN_NEW_NIGHT', seed: 99 });

    expect(another).toMatchObject({
      schemaVersion: 1,
      seed: 99,
      phase: 'arrival',
      currentScene: 'arrival',
      completedAttractions: [],
      discoveries: ['carry:bloom:v1:bridge:4:chorus'],
      traces: {},
      finale: null,
      revision: 0,
      preferences: { motion: 'reduced', audio: 'on' },
    });
  });

  it('keeps Night Code resume seed-only and never leaks continuity control tokens into motifs', () => {
    let state = createGuestState(12);
    state = reduceGuestState(state, { type: 'LIGHT_STAR' });
    state = complete(state, { attractionId: 'bloomworks', pattern: 'wild', pulse: 7 });
    state = complete(state, {
      attractionId: 'driftglass',
      route: 'cove',
      companions: ['flicker'],
    });
    state = complete(state, { attractionId: 'cabinet', nearThing: 'enough-clock' });
    state = reduceGuestState(state, { type: 'BEGIN_FINALE' });
    state = reduceGuestState(state, { type: 'COMPLETE_FINALE' });

    const resumed = reduceGuestState(state, { type: 'RESUME_NIGHT', seed: 99 });
    expect(resumed.discoveries).toEqual([]);

    const returned: GuestState = {
      ...createGuestState(99),
      discoveries: ['carry:bloom:v1:wild:7:root', 'return:bloom:v1:wild:7:root:bridge:connect'],
    };
    const recipe = deriveFinaleRecipe(returned);
    expect(recipe.motifIds).toContain('memory:bloom:wild:7:root');
    expect(recipe.motifIds).toContain('dawn-root:wild:bridge:connect');
    expect(recipe.motifIds.some((motif) => motif.startsWith('secret:carry:'))).toBe(false);
    expect(recipe.motifIds.some((motif) => motif.startsWith('secret:return:'))).toBe(false);
  });
});
