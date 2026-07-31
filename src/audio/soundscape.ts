import type { ScorePlan } from './score-plan';

const LOOP_COUNT = 2;
const MAX_PULSES_PER_LOOP = 4;

const NOTE_FREQUENCIES: Record<string, number> = {
  A3: 220,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392,
  A4: 440,
  C5: 523.25,
  D5: 587.33,
};

export type AudioParamLike = {
  setValueAtTime(value: number, time: number): void;
  linearRampToValueAtTime(value: number, time: number): void;
};

export type AudioNodeLike = {
  connect(destination: AudioNodeLike): void;
  disconnect(): void;
};

export type GainNodeLike = AudioNodeLike & {
  gain: AudioParamLike;
};

export type OscillatorNodeLike = AudioNodeLike & {
  frequency: AudioParamLike;
  type: string;
  start(when: number): void;
  stop(when: number): void;
};

export type AudioContextLike = {
  currentTime: number;
  state: string;
  destination: AudioNodeLike;
  createGain(): GainNodeLike;
  createOscillator(): OscillatorNodeLike;
  resume?(): Promise<void> | void;
  close?(): Promise<void> | void;
};

export type SoundscapeDependencies = {
  createAudioContext?: () => AudioContextLike | null | undefined;
};

export type SoundscapeStatus =
  'idle' | 'playing' | 'muted' | 'unavailable' | 'suspended' | 'stopped' | 'disposed';

export type SoundscapeStartResult = {
  status: 'playing' | 'muted' | 'unavailable' | 'suspended' | 'disposed';
  audioLabel: string;
  motionLabel: string;
  scheduledPulseCount: number;
};

export type Soundscape = {
  start(plan: ScorePlan): Promise<SoundscapeStartResult>;
  stop(): void;
  dispose(): Promise<void>;
  getStatus(): SoundscapeStatus;
};

type ActiveVoice = {
  oscillator: OscillatorNodeLike;
  gain: GainNodeLike;
};

function createStartResult(
  plan: ScorePlan,
  status: SoundscapeStartResult['status'],
  scheduledPulseCount: number,
): SoundscapeStartResult {
  return {
    status,
    audioLabel: plan.equivalence.audio.visibleLabel,
    motionLabel: plan.equivalence.motion.visibleLabel,
    scheduledPulseCount,
  };
}

function safeCurrentTime(context: AudioContextLike | undefined): number {
  try {
    const currentTime = context?.currentTime ?? 0;
    return Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0;
  } catch {
    return 0;
  }
}

function normalizeTempo(tempoBpm: number): number {
  if (!Number.isFinite(tempoBpm)) return 96;
  return Math.min(160, Math.max(48, tempoBpm));
}

function frequencyFor(note: string): number {
  return NOTE_FREQUENCIES[note] ?? 220;
}

function amplitudeFor(emphasis: ScorePlan['visiblePulseSequence'][number]['emphasis']): number {
  if (emphasis === 'strong') return 0.06;
  if (emphasis === 'bright') return 0.045;
  return 0.03;
}

function safeStop(node: OscillatorNodeLike, when: number): void {
  try {
    node.stop(when);
  } catch {
    // A browser may reject a second stop call after a node has already ended.
  }
}

function safeDisconnect(node: AudioNodeLike): void {
  try {
    node.disconnect();
  } catch {
    // Disposal should never surface an audio-device failure to the UI.
  }
}

function isRunning(context: AudioContextLike): boolean {
  try {
    return context.state === 'running';
  } catch {
    return false;
  }
}

function isClosed(context: AudioContextLike): boolean {
  try {
    return context.state === 'closed';
  } catch {
    return true;
  }
}

export function createSoundscape(dependencies: SoundscapeDependencies = {}): Soundscape {
  let context: AudioContextLike | undefined;
  let masterGain: GainNodeLike | undefined;
  let activeVoices: ActiveVoice[] = [];
  let status: SoundscapeStatus = 'idle';
  let disposed = false;
  let requestId = 0;

  function releaseActiveNodes(): void {
    const now = safeCurrentTime(context);

    for (const voice of activeVoices) {
      safeStop(voice.oscillator, now);
      safeDisconnect(voice.oscillator);
      safeDisconnect(voice.gain);
    }

    activeVoices = [];

    if (masterGain) {
      safeDisconnect(masterGain);
      masterGain = undefined;
    }
  }

  function acquireContext(): AudioContextLike | undefined {
    if (context && !isClosed(context)) return context;

    context = undefined;

    try {
      const created = dependencies.createAudioContext?.();
      if (!created) return undefined;
      context = created;
      return context;
    } catch {
      return undefined;
    }
  }

  async function resumeContext(runtime: AudioContextLike): Promise<boolean> {
    if (isRunning(runtime)) return true;

    try {
      if (!runtime.resume) return false;
      await runtime.resume();
      return isRunning(runtime);
    } catch {
      return false;
    }
  }

  function scheduleLoop(runtime: AudioContextLike, plan: ScorePlan): number {
    const pulses = plan.visiblePulseSequence.slice(0, MAX_PULSES_PER_LOOP);
    const secondsPerBeat = 60 / normalizeTempo(plan.tempoBpm);
    const loopDuration = Math.max(0.5, secondsPerBeat * MAX_PULSES_PER_LOOP);
    const startAt = safeCurrentTime(runtime) + 0.03;
    const master = runtime.createGain();

    masterGain = master;
    master.gain.setValueAtTime(0.1, startAt);
    master.connect(runtime.destination);

    for (let cycle = 0; cycle < LOOP_COUNT; cycle += 1) {
      for (const [index, pulse] of pulses.entries()) {
        const oscillator = runtime.createOscillator();
        let gain: GainNodeLike | undefined;

        try {
          gain = runtime.createGain();
          const voice = { oscillator, gain };
          activeVoices.push(voice);

          const beat = Number.isFinite(pulse.beat)
            ? Math.min(MAX_PULSES_PER_LOOP - 1, Math.max(0, pulse.beat))
            : index;
          const at = startAt + cycle * loopDuration + beat * secondsPerBeat;
          const end = at + Math.max(0.08, secondsPerBeat * 0.62);

          oscillator.type = pulse.emphasis === 'soft' ? 'sine' : 'triangle';
          oscillator.frequency.setValueAtTime(frequencyFor(pulse.note), at);
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(amplitudeFor(pulse.emphasis), at + 0.02);
          gain.gain.linearRampToValueAtTime(0, end);
          oscillator.connect(gain);
          gain.connect(master);
          oscillator.start(at);
          oscillator.stop(end);
        } catch (error) {
          activeVoices = activeVoices.filter((voice) => voice.oscillator !== oscillator);
          safeStop(oscillator, safeCurrentTime(runtime));
          safeDisconnect(oscillator);
          if (gain) safeDisconnect(gain);
          throw error;
        }
      }
    }

    return activeVoices.length;
  }

  return {
    async start(plan: ScorePlan): Promise<SoundscapeStartResult> {
      if (disposed) return createStartResult(plan, 'disposed', 0);

      const startRequestId = ++requestId;
      releaseActiveNodes();

      if (plan.equivalence.audio.mode === 'muted') {
        status = 'muted';
        return createStartResult(plan, 'muted', 0);
      }

      const runtime = acquireContext();
      if (!runtime) {
        status = 'unavailable';
        return createStartResult(plan, 'unavailable', 0);
      }

      const isReady = await resumeContext(runtime);
      if (disposed || startRequestId !== requestId) {
        return createStartResult(plan, disposed ? 'disposed' : 'suspended', 0);
      }

      if (!isReady) {
        status = 'suspended';
        return createStartResult(plan, 'suspended', 0);
      }

      try {
        const scheduledPulseCount = scheduleLoop(runtime, plan);
        status = 'playing';
        return createStartResult(plan, 'playing', scheduledPulseCount);
      } catch {
        releaseActiveNodes();
        status = 'unavailable';
        return createStartResult(plan, 'unavailable', 0);
      }
    },

    stop(): void {
      if (disposed) return;

      requestId += 1;
      releaseActiveNodes();
      status = 'stopped';
    },

    async dispose(): Promise<void> {
      if (disposed) return;

      disposed = true;
      requestId += 1;
      releaseActiveNodes();
      status = 'disposed';

      const runtime = context;
      context = undefined;

      try {
        await runtime?.close?.();
      } catch {
        // The runtime has already been disposed from the caller's perspective.
      }
    },

    getStatus(): SoundscapeStatus {
      return status;
    },
  };
}
