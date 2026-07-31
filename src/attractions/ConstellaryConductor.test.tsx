import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { ScorePlan } from '../audio/score-plan';
import { ConstellaryConductor } from './ConstellaryConductor';

const plan: ScorePlan = {
  planVersion: 1,
  finaleTitle: 'The Bridged Far Horizon',
  palette: 'ember-violet',
  tempoBpm: 96,
  emberIdentity: ['A3', 'C4', 'D4', 'E4'],
  realmLayers: [],
  visiblePulseSequence: [
    { index: 0, beat: 0, note: 'A3', emphasis: 'soft', caption: 'Ember wakes' },
    { index: 1, beat: 1, note: 'C4', emphasis: 'bright', caption: 'Path answers' },
    { index: 2, beat: 2, note: 'D4', emphasis: 'bright', caption: 'Realm gathers' },
    { index: 3, beat: 3, note: 'E4', emphasis: 'strong', caption: 'Constellation resolves' },
  ],
  equivalence: {
    audio: { mode: 'muted', visibleLabel: 'Sound is muted. Follow the four amber pulses.' },
    motion: {
      mode: 'step',
      visibleLabel: 'Advance through the constellation one visible pulse at a time.',
    },
  },
};

function pulseButton(number: number, caption: string, note: string) {
  return screen.getByRole('button', {
    name: `Conduct pulse ${number}: ${caption} (${note})`,
  });
}

describe('ConstellaryConductor', () => {
  it('offers four visible semantic pulses, a current caption, and the no-timing route', () => {
    render(<ConstellaryConductor plan={plan} onComplete={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Conduct the four amber pulses' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 4 pulses conducted');
    expect(screen.getByRole('status')).toHaveTextContent('Current pulse: Ember wakes');
    expect(pulseButton(1, 'Ember wakes', 'A3')).toHaveAttribute('aria-pressed', 'false');
    expect(pulseButton(4, 'Constellation resolves', 'E4')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Resolve my constellation' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Let the park remember for me' }),
    ).toBeInTheDocument();
  });

  it('explains an out-of-order attempt without losing the guest’s progress', async () => {
    const user = userEvent.setup();
    render(<ConstellaryConductor plan={plan} onComplete={vi.fn()} />);

    await user.click(pulseButton(3, 'Realm gathers', 'D4'));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Pulse 3 is waiting. Begin with Ember wakes.',
    );
    expect(screen.getByRole('status')).toHaveTextContent('0 of 4 pulses conducted');

    await user.click(pulseButton(1, 'Ember wakes', 'A3'));

    expect(screen.getByRole('status')).toHaveTextContent('1 of 4 pulses conducted');
    expect(screen.getByRole('status')).toHaveTextContent('Current pulse: Path answers');
  });

  it('conducts all four in sequence before explicitly resolving the constellation', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ConstellaryConductor plan={plan} onComplete={onComplete} />);

    await user.click(pulseButton(1, 'Ember wakes', 'A3'));
    await user.click(pulseButton(2, 'Path answers', 'C4'));
    await user.click(pulseButton(3, 'Realm gathers', 'D4'));
    await user.click(pulseButton(4, 'Constellation resolves', 'E4'));

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('4 of 4 pulses conducted');
    expect(screen.getByRole('status')).toHaveTextContent('All four pulses are ready to resolve.');
    expect(screen.getByRole('button', { name: 'Resolve my constellation' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Resolve my constellation' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard conduct/reset controls and an equivalent immediate completion route', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ConstellaryConductor plan={plan} onComplete={onComplete} />);

    const firstPulse = pulseButton(1, 'Ember wakes', 'A3');
    firstPulse.focus();
    await user.keyboard(' ');

    expect(firstPulse).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('1 of 4 pulses conducted');

    await user.click(screen.getByRole('button', { name: 'Reset pulses' }));
    expect(screen.getByRole('status')).toHaveTextContent('0 of 4 pulses conducted');
    expect(firstPulse).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'Let the park remember for me' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
