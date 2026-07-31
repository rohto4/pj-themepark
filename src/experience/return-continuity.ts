import type { BloomPlacement, MoonSocketId, SeedGearId } from '../attractions/bloomworks-model';
import type { GuestState } from './guest-state';

export type BloomPattern = 'cluster' | 'bridge' | 'wild';
export type BloomMemoryKind = 'root' | 'chorus';

export type BloomReturnMemory = {
  pattern: BloomPattern;
  pulse: number;
  mastered: boolean;
  kind: BloomMemoryKind;
  formLabel: string;
  previousGear: SeedGearId;
  replySocket: MoonSocketId;
  goalTitle: string;
  goalCopy: string;
  discoveryId: string;
};

export type BloomReturnReply = {
  memory: BloomReturnMemory;
  currentPattern: BloomPattern;
  replyGear: SeedGearId;
  discoveryId: string;
};

const RETURN_COPY: Readonly<
  Record<
    BloomPattern,
    Pick<BloomReturnMemory, 'formLabel' | 'previousGear' | 'replySocket' | 'goalTitle' | 'goalCopy'>
  >
> = {
  cluster: {
    formLabel: 'a sheltered circle holding the last lamp',
    previousGear: 'gather',
    replySocket: 'crown',
    goalTitle: 'Answer the root that sheltered overnight',
    goalCopy:
      'Yesterday’s circle is listening at Crown. Any relationship you place there becomes a reply.',
  },
  bridge: {
    formLabel: 'a pale crossing with one rail unfinished',
    previousGear: 'connect',
    replySocket: 'crossing',
    goalTitle: 'Finish the line another night began',
    goalCopy:
      'Last night’s crossing is listening at Crossing. Any relationship you place there becomes a reply.',
  },
  wild: {
    formLabel: 'a pollinator runner returned from the park edge',
    previousGear: 'wander',
    replySocket: 'verge',
    goalTitle: 'Greet the root that found its way back',
    goalCopy:
      'Yesterday’s runner is listening at Verge. Any relationship you place there becomes a reply.',
  },
};

const CARRY_PREFIX = 'carry:bloom:';
const REPLY_PREFIX = 'return:bloom:';
const PATTERNS: readonly BloomPattern[] = ['cluster', 'bridge', 'wild'];
const KINDS: readonly BloomMemoryKind[] = ['root', 'chorus'];
const GEARS: readonly SeedGearId[] = ['gather', 'connect', 'wander'];

function isOneOf<Value extends string>(value: string, choices: readonly Value[]): value is Value {
  return choices.includes(value as Value);
}

function boundedPulse(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(8, Math.max(1, Math.trunc(value)));
}

function parsePulse(value: string): number | null {
  if (!/^[1-8]$/.test(value)) return null;
  return Number(value);
}

function memoryFromParts(
  pattern: BloomPattern,
  pulse: number,
  kind: BloomMemoryKind,
  discoveryId: string,
): BloomReturnMemory {
  return {
    pattern,
    pulse,
    mastered: kind === 'chorus',
    kind,
    ...RETURN_COPY[pattern],
    discoveryId,
  };
}

function parseCarry(discoveryId: string): BloomReturnMemory | null {
  const [scope, realm, version, pattern, pulseText, kind, ...extra] = discoveryId.split(':');
  const pulse = parsePulse(pulseText ?? '');
  if (
    scope !== 'carry' ||
    realm !== 'bloom' ||
    version !== 'v1' ||
    !pattern ||
    !isOneOf(pattern, PATTERNS) ||
    pulse === null ||
    !kind ||
    !isOneOf(kind, KINDS) ||
    extra.length > 0
  ) {
    return null;
  }
  return memoryFromParts(pattern, pulse, kind, discoveryId);
}

export function createBloomReturnDiscovery(
  state: Readonly<Pick<GuestState, 'phase' | 'finale' | 'traces' | 'discoveries'>>,
): string | null {
  const trace = state.traces.bloomworks;
  if (state.phase !== 'farewell' || state.finale === null || !trace) return null;
  const kind: BloomMemoryKind = state.discoveries.includes('bloom-moon-root-chorus')
    ? 'chorus'
    : 'root';
  return `carry:bloom:v1:${trace.pattern}:${boundedPulse(trace.pulse)}:${kind}`;
}

export function deriveBloomReturnMemory(
  state: Readonly<Pick<GuestState, 'discoveries'>>,
): BloomReturnMemory | null {
  const candidates = state.discoveries.filter((discovery) => discovery.startsWith(CARRY_PREFIX));
  if (candidates.length !== 1) return null;
  return parseCarry(candidates[0] ?? '');
}

export function deriveBloomReplyDiscovery(
  memory: BloomReturnMemory,
  placements: readonly BloomPlacement[],
  currentPattern: BloomPattern,
): string | null {
  const reply = placements.find((placement) => placement.socketId === memory.replySocket);
  if (!reply) return null;
  return `return:bloom:v1:${memory.pattern}:${memory.pulse}:${memory.kind}:${currentPattern}:${reply.gearId}`;
}

export function deriveBloomReturnReply(
  state: Readonly<Pick<GuestState, 'discoveries'>>,
): BloomReturnReply | null {
  const candidates = state.discoveries.filter((discovery) => discovery.startsWith(REPLY_PREFIX));
  if (candidates.length !== 1) return null;
  const discoveryId = candidates[0] ?? '';
  const [scope, realm, version, pattern, pulseText, kind, currentPattern, replyGear, ...extra] =
    discoveryId.split(':');
  const pulse = parsePulse(pulseText ?? '');
  if (
    scope !== 'return' ||
    realm !== 'bloom' ||
    version !== 'v1' ||
    !pattern ||
    !isOneOf(pattern, PATTERNS) ||
    pulse === null ||
    !kind ||
    !isOneOf(kind, KINDS) ||
    !currentPattern ||
    !isOneOf(currentPattern, PATTERNS) ||
    !replyGear ||
    !isOneOf(replyGear, GEARS) ||
    extra.length > 0
  ) {
    return null;
  }
  return {
    memory: memoryFromParts(pattern, pulse, kind, `carry:bloom:v1:${pattern}:${pulse}:${kind}`),
    currentPattern,
    replyGear,
    discoveryId,
  };
}

export function isBloomContinuityControl(discoveryId: string): boolean {
  return discoveryId.startsWith(CARRY_PREFIX) || discoveryId.startsWith(REPLY_PREFIX);
}
