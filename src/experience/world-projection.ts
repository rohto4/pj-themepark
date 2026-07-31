import type { GuestState } from './guest-state';

export type ProjectedPath = {
  id: string;
  d: string;
  role: 'root' | 'bridge' | 'runner' | 'chorus';
};

export type ProjectedNode = {
  id: string;
  cx: number;
  cy: number;
  radius: number;
  role: 'seed' | 'resident' | 'echo';
};

export type ProjectedSurface = {
  geometryId: string;
  viewBox: string;
  accessibleLabel: string;
  paths: readonly ProjectedPath[];
  nodes: readonly ProjectedNode[];
};

export type BloomWorldProjection = {
  pattern: NonNullable<GuestState['traces']['bloomworks']>['pattern'];
  pulse: number;
  mastered: boolean;
  map: ProjectedSurface;
  hushgarden: ProjectedSurface & {
    discoveryId: string;
    actionLabel: string;
  };
  constellary: ProjectedSurface;
};

export type WorldProjection = {
  bloom: BloomWorldProjection | null;
};

type BloomPattern = BloomWorldProjection['pattern'];
type SurfaceName = 'map' | 'hushgarden' | 'constellary';

const PATTERN_COPY: Readonly<
  Record<
    BloomPattern,
    {
      form: string;
      actionLabel: string;
    }
  >
> = {
  cluster: {
    form: 'sheltering root circles',
    actionLabel: 'Rest beside the sheltering vine',
  },
  bridge: {
    form: 'living crossings',
    actionLabel: 'Ring the living bridge',
  },
  wild: {
    form: 'pollinator runners',
    actionLabel: 'Follow a pollinator runner',
  },
};

const MAP_PATHS: Readonly<Record<BloomPattern, readonly ProjectedPath[]>> = {
  cluster: [
    {
      id: 'map-cluster-nest',
      d: 'M233 397C181 365 165 425 208 447C251 468 282 424 252 392',
      role: 'root',
    },
    {
      id: 'map-cluster-lanterns',
      d: 'M208 447C185 476 194 508 226 519M252 392C280 365 304 380 310 410',
      role: 'root',
    },
  ],
  bridge: [
    {
      id: 'map-bridge-spine',
      d: 'M233 397C322 350 406 388 494 326C575 270 650 304 718 260',
      role: 'bridge',
    },
    {
      id: 'map-bridge-return',
      d: 'M218 443C342 492 436 434 532 455C620 474 676 428 744 404',
      role: 'bridge',
    },
  ],
  wild: [
    {
      id: 'map-wild-runner',
      d: 'M233 397C173 348 128 366 104 314C78 256 139 235 116 181',
      role: 'runner',
    },
    {
      id: 'map-wild-edge',
      d: 'M220 438C150 454 112 497 52 472M247 414C304 427 331 462 378 449',
      role: 'runner',
    },
  ],
};

const HUSH_PATHS: Readonly<Record<BloomPattern, readonly ProjectedPath[]>> = {
  cluster: [
    {
      id: 'hush-cluster',
      d: 'M25 63C45 20 84 18 103 52C122 84 164 78 190 45C165 66 135 50 118 31C91 1 47 18 25 63Z',
      role: 'root',
    },
  ],
  bridge: [
    {
      id: 'hush-bridge',
      d: 'M18 68C54 15 91 15 112 64C135 15 174 17 203 68M48 58H174',
      role: 'bridge',
    },
  ],
  wild: [
    {
      id: 'hush-wild',
      d: 'M21 72C57 58 54 27 92 18M58 52C94 70 119 48 132 24M106 61C151 79 172 44 204 29',
      role: 'runner',
    },
  ],
};

const CONSTELLARY_PATHS: Readonly<Record<BloomPattern, readonly ProjectedPath[]>> = {
  cluster: [
    {
      id: 'finale-cluster-outer',
      d: 'M150 24C92 24 54 61 54 101C54 143 102 162 150 141C198 162 246 143 246 101C246 61 208 24 150 24Z',
      role: 'root',
    },
    {
      id: 'finale-cluster-inner',
      d: 'M150 45C116 45 91 68 91 96C91 121 119 135 150 122C181 135 209 121 209 96C209 68 184 45 150 45Z',
      role: 'root',
    },
  ],
  bridge: [
    {
      id: 'finale-bridge-rise',
      d: 'M24 128C70 31 118 27 150 108C182 27 230 31 276 128',
      role: 'bridge',
    },
    {
      id: 'finale-bridge-crossing',
      d: 'M44 126C98 82 202 82 256 126M82 67C126 105 174 105 218 67',
      role: 'bridge',
    },
  ],
  wild: [
    {
      id: 'finale-wild-spine',
      d: 'M150 151C133 115 155 91 137 60C122 34 135 19 150 9M142 88L79 47M147 112L220 68',
      role: 'runner',
    },
    {
      id: 'finale-wild-crown',
      d: 'M79 47L50 35M79 47L63 74M220 68L254 49M220 68L245 92',
      role: 'runner',
    },
  ],
};

const NODE_POSITIONS: Readonly<Record<SurfaceName, readonly [number, number][]>> = {
  map: [
    [233, 397],
    [208, 447],
    [310, 410],
    [378, 449],
    [494, 326],
    [532, 455],
    [718, 260],
    [744, 404],
  ],
  hushgarden: [
    [25, 63],
    [58, 52],
    [92, 18],
    [112, 64],
    [132, 24],
    [174, 58],
    [190, 45],
    [204, 29],
  ],
  constellary: [
    [150, 24],
    [91, 96],
    [209, 96],
    [150, 122],
    [82, 67],
    [218, 67],
    [44, 126],
    [256, 126],
  ],
};

const SURFACE_VIEWBOX: Readonly<Record<SurfaceName, string>> = {
  map: '0 0 1000 650',
  hushgarden: '0 0 220 90',
  constellary: '0 0 300 180',
};

function boundedPulse(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(8, Math.max(1, Math.trunc(value)));
}

function projectedNodes(surface: SurfaceName, pattern: BloomPattern, pulse: number) {
  const positions = NODE_POSITIONS[surface];
  const offset = pattern === 'cluster' ? 0 : pattern === 'bridge' ? 2 : 4;
  return Array.from({ length: Math.min(pulse, positions.length) }, (_, index): ProjectedNode => {
    const position = positions[(index + offset) % positions.length] ?? positions[0] ?? [0, 0];
    return {
      id: `${surface}-${pattern}-light-${index + 1}`,
      cx: position[0],
      cy: position[1],
      radius: index === 0 ? 5 : 2 + ((index + offset) % 3),
      role: index === 0 ? 'resident' : index % 2 === 0 ? 'seed' : 'echo',
    };
  });
}

function chorusPath(surface: SurfaceName): ProjectedPath {
  const paths: Record<SurfaceName, ProjectedPath> = {
    map: {
      id: 'map-moon-root-chorus',
      d: 'M191 522C260 555 335 535 405 557C473 578 548 552 615 573',
      role: 'chorus',
    },
    hushgarden: {
      id: 'hush-moon-root-chorus',
      d: 'M28 78C72 61 101 84 143 65C169 53 189 58 207 72',
      role: 'chorus',
    },
    constellary: {
      id: 'finale-moon-root-chorus',
      d: 'M33 151C88 118 118 162 150 133C182 162 212 118 267 151',
      role: 'chorus',
    },
  };
  return paths[surface];
}

function makeSurface(
  surface: SurfaceName,
  pattern: BloomPattern,
  pulse: number,
  mastered: boolean,
  paths: Readonly<Record<BloomPattern, readonly ProjectedPath[]>>,
): ProjectedSurface {
  const copy = PATTERN_COPY[pattern];
  return {
    geometryId: `bloom-${surface}-${pattern}-${pulse}${mastered ? '-chorus' : ''}`,
    viewBox: SURFACE_VIEWBOX[surface],
    accessibleLabel: `Bloomworks ${copy.form}, ${pulse} answering lights${mastered ? ', with the moon-root chorus' : ''}`,
    paths: mastered ? [...paths[pattern], chorusPath(surface)] : [...paths[pattern]],
    nodes: projectedNodes(surface, pattern, pulse),
  };
}

export function deriveWorldProjection(
  state: Readonly<Pick<GuestState, 'traces' | 'discoveries'>>,
): WorldProjection {
  const trace = state.traces.bloomworks;
  if (!trace) return { bloom: null };

  const pattern = trace.pattern;
  const pulse = boundedPulse(trace.pulse);
  const mastered = state.discoveries.includes('bloom-moon-root-chorus');
  const map = makeSurface('map', pattern, pulse, mastered, MAP_PATHS);
  const hushgardenBase = makeSurface('hushgarden', pattern, pulse, mastered, HUSH_PATHS);
  const constellary = makeSurface('constellary', pattern, pulse, mastered, CONSTELLARY_PATHS);

  return {
    bloom: {
      pattern,
      pulse,
      mastered,
      map,
      hushgarden: {
        ...hushgardenBase,
        discoveryId: `afterlight:bloom:${pattern}:${mastered ? 'chorus' : 'root'}`,
        actionLabel: PATTERN_COPY[pattern].actionLabel,
      },
      constellary,
    },
  };
}
