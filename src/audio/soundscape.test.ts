import { describe, expect, it, vi } from 'vitest';

import { createGuestState, type GuestPreferences } from '../experience/guest-state';
import { createScorePlan } from './score-plan';
import { createSoundscape } from './soundscape';

class FakeAudioParam {
  readonly values: Array<{ kind: 'set' | 'ramp'; value: number; time: number }> = [];

  setValueAtTime(value: number, time: number): void {
    this.values.push({ kind: 'set', value, time });
  }

  linearRampToValueAtTime(value: number, time: number): void {
    this.values.push({ kind: 'ramp', value, time });
  }
}

class FakeAudioNode {
  readonly connections: FakeAudioNode[] = [];
  disconnectCalls = 0;

  connect(destination: FakeAudioNode): void {
    this.connections.push(destination);
  }

  disconnect(): void {
    this.disconnectCalls += 1;
  }
}

class FakeGainNode extends FakeAudioNode {
  readonly gain = new FakeAudioParam();
}

class FakeOscillatorNode extends FakeAudioNode {
  readonly frequency = new FakeAudioParam();
  type: 'sine' | 'triangle' = 'sine';
  readonly startCalls: number[] = [];
  readonly stopCalls: number[] = [];

  start(when: number): void {
    this.startCalls.push(when);
  }

  stop(when: number): void {
    this.stopCalls.push(when);
  }
}

class FakeAudioContext {
  state: 'running' | 'suspended' | 'closed';
  currentTime = 12;
  readonly destination = new FakeAudioNode();
  readonly gains: FakeGainNode[] = [];
  readonly oscillators: FakeOscillatorNode[] = [];
  resumeCalls = 0;
  closeCalls = 0;

  constructor(
    state: 'running' | 'suspended' = 'suspended',
    private readonly resumeFails = false,
  ) {
    this.state = state;
  }

  createGain(): FakeGainNode {
    const node = new FakeGainNode();
    this.gains.push(node);
    return node;
  }

  createOscillator(): FakeOscillatorNode {
    const node = new FakeOscillatorNode();
    this.oscillators.push(node);
    return node;
  }

  async resume(): Promise<void> {
    this.resumeCalls += 1;
    if (this.resumeFails) throw new Error('autoplay is blocked');
    this.state = 'running';
  }

  async close(): Promise<void> {
    this.closeCalls += 1;
    this.state = 'closed';
  }
}

function createPlan(preferences: Partial<GuestPreferences>): ReturnType<typeof createScorePlan> {
  return createScorePlan(createGuestState(77, preferences));
}

describe('soundscape', () => {
  it('does not create audio until explicit start, then schedules a short gentle loop', async () => {
    const context = new FakeAudioContext();
    const createAudioContext = vi.fn(() => context);
    const soundscape = createSoundscape({ createAudioContext });
    const plan = createPlan({ audio: 'on', motion: 'full' });

    expect(createAudioContext).not.toHaveBeenCalled();
    expect(soundscape.getStatus()).toBe('idle');

    const result = await soundscape.start(plan);

    expect(result).toMatchObject({
      status: 'playing',
      audioLabel: plan.equivalence.audio.visibleLabel,
      motionLabel: plan.equivalence.motion.visibleLabel,
      scheduledPulseCount: 8,
    });
    expect(createAudioContext).toHaveBeenCalledTimes(1);
    expect(context.resumeCalls).toBe(1);
    expect(context.oscillators).toHaveLength(8);
    expect(context.oscillators.every((node) => node.startCalls.length === 1)).toBe(true);
    expect(context.oscillators.every((node) => node.stopCalls.length === 1)).toBe(true);
    expect(context.gains).toHaveLength(9);
  });

  it('keeps muted and reduced-motion plans silent while returning their visual-equivalence labels', async () => {
    const createAudioContext = vi.fn(() => new FakeAudioContext());
    const soundscape = createSoundscape({ createAudioContext });
    const plan = createPlan({ audio: 'off', motion: 'reduced' });

    const result = await soundscape.start(plan);

    expect(result).toEqual({
      status: 'muted',
      audioLabel: plan.equivalence.audio.visibleLabel,
      motionLabel: plan.equivalence.motion.visibleLabel,
      scheduledPulseCount: 0,
    });
    expect(createAudioContext).not.toHaveBeenCalled();
    expect(soundscape.getStatus()).toBe('muted');
  });

  it('returns an unavailable result instead of throwing when no context can be created', async () => {
    const soundscape = createSoundscape({
      createAudioContext: () => {
        throw new Error('no audio device');
      },
    });
    const plan = createPlan({ audio: 'on', motion: 'reduced' });

    await expect(soundscape.start(plan)).resolves.toEqual({
      status: 'unavailable',
      audioLabel: plan.equivalence.audio.visibleLabel,
      motionLabel: plan.equivalence.motion.visibleLabel,
      scheduledPulseCount: 0,
    });
    expect(() => soundscape.stop()).not.toThrow();
    await expect(soundscape.dispose()).resolves.toBeUndefined();
  });

  it('stays exception-safe when an explicitly started context cannot resume', async () => {
    const context = new FakeAudioContext('suspended', true);
    const soundscape = createSoundscape({ createAudioContext: () => context });
    const plan = createPlan({ audio: 'on', motion: 'full' });

    const result = await soundscape.start(plan);

    expect(result).toEqual({
      status: 'suspended',
      audioLabel: plan.equivalence.audio.visibleLabel,
      motionLabel: plan.equivalence.motion.visibleLabel,
      scheduledPulseCount: 0,
    });
    expect(context.resumeCalls).toBe(1);
    expect(context.oscillators).toHaveLength(0);
  });

  it('stops scheduled nodes and closes its injected context on dispose', async () => {
    const context = new FakeAudioContext('running');
    const soundscape = createSoundscape({ createAudioContext: () => context });

    await soundscape.start(createPlan({ audio: 'on', motion: 'full' }));
    soundscape.stop();

    expect(soundscape.getStatus()).toBe('stopped');
    expect(context.oscillators.every((node) => node.stopCalls.length >= 2)).toBe(true);
    expect(context.oscillators.every((node) => node.disconnectCalls === 1)).toBe(true);

    await soundscape.dispose();

    expect(context.closeCalls).toBe(1);
    expect(soundscape.getStatus()).toBe('disposed');
    await expect(soundscape.start(createPlan({ audio: 'on' }))).resolves.toMatchObject({
      status: 'disposed',
    });
  });
});
