import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { createGuestState, reduceGuestState } from '../experience/guest-state';
import { encodeNightCode } from '../experience/night-code';
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

  it('projects a Bloom trace into map geometry and a touchable Hushgarden afterlight', async () => {
    const user = userEvent.setup();
    let state = reduceGuestState(createGuestState(44), { type: 'LIGHT_STAR' });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 8 },
    });
    state = reduceGuestState(state, {
      type: 'DISCOVER',
      discoveryId: 'bloom-moon-root-chorus',
    });
    render(<App initialState={state} />);

    expect(screen.getByTestId('bloom-map-afterlight')).toHaveAttribute(
      'data-geometry',
      'bloom-map-bridge-8-chorus',
    );
    expect(
      screen.getByTestId('bloom-map-afterlight').querySelectorAll('path').length,
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Rest in Hushgarden' }));
    expect(
      screen.getByRole('img', { name: /Bloomworks living crossings, 8 answering lights/i }),
    ).toBeInTheDocument();
    const afterlight = screen.getByRole('button', { name: 'Ring the living bridge' });
    await user.click(afterlight);
    expect(afterlight).toHaveAttribute('aria-pressed', 'true');
  });

  it('returns Bloom geometry as a visible Constellary recognition figure', () => {
    let state = reduceGuestState(createGuestState(44), { type: 'LIGHT_STAR' });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'bloomworks', pattern: 'wild', pulse: 7 },
    });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'driftglass', route: 'horizon', companions: ['bell', 'comet'] },
    });
    state = reduceGuestState(state, {
      type: 'COMPLETE_ATTRACTION',
      trace: { attractionId: 'cabinet', nearThing: 'weather-loom' },
    });
    state = reduceGuestState(state, { type: 'BEGIN_FINALE' });
    render(<App initialState={state} />);

    const recognition = screen.getByRole('img', {
      name: /Bloomworks pollinator runners, 7 answering lights/i,
    });
    expect(recognition).toHaveAttribute('data-geometry', 'bloom-constellary-wild-7');
    expect(recognition.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('carries three authored choices into a personalized finale', async () => {
    const user = userEvent.setup();
    render(<App initialState={createGuestState(901)} />);

    await user.click(screen.getByRole('button', { name: 'Touch the last light of today' }));

    await user.click(screen.getByRole('button', { name: /Enter Bloomworks/ }));
    await user.click(screen.getByRole('button', { name: 'Gather seed gear' }));
    await user.click(screen.getByRole('button', { name: 'Connect seed gear' }));
    await user.click(screen.getByRole('button', { name: 'Wander seed gear' }));
    await user.click(screen.getByRole('button', { name: 'Wake Bloomworks' }));

    expect(screen.getByText('1 of 3 lights gathered')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Enter Driftglass Sea/ }));
    await user.click(screen.getByRole('button', { name: 'Starboard' }));
    await user.click(screen.getByRole('button', { name: 'Starboard' }));
    await user.click(screen.getByRole('button', { name: 'Starboard' }));

    await user.click(screen.getByRole('button', { name: /Enter the Cabinet of Near Things/ }));
    await user.click(screen.getByRole('button', { name: 'Inspect staircase seed drawer' }));
    await user.click(screen.getByRole('button', { name: 'Inspect weather loom drawer' }));
    await user.click(screen.getByRole('button', { name: 'Let it follow me' }));

    expect(screen.getByText('3 of 3 lights gathered')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open the Constellary' }));

    expect(screen.getByRole('heading', { name: 'The Constellary remembers' })).toBeInTheDocument();
    expect(screen.getByText('The Bridged Far Horizon')).toBeInTheDocument();
    const receipt = screen.getByText('3 traces are woven into this sky');
    expect(receipt.closest('details')).not.toHaveAttribute('open');
    await user.click(receipt);
    expect(screen.getByText('Bloomworks · Living crossings · 4 lights')).toBeInTheDocument();
    expect(screen.getByText(/Driftglass · Far Horizon ·/)).toBeInTheDocument();
    expect(screen.getByText('Cabinet · Weather Loom')).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Constellary performance sequence' }).children,
    ).toHaveLength(5);
    expect(screen.getByTestId('constellary-performance-stage')).toHaveAttribute(
      'data-beat',
      'awakening',
    );

    await user.click(screen.getByRole('button', { name: 'Let the park remember for me' }));
    expect(screen.getByRole('button', { name: 'Download my Night Chart' })).toBeInTheDocument();
    expect(screen.getByText(encodeNightCode(createGuestState(901)))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Begin another night' }));
    expect(
      screen.getByRole('button', { name: 'Touch the last light of today' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Touch the last light of today' }));
    await user.click(screen.getByRole('button', { name: /Enter Bloomworks/ }));
    expect(
      screen.getByRole('heading', { name: 'A root remembered overnight' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('bloom-return-afterimage')).toHaveAttribute(
      'data-return-pattern',
      'bridge',
    );
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

  it('rejects a damaged Night Code and opens a valid seeded night without an account', async () => {
    const user = userEvent.setup();
    const returnState = createGuestState(0x12ab34cd);
    render(<App initialState={createGuestState(5)} />);

    await user.click(screen.getByRole('button', { name: 'Touch the last light of today' }));
    await user.click(screen.getByRole('button', { name: 'Visit settings' }));
    const input = screen.getByRole('textbox', { name: 'Return by Night Code' });

    await user.type(input, 'ML-00000000-00');
    await user.click(screen.getByRole('button', { name: 'Open night' }));
    expect(screen.getByText(/does not match a Morrowlight night/)).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, encodeNightCode(returnState).toLowerCase());
    await user.click(screen.getByRole('button', { name: 'Open night' }));

    expect(
      screen.getByRole('button', { name: 'Touch the last light of today' }),
    ).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(GUEST_STATE_STORAGE_KEY) ?? '{}').seed).toBe(
      returnState.seed,
    );
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

  it('offers Hushgarden as rest without a completion meter', async () => {
    const user = userEvent.setup();
    render(<App initialState={createGuestState(211)} />);

    await user.click(screen.getByRole('button', { name: 'Touch the last light of today' }));
    await user.click(screen.getByRole('button', { name: 'Rest in Hushgarden' }));

    expect(
      screen.getByRole('heading', { name: 'Nothing needs completing here.' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/of 3 lights gathered/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Listen to the patient fern' }));
    expect(screen.getByText('1 quiet detail noticed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Return to the Morrowspire' })).toBeInTheDocument();
  });
});
