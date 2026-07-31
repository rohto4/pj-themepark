import { useState } from 'react';

import type { ScorePlan } from '../audio/score-plan';

const PULSE_LIMIT = 4;

export function ConstellaryConductor({
  plan,
  onComplete,
}: {
  plan: ScorePlan;
  onComplete: () => void;
}) {
  const pulses = plan.visiblePulseSequence.slice(0, PULSE_LIMIT);
  const [conductedCount, setConductedCount] = useState(0);
  const [message, setMessage] = useState('Choose the first amber pulse when you are ready.');
  const pulseCount = pulses.length;
  const isResolved = pulseCount > 0 && conductedCount === pulseCount;
  const currentPulse = isResolved ? null : (pulses[conductedCount] ?? null);

  function conductPulse(index: number) {
    const pulse = pulses[index];
    if (!pulse) return;

    if (isResolved) {
      setMessage('All four pulses are ready to resolve.');
      return;
    }

    if (index < conductedCount) {
      setMessage(
        currentPulse
          ? `${pulse.caption} is already in the constellation. Next: ${currentPulse.caption}.`
          : `${pulse.caption} is already in the constellation.`,
      );
      return;
    }

    if (index > conductedCount) {
      setMessage(
        `Pulse ${index + 1} is waiting. Begin with ${currentPulse?.caption ?? pulse.caption}.`,
      );
      return;
    }

    const nextCount = conductedCount + 1;
    const nextPulse = pulses[nextCount];
    setConductedCount(nextCount);
    setMessage(
      nextCount === pulseCount
        ? 'All four pulses are ready to resolve.'
        : `${pulse.caption} joins the constellation. Next: ${nextPulse?.caption ?? 'the final pulse'}.`,
    );
  }

  function resetPulses() {
    setConductedCount(0);
    setMessage('The constellation is ready to begin again.');
  }

  return (
    <section className="constellary-play__experience" aria-labelledby="constellary-play-heading">
      <header className="constellary-play__introduction">
        <p className="constellary-play__eyebrow">The Constellary · visible score</p>
        <h2 id="constellary-play-heading">Conduct the four amber pulses</h2>
        <p>
          Follow the captions in order. Every pulse waits patiently: there is no beat to catch and
          no timing window to miss.
        </p>
      </header>

      <div
        className="constellary-play__status"
        aria-label="Constellary conductor status"
        aria-live="polite"
        role="status"
      >
        <p className="constellary-play__progress">
          {conductedCount} of {pulseCount} pulses conducted
        </p>
        <p className="constellary-play__current">
          {currentPulse
            ? `Current pulse: ${currentPulse.caption}`
            : 'All four pulses are ready to resolve.'}
        </p>
        <p className="constellary-play__message">{message}</p>
      </div>

      <ol className="constellary-play__pulse-list" aria-label="Constellary pulse sequence">
        {pulses.map((pulse, index) => {
          const isConducted = index < conductedCount;
          const isCurrent = index === conductedCount && !isResolved;

          return (
            <li className="constellary-play__pulse-item" key={pulse.index}>
              <button
                className={`constellary-play__pulse${
                  isConducted ? ' constellary-play__pulse--conducted' : ''
                }${isCurrent ? ' constellary-play__pulse--current' : ''}`}
                type="button"
                aria-label={`Conduct pulse ${index + 1}: ${pulse.caption} (${pulse.note})`}
                aria-pressed={isConducted}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => conductPulse(index)}
              >
                <span className="constellary-play__pulse-number">0{index + 1}</span>
                <span className="constellary-play__pulse-caption">{pulse.caption}</span>
                <span className="constellary-play__pulse-note">{pulse.note}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="constellary-play__equivalence">
        <p>{plan.equivalence.audio.visibleLabel}</p>
        <p>{plan.equivalence.motion.visibleLabel}</p>
      </div>

      <div className="constellary-play__actions">
        <button
          className="constellary-play__reset"
          type="button"
          disabled={conductedCount === 0}
          onClick={resetPulses}
        >
          Reset pulses
        </button>
        {isResolved ? (
          <button className="constellary-play__resolve" type="button" onClick={onComplete}>
            Resolve my constellation
          </button>
        ) : null}
        <button className="constellary-play__remember" type="button" onClick={onComplete}>
          Let the park remember for me
        </button>
      </div>
    </section>
  );
}
