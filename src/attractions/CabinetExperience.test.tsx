import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getAttraction } from '../content/attractions';
import { CabinetExperience } from './CabinetExperience';

const CABINET_CHOICES = getAttraction('cabinet').choices;

describe('CabinetExperience', () => {
  it('remembers two distinct clues before adopting the selected authored near thing', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<CabinetExperience onComplete={onComplete} />);

    const weatherLoom = screen.getByRole('button', { name: 'Inspect weather loom drawer' });
    const adoption = screen.getByRole('button', { name: 'Let it follow me' });

    expect(screen.getByText('0 of 2 drawers inspected')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Remembered clues' })).toHaveTextContent(
      'No near-thing clues remembered yet.',
    );
    expect(adoption).toBeDisabled();

    weatherLoom.focus();
    await user.keyboard('{Enter}');
    await user.click(weatherLoom);

    expect(screen.getByText('1 of 2 drawers inspected')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Remembered clues' })).toHaveTextContent(
      'Loose threads hum against the brass and smell faintly of rain.',
    );
    expect(adoption).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Inspect staircase seed drawer' }));

    expect(screen.getByText('2 of 2 drawers inspected')).toBeInTheDocument();
    expect(screen.getByText('Candidate: Adopt the staircase seed')).toBeInTheDocument();
    expect(adoption).toBeEnabled();
    expect(onComplete).not.toHaveBeenCalled();

    await user.click(adoption);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenLastCalledWith(CABINET_CHOICES[1]);
  });

  it('resets remembered clues and the candidate without completing', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(<CabinetExperience onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: 'Inspect weather loom drawer' }));
    await user.click(screen.getByRole('button', { name: 'Inspect enough clock drawer' }));
    expect(screen.getByRole('button', { name: 'Let it follow me' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Reset cabinet' }));

    expect(screen.getByText('0 of 2 drawers inspected')).toBeInTheDocument();
    expect(screen.getByText('Candidate: none yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Let it follow me' })).toBeDisabled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
