export const GUEST_STATE_VERSION = 1 as const;

export type AttractionId = 'bloomworks' | 'driftglass' | 'cabinet' | 'windthread';

export type PreferenceKey = 'audio' | 'motion' | 'contrast' | 'power';

export type GuestPreferences = {
  audio: 'off' | 'on';
  motion: 'full' | 'reduced';
  contrast: 'standard' | 'high';
  power: 'auto' | 'low';
};

export type AttractionTrace =
  | { attractionId: 'bloomworks'; pattern: 'cluster' | 'bridge' | 'wild'; pulse: number }
  | {
      attractionId: 'driftglass';
      route: 'cove' | 'current' | 'horizon';
      companions: string[];
    }
  | {
      attractionId: 'cabinet';
      nearThing: 'weather-loom' | 'staircase-seed' | 'enough-clock';
    }
  | { attractionId: 'windthread'; flight: 'drift' | 'weave' | 'soar'; rings: number };

export type FinaleRecipe = {
  recipeVersion: 1;
  title: string;
  palette: string;
  growth: string;
  emblem: string;
  movement: string;
  motifIds: string[];
};

export type GuestState = {
  schemaVersion: typeof GUEST_STATE_VERSION;
  nightId: string;
  seed: number;
  phase: 'arrival' | 'explore' | 'finale' | 'farewell';
  currentScene: 'arrival' | 'map' | 'hushgarden' | AttractionId | 'constellary' | 'keepsake';
  preferences: GuestPreferences;
  completedAttractions: AttractionId[];
  traces: Partial<{ [K in AttractionId]: Extract<AttractionTrace, { attractionId: K }> }>;
  discoveries: string[];
  finale: FinaleRecipe | null;
  revision: number;
};

export type GuestAction =
  | { type: 'LIGHT_STAR' }
  | { type: 'ENTER_SCENE'; scene: 'map' | 'hushgarden' | AttractionId }
  | { type: 'COMPLETE_ATTRACTION'; trace: AttractionTrace }
  | { type: 'DISCOVER'; discoveryId: string }
  | { type: 'SET_PREFERENCE'; key: PreferenceKey; value: GuestPreferences[PreferenceKey] }
  | { type: 'BEGIN_FINALE' }
  | { type: 'COMPLETE_FINALE' }
  | { type: 'BEGIN_NEW_NIGHT'; seed: number };

const DEFAULT_PREFERENCES: GuestPreferences = {
  audio: 'off',
  motion: 'full',
  contrast: 'standard',
  power: 'auto',
};

const VALID_PREFERENCES = {
  audio: new Set<GuestPreferences['audio']>(['off', 'on']),
  motion: new Set<GuestPreferences['motion']>(['full', 'reduced']),
  contrast: new Set<GuestPreferences['contrast']>(['standard', 'high']),
  power: new Set<GuestPreferences['power']>(['auto', 'low']),
} as const;

const ATTRACTION_ORDER: AttractionId[] = ['bloomworks', 'driftglass', 'cabinet', 'windthread'];

function normalizeSeed(seed: number) {
  if (!Number.isFinite(seed)) return 0;
  return Math.trunc(seed) >>> 0;
}

function isValidPreference<Key extends PreferenceKey>(
  key: Key,
  value: unknown,
): value is GuestPreferences[Key] {
  return (VALID_PREFERENCES[key] as ReadonlySet<unknown>).has(value);
}

function applyPreferences(preferences: Partial<GuestPreferences> = {}): GuestPreferences {
  return {
    audio: isValidPreference('audio', preferences.audio)
      ? preferences.audio
      : DEFAULT_PREFERENCES.audio,
    motion: isValidPreference('motion', preferences.motion)
      ? preferences.motion
      : DEFAULT_PREFERENCES.motion,
    contrast: isValidPreference('contrast', preferences.contrast)
      ? preferences.contrast
      : DEFAULT_PREFERENCES.contrast,
    power: isValidPreference('power', preferences.power)
      ? preferences.power
      : DEFAULT_PREFERENCES.power,
  };
}

export function createGuestState(
  seed: number,
  preferences?: Partial<GuestPreferences>,
): GuestState {
  const normalizedSeed = normalizeSeed(seed);

  return {
    schemaVersion: GUEST_STATE_VERSION,
    nightId: `night-${normalizedSeed.toString(16).padStart(8, '0')}`,
    seed: normalizedSeed,
    phase: 'arrival',
    currentScene: 'arrival',
    preferences: applyPreferences(preferences),
    completedAttractions: [],
    traces: {},
    discoveries: [],
    finale: null,
    revision: 0,
  };
}

function setPreference(
  preferences: GuestPreferences,
  key: PreferenceKey,
  value: unknown,
): GuestPreferences | null {
  switch (key) {
    case 'audio': {
      if (!isValidPreference('audio', value) || preferences.audio === value) return null;
      return { ...preferences, audio: value };
    }
    case 'motion': {
      if (!isValidPreference('motion', value) || preferences.motion === value) return null;
      return { ...preferences, motion: value };
    }
    case 'contrast': {
      if (!isValidPreference('contrast', value) || preferences.contrast === value) return null;
      return { ...preferences, contrast: value };
    }
    case 'power': {
      if (!isValidPreference('power', value) || preferences.power === value) return null;
      return { ...preferences, power: value };
    }
  }
}

function traceVariation(trace: AttractionTrace): string {
  switch (trace.attractionId) {
    case 'bloomworks':
      return trace.pattern;
    case 'driftglass':
      return trace.route;
    case 'cabinet':
      return trace.nearThing;
    case 'windthread':
      return trace.flight;
  }
}

export function reduceGuestState(state: GuestState, action: GuestAction): GuestState {
  switch (action.type) {
    case 'LIGHT_STAR':
      if (state.phase !== 'arrival') return state;
      return {
        ...state,
        phase: 'explore',
        currentScene: 'map',
        revision: state.revision + 1,
      };

    case 'ENTER_SCENE':
      if (action.scene === 'map' && state.phase === 'farewell') {
        return {
          ...state,
          phase: 'explore',
          currentScene: 'map',
          revision: state.revision + 1,
        };
      }
      if (state.phase !== 'explore' || state.currentScene === action.scene) return state;
      return { ...state, currentScene: action.scene, revision: state.revision + 1 };

    case 'COMPLETE_ATTRACTION': {
      if (state.phase === 'farewell') return state;

      const attractionId = action.trace.attractionId;
      const existingTrace = state.traces[attractionId];
      if (existingTrace && JSON.stringify(existingTrace) === JSON.stringify(action.trace)) {
        return state;
      }

      const completedAttractions = state.completedAttractions.includes(attractionId)
        ? state.completedAttractions
        : [...state.completedAttractions, attractionId].sort(
            (left, right) => ATTRACTION_ORDER.indexOf(left) - ATTRACTION_ORDER.indexOf(right),
          );
      const replayDiscovery = existingTrace
        ? `revisit:${attractionId}:${traceVariation(action.trace)}`
        : null;
      const discoveries =
        replayDiscovery && !state.discoveries.includes(replayDiscovery)
          ? [...state.discoveries, replayDiscovery].sort()
          : state.discoveries;

      return {
        ...state,
        completedAttractions,
        traces: { ...state.traces, [attractionId]: action.trace },
        discoveries,
        currentScene: 'map',
        revision: state.revision + 1,
      };
    }

    case 'DISCOVER': {
      const discoveryId = action.discoveryId.trim();
      if (!discoveryId || state.discoveries.includes(discoveryId)) return state;
      return {
        ...state,
        discoveries: [...state.discoveries, discoveryId].sort(),
        revision: state.revision + 1,
      };
    }

    case 'SET_PREFERENCE': {
      const preferences = setPreference(state.preferences, action.key, action.value);
      if (!preferences) return state;
      return { ...state, preferences, revision: state.revision + 1 };
    }

    case 'BEGIN_FINALE':
      if (state.phase !== 'explore' || state.completedAttractions.length < 3) return state;
      return {
        ...state,
        phase: 'finale',
        currentScene: 'constellary',
        finale: deriveFinaleRecipe(state),
        revision: state.revision + 1,
      };

    case 'COMPLETE_FINALE':
      if (state.phase !== 'finale') return state;
      return {
        ...state,
        phase: 'farewell',
        currentScene: 'keepsake',
        revision: state.revision + 1,
      };

    case 'BEGIN_NEW_NIGHT':
      return createGuestState(action.seed, state.preferences);
  }
}

const BLOOM_TITLES: Record<NonNullable<GuestState['traces']['bloomworks']>['pattern'], string> = {
  cluster: 'Gathered',
  bridge: 'Bridged',
  wild: 'Wild',
};

const DRIFT_TITLES: Record<NonNullable<GuestState['traces']['driftglass']>['route'], string> = {
  cove: 'Cove',
  current: 'Living Current',
  horizon: 'Far Horizon',
};

export function deriveFinaleRecipe(state: GuestState): FinaleRecipe {
  const bloom = state.traces.bloomworks;
  const drift = state.traces.driftglass;
  const cabinet = state.traces.cabinet;
  const wind = state.traces.windthread;

  const titleLead = bloom ? BLOOM_TITLES[bloom.pattern] : wind ? 'Wind-Written' : 'Emberlit';
  const titleEnd = drift
    ? DRIFT_TITLES[drift.route]
    : cabinet
      ? cabinet.nearThing.replaceAll('-', ' ')
      : `Night ${String((state.seed % 97) + 1).padStart(2, '0')}`;

  const motifIds = [
    bloom ? `bloom:${bloom.pattern}:${bloom.pulse}` : null,
    drift ? `drift:${drift.route}:${[...drift.companions].sort().join('+') || 'solo'}` : null,
    cabinet ? `near:${cabinet.nearThing}` : null,
    wind ? `wind:${wind.flight}:${wind.rings}` : null,
    ...state.discoveries.map((discovery) => `secret:${discovery}`),
  ].filter((motif): motif is string => motif !== null);

  const palettes = ['ember-tide', 'bloom-moon', 'violet-wind'] as const;

  return {
    recipeVersion: 1,
    title: `The ${titleLead} ${titleEnd}`,
    palette: drift?.route ?? palettes[state.seed % palettes.length] ?? palettes[0],
    growth: bloom?.pattern ?? 'ember',
    emblem: cabinet?.nearThing ?? state.discoveries[0] ?? `star-${state.seed % 7}`,
    movement: wind?.flight ?? (drift?.route === 'horizon' ? 'soar' : 'drift'),
    motifIds,
  };
}
