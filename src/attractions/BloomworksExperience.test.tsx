import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { deriveBloomReturnMemory } from '../experience/return-continuity';
import { BloomworksExperience } from './BloomworksExperience';

const bridgeMemory = deriveBloomReturnMemory({
  discoveries: ['carry:bloom:v1:bridge:4:root'],
});

describe('BloomworksExperience', () => {
  it('grows a semantic root graph on every repeatable core placement and preserves the short exit', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<BloomworksExperience onComplete={onComplete} />);

    const graph = screen.getByRole('img', { name: 'Living root network' });
    expect(graph).toHaveAttribute('data-node-count', '0');
    expect(graph).toHaveAttribute('data-edge-count', '0');

    await user.click(screen.getByRole('button', { name: 'Gather seed gear' }));
    expect(graph).toHaveAttribute('data-node-count', '1');
    expect(screen.getByRole('status')).toHaveTextContent(/first living point/i);

    await user.click(screen.getByRole('button', { name: 'Gather seed gear' }));
    await user.click(screen.getByRole('button', { name: 'Connect seed gear' }));

    expect(graph).toHaveAttribute('data-node-count', '3');
    expect(Number(graph.getAttribute('data-edge-count'))).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('button', { name: 'Wake Bloomworks' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Tend the moon roots' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('lets the guest place three spatial moon roots and commits the chorus discovery', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onDiscover = vi.fn();
    render(<BloomworksExperience onComplete={onComplete} onDiscover={onDiscover} />);

    for (const gear of ['Gather seed gear', 'Connect seed gear', 'Wander seed gear']) {
      await user.click(screen.getByRole('button', { name: gear }));
    }
    await user.click(screen.getByRole('button', { name: 'Tend the moon roots' }));

    const sockets = [
      ['Choose Crown socket', 'Gather seed gear'],
      ['Choose Crossing socket', 'Connect seed gear'],
      ['Choose Verge socket', 'Wander seed gear'],
    ] as const;
    for (const [socket, gear] of sockets) {
      await user.click(screen.getByRole('button', { name: socket }));
      await user.click(screen.getByRole('button', { name: gear }));
    }

    const graph = screen.getByRole('img', { name: 'Living root network' });
    expect(graph).toHaveAttribute('data-node-count', '6');
    expect(graph.getAttribute('data-topology')).toMatch(/^bloom:/);
    expect(screen.getByRole('status')).toHaveTextContent(/moon-root chorus/i);

    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

    expect(onDiscover).toHaveBeenCalledWith('bloom-moon-root-chorus');
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        trace: expect.objectContaining({ attractionId: 'bloomworks', pulse: 8 }),
      }),
    );
  });

  it('explains the three-gear interaction and keeps completion unavailable at rest', () => {
    render(<BloomworksExperience onComplete={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Wake the root garden' })).toBeInTheDocument();
    expect(screen.getByText(/Grow three roots for a complete small garden/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Seed gears' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 core roots placed');
    expect(screen.getByRole('button', { name: 'Wake Bloomworks' })).toBeDisabled();
  });

  it('grows a live root response and completes the authored bridge trace from its order', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<BloomworksExperience onComplete={onComplete} />);

    await user.click(screen.getByRole('button', { name: 'Gather seed gear' }));

    expect(screen.getByRole('button', { name: 'Gather seed gear' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('1 of 3 core roots placed');
    expect(screen.getByLabelText('Garden root response')).toHaveTextContent(
      'A sheltering root folds the nearby light into a warm nest.',
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
    [['Gather seed gear', 'Gather seed gear', 'Gather seed gear'], 'cluster'],
    [['Wander seed gear', 'Wander seed gear', 'Wander seed gear'], 'wild'],
  ] as const)(
    'uses visible graph relationships to deterministically form the %s pattern',
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

    expect(screen.getByRole('status')).toHaveTextContent('2 of 3 core roots placed');
    expect(screen.getByRole('button', { name: 'Wake Bloomworks' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Reset root garden' }));

    expect(screen.getByRole('status')).toHaveTextContent('0 of 3 core roots placed');
    expect(gather).toBeEnabled();
  });

  it('shows a real compressed afterimage immediately without blocking the three-root exit', async () => {
    if (!bridgeMemory) throw new Error('fixture should produce a return memory');
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onDiscover = vi.fn();
    render(
      <BloomworksExperience
        returnMemory={bridgeMemory}
        onComplete={onComplete}
        onDiscover={onDiscover}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'A root remembered overnight' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/pale crossing with one rail unfinished/i)).toBeInTheDocument();
    const afterimage = screen.getByTestId('bloom-return-afterimage');
    expect(afterimage).toHaveAttribute('data-return-pattern', 'bridge');
    expect(afterimage.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(afterimage.querySelectorAll('circle')).toHaveLength(4);

    for (const gear of ['Gather seed gear', 'Connect seed gear', 'Wander seed gear']) {
      await user.click(screen.getByRole('button', { name: gear }));
    }
    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onDiscover).not.toHaveBeenCalledWith(expect.stringMatching(/^return:bloom:/));
  });

  it('lets any one gear answer at the listening moon socket and persists the authored reply', async () => {
    if (!bridgeMemory) throw new Error('fixture should produce a return memory');
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onDiscover = vi.fn();
    render(
      <BloomworksExperience
        returnMemory={bridgeMemory}
        onComplete={onComplete}
        onDiscover={onDiscover}
      />,
    );

    for (const gear of ['Gather seed gear', 'Connect seed gear', 'Wander seed gear']) {
      await user.click(screen.getByRole('button', { name: gear }));
    }
    await user.click(screen.getByRole('button', { name: 'Tend the moon roots' }));

    const listeningSocket = screen.getByRole('button', { name: 'Choose Crossing socket' });
    expect(listeningSocket).toHaveAttribute('data-return-reply', 'true');
    expect(listeningSocket).toHaveTextContent(/listening across nights/i);
    await user.click(listeningSocket);
    await user.click(screen.getByRole('button', { name: 'Connect seed gear' }));

    expect(screen.getByRole('status')).toHaveTextContent(/old rhythm recognizes itself/i);
    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

    expect(onDiscover).toHaveBeenCalledWith('return:bloom:v1:bridge:4:root:bridge:connect');
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ trace: expect.objectContaining({ pattern: 'bridge' }) }),
    );
  });
});
