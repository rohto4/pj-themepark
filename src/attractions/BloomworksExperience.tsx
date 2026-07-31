import { useState } from 'react';

import { getAttraction, type AttractionChoice } from '../content/attractions';

type SeedGearId = 'gather' | 'connect' | 'wander';
type BloomPattern = 'cluster' | 'bridge' | 'wild';

type SeedGear = {
  id: SeedGearId;
  buttonLabel: string;
  label: string;
  rootResponse: string;
  detail: string;
};

const BLOOMWORKS = getAttraction('bloomworks');

const SEED_GEARS: readonly SeedGear[] = [
  {
    id: 'gather',
    buttonLabel: 'Gather seed gear',
    label: 'Gather',
    rootResponse: 'A sheltered root curls inward.',
    detail: 'Close soil makes a pocket for shared light.',
  },
  {
    id: 'connect',
    buttonLabel: 'Connect seed gear',
    label: 'Connect',
    rootResponse: 'A bright root reaches toward another socket.',
    detail: 'A crossing opens where two roots agree to meet.',
  },
  {
    id: 'wander',
    buttonLabel: 'Wander seed gear',
    label: 'Wander',
    rootResponse: 'A curious root branches beyond the glass.',
    detail: 'Loose pollen finds room to travel.',
  },
];

const PATTERN_BY_MIDDLE_GEAR: Readonly<Record<SeedGearId, BloomPattern>> = {
  gather: 'cluster',
  connect: 'bridge',
  wander: 'wild',
};

function getSeedGear(id: SeedGearId): SeedGear {
  const gear = SEED_GEARS.find((candidate) => candidate.id === id);
  if (!gear) throw new Error(`Unknown Bloomworks seed gear: ${id}`);
  return gear;
}

function getChoice(pattern: BloomPattern): AttractionChoice {
  const choice = BLOOMWORKS.choices.find((candidate) => candidate.id === pattern);
  if (!choice) throw new Error(`Missing authored Bloomworks choice: ${pattern}`);
  return choice;
}

function getPattern(order: readonly SeedGearId[]): BloomPattern | null {
  if (order.length !== SEED_GEARS.length) return null;

  const middleGear = order[1];
  return middleGear ? PATTERN_BY_MIDDLE_GEAR[middleGear] : null;
}

function formatOrder(order: readonly SeedGearId[]) {
  return order.map((gear) => getSeedGear(gear).label).join(' → ');
}

export function BloomworksExperience({
  onComplete,
}: {
  onComplete: (choice: AttractionChoice) => void;
}) {
  const [order, setOrder] = useState<SeedGearId[]>([]);
  const pattern = getPattern(order);
  const choice = pattern ? getChoice(pattern) : null;
  const latestGear = order.length > 0 ? getSeedGear(order[order.length - 1] as SeedGearId) : null;

  function activateGear(id: SeedGearId) {
    setOrder((currentOrder) => (currentOrder.includes(id) ? currentOrder : [...currentOrder, id]));
  }

  return (
    <section className="bloom-play__experience" aria-labelledby="bloom-play-heading">
      <header className="bloom-play__introduction">
        <p className="bloom-play__eyebrow">Bloomworks · arrange and pulse</p>
        <h2 id="bloom-play-heading">Wake the root garden</h2>
        <p>
          Place all three distinct seed-gears. The second gear becomes the garden&apos;s dominant
          relationship: gather shapes a cluster, connect grows bridges, and wander invites wild
          blooms.
        </p>
        <p className="bloom-play__motion-note">
          Each root settles immediately; no timing is required.
        </p>
      </header>

      <div
        className="bloom-play__garden"
        aria-label="Garden root response"
        aria-live="polite"
        role="status"
      >
        <p className="bloom-play__progress">{order.length} of 3 seed-gears placed</p>
        <p className="bloom-play__root-response">
          {latestGear
            ? latestGear.rootResponse
            : 'The roots are listening for their first relationship.'}
        </p>
        <ol className="bloom-play__root-list" aria-label="Root growth">
          {order.length === 0 ? (
            <li className="bloom-play__root-placeholder">
              Three empty sockets wait beneath the glass.
            </li>
          ) : (
            order.map((gear, index) => (
              <li className="bloom-play__root" key={gear}>
                <span className="bloom-play__root-index">0{index + 1}</span>
                <span className="bloom-play__root-label">{getSeedGear(gear).label}</span>
                <span className="bloom-play__root-detail">{getSeedGear(gear).detail}</span>
              </li>
            ))
          )}
        </ol>
      </div>

      <div className="bloom-play__gear-group" role="group" aria-label="Seed gears">
        {SEED_GEARS.map((gear) => {
          const isPlaced = order.includes(gear.id);

          return (
            <button
              className={`bloom-play__gear${isPlaced ? ' bloom-play__gear--placed' : ''}`}
              type="button"
              key={gear.id}
              aria-label={gear.buttonLabel}
              aria-pressed={isPlaced}
              disabled={isPlaced}
              onClick={() => activateGear(gear.id)}
            >
              <span className="bloom-play__gear-label">{gear.buttonLabel}</span>
              <span className="bloom-play__gear-detail" aria-hidden="true">
                {gear.detail}
              </span>
            </button>
          );
        })}
      </div>

      {choice ? (
        <div className="bloom-play__pattern" aria-live="polite">
          <p className="bloom-play__pattern-title">Pattern formed: {choice.label}</p>
          <p className="bloom-play__pattern-note">{choice.note}</p>
          <p className="bloom-play__pattern-order">Root order: {formatOrder(order)}</p>
        </div>
      ) : (
        <p className="bloom-play__pattern-prompt">
          Place every gear to reveal the garden&apos;s pattern.
        </p>
      )}

      <div className="bloom-play__actions">
        <button
          className="bloom-play__reset"
          type="button"
          disabled={order.length === 0}
          onClick={() => setOrder([])}
        >
          Reset seed-gears
        </button>
        <button
          className="bloom-play__complete"
          type="button"
          disabled={!choice}
          onClick={() => choice && onComplete(choice)}
        >
          {BLOOMWORKS.completionLabel}
        </button>
      </div>
    </section>
  );
}
