import { describe, expect, it, vi } from 'vitest';

import {
  canCompleteBloom,
  createBloomSession,
  deriveBloomGraph,
  deriveBloomOutcome,
  reduceBloomSession,
  type BloomIntent,
  type BloomSession,
  type MoonSocketId,
  type SeedGearId,
} from './bloomworks-model';

function play(session: BloomSession, ...intents: BloomIntent[]): BloomSession {
  return intents.reduce(reduceBloomSession, session);
}

function plantCore(gears: readonly SeedGearId[]): BloomSession {
  return play(
    createBloomSession(),
    ...gears.map((gearId): BloomIntent => ({ type: 'PLANT_GEAR', gearId })),
  );
}

function plantMoon(
  session: BloomSession,
  placements: readonly [MoonSocketId, SeedGearId][],
): BloomSession {
  let next = play(session, { type: 'ENTER_MOON_ROOTS' });

  for (const [socketId, gearId] of placements) {
    next = play(next, { type: 'SELECT_MOON_SOCKET', socketId }, { type: 'PLANT_GEAR', gearId });
  }

  return next;
}

describe('Bloomworks root instrument model', () => {
  it('turns every core placement into a visible node and relationship before enabling the exit', () => {
    const first = play(createBloomSession(), { type: 'PLANT_GEAR', gearId: 'gather' });
    expect(deriveBloomGraph(first)).toMatchObject({
      nodes: [expect.objectContaining({ socketId: 'heart', gearId: 'gather' })],
      edges: [],
    });
    expect(canCompleteBloom(first)).toBe(false);

    const core = play(
      first,
      { type: 'PLANT_GEAR', gearId: 'connect' },
      { type: 'PLANT_GEAR', gearId: 'wander' },
    );
    const graph = deriveBloomGraph(core);

    expect(graph.nodes).toHaveLength(3);
    expect(graph.edges.length).toBeGreaterThanOrEqual(2);
    expect(new Set(graph.edges.map((edge) => edge.role)).size).toBeGreaterThanOrEqual(1);
    expect(graph.readback).not.toMatch(/waiting/i);
    expect(canCompleteBloom(core)).toBe(true);
    expect(deriveBloomOutcome(core)?.choice.trace).toMatchObject({
      attractionId: 'bloomworks',
      pattern: expect.stringMatching(/^(cluster|bridge|wild)$/),
      pulse: expect.any(Number),
    });
  });

  it('adds spatial moon roots and reveals the chorus when the core phrase is repeated', () => {
    const chorus = plantMoon(plantCore(['gather', 'connect', 'wander']), [
      ['crown', 'gather'],
      ['crossing', 'connect'],
      ['verge', 'wander'],
    ]);
    const graph = deriveBloomGraph(chorus);
    const outcome = deriveBloomOutcome(chorus);

    expect(graph.nodes).toHaveLength(6);
    expect(graph.edges.length).toBeGreaterThanOrEqual(5);
    expect(graph.topologyId).toMatch(/^bloom:/);
    expect(outcome).toMatchObject({
      topologyId: graph.topologyId,
      masteryDiscoveryId: 'bloom-moon-root-chorus',
    });
    expect(outcome?.choice.trace).toMatchObject({
      attractionId: 'bloomworks',
      pulse: expect.any(Number),
    });
  });

  it('makes socket choice change geometry even when the planted gear is the same', () => {
    const core = plantCore(['gather', 'connect', 'wander']);
    const crown = plantMoon(core, [['crown', 'connect']]);
    const verge = plantMoon(core, [['verge', 'connect']]);
    const crownGraph = deriveBloomGraph(crown);
    const vergeGraph = deriveBloomGraph(verge);

    expect(crownGraph.topologyId).not.toBe(vergeGraph.topologyId);
    expect(crownGraph.nodes.at(-1)).not.toMatchObject(vergeGraph.nodes.at(-1) ?? {});
    expect(crownGraph.edges.map(({ from, to }) => `${from}:${to}`)).not.toEqual(
      vergeGraph.edges.map(({ from, to }) => `${from}:${to}`),
    );
  });

  it('compresses two legal strategies into different persistent traces without a score', () => {
    const chorus = plantMoon(plantCore(['gather', 'connect', 'wander']), [
      ['crown', 'gather'],
      ['crossing', 'connect'],
      ['verge', 'wander'],
    ]);
    const wildMirror = plantMoon(plantCore(['wander', 'wander', 'connect']), [
      ['verge', 'wander'],
      ['crossing', 'wander'],
      ['crown', 'connect'],
    ]);
    const chorusOutcome = deriveBloomOutcome(chorus);
    const mirrorOutcome = deriveBloomOutcome(wildMirror);

    expect(chorusOutcome?.topologyId).not.toBe(mirrorOutcome?.topologyId);
    expect(chorusOutcome?.choice.trace).not.toEqual(mirrorOutcome?.choice.trace);
    expect(mirrorOutcome?.masteryDiscoveryId).toBeNull();
  });

  it('is deterministic and never consults clock or global randomness', () => {
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Bloomworks must not use Math.random');
    });
    const now = vi.spyOn(Date, 'now').mockImplementation(() => {
      throw new Error('Bloomworks must not use Date.now');
    });

    try {
      const intents: BloomIntent[] = [
        { type: 'PLANT_GEAR', gearId: 'connect' },
        { type: 'PLANT_GEAR', gearId: 'connect' },
        { type: 'PLANT_GEAR', gearId: 'wander' },
        { type: 'ENTER_MOON_ROOTS' },
        { type: 'SELECT_MOON_SOCKET', socketId: 'crossing' },
        { type: 'PLANT_GEAR', gearId: 'gather' },
      ];
      const first = play(createBloomSession(), ...intents);
      const second = play(createBloomSession(), ...intents);

      expect(first).toEqual(second);
      expect(deriveBloomGraph(first)).toEqual(deriveBloomGraph(second));
      expect(deriveBloomOutcome(first)).toEqual(deriveBloomOutcome(second));
    } finally {
      random.mockRestore();
      now.mockRestore();
    }
  });
});
