import { useState } from 'react';

import { getAttraction, type AttractionChoice } from '../content/attractions';

type DrawerId = 'weather-loom' | 'staircase-seed' | 'enough-clock';

type Drawer = {
  id: DrawerId;
  inspectLabel: string;
  clue: string;
  choice: AttractionChoice;
};

const CABINET = getAttraction('cabinet');

function getChoice(id: DrawerId): AttractionChoice {
  const choice = CABINET.choices.find((candidate) => candidate.id === id);
  if (!choice) throw new Error(`Missing authored Cabinet choice: ${id}`);
  return choice;
}

const DRAWERS: readonly Drawer[] = [
  {
    id: 'weather-loom',
    inspectLabel: 'Inspect weather loom drawer',
    clue: 'Loose threads hum against the brass and smell faintly of rain.',
    choice: getChoice('weather-loom'),
  },
  {
    id: 'staircase-seed',
    inspectLabel: 'Inspect staircase seed drawer',
    clue: 'A single folded riser waits where a brave step might be useful.',
    choice: getChoice('staircase-seed'),
  },
  {
    id: 'enough-clock',
    inspectLabel: 'Inspect enough clock drawer',
    clue: 'Its face has no numbers; it warms only when a moment has already held.',
    choice: getChoice('enough-clock'),
  },
];

function getDrawer(id: DrawerId): Drawer {
  const drawer = DRAWERS.find((candidate) => candidate.id === id);
  if (!drawer) throw new Error(`Unknown Cabinet drawer: ${id}`);
  return drawer;
}

export function CabinetExperience({
  onComplete,
}: {
  onComplete: (choice: AttractionChoice) => void;
}) {
  const [inspectedIds, setInspectedIds] = useState<DrawerId[]>([]);
  const [candidateId, setCandidateId] = useState<DrawerId | null>(null);
  const candidate = candidateId ? getDrawer(candidateId).choice : null;
  const canAdopt = inspectedIds.length >= 2 && candidate !== null;

  function inspectDrawer(id: DrawerId) {
    setInspectedIds((currentIds) => (currentIds.includes(id) ? currentIds : [...currentIds, id]));
    setCandidateId(id);
  }

  function resetCabinet() {
    setInspectedIds([]);
    setCandidateId(null);
  }

  return (
    <section className="cabinet-play__experience" aria-labelledby="cabinet-play-heading">
      <header className="cabinet-play__introduction">
        <p className="cabinet-play__eyebrow">Cabinet of Near Things · notice and carry</p>
        <h2 id="cabinet-play-heading">Open the almost-inventions</h2>
        <p>
          Open two different drawers before choosing what should follow you. Every clue stays in the
          cabinet&apos;s memory, so there is no need to rush or remember it alone.
        </p>
      </header>

      <div className="cabinet-play__status" aria-live="polite" role="status">
        <p className="cabinet-play__progress">{inspectedIds.length} of 2 drawers inspected</p>
        <p className="cabinet-play__candidate">
          Candidate: {candidate ? candidate.label : 'none yet'}
        </p>
      </div>

      <div className="cabinet-play__drawers" role="group" aria-label="Near-thing drawers">
        {DRAWERS.map((drawer) => {
          const isInspected = inspectedIds.includes(drawer.id);
          const isCandidate = candidateId === drawer.id;

          return (
            <button
              className={`cabinet-play__drawer${isInspected ? ' cabinet-play__drawer--inspected' : ''}`}
              type="button"
              key={drawer.id}
              aria-label={drawer.inspectLabel}
              aria-pressed={isCandidate}
              onClick={() => inspectDrawer(drawer.id)}
            >
              <span className="cabinet-play__drawer-label">{drawer.inspectLabel}</span>
              <span className="cabinet-play__drawer-note">{drawer.choice.note}</span>
            </button>
          );
        })}
      </div>

      <aside className="cabinet-play__memory" aria-labelledby="cabinet-play-memory-heading">
        <h3 id="cabinet-play-memory-heading">Remembered clues</h3>
        <ul className="cabinet-play__clue-list" aria-label="Remembered clues">
          {inspectedIds.length === 0 ? (
            <li className="cabinet-play__clue-placeholder">No near-thing clues remembered yet.</li>
          ) : (
            inspectedIds.map((id) => {
              const drawer = getDrawer(id);

              return (
                <li className="cabinet-play__clue" key={id}>
                  <strong>{drawer.choice.label}</strong>
                  <span>{drawer.clue}</span>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <div className="cabinet-play__actions">
        <button
          className="cabinet-play__reset"
          type="button"
          disabled={inspectedIds.length === 0}
          onClick={resetCabinet}
        >
          Reset cabinet
        </button>
        <button
          className="cabinet-play__complete"
          type="button"
          disabled={!canAdopt}
          onClick={() => candidate && onComplete(candidate)}
        >
          {CABINET.completionLabel}
        </button>
      </div>
    </section>
  );
}
