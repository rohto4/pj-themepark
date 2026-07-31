import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FinaleTimelinePlan } from '../experience/finale-timeline';
import { ConstellaryConductor } from './ConstellaryConductor';

const beats: FinaleTimelinePlan['beats'] = [
  {
    id: 'awakening',
    act: 1,
    title: 'The ember remembers its name',
    caption: 'A3 · C4 · D4 · E4 returns as the first lantern phrase.',
    note: 'A3',
    geometryId: 'ember-a3-c4-d4-e4',
    pace: 'measured',
  },
  {
    id: 'gathering',
    act: 2,
    title: 'The realms enter the sky',
    caption: 'Three remembered paths gather without losing their shape.',
    note: 'C4',
    geometryId: 'gathering-bloom-drift-cabinet',
    pace: 'rising',
  },
  {
    id: 'recognition',
    act: 3,
    title: 'The garden returns as a constellation',
    caption: 'Living crossings return above the park.',
    note: 'D4',
    geometryId: 'bloom-constellary-bridge-4',
    pace: 'still',
  },
  {
    id: 'climax',
    act: 4,
    title: 'Every route meets at midnight',
    caption: 'Bell and comet cross the sky.',
    note: 'E4',
    geometryId: 'climax-bridge-soar-horizon-bell-comet',
    pace: 'soaring',
  },
  {
    id: 'release',
    act: 5,
    title: 'The night becomes yours to carry',
    caption: 'One light stays awake for tomorrow.',
    note: 'A3',
    geometryId: 'release-weather-loom-5',
    pace: 'settling',
  },
];

const plan: FinaleTimelinePlan = {
  timelineVersion: 1,
  finaleTitle: 'The Bridged Far Horizon',
  beats,
  recognition: {
    geometryId: 'bloom-constellary-bridge-4',
    viewBox: '0 0 300 180',
    accessibleLabel: 'Bloomworks living crossings, 4 answering lights',
    paths: [
      {
        id: 'recognition-bridge',
        d: 'M24 128C70 31 118 27 150 108C182 27 230 31 276 128',
        role: 'bridge',
      },
    ],
    nodes: [{ id: 'recognition-light', cx: 150, cy: 108, radius: 5, role: 'resident' }],
  },
  resultFingerprint: 'finale:bridged-night',
  presentation: { audio: 'audible', motion: 'animated' },
};

function actButton(number: number, title: string, note: string) {
  return screen.getByRole('button', { name: `Conduct act ${number}: ${title} (${note})` });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ConstellaryConductor', () => {
  it('opens on a real stage with five semantic acts and a patient active route', () => {
    render(<ConstellaryConductor timeline={plan} onComplete={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: 'Conduct a night in five acts' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 5 acts conducted');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Current act: The ember remembers its name',
    );
    expect(screen.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-beat',
      'awakening',
    );
    expect(screen.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-result-fingerprint',
      plan.resultFingerprint,
    );
    expect(
      screen.getByRole('list', { name: 'Constellary performance sequence' }).children,
    ).toHaveLength(5);
    expect(actButton(1, beats[0]!.title, beats[0]!.note)).toHaveAttribute('aria-pressed', 'false');
    expect(actButton(5, beats[4]!.title, beats[4]!.note)).toBeInTheDocument();
  });

  it('explains an out-of-order act without losing the guest’s progress', async () => {
    const user = userEvent.setup();
    render(<ConstellaryConductor timeline={plan} onComplete={vi.fn()} />);

    await user.click(actButton(3, beats[2]!.title, beats[2]!.note));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Act 3 is waiting. Begin with The ember remembers its name.',
    );
    expect(screen.getByRole('status')).toHaveTextContent('0 of 5 acts conducted');

    await user.click(actButton(1, beats[0]!.title, beats[0]!.note));

    expect(screen.getByRole('status')).toHaveTextContent('1 of 5 acts conducted');
    expect(screen.getByRole('status')).toHaveTextContent('Current act: The realms enter the sky');
    expect(screen.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-beat',
      'gathering',
    );

    await user.click(actButton(2, beats[1]!.title, beats[1]!.note));
    expect(screen.getByRole('status')).toHaveTextContent(
      'The realms enter the sky. Next: The garden returns as a constellation.',
    );
    expect(screen.getByRole('status')).not.toHaveTextContent('enters the sky enters the sky');
  });

  it('conducts all five acts before resolving the exact timeline result', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ConstellaryConductor timeline={plan} onComplete={onComplete} />);

    for (const beat of beats) await user.click(actButton(beat.act, beat.title, beat.note));

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('5 of 5 acts conducted');
    expect(screen.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-beat',
      'release',
    );

    await user.click(screen.getByRole('button', { name: 'Carry this night with me' }));
    expect(onComplete).toHaveBeenCalledWith(plan.resultFingerprint);
  });

  it('performs the same five acts as an animated watch-only route', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<ConstellaryConductor timeline={plan} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Watch the park perform' }));
    for (let index = 0; index < 5; index += 1) {
      await act(async () => vi.advanceTimersByTime(1000));
    }

    expect(screen.getByRole('status')).toHaveTextContent('5 of 5 acts performed');
    expect(screen.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-result-fingerprint',
      plan.resultFingerprint,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Carry this night with me' }));
    expect(onComplete).toHaveBeenCalledWith(plan.resultFingerprint);
  });

  it('offers the five equivalent still acts without timers in reduced or low-power mode', async () => {
    vi.useFakeTimers();
    const stepPlan: FinaleTimelinePlan = {
      ...plan,
      presentation: { audio: 'muted', motion: 'step' },
    };
    render(<ConstellaryConductor timeline={stepPlan} onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Watch the park perform' }));

    expect(screen.getAllByRole('img', { name: /Act \d of 5:/ })).toHaveLength(5);
    expect(screen.getByRole('status')).toHaveTextContent('5 of 5 acts performed');
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByRole('button', { name: 'Carry this night with me' })).toBeEnabled();
  });

  it('supports keyboard conducting, reset, and the generous immediate route', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ConstellaryConductor timeline={plan} onComplete={onComplete} />);

    const firstAct = actButton(1, beats[0]!.title, beats[0]!.note);
    firstAct.focus();
    await user.keyboard(' ');
    expect(firstAct).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Reset performance' }));
    expect(screen.getByRole('status')).toHaveTextContent('0 of 5 acts conducted');

    await user.click(screen.getByRole('button', { name: 'Let the park remember for me' }));
    expect(onComplete).toHaveBeenCalledWith(plan.resultFingerprint);
  });
});
