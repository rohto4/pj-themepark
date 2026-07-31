import { useEffect, useState } from 'react';

import type { FinaleBeat, FinaleTimelinePlan } from '../experience/finale-timeline';

const WATCH_BEAT_MS = 900;

function geometryVariant(geometryId: string): number {
  let value = 0;
  for (let index = 0; index < geometryId.length; index += 1) {
    value = (value * 31 + geometryId.charCodeAt(index)) >>> 0;
  }
  return value % 3;
}

function BeatGeometry({ beat, timeline }: { beat: FinaleBeat; timeline: FinaleTimelinePlan }) {
  const recognition = timeline.recognition;
  const variant = geometryVariant(beat.geometryId);
  const shift = variant * 12;

  if (beat.id === 'recognition' && recognition) {
    return (
      <svg viewBox={recognition.viewBox} aria-hidden="true" focusable="false">
        <g className="constellary-stage__recognition">
          {recognition.paths.map((path) => (
            <path key={path.id} d={path.d} data-path-role={path.role} />
          ))}
          {recognition.nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.cx}
              cy={node.cy}
              r={node.radius}
              data-node-role={node.role}
            />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 300 180" aria-hidden="true" focusable="false">
      <g className={`constellary-stage__geometry constellary-stage__geometry--${beat.id}`}>
        <circle className="constellary-stage__ember" cx="150" cy="90" r={8 + variant * 2} />
        {beat.id === 'awakening' ? (
          <>
            <circle className="constellary-stage__orbit" cx="150" cy="90" r={31 + shift} />
            <path d={`M150 90C${124 - shift} 65 ${108 - shift} 43 80 29`} />
            <path d={`M150 90C${176 + shift} 65 ${192 + shift} 43 220 29`} />
          </>
        ) : null}
        {beat.id === 'gathering' ? (
          <>
            <path d={`M18 148C72 ${118 - shift} 105 121 150 90`} />
            <path d={`M282 148C228 ${118 + shift} 195 121 150 90`} />
            <path d={`M150 18C${132 - shift} 54 ${164 + shift} 66 150 90`} />
            <circle cx="18" cy="148" r="5" />
            <circle cx="282" cy="148" r="5" />
            <circle cx="150" cy="18" r="5" />
          </>
        ) : null}
        {beat.id === 'recognition' ? (
          <>
            <path d={`M42 126C86 ${32 + shift} 116 39 150 105`} />
            <path d={`M258 126C214 ${32 + shift} 184 39 150 105`} />
          </>
        ) : null}
        {beat.id === 'climax' ? (
          <>
            <path d={`M12 ${146 - shift}C70 22 120 22 150 90C180 22 230 22 288 ${146 - shift}`} />
            <path d={`M24 ${48 + shift}C90 72 182 38 276 116`} />
            <path className="constellary-stage__comet" d={`M${48 + shift} 160L250 ${22 + shift}`} />
          </>
        ) : null}
        {beat.id === 'release' ? (
          <>
            <path d={`M42 86C78 ${142 - shift} 222 ${142 - shift} 258 86`} />
            <path d={`M70 102C105 ${128 + shift} 195 ${128 + shift} 230 102`} />
            <circle className="constellary-stage__tomorrow" cx={150 + shift} cy="145" r="4" />
          </>
        ) : null}
      </g>
    </svg>
  );
}

function BeatStage({
  beat,
  timeline,
  compact = false,
}: {
  beat: FinaleBeat;
  timeline: FinaleTimelinePlan;
  compact?: boolean;
}) {
  return (
    <figure
      className={`constellary-stage${compact ? ' constellary-stage--compact' : ''}`}
      role="img"
      aria-label={`Act ${beat.act} of ${timeline.beats.length}: ${beat.title}. ${beat.caption}`}
      data-testid={compact ? undefined : 'constellary-performance-stage'}
      data-beat={beat.id}
      data-pace={beat.pace}
      data-geometry={beat.geometryId}
      data-result-fingerprint={timeline.resultFingerprint}
    >
      <BeatGeometry beat={beat} timeline={timeline} />
      <figcaption>
        <span>Act {beat.act}</span>
        <strong>{beat.title}</strong>
        <small>{beat.caption}</small>
      </figcaption>
    </figure>
  );
}

export function ConstellaryConductor({
  timeline,
  onComplete,
}: {
  timeline: FinaleTimelinePlan;
  onComplete: (resultFingerprint: string) => void;
}) {
  const beats = timeline.beats;
  const beatCount = beats.length;
  const [mode, setMode] = useState<'conduct' | 'watch'>('conduct');
  const [conductedCount, setConductedCount] = useState(0);
  const [message, setMessage] = useState('Choose the first act when you are ready.');
  const isResolved = beatCount > 0 && conductedCount === beatCount;
  const stageIndex = isResolved
    ? Math.max(0, beatCount - 1)
    : Math.min(conductedCount, beatCount - 1);
  const currentBeat = beats[stageIndex] ?? null;
  const showStoryboard = mode === 'watch' && timeline.presentation.motion === 'step';

  useEffect(() => {
    if (mode !== 'watch' || timeline.presentation.motion !== 'animated') return;

    const interval = window.setInterval(() => {
      setConductedCount((count) => {
        const nextCount = Math.min(beatCount, count + 1);
        const performedBeat = beats[Math.max(0, nextCount - 1)];
        setMessage(
          nextCount === beatCount
            ? 'The park has performed all five acts. The night is ready to carry.'
            : `${performedBeat?.title ?? 'The next act'} enters the sky.`,
        );
        if (nextCount === beatCount) window.clearInterval(interval);
        return nextCount;
      });
    }, WATCH_BEAT_MS);

    return () => window.clearInterval(interval);
  }, [beatCount, beats, mode, timeline.presentation.motion]);

  function conductBeat(index: number) {
    const beat = beats[index];
    if (!beat) return;
    setMode('conduct');

    if (isResolved) {
      setMessage('All five acts are ready to resolve.');
      return;
    }
    if (index < conductedCount) {
      setMessage(`${beat.title} is already in the sky. Next: ${currentBeat?.title ?? 'release'}.`);
      return;
    }
    if (index > conductedCount) {
      setMessage(`Act ${index + 1} is waiting. Begin with ${currentBeat?.title ?? beat.title}.`);
      return;
    }

    const nextCount = conductedCount + 1;
    const nextBeat = beats[nextCount];
    setConductedCount(nextCount);
    setMessage(
      nextCount === beatCount
        ? 'All five acts are ready to resolve.'
        : `${beat.title} enters the sky. Next: ${nextBeat?.title ?? 'release'}.`,
    );
  }

  function resetPerformance() {
    setMode('conduct');
    setConductedCount(0);
    setMessage('The five-act sky is ready to begin again.');
  }

  function watchPerformance() {
    setMode('watch');
    if (timeline.presentation.motion === 'step') {
      setConductedCount(beatCount);
      setMessage('All five still acts are open together. The night is ready to carry.');
    } else {
      setConductedCount(0);
      setMessage('The park begins the five-act performance for you.');
    }
  }

  function complete() {
    onComplete(timeline.resultFingerprint);
  }

  return (
    <section className="constellary-play__experience" aria-labelledby="constellary-play-heading">
      <header className="constellary-play__introduction">
        <p className="constellary-play__eyebrow">The Constellary · five-act sky</p>
        <h2 id="constellary-play-heading">Conduct a night in five acts</h2>
        <p>
          Bring each act into the sky, or watch the park perform the same remembered night. Nothing
          here can be missed by timing.
        </p>
      </header>

      <div className="constellary-play__modes" role="group" aria-label="Performance route">
        <button type="button" aria-pressed={mode === 'conduct'} onClick={() => setMode('conduct')}>
          Conduct the sky
        </button>
        <button type="button" aria-pressed={mode === 'watch'} onClick={watchPerformance}>
          Watch the park perform
        </button>
      </div>

      {showStoryboard ? (
        <div className="constellary-storyboard" aria-label="Five-act still performance">
          {beats.map((beat) => (
            <BeatStage key={beat.id} beat={beat} timeline={timeline} compact />
          ))}
        </div>
      ) : currentBeat ? (
        <BeatStage beat={currentBeat} timeline={timeline} />
      ) : null}

      <div
        className="constellary-play__status"
        aria-label="Constellary conductor status"
        aria-live="polite"
        role="status"
      >
        <p className="constellary-play__progress">
          {conductedCount} of {beatCount} acts {mode === 'watch' ? 'performed' : 'conducted'}
        </p>
        <p className="constellary-play__current">
          {isResolved
            ? 'The five-act sky is complete.'
            : `Current act: ${currentBeat?.title ?? 'The quiet before the sky'}`}
        </p>
        <p className="constellary-play__message">{message}</p>
      </div>

      <ol className="constellary-play__pulse-list" aria-label="Constellary performance sequence">
        {beats.map((beat, index) => {
          const isConducted = index < conductedCount;
          const isCurrent = index === conductedCount && !isResolved;
          return (
            <li className="constellary-play__pulse-item" key={beat.id}>
              <button
                className={`constellary-play__pulse${
                  isConducted ? ' constellary-play__pulse--conducted' : ''
                }${isCurrent ? ' constellary-play__pulse--current' : ''}`}
                type="button"
                aria-label={`Conduct act ${beat.act}: ${beat.title} (${beat.note})`}
                aria-pressed={isConducted}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => conductBeat(index)}
              >
                <span className="constellary-play__pulse-number">0{beat.act}</span>
                <span className="constellary-play__pulse-caption">{beat.title}</span>
                <span className="constellary-play__pulse-note">{beat.note}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="constellary-play__equivalence">
        <p>
          {timeline.presentation.audio === 'audible'
            ? 'Sound is on; every act also has visible notation.'
            : 'Sound is muted; the complete score remains visible.'}
        </p>
        <p>
          {timeline.presentation.motion === 'step'
            ? 'The five acts open as an equivalent still sequence.'
            : 'The stage moves only while an act is entering.'}
        </p>
      </div>

      <div className="constellary-play__actions">
        <button
          className="constellary-play__reset"
          type="button"
          disabled={conductedCount === 0}
          onClick={resetPerformance}
        >
          Reset performance
        </button>
        {isResolved ? (
          <button className="constellary-play__resolve" type="button" onClick={complete}>
            Carry this night with me
          </button>
        ) : null}
        <button className="constellary-play__remember" type="button" onClick={complete}>
          Let the park remember for me
        </button>
      </div>
    </section>
  );
}
