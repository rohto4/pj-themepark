import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BloomworksExperience } from './BloomworksExperience';

describe('BloomworksExperience', () => {
  it('explains the three-gear interaction and keeps completion unavailable at rest', () => {
    render(<BloomworksExperience onComplete={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Wake the root garden' })).toBeInTheDocument();
    expect(screen.getByText(/Place all three distinct seed-gears/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Seed gears' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 seed-gears placed');
    expect(screen.getByRole('button', { name: 'Wake Bloomworks' })).toBeDisabled();
  });

  it('grows a live root response and completes the authored bridge trace from its order', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<BloomworksExperience onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: 'Gather seed gear' }));

    expect(screen.getByRole('button', { name: 'Gather seed gear' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 seed-gears placed');
    expect(screen.getByLabelText('Garden root response')).toHaveTextContent(
      'A sheltered root curls inward.',
    );

    await user.click(screen.getByRole('button', { name: 'Connect seed gear' }));
    await user.click(screen.getByRole('button', { name: 'Wander seed gear' }));

    expect(screen.getByText('Pattern formed: Grow bridges')).toBeInTheDocument();
    expect(screen.getByText('Long vines · shared crossings')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

    expect(onComplete).toHaveBeenCalledWith({
      id: 'bridge',
      label: 'Grow bridges',
      note: 'Long vines · shared crossings',
      trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
    });
  });

  it.each([
    [['Connect seed gear', 'Gather seed gear', 'Wander seed gear'], 'cluster'],
    [['Gather seed gear', 'Wander seed gear', 'Connect seed gear'], 'wild'],
  ] as const)(
    'uses the second gear to deterministically form the %s pattern',
    async (order, pattern) => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<BloomworksExperience onComplete={onComplete} />);

      for (const gear of order) {
        await user.click(screen.getByRole('button', { name: gear }));
      }
      await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ trace: expect.objectContaining({ pattern }) }),
      );
    },
  );

  it('supports keyboard activation and a reset before the garden is awakened', async () => {
    const user = userEvent.setup();
    render(<BloomworksExperience onComplete={vi.fn()} />);

    const gather = screen.getByRole('button', { name: 'Gather seed gear' });
    gather.focus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Connect seed gear' }));

    expect(screen.getByRole('status')).toHaveTextContent('2 of 3 seed-gears placed');
    expect(screen.getByRole('button', { name: 'Wake Bloomworks' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reset seed-gears' }));

    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 seed-gears placed');
    expect(gather).toHaveAttribute('aria-pressed', 'false');
    expect(gather).toBeEnabled();
  });
});
