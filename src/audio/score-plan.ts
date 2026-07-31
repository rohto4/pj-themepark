import {
  deriveFinaleRecipe,
  type AttractionId,
  type FinaleRecipe,
  type GuestState,
} from '../experience/guest-state';

export const SCORE_PLAN_VERSION = 1 as const;

const MIN_TEMPO_BPM = 72;
const MAX_TEMPO_BPM = 132;
const MAX_BLOOM_PULSE = 8;
const MAX_WIND_RINGS = 12;

const EMBER_SCALE = ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'] as const;

const PULSE_CAPTIONS = [
  'Ember wakes',
  'Path answers',
  'Realm gathers',
  'Constellation resolves',
] as const;

const BLOOM_NOTE_OFFSETS = {
  cluster: 0,
  bridge: 2,
  wild: 4,
} as const;

const DRIFT_NOTE_OFFSETS = {
  cove: 0,
  current: 1,
  horizon: 3,
} as const;

const CABINET_NOTE_OFFSETS = {
  'weather-loom': 1,
  'staircase-seed': 3,
  'enough-clock': 5,
} as const;

const WIND_NOTE_OFFSETS = {
  drift: 0,
  weave: 2,
  soar: 5,
} as const;

const BLOOM_TEMPO_OFFSETS = {
  cluster: 0,
  bridge: 4,
  wild: 8,
} as const;

const DRIFT_TEMPO_OFFSETS = {
  cove: 0,
  current: 3,
  horizon: 6,
} as const;

const WIND_TEMPO_OFFSETS = {
  drift: 0,
  weave: 4,
  soar: 8,
} as const;

const CABINET_INTENSITIES = {
  'weather-loom': 0.7,
  'staircase-seed': 0.55,
  'enough-clock': 0.45,
} as const;

export type EmberNote = (typeof EMBER_SCALE)[number];

export type EmberIdentity = readonly [EmberNote, EmberNote, EmberNote, EmberNote];

export type RealmLayer = {
  realm: AttractionId;
  timbre: string;
  pattern: string;
  intensity: number;
  pulseDivision: 1 | 2 | 4;
  visibleLabel: string;
};

export type VisiblePulse = {
  index: number;
  beat: number;
  note: EmberNote;
  emphasis: 'soft' | 'bright' | 'strong';
  caption: string;
};

export type ScoreEquivalence = {
  audio: {
    mode: 'audible' | 'muted';
    visibleLabel: string;
  };
  motion: {
    mode: 'animated' | 'step';
    visibleLabel: string;
  };
};

export type ScorePlan = {
  planVersion: typeof SCORE_PLAN_VERSION;
  finaleTitle: string;
  palette: string;
  tempoBpm: number;
  emberIdentity: EmberIdentity;
  realmLayers: readonly RealmLayer[];
  visiblePulseSequence: readonly VisiblePulse[];
  equivalence: ScoreEquivalence;
};

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (Number.isNaN(value) || value === Number.NEGATIVE_INFINITY) return minimum;
  if (value === Number.POSITIVE_INFINITY) return maximum;
  return Math.min(maximum, Math.max(minimum, Math.trunc(value)));
}

function normalizeSeed(seed: number): number {
  if (!Number.isFinite(seed)) return 0;
  return Math.trunc(seed) >>> 0;
}

function scaleAt(index: number): EmberNote {
  const normalizedIndex = ((index % EMBER_SCALE.length) + EMBER_SCALE.length) % EMBER_SCALE.length;
  return EMBER_SCALE[normalizedIndex] ?? EMBER_SCALE[0];
}

function hashText(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
  }

  return hash;
}

function recipeFingerprint(recipe: FinaleRecipe): string {
  return [
    recipe.title,
    recipe.palette,
    recipe.growth,
    recipe.emblem,
    recipe.movement,
    ...recipe.motifIds,
  ].join('|');
}

function companionCount(companions: string[]): number {
  return clampInteger(companions.filter((companion) => companion.trim().length > 0).length, 0, 4);
}

function bloomPulse(pulse: number): number {
  return clampInteger(pulse, 0, MAX_BLOOM_PULSE);
}

function windRings(rings: number): number {
  return clampInteger(rings, 0, MAX_WIND_RINGS);
}

function createTempo(state: GuestState, recipe: FinaleRecipe): number {
  const bloom = state.traces.bloomworks;
  const drift = state.traces.driftglass;
  const wind = state.traces.windthread;
  const fingerprint = hashText(recipeFingerprint(recipe));
  let tempo = 84 + (normalizeSeed(state.seed) % 11) + (fingerprint % 3);

  if (bloom) {
    tempo += BLOOM_TEMPO_OFFSETS[bloom.pattern] + bloomPulse(bloom.pulse);
  }

  if (drift) {
    tempo += DRIFT_TEMPO_OFFSETS[drift.route] + companionCount(drift.companions);
  }

  if (wind) {
    tempo += WIND_TEMPO_OFFSETS[wind.flight] + Math.floor(windRings(wind.rings) / 2);
  }

  return clampInteger(tempo, MIN_TEMPO_BPM, MAX_TEMPO_BPM);
}

function createEmberIdentity(state: GuestState, recipe: FinaleRecipe): EmberIdentity {
  const bloom = state.traces.bloomworks;
  const drift = state.traces.driftglass;
  const cabinet = state.traces.cabinet;
  const wind = state.traces.windthread;
  const fingerprint = hashText(recipeFingerprint(recipe));
  const root = (normalizeSeed(state.seed) + fingerprint) % EMBER_SCALE.length;
  const bloomOffset = bloom
    ? BLOOM_NOTE_OFFSETS[bloom.pattern] + (bloomPulse(bloom.pulse) % 3)
    : fingerprint % 3;
  const driftOffset = drift
    ? DRIFT_NOTE_OFFSETS[drift.route] + companionCount(drift.companions)
    : (fingerprint >>> 3) % 4;
  const finaleOffset = cabinet
    ? CABINET_NOTE_OFFSETS[cabinet.nearThing]
    : wind
      ? WIND_NOTE_OFFSETS[wind.flight] + (windRings(wind.rings) % 3)
      : (fingerprint >>> 6) % 6;

  return [
    scaleAt(root),
    scaleAt(root + bloomOffset + 1),
    scaleAt(root + driftOffset + 3),
    scaleAt(root + finaleOffset + 5),
  ];
}

function createRealmLayers(state: GuestState): RealmLayer[] {
  const layers: RealmLayer[] = [];
  const bloom = state.traces.bloomworks;
  const drift = state.traces.driftglass;
  const cabinet = state.traces.cabinet;
  const wind = state.traces.windthread;

  if (bloom) {
    const pulse = bloomPulse(bloom.pulse);
    layers.push({
      realm: 'bloomworks',
      timbre: 'seed-chime',
      pattern: bloom.pattern,
      intensity: pulse / MAX_BLOOM_PULSE,
      pulseDivision: bloom.pattern === 'wild' ? 4 : 2,
      visibleLabel: `Bloomworks ${bloom.pattern} pattern`,
    });
  }

  if (drift) {
    const companions = companionCount(drift.companions);
    layers.push({
      realm: 'driftglass',
      timbre: 'tide-glass',
      pattern: drift.route,
      intensity: Math.min(1, 0.35 + companions * 0.15),
      pulseDivision: drift.route === 'current' ? 4 : 2,
      visibleLabel: `Driftglass ${drift.route} route`,
    });
  }

  if (cabinet) {
    layers.push({
      realm: 'cabinet',
      timbre: 'brass-memory',
      pattern: cabinet.nearThing,
      intensity: CABINET_INTENSITIES[cabinet.nearThing],
      pulseDivision: 1,
      visibleLabel: `Cabinet memory: ${cabinet.nearThing}`,
    });
  }

  if (wind) {
    const rings = windRings(wind.rings);
    layers.push({
      realm: 'windthread',
      timbre: 'air-thread',
      pattern: wind.flight,
      intensity: rings / MAX_WIND_RINGS,
      pulseDivision: wind.flight === 'soar' ? 4 : 2,
      visibleLabel: `Windthread ${wind.flight} flight`,
    });
  }

  return layers;
}

function createVisiblePulseSequence(
  emberIdentity: EmberIdentity,
  realmLayers: readonly RealmLayer[],
): VisiblePulse[] {
  return emberIdentity.map((note, index) => {
    const caption = PULSE_CAPTIONS[index] ?? 'Ember continues';
    const emphasis: VisiblePulse['emphasis'] =
      index === emberIdentity.length - 1
        ? 'strong'
        : realmLayers.length > index
          ? 'bright'
          : 'soft';

    return {
      index,
      beat: index,
      note,
      emphasis,
      caption,
    };
  });
}

function createEquivalence(state: GuestState): ScoreEquivalence {
  const muted = state.preferences.audio === 'off';
  const stepMotion = state.preferences.motion === 'reduced' || state.preferences.power === 'low';

  return {
    audio: {
      mode: muted ? 'muted' : 'audible',
      visibleLabel: muted
        ? 'Sound is muted. Follow the four amber pulses.'
        : 'Sound is on. Amber pulses mirror the score.',
    },
    motion: {
      mode: stepMotion ? 'step' : 'animated',
      visibleLabel: stepMotion
        ? 'Advance through the constellation one visible pulse at a time.'
        : 'The constellation gathers with each visible pulse.',
    },
  };
}

export function createScorePlan(
  state: GuestState,
  recipe: FinaleRecipe = state.finale ?? deriveFinaleRecipe(state),
): ScorePlan {
  const emberIdentity = createEmberIdentity(state, recipe);
  const realmLayers = createRealmLayers(state);

  return {
    planVersion: SCORE_PLAN_VERSION,
    finaleTitle: recipe.title,
    palette: recipe.palette,
    tempoBpm: createTempo(state, recipe),
    emberIdentity,
    realmLayers,
    visiblePulseSequence: createVisiblePulseSequence(emberIdentity, realmLayers),
    equivalence: createEquivalence(state),
  };
}
