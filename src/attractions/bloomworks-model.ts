import { getAttraction, type AttractionChoice } from '../content/attractions';

export type SeedGearId = 'gather' | 'connect' | 'wander';
export type CoreSocketId = 'heart' | 'reach' | 'edge';
export type MoonSocketId = 'crown' | 'crossing' | 'verge';
export type BloomSocketId = CoreSocketId | MoonSocketId;

export type BloomPlacement = {
  socketId: BloomSocketId;
  gearId: SeedGearId;
};

export type BloomSession = {
  depth: 'core' | 'moon';
  placements: readonly BloomPlacement[];
  selectedMoonSocket: MoonSocketId | null;
};

export type BloomIntent =
  | { type: 'PLANT_GEAR'; gearId: SeedGearId }
  | { type: 'ENTER_MOON_ROOTS' }
  | { type: 'SELECT_MOON_SOCKET'; socketId: MoonSocketId }
  | { type: 'RESET' };

export type BloomNode = BloomPlacement & {
  x: number;
  y: number;
};

export type BloomEdge = {
  id: string;
  from: BloomSocketId;
  to: BloomSocketId;
  role: 'nest' | 'bridge' | 'runner';
};

export type BloomGraph = {
  nodes: readonly BloomNode[];
  edges: readonly BloomEdge[];
  topologyId: string;
  readback: string;
};

export type BloomOutcome = {
  choice: AttractionChoice;
  topologyId: string;
  masteryDiscoveryId: 'bloom-moon-root-chorus' | null;
};

const CORE_SOCKETS: readonly CoreSocketId[] = ['heart', 'reach', 'edge'];
const MOON_SOCKETS: readonly MoonSocketId[] = ['crown', 'crossing', 'verge'];
const ALL_SOCKETS: readonly BloomSocketId[] = [...CORE_SOCKETS, ...MOON_SOCKETS];

const SOCKET_POSITION: Readonly<Record<BloomSocketId, { x: number; y: number }>> = {
  heart: { x: 74, y: 116 },
  reach: { x: 150, y: 88 },
  edge: { x: 226, y: 116 },
  crown: { x: 66, y: 38 },
  crossing: { x: 150, y: 24 },
  verge: { x: 238, y: 48 },
};

const MOON_ANCHOR: Readonly<Record<MoonSocketId, CoreSocketId>> = {
  crown: 'heart',
  crossing: 'reach',
  verge: 'edge',
};

const CONNECT_SECOND_ANCHOR: Readonly<Record<MoonSocketId, CoreSocketId>> = {
  crown: 'reach',
  crossing: 'edge',
  verge: 'reach',
};

const PATTERN_FOR_GEAR = {
  gather: 'cluster',
  connect: 'bridge',
  wander: 'wild',
} as const;

const PATTERN_FOR_EDGE = {
  nest: 'cluster',
  bridge: 'bridge',
  runner: 'wild',
} as const;

const BLOOMWORKS = getAttraction('bloomworks');

function hasSocket(session: BloomSession, socketId: BloomSocketId): boolean {
  return session.placements.some((placement) => placement.socketId === socketId);
}

function relationshipRole(left: SeedGearId, right: SeedGearId): BloomEdge['role'] {
  if (left === right) return 'nest';
  if (left === 'connect' || right === 'connect') return 'bridge';
  if (left === 'wander' || right === 'wander') return 'runner';
  return 'nest';
}

function placementAt(
  placements: readonly BloomPlacement[],
  socketId: BloomSocketId,
): BloomPlacement | undefined {
  return placements.find((placement) => placement.socketId === socketId);
}

function edge(
  from: BloomSocketId,
  to: BloomSocketId,
  role: BloomEdge['role'],
  suffix = 'primary',
): BloomEdge {
  return { id: `${from}-${to}-${role}-${suffix}`, from, to, role };
}

function deriveEdges(placements: readonly BloomPlacement[]): BloomEdge[] {
  const edges: BloomEdge[] = [];

  for (let index = 1; index < Math.min(placements.length, CORE_SOCKETS.length); index += 1) {
    const previous = placements[index - 1];
    const current = placements[index];
    if (!previous || !current) continue;
    edges.push(
      edge(previous.socketId, current.socketId, relationshipRole(previous.gearId, current.gearId)),
    );
  }

  for (const moonSocket of MOON_SOCKETS) {
    const moon = placementAt(placements, moonSocket);
    if (!moon) continue;
    const anchor = placementAt(placements, MOON_ANCHOR[moonSocket]);
    if (!anchor) continue;

    edges.push(edge(anchor.socketId, moon.socketId, relationshipRole(anchor.gearId, moon.gearId)));

    if (moon.gearId === 'connect') {
      const secondAnchor = placementAt(placements, CONNECT_SECOND_ANCHOR[moonSocket]);
      if (secondAnchor && secondAnchor.socketId !== anchor.socketId) {
        edges.push(edge(secondAnchor.socketId, moon.socketId, 'bridge', 'crossing'));
      }
    }
  }

  return edges;
}

function topologyId(placements: readonly BloomPlacement[]): string {
  const placementMap = new Map(
    placements.map((placement) => [placement.socketId, placement.gearId] as const),
  );
  const signature = ALL_SOCKETS.filter((socketId) => placementMap.has(socketId))
    .map((socketId) => `${socketId}-${placementMap.get(socketId)}`)
    .join('.');
  return `bloom:${signature || 'empty'}`;
}

function latestReadback(session: BloomSession, edges: readonly BloomEdge[]): string {
  const latest = session.placements.at(-1);
  if (!latest) return 'The roots are waiting.';
  const latestEdge = [...edges].reverse().find((candidate) => candidate.to === latest.socketId);
  const response = {
    gather: 'A sheltering root folds the nearby light into a warm nest.',
    connect: 'A bright root reaches across the glass and makes a shared crossing.',
    wander: 'A curious root runs toward the open edge with pollinator light behind it.',
  }[latest.gearId];
  const relationship = latestEdge
    ? ` Its newest relationship is ${latestEdge.role}.`
    : ' It is the first living point in the network.';
  return `${response}${relationship}`;
}

function hasMoonRootChorus(placements: readonly BloomPlacement[]): boolean {
  if (placements.length !== ALL_SOCKETS.length) return false;
  return (
    placementAt(placements, 'heart')?.gearId === placementAt(placements, 'crown')?.gearId &&
    placementAt(placements, 'reach')?.gearId === placementAt(placements, 'crossing')?.gearId &&
    placementAt(placements, 'edge')?.gearId === placementAt(placements, 'verge')?.gearId
  );
}

function clampPulse(value: number): number {
  return Math.min(8, Math.max(1, Math.trunc(value)));
}

export function createBloomSession(): BloomSession {
  return { depth: 'core', placements: [], selectedMoonSocket: null };
}

export function reduceBloomSession(session: BloomSession, intent: BloomIntent): BloomSession {
  switch (intent.type) {
    case 'RESET':
      return createBloomSession();

    case 'ENTER_MOON_ROOTS':
      if (session.depth !== 'core' || session.placements.length !== CORE_SOCKETS.length) {
        return session;
      }
      return { ...session, depth: 'moon', selectedMoonSocket: null };

    case 'SELECT_MOON_SOCKET':
      if (session.depth !== 'moon' || hasSocket(session, intent.socketId)) return session;
      return { ...session, selectedMoonSocket: intent.socketId };

    case 'PLANT_GEAR': {
      if (session.depth === 'core') {
        const socketId = CORE_SOCKETS[session.placements.length];
        if (!socketId) return session;
        return {
          ...session,
          placements: [...session.placements, { socketId, gearId: intent.gearId }],
        };
      }

      const socketId = session.selectedMoonSocket;
      if (!socketId || hasSocket(session, socketId)) return session;
      return {
        ...session,
        placements: [...session.placements, { socketId, gearId: intent.gearId }],
        selectedMoonSocket: null,
      };
    }
  }
}

export function deriveBloomGraph(session: BloomSession): BloomGraph {
  const edges = deriveEdges(session.placements);
  return {
    nodes: session.placements.map((placement) => ({
      ...placement,
      ...SOCKET_POSITION[placement.socketId],
    })),
    edges,
    topologyId: topologyId(session.placements),
    readback: latestReadback(session, edges),
  };
}

export function canCompleteBloom(session: BloomSession): boolean {
  return session.placements.length >= CORE_SOCKETS.length;
}

export function deriveBloomOutcome(session: BloomSession): BloomOutcome | null {
  if (!canCompleteBloom(session)) return null;

  const graph = deriveBloomGraph(session);
  const chorus = hasMoonRootChorus(session.placements);
  const totals = { cluster: 0, bridge: 0, wild: 0 };

  for (const placement of session.placements) {
    totals[PATTERN_FOR_GEAR[placement.gearId]] += 2;
  }
  for (const graphEdge of graph.edges) {
    totals[PATTERN_FOR_EDGE[graphEdge.role]] += 1;
  }
  if (chorus) totals.bridge += 2;

  const latestPattern = PATTERN_FOR_GEAR[session.placements.at(-1)?.gearId ?? 'gather'];
  const pattern = (Object.keys(totals) as Array<keyof typeof totals>).reduce((best, candidate) => {
    if (totals[candidate] > totals[best]) return candidate;
    if (totals[candidate] === totals[best] && candidate === latestPattern) return candidate;
    return best;
  }, latestPattern);
  const baseChoice = BLOOMWORKS.choices.find((choice) => choice.id === pattern);
  if (!baseChoice || baseChoice.trace.attractionId !== 'bloomworks') {
    throw new Error(`Missing authored Bloomworks choice: ${pattern}`);
  }

  const pulse =
    session.placements.length === CORE_SOCKETS.length
      ? baseChoice.trace.pulse
      : clampPulse(
          3 +
            new Set(graph.edges.map((item) => item.role)).size +
            Math.floor((session.placements.length - CORE_SOCKETS.length) / 2) +
            (chorus ? 2 : 0),
        );
  const choice: AttractionChoice = {
    ...baseChoice,
    note:
      session.placements.length > CORE_SOCKETS.length
        ? `${baseChoice.note} · ${session.placements.length} living roots`
        : baseChoice.note,
    trace: { attractionId: 'bloomworks', pattern, pulse },
  };

  return {
    choice,
    topologyId: graph.topologyId,
    masteryDiscoveryId: chorus ? 'bloom-moon-root-chorus' : null,
  };
}
