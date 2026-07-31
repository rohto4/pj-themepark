import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getAttraction } from '../content/attractions';
import { WindthreadExperience } from './WindthreadExperience';

const WINDTHREAD_CHOICES = getAttraction('windthread').choices;

describe('WindthreadExperience', () => {
  it.each([
    {
      marks: ['Low straight mark', 'Low straight mark', 'Middle straight mark'],
      choiceId: 'drift',
      routeName: 'Drift route',
    },
    {
      marks: ['Left turn mark', 'Right turn mark', 'Middle straight mark'],
      choiceId: 'weave',
      routeName: 'Weave route',
    },
    {
      marks: ['High climb mark', 'High climb mark', 'Left turn mark'],
      choiceId: 'soar',
      routeName: 'Soar route',
    },
  ])(
    'turns three deliberate marks into the $choiceId authored trace',
    async ({ marks, choiceId, routeName }) => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      const expectedChoice = WINDTHREAD_CHOICES.find((choice) => choice.id === choiceId);

      render(<WindthreadExperience onComplete={onComplete} />);

      expect(screen.getByRole('heading', { name: 'Write across the air' })).toBeInTheDocument();
      expect(screen.getByText('0 of 3 flight marks composed')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tie off the sky-thread' })).toBeDisabled();

      for (const mark of marks) {
        await user.click(screen.getByRole('button', { name: mark }));
      }

      expect(screen.getByText('3 of 3 flight marks composed')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: routeName })).toBeInTheDocument();
      expect(screen.getByText(`Route transformed: ${routeName}`)).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();

      await user.click(screen.getByRole('button', { name: 'Tie off the sky-thread' }));

      expect(expectedChoice).toBeDefined();
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenLastCalledWith(expectedChoice);
    },
  );

  it('supports keyboard marks and resets the flight before a trace is tied off', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<WindthreadExperience onComplete={onComplete} />);

    const highClimb = screen.getByRole('button', { name: 'High climb mark' });
    highClimb.focus();
    await user.keyboard('{Enter}');
    await user.click(highClimb);

    expect(screen.getByText('2 of 3 flight marks composed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset flight marks' }));

    expect(screen.getByText('0 of 3 flight marks composed')).toBeInTheDocument();
    expect(screen.getByText('Route transform: waiting for three marks.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tie off the sky-thread' })).toBeDisabled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
