import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SceneErrorBoundary } from './SceneErrorBoundary';

function FoldedScene(): never {
  throw new Error('A scene-specific render failure');
}

describe('SceneErrorBoundary', () => {
  it('contains a failed scene while preserving the outer park shell and an escape control', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();

    render(
      <main aria-label="Morrowlight park shell">
        <h1>MORROWLIGHT</h1>
        <SceneErrorBoundary sceneKey="bloomworks" onEscape={onEscape}>
          <FoldedScene />
        </SceneErrorBoundary>
      </main>,
    );

    expect(screen.getByRole('main', { name: 'Morrowlight park shell' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'MORROWLIGHT' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('This path folded unexpectedly');

    const returnButton = screen.getByRole('button', { name: 'Return to the Morrowspire' });
    returnButton.focus();
    await user.keyboard('{Enter}');

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('resets a scene fault after the scene key changes', () => {
    const onEscape = vi.fn();
    const { rerender } = render(
      <SceneErrorBoundary sceneKey="bloomworks" onEscape={onEscape}>
        <FoldedScene />
      </SceneErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <SceneErrorBoundary sceneKey="map" onEscape={onEscape}>
        <p>Where will your light go?</p>
      </SceneErrorBoundary>,
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Where will your light go?')).toBeInTheDocument();
  });
});
