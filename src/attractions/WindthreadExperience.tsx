import { useState } from 'react';

import { getAttraction, type AttractionChoice } from '../content/attractions';

type Flight = 'drift' | 'weave' | 'soar';
type MarkId = 'low-straight' | 'middle-straight' | 'left-turn' | 'right-turn' | 'high-climb';

type FlightMark = {
  id: MarkId;
  label: string;
  detail: string;
  altitude: 'low' | 'middle' | 'high';
  turn: 'left' | 'right' | 'straight';
};

type Route = {
  name: string;
  description: string;
  path: string;
  endY: number;
};

const WINDTHREAD = getAttraction('windthread');

const FLIGHT_MARKS: readonly FlightMark[] = [
  {
    id: 'low-straight',
    label: 'Low straight mark',
    detail: 'Low altitude · a level thread',
    altitude: 'low',
    turn: 'straight',
  },
  {
    id: 'middle-straight',
    label: 'Middle straight mark',
    detail: 'Middle altitude · a steady thread',
    altitude: 'middle',
    turn: 'straight',
  },
  {
    id: 'left-turn',
    label: 'Left turn mark',
    detail: 'Middle altitude · bend toward the cloudline',
    altitude: 'middle',
    turn: 'left',
  },
  {
    id: 'right-turn',
    label: 'Right turn mark',
    detail: 'Middle altitude · answer the other cloudline',
    altitude: 'middle',
    turn: 'right',
  },
  {
    id: 'high-climb',
    label: 'High climb mark',
    detail: 'High altitude · lift the filament kite',
    altitude: 'high',
    turn: 'straight',
  },
];

const ROUTES: Readonly<Record<Flight, Route>> = {
  drift: {
    name: 'Drift route',
    description: 'The thread settles into calm arcs and unhurried height.',
    path: 'M12 62C50 56 78 69 116 62S182 55 228 61',
    endY: 61,
  },
  weave: {
    name: 'Weave route',
    description: 'The thread crosses itself into alternating turns between cloudlines.',
    path: 'M12 65C48 25 78 103 116 64S181 24 228 66',
    endY: 66,
  },
  soar: {
    name: 'Soar route',
    description: 'The thread climbs into high air and leaves a long comet tail.',
    path: 'M12 76C62 76 84 63 118 36S185 12 228 17',
    endY: 17,
  },
};

function getMark(id: MarkId): FlightMark {
  const mark = FLIGHT_MARKS.find((candidate) => candidate.id === id);
  if (!mark) throw new Error(`Unknown Windthread mark: ${id}`);
  return mark;
}

function getChoice(flight: Flight): AttractionChoice {
  const choice = WINDTHREAD.choices.find((candidate) => candidate.id === flight);
  if (!choice) throw new Error(`Missing authored Windthread choice: ${flight}`);
  return choice;
}

function deriveFlight(markIds: readonly MarkId[]): Flight | null {
  if (markIds.length < 3) return null;

  const marks = markIds.map(getMark);
  const highClimbs = marks.filter((mark) => mark.altitude === 'high').length;
  const turns = new Set(marks.map((mark) => mark.turn));

  if (highClimbs >= 2) return 'soar';
  if (turns.has('left') && turns.has('right')) return 'weave';
  return 'drift';
}

export function WindthreadExperience({
  onComplete,
}: {
  onComplete: (choice: AttractionChoice) => void;
}) {
  const [markIds, setMarkIds] = useState<MarkId[]>([]);
  const flight = deriveFlight(markIds);
  const choice = flight ? getChoice(flight) : null;
  const route = flight ? ROUTES[flight] : null;
  const isComplete = markIds.length >= 3;

  function addMark(id: MarkId) {
    setMarkIds((currentIds) => (currentIds.length >= 3 ? currentIds : [...currentIds, id]));
  }

  function resetFlight() {
    setMarkIds([]);
  }

  return (
    <section className="wind-play__experience" aria-labelledby="wind-play-heading">
      <header className="wind-play__introduction">
        <p className="wind-play__eyebrow">Windthread · compose and transform</p>
        <h2 id="wind-play-heading">Write across the air</h2>
        <p>
          Place three altitude and turn marks at your own pace. This is a flight instrument, not a
          reflex test: every mark lands immediately and the route remains visible.
        </p>
      </header>

      <div
        className="wind-play__progress"
        role="progressbar"
        aria-label="Flight mark progress"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={markIds.length}
      >
        {markIds.length} of 3 flight marks composed
      </div>

      <ol className="wind-play__mark-list" aria-label="Composed flight marks">
        {markIds.length === 0 ? (
          <li className="wind-play__mark-placeholder">No marks yet; the kite is waiting.</li>
        ) : (
          markIds.map((id, index) => {
            const mark = getMark(id);

            return (
              <li className="wind-play__mark" key={`${id}-${index}`}>
                <span className="wind-play__mark-index">0{index + 1}</span>
                <span className="wind-play__mark-label">{mark.label}</span>
                <span className="wind-play__mark-detail">{mark.detail}</span>
              </li>
            );
          })
        )}
      </ol>

      <fieldset className="wind-play__mark-controls" disabled={isComplete}>
        <legend>Choose the next altitude or turn mark</legend>
        <div className="wind-play__mark-buttons" role="group" aria-label="Flight mark controls">
          {FLIGHT_MARKS.map((mark) => (
            <button
              className="wind-play__mark-button"
              type="button"
              key={mark.id}
              aria-label={mark.label}
              aria-describedby={`wind-play-mark-${mark.id}-detail`}
              disabled={isComplete}
              onClick={() => addMark(mark.id)}
            >
              <span className="wind-play__mark-button-label">{mark.label}</span>
              <span
                className="wind-play__mark-button-detail"
                id={`wind-play-mark-${mark.id}-detail`}
              >
                {mark.detail}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="wind-play__route" aria-live="polite">
        {route ? (
          <>
            <svg
              className="wind-play__route-illustration"
              viewBox="0 0 240 90"
              role="img"
              aria-label={route.name}
            >
              <path
                className="wind-play__route-line"
                d={route.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                className="wind-play__route-start"
                cx="12"
                cy="62"
                r="4"
                fill="currentColor"
              />
              <circle
                className="wind-play__route-end"
                cx="228"
                cy={route.endY}
                r="4"
                fill="currentColor"
              />
            </svg>
            <p className="wind-play__route-title">Route transformed: {route.name}</p>
            <p className="wind-play__route-description">{route.description}</p>
          </>
        ) : (
          <p className="wind-play__route-prompt">Route transform: waiting for three marks.</p>
        )}
      </div>

      <div className="wind-play__actions">
        <button
          className="wind-play__reset"
          type="button"
          disabled={markIds.length === 0}
          onClick={resetFlight}
        >
          Reset flight marks
        </button>
        <button
          className="wind-play__complete"
          type="button"
          disabled={!choice}
          onClick={() => choice && onComplete(choice)}
        >
          {WINDTHREAD.completionLabel}
        </button>
      </div>
    </section>
  );
}
