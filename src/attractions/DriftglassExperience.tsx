import { useState } from 'react';

import { getAttraction, type AttractionChoice } from '../content/attractions';

const CURRENT_STEP_COUNT = 3;

const DRIFTGLASS_CHOICES = getAttraction('driftglass').choices;

const CURRENT_DECISIONS = [
  {
    id: 'port',
    label: 'Port',
    description: 'Shelter the light in the softer water.',
  },
  {
    id: 'hold',
    label: 'Hold',
    description: 'Let the light listen before the next turn.',
  },
  {
    id: 'starboard',
    label: 'Starboard',
    description: 'Invite the light toward the open glow.',
  },
] as const;

type CurrentDecision = (typeof CURRENT_DECISIONS)[number]['id'];
type DriftglassRoute = Extract<AttractionChoice['trace'], { attractionId: 'driftglass' }>['route'];

const CURRENT_SHIFT: Record<CurrentDecision, number> = {
  port: -1,
  hold: 0,
  starboard: 1,
};

function routeFor(decisions: readonly CurrentDecision[]): DriftglassRoute {
  const current = decisions.reduce((total, decision) => total + CURRENT_SHIFT[decision], 0);

  if (current < 0) return 'cove';
  if (current > 0) return 'horizon';
  return 'current';
}

function choiceForRoute(route: DriftglassRoute): AttractionChoice {
  const choice = DRIFTGLASS_CHOICES.find((candidate) => {
    const trace = candidate.trace;
    return trace.attractionId === 'driftglass' && trace.route === route;
  });

  if (!choice) throw new Error(`Missing authored Driftglass choice: ${route}`);
  return choice;
}

function companionLabel(choice: AttractionChoice | null): string {
  if (!choice || choice.trace.attractionId !== 'driftglass') {
    return 'Waiting for the first current.';
  }

  return choice.trace.companions
    .map((companion) => `${companion.charAt(0).toUpperCase()}${companion.slice(1)}`)
    .join(' · ');
}

function stepLabel(step: number): string {
  return `Step ${Math.min(step + 1, CURRENT_STEP_COUNT)} of ${CURRENT_STEP_COUNT}`;
}

export function DriftglassExperience({
  onComplete,
}: {
  onComplete: (choice: AttractionChoice) => void;
}) {
  const [decisions, setDecisions] = useState<CurrentDecision[]>([]);
  const isComplete = decisions.length === CURRENT_STEP_COUNT;
  const routeChoice = decisions.length > 0 ? choiceForRoute(routeFor(decisions)) : null;

  function chooseCurrent(decision: CurrentDecision): void {
    if (isComplete) return;

    const nextDecisions = [...decisions, decision];
    setDecisions(nextDecisions);

    if (nextDecisions.length === CURRENT_STEP_COUNT) {
      onComplete(choiceForRoute(routeFor(nextDecisions)));
    }
  }

  function resetCrossing(): void {
    setDecisions([]);
  }

  return (
    <section className="drift-play__experience" aria-labelledby="drift-play-title">
      <header className="drift-play__heading">
        <p className="drift-play__eyebrow">Driftglass Sea · a listening crossing</p>
        <h2 id="drift-play-title">Guide the lost light</h2>
        <p>
          The translucent current answers three clear decisions. Choose a direction, watch the
          pulse, and see who gathers beside the light.
        </p>
      </header>

      <div className="drift-play__instrument" aria-hidden="true">
        <span className="drift-play__waterline" />
        <span className="drift-play__light" />
        <span className="drift-play__wake" />
      </div>

      <div className="drift-play__readout" aria-live="polite" aria-atomic="true">
        <strong>{stepLabel(decisions.length)}</strong>
        <progress
          className="drift-play__pulse"
          aria-label="Current pulse"
          aria-valuenow={decisions.length}
          max={CURRENT_STEP_COUNT}
          value={decisions.length}
        >
          {decisions.length} of {CURRENT_STEP_COUNT}
        </progress>
        <p className="drift-play__companions" aria-label="Companions gathering">
          <span>Companions: </span>
          {companionLabel(routeChoice)}
        </p>
        <p className="drift-play__history">
          <span>Current marks: </span>
          {decisions.length > 0 ? decisions.join(' → ') : 'No turn chosen yet.'}
        </p>
      </div>

      {isComplete && routeChoice ? (
        <div className="drift-play__resolution" role="status">
          <p>The light has found a route.</p>
          <strong>{routeChoice.label}</strong>
          <span>{routeChoice.note}</span>
        </div>
      ) : (
        <fieldset className="drift-play__decisions">
          <legend>Choose the next current</legend>
          <div className="drift-play__decision-list">
            {CURRENT_DECISIONS.map((decision) => (
              <button
                className="drift-play__decision"
                key={decision.id}
                type="button"
                aria-label={decision.label}
                aria-describedby={`drift-play-${decision.id}-description`}
                onClick={() => chooseCurrent(decision.id)}
              >
                <strong>{decision.label}</strong>
                <span id={`drift-play-${decision.id}-description`}>{decision.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <button
        className="drift-play__reset"
        type="button"
        disabled={decisions.length === 0}
        onClick={resetCrossing}
      >
        Reset this crossing
      </button>
    </section>
  );
}
