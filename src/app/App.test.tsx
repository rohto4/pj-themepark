import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createGuestState, reduceGuestState } from '../experience/guest-state';
import { GUEST_STATE_STORAGE_KEY, saveGuestState } from '../experience/persistence';
import { App } from './App';

describe('Morrowlight guest journey', () => {
  it('offers one immediate action and accessibility controls at the threshold', () => {
    render(<App initialState={createGuestState(1147)} />);

    expect(screen.getByRole('heading', { name: 'MORROWLIGHT' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Touch the last light of today' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visit settings' })).toBeInTheDocument();
  });

  it('reveals a legible living map after lighting the star', async () => {
    const user = userEvent.setup();
    render(<App initialState={createGuestState(1147)} />);

    await user.click(screen.getByRole('button', { name: 'Touch the last light of today' }));

    expect(screen.getByRole('heading', { name: 'Where will your light go?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Bloomworks/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Driftglass Sea/ })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Enter the Cabinet of Near Things/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 of 3 lights gathered')).toBeInTheDocument();
  });

  it('carries three authored choices into a personalized finale', async () => {
    const user = userEvent.setup();
    render(<App initialState={createGuestState(901)} />);

    await user.click(screen.getByRole('button', { name: 'Touch the last light of today' }));

    await user.click(screen.getByRole('button', { name: /Enter Bloomworks/ }));
    await user.click(screen.getByRole('button', { name: 'Grow bridges' }));
    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

    expect(screen.getByText('1 of 3 lights gathered')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Enter Driftglass Sea/ }));
    await user.click(screen.getByRole('button', { name: 'Follow the far horizon' }));
    await user.click(screen.getByRole('button', { name: 'Set the current' }));

    await user.click(screen.getByRole('button', { name: /Enter the Cabinet of Near Things/ }));
    await user.click(screen.getByRole('button', { name: 'Adopt the weather loom' }));
    await user.click(screen.getByRole('button', { name: 'Let it follow me' }));

    expect(screen.getByText('3 of 3 lights gathered')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open the Constellary' }));

    expect(screen.getByRole('heading', { name: 'The Constellary remembers' })).toBeInTheDocument();
    expect(screen.getByText('The Bridged Far Horizon')).toBeInTheDocument();
    expect(screen.getByText(/bloom:bridge/)).toBeInTheDocument();
    expect(screen.getByText(/drift:horizon/)).toBeInTheDocument();
    expect(screen.getByText(/near:weather-loom/)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Visible score' }).children).toHaveLength(4);

    await user.click(screen.getByRole('button', { name: 'Conduct this night' }));
    expect(screen.getByRole('button', { name: 'Download my Night Chart' })).toBeInTheDocument();
  });

  it('authors reduced motion and low power as explicit guest settings', async () => {
    const user = userEvent.setup();
    render(<App initialState={createGuestState(5)} />);

    await user.click(screen.getByRole('button', { name: 'Visit settings' }));
    await user.click(screen.getByRole('button', { name: 'Use reduced motion' }));
    await user.click(screen.getByRole('button', { name: 'Use low power mode' }));
    await user.click(screen.getByRole('button', { name: 'Invite sound' }));

    expect(screen.getByTestId('park-root')).toHaveAttribute('data-motion', 'reduced');
    expect(screen.getByTestId('park-root')).toHaveAttribute('data-power', 'low');
    expect(screen.getByTestId('park-root')).toHaveAttribute('data-audio', 'on');
    expect(
      await screen.findByText('Sound is unavailable; visible score remains'),
    ).toBeInTheDocument();
  });

  it('remembers a night locally and resumes at the exact scene', async () => {
    const remembered = reduceGuestState(createGuestState(73), { type: 'LIGHT_STAR' });
    saveGuestState(window.localStorage, remembered);

    const { unmount } = render(<App />);

    expect(screen.getByRole('heading', { name: 'Where will your light go?' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Enter Bloomworks/ }));
    const saved = JSON.parse(window.localStorage.getItem(GUEST_STATE_STORAGE_KEY) ?? '{}');
    expect(saved.currentScene).toBe('bloomworks');

    unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Bloomworks' })).toBeInTheDocument();
  });
});
