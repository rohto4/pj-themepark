import {
  GUEST_STATE_VERSION,
  type AttractionId,
  type AttractionTrace,
  type FinaleRecipe,
  type GuestPreferences,
  type GuestState,
} from './guest-state';

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type SaveGuestStateResult = { status: 'saved' } | { status: 'storage-unavailable' };

export const GUEST_STATE_STORAGE_KEY = 'morrowlight:guest-state:v' + GUEST_STATE_VERSION;
export const GUEST_STATE_QUARANTINE_KEY = GUEST_STATE_STORAGE_KEY + ':quarantine';

const ATTRACTION_IDS = ['bloomworks', 'driftglass', 'cabinet', 'windthread'] as const;
const PHASES = ['arrival', 'explore', 'finale', 'farewell'] as const;
const PREFERENCE_VALUES = {
  audio: ['off', 'on'],
  motion: ['full', 'reduced'],
  contrast: ['standard', 'high'],
  power: ['auto', 'low'],
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<Value extends string>(value: unknown, choices: readonly Value[]): value is Value {
  return typeof value === 'string' && choices.includes(value as Value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function hasUniqueValues(values: readonly string[]) {
  return new Set(values).size === values.length;
}

function isAttractionId(value: unknown): value is AttractionId {
  return isOneOf(value, ATTRACTION_IDS);
}

function isPreferences(value: unknown): value is GuestPreferences {
  if (!isRecord(value)) return false;

  return (
    isOneOf(value.audio, PREFERENCE_VALUES.audio) &&
    isOneOf(value.motion, PREFERENCE_VALUES.motion) &&
    isOneOf(value.contrast, PREFERENCE_VALUES.contrast) &&
    isOneOf(value.power, PREFERENCE_VALUES.power)
  );
}

function isBloomworksTrace(
  value: unknown,
): value is Extract<AttractionTrace, { attractionId: 'bloomworks' }> {
  return (
    isRecord(value) &&
    value.attractionId === 'bloomworks' &&
    isOneOf(value.pattern, ['cluster', 'bridge', 'wild'] as const) &&
    isFiniteNumber(value.pulse)
  );
}

function isDriftglassTrace(
  value: unknown,
): value is Extract<AttractionTrace, { attractionId: 'driftglass' }> {
  return (
    isRecord(value) &&
    value.attractionId === 'driftglass' &&
    isOneOf(value.route, ['cove', 'current', 'horizon'] as const) &&
    isStringArray(value.companions)
  );
}

function isCabinetTrace(
  value: unknown,
): value is Extract<AttractionTrace, { attractionId: 'cabinet' }> {
  return (
    isRecord(value) &&
    value.attractionId === 'cabinet' &&
    isOneOf(value.nearThing, ['weather-loom', 'staircase-seed', 'enough-clock'] as const)
  );
}

function isWindthreadTrace(
  value: unknown,
): value is Extract<AttractionTrace, { attractionId: 'windthread' }> {
  return (
    isRecord(value) &&
    value.attractionId === 'windthread' &&
    isOneOf(value.flight, ['drift', 'weave', 'soar'] as const) &&
    isFiniteNumber(value.rings)
  );
}

function isTraceForAttraction(attractionId: AttractionId, value: unknown): boolean {
  switch (attractionId) {
    case 'bloomworks':
      return isBloomworksTrace(value);
    case 'driftglass':
      return isDriftglassTrace(value);
    case 'cabinet':
      return isCabinetTrace(value);
    case 'windthread':
      return isWindthreadTrace(value);
  }
}

function isTraces(value: unknown): value is GuestState['traces'] {
  if (!isRecord(value)) return false;

  return Object.entries(value).every(
    ([attractionId, trace]) =>
      isAttractionId(attractionId) && isTraceForAttraction(attractionId, trace),
  );
}

function isFinaleRecipe(value: unknown): value is FinaleRecipe {
  return (
    isRecord(value) &&
    value.recipeVersion === 1 &&
    typeof value.title === 'string' &&
    typeof value.palette === 'string' &&
    typeof value.growth === 'string' &&
    typeof value.emblem === 'string' &&
    typeof value.movement === 'string' &&
    isStringArray(value.motifIds)
  );
}

function isCurrentScene(value: unknown): value is GuestState['currentScene'] {
  return (
    value === 'arrival' ||
    value === 'map' ||
    value === 'hushgarden' ||
    value === 'constellary' ||
    value === 'keepsake' ||
    isAttractionId(value)
  );
}

function hasValidPhaseScene(phase: GuestState['phase'], currentScene: GuestState['currentScene']) {
  if (phase === 'arrival') return currentScene === 'arrival';
  if (phase === 'explore') {
    return currentScene === 'map' || currentScene === 'hushgarden' || isAttractionId(currentScene);
  }
  if (phase === 'finale') return currentScene === 'constellary';
  return currentScene === 'keepsake';
}

function isGuestStateV1(value: unknown): value is GuestState {
  if (!isRecord(value)) return false;
  if (value.schemaVersion !== GUEST_STATE_VERSION) return false;
  if (typeof value.nightId !== 'string' || !value.nightId) return false;
  if (!isFiniteNumber(value.seed)) return false;
  if (!isOneOf(value.phase, PHASES) || !isCurrentScene(value.currentScene)) return false;
  if (!hasValidPhaseScene(value.phase, value.currentScene)) return false;
  if (!isPreferences(value.preferences)) return false;
  if (
    !Array.isArray(value.completedAttractions) ||
    !value.completedAttractions.every(isAttractionId) ||
    !hasUniqueValues(value.completedAttractions)
  ) {
    return false;
  }
  if (!isTraces(value.traces)) return false;
  if (!isStringArray(value.discoveries) || !hasUniqueValues(value.discoveries)) return false;
  if (value.finale !== null && !isFinaleRecipe(value.finale)) return false;
  if (!isNonNegativeInteger(value.revision)) return false;

  return true;
}

function quarantine(storage: StorageLike, reason: 'invalid-json' | 'invalid-shape', value: string) {
  try {
    storage.setItem(GUEST_STATE_QUARANTINE_KEY, JSON.stringify({ reason, value }));
  } catch {
    // Persistence is progressive enhancement; a failed diagnostic must not block the park.
  }
}

export function saveGuestState(storage: StorageLike, state: GuestState): SaveGuestStateResult {
  try {
    storage.setItem(GUEST_STATE_STORAGE_KEY, JSON.stringify(state));
    return { status: 'saved' };
  } catch {
    return { status: 'storage-unavailable' };
  }
}

export function loadGuestState(storage: StorageLike): GuestState | null {
  let serialized: string | null;

  try {
    serialized = storage.getItem(GUEST_STATE_STORAGE_KEY);
  } catch {
    return null;
  }

  if (serialized === null) return null;

  let candidate: unknown;
  try {
    candidate = JSON.parse(serialized);
  } catch {
    quarantine(storage, 'invalid-json', serialized);
    return null;
  }

  if (!isGuestStateV1(candidate)) {
    quarantine(storage, 'invalid-shape', serialized);
    return null;
  }

  return candidate;
}
