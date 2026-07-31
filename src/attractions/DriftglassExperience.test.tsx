import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getAttraction } from '../content/attractions';
import { DriftglassExperience } from './DriftglassExperience';

const DRIFTGLASS_CHOICES = getAttraction('driftglass').choices;

describe('DriftglassExperience', () => {
  it('offers three semantic current decisions and keeps step, pulse, and companions live', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<DriftglassExperience onComplete={onComplete} />);

    expect(screen.getByRole('heading', { name: 'Guide the lost light' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^(Port|Hold|Starboard)$/ })).toHaveLength(3);
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Current pulse' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByLabelText('Companions gathering')).toHaveTextContent('Waiting');

    screen.getByRole('button', { name: 'Port' }).focus();
    await user.keyboard('{Enter}');

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Current pulse' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
    expect(screen.getByLabelText('Companions gathering')).toHaveTextContent('Flicker');
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Hold' }));
    expect(onComplete).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Port' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenLastCalledWith(DRIFTGLASS_CHOICES[0]);
    expect(screen.getByRole('status')).toHaveTextContent('Follow the quiet cove');
  });

  it.each([
    { moves: ['Port', 'Hold', 'Port'], choiceId: 'cove' },
    { moves: ['Port', 'Hold', 'Starboard'], choiceId: 'current' },
    { moves: ['Starboard', 'Hold', 'Starboard'], choiceId: 'horizon' },
  ])('resolves $choiceId from a deterministic three-current route', async ({ moves, choiceId }) => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const expectedChoice = DRIFTGLASS_CHOICES.find((choice) => choice.id === choiceId);

    render(<DriftglassExperience onComplete={onComplete} />);

    for (const move of moves) {
      await user.click(screen.getByRole('button', { name: move }));
    }

    expect(expectedChoice).toBeDefined();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenLastCalledWith(expectedChoice);
  });

  it('allows a completed crossing to reset before another three-decision route', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<DriftglassExperience onComplete={onComplete} />);

    for (const move of ['Starboard', 'Hold', 'Starboard']) {
      await user.click(screen.getByRole('button', { name: move }));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Reset this crossing' }));

    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Current pulse' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
