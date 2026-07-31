import { describe, expect, it } from 'vitest';

import {
  GUEST_STATE_QUARANTINE_KEY,
  GUEST_STATE_STORAGE_KEY,
  loadGuestState,
  saveGuestState,
  type StorageLike,
} from './persistence';
import { createGuestState, reduceGuestState, type GuestState } from './guest-state';

class MemoryStorage implements StorageLike {
  readonly entries = new Map<string, string>();

  getItem(key: string) {
    return this.entries.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.entries.set(key, value);
  }
}

const stateWithTrace = (): GuestState => {
  const started = reduceGuestState(createGuestState(314), { type: 'LIGHT_STAR' });

  return reduceGuestState(started, {
    type: 'COMPLETE_ATTRACTION',
    trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 3 },
  });
};

const copyAsRecord = (state: GuestState): Record<string, unknown> =>
  JSON.parse(JSON.stringify(state)) as Record<string, unknown>;

describe('guest-state persistence', () => {
  it('uses a schema-versioned key and round-trips V1 without mutating the input', () => {
    const storage = new MemoryStorage();
    const state = stateWithTrace();
    const original = structuredClone(state);

    expect(GUEST_STATE_STORAGE_KEY).toBe('morrowlight:guest-state:v1');
    expect(saveGuestState(storage, state)).toEqual({ status: 'saved' });
    expect(state).toEqual(original);
    expect(JSON.parse(storage.getItem(GUEST_STATE_STORAGE_KEY) ?? '')).toEqual(original);

    const loaded = loadGuestState(storage);

    expect(loaded).toEqual(original);
    expect(loaded).not.toBe(state);
  });

  it('catches a save failure and reports a typed non-blocking result', () => {
    const storage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage full');
      },
    };

    expect(() => saveGuestState(storage, createGuestState(7))).not.toThrow();
    expect(saveGuestState(storage, createGuestState(7))).toEqual({
      status: 'storage-unavailable',
    });
  });

  it('returns no state when storage has no saved state or cannot be read', () => {
    expect(loadGuestState(new MemoryStorage())).toBeNull();

    const unavailable: StorageLike = {
      getItem: () => {
        throw new Error('storage disabled');
      },
      setItem: () => undefined,
    };

    expect(loadGuestState(unavailable)).toBeNull();
  });

  it('quarantines malformed JSON when possible and then ignores it', () => {
    const storage = new MemoryStorage();
    storage.setItem(GUEST_STATE_STORAGE_KEY, '{not valid JSON');

    expect(loadGuestState(storage)).toBeNull();
    expect(JSON.parse(storage.getItem(GUEST_STATE_QUARANTINE_KEY) ?? '')).toEqual({
      reason: 'invalid-json',
      value: '{not valid JSON',
    });
  });

  it.each([
    ['schema version', (state: Record<string, unknown>) => ({ ...state, schemaVersion: 2 })],
    ['phase', (state: Record<string, unknown>) => ({ ...state, phase: 'sleep' })],
    ['scene', (state: Record<string, unknown>) => ({ ...state, currentScene: 'void' })],
    [
      'preferences',
      (state: Record<string, unknown>) => ({
        ...state,
        preferences: { ...((state.preferences ?? {}) as object), motion: 'spinning' },
      }),
    ],
    [
      'traces',
      (state: Record<string, unknown>) => ({
        ...state,
        traces: {
          ...((state.traces ?? {}) as object),
          bloomworks: { attractionId: 'bloomworks', pattern: 'impossible', pulse: 3 },
        },
      }),
    ],
  ])('rejects and quarantines an invalid %s shape', (_label, corrupt) => {
    const storage = new MemoryStorage();
    const invalid = corrupt(copyAsRecord(stateWithTrace()));
    storage.setItem(GUEST_STATE_STORAGE_KEY, JSON.stringify(invalid));

    expect(loadGuestState(storage)).toBeNull();
    expect(JSON.parse(storage.getItem(GUEST_STATE_QUARANTINE_KEY) ?? '')).toEqual({
      reason: 'invalid-shape',
      value: JSON.stringify(invalid),
    });
  });

  it('ignores corrupt state even when quarantine storage is unavailable', () => {
    const storage: StorageLike = {
      getItem: () => '{"schemaVersion":0}',
      setItem: () => {
        throw new Error('quarantine unavailable');
      },
    };

    expect(() => loadGuestState(storage)).not.toThrow();
    expect(loadGuestState(storage)).toBeNull();
  });

  it('round-trips a calm Hushgarden staging point', () => {
    const storage = new MemoryStorage();
    const started = reduceGuestState(createGuestState(26), { type: 'LIGHT_STAR' });
    const resting = reduceGuestState(started, { type: 'ENTER_SCENE', scene: 'hushgarden' });

    saveGuestState(storage, resting);
    expect(loadGuestState(storage)).toMatchObject({
      phase: 'explore',
      currentScene: 'hushgarden',
    });
  });
});
