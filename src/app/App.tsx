import { useEffect, useReducer, useRef, useState, type CSSProperties, type Dispatch } from 'react';

import { createScorePlan } from '../audio/score-plan';
import {
  createSoundscape,
  type AudioContextLike,
  type Soundscape,
  type SoundscapeStatus,
} from '../audio/soundscape';
import { ATTRACTIONS, getAttraction, type AttractionChoice } from '../content/attractions';
import {
  createGuestState,
  reduceGuestState,
  type AttractionId,
  type GuestState,
} from '../experience/guest-state';
import { loadGuestState, saveGuestState } from '../experience/persistence';
import { buildNightChartSvg, nightChartFilename } from '../experience/keepsake';

type AppProps = {
  initialState?: GuestState;
};

function createNightSeed() {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  }
  return 0x4d4f5252;
}

function systemPreferences() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
  return {
    motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? ('reduced' as const)
      : ('full' as const),
    contrast: window.matchMedia('(prefers-contrast: more)').matches
      ? ('high' as const)
      : ('standard' as const),
  };
}

function resolveInitialState(initialState?: GuestState) {
  if (initialState) return initialState;

  if (typeof window !== 'undefined') {
    const remembered = loadGuestState(window.localStorage);
    if (remembered) return remembered;
  }

  return createGuestState(createNightSeed(), systemPreferences());
}

function StarMark({ quiet = false }: { quiet?: boolean }) {
  return (
    <span className={quiet ? 'star-mark star-mark--quiet' : 'star-mark'} aria-hidden="true">
      <span className="star-mark__core" />
      <span className="star-mark__orbit" />
    </span>
  );
}

function SettingsPanel({
  state,
  onAction,
  onToggleAudio,
  soundStatus,
  onClose,
}: {
  state: GuestState;
  onAction: Dispatch<Parameters<typeof reduceGuestState>[1]>;
  onToggleAudio: () => void;
  soundStatus: SoundscapeStatus;
  onClose: () => void;
}) {
  const { preferences } = state;

  return (
    <aside className="settings-panel" aria-labelledby="settings-title">
      <div className="settings-panel__heading">
        <div>
          <p className="eyebrow">Field guide · page 00</p>
          <h2 id="settings-title">Make the night yours</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings">
          ×
        </button>
      </div>
      <p className="settings-panel__intro">
        Every route reaches the same meaning. Change these whenever the park asks for too much.
      </p>
      <div className="settings-list">
        <div className="setting-row">
          <div>
            <strong>Motion</strong>
            <span>
              {preferences.motion === 'full' ? 'Wake, breathe, and gather' : 'Still compositions'}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onAction({
                type: 'SET_PREFERENCE',
                key: 'motion',
                value: preferences.motion === 'full' ? 'reduced' : 'full',
              })
            }
          >
            {preferences.motion === 'full' ? 'Use reduced motion' : 'Use full motion'}
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Power</strong>
            <span>
              {preferences.power === 'auto' ? 'Adaptive atmosphere' : 'Static illustrated scenes'}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onAction({
                type: 'SET_PREFERENCE',
                key: 'power',
                value: preferences.power === 'auto' ? 'low' : 'auto',
              })
            }
          >
            {preferences.power === 'auto' ? 'Use low power mode' : 'Use adaptive power'}
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Contrast</strong>
            <span>
              {preferences.contrast === 'standard' ? 'Luminous ink' : 'Crisp route edges'}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              onAction({
                type: 'SET_PREFERENCE',
                key: 'contrast',
                value: preferences.contrast === 'standard' ? 'high' : 'standard',
              })
            }
          >
            {preferences.contrast === 'standard' ? 'Use high contrast' : 'Use standard contrast'}
          </button>
        </div>
        <div className="setting-row">
          <div>
            <strong>Sound</strong>
            <span aria-live="polite">
              {preferences.audio === 'off'
                ? 'Visual pulses only'
                : soundStatus === 'playing'
                  ? 'The generative score is awake'
                  : soundStatus === 'unavailable' || soundStatus === 'suspended'
                    ? 'Sound is unavailable; visible score remains'
                    : 'Sound waits for one deliberate tap'}
            </span>
          </div>
          <button type="button" onClick={onToggleAudio}>
            {preferences.audio === 'off' ? 'Invite sound' : 'Mute sound'}
          </button>
        </div>
      </div>
    </aside>
  );
}

function ArrivalScene({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="scene arrival-scene" aria-labelledby="arrival-title">
      <div className="arrival-scene__horizon" aria-hidden="true">
        <span className="arrival-scene__sunline" />
        <span className="arrival-scene__spire" />
      </div>
      <div className="arrival-scene__copy">
        <p className="eyebrow">Admit one night · No ticket required</p>
        <h1 id="arrival-title" data-scene-heading tabIndex={-1}>
          <span>MORROW</span>
          <span>LIGHT</span>
        </h1>
        <p className="arrival-scene__dek">
          A park made from the tomorrows we nearly imagined.
          <br /> It opens when the last daylight finds your hand.
        </p>
      </div>
      <button
        className="ember-invitation"
        type="button"
        onClick={onEnter}
        aria-label="Touch the last light of today"
      >
        <StarMark />
        <span>
          <small>Begin here</small>
          Touch the last light of today
        </span>
      </button>
      <p className="arrival-scene__footnote">
        A five-minute visit is enough. Curiosity may take longer.
      </p>
    </section>
  );
}

function MapIllustration({ completed }: { completed: AttractionId[] }) {
  return (
    <svg
      className="park-map-art"
      viewBox="0 0 1000 650"
      role="img"
      aria-labelledby="park-map-title park-map-desc"
    >
      <title id="park-map-title">A map of Morrowlight</title>
      <desc id="park-map-desc">
        The Morrowspire stands at the center. Four illuminated routes lead to Bloomworks, Driftglass
        Sea, the Cabinet of Near Things, and Windthread.
      </desc>
      <defs>
        <radialGradient id="mapGlow">
          <stop offset="0" stopColor="var(--ember-hot)" stopOpacity=".7" />
          <stop offset="1" stopColor="var(--ember)" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <path className="map-contour" d="M78 470C196 351 228 142 448 178s267-68 464 102" />
      <path
        className="map-contour map-contour--two"
        d="M70 526c181-82 291 60 452-24s260-36 406 34"
      />
      <g className="map-routes">
        <path className="map-route map-route--bloom" d="M494 350C387 375 322 411 228 492" />
        <path className="map-route map-route--drift" d="M512 352c90 33 149 88 232 152" />
        <path className="map-route map-route--cabinet" d="M488 332C396 276 326 247 235 226" />
        <path className="map-route map-route--wind" d="M516 328c105-58 176-101 275-151" />
      </g>
      <g className="morrowspire" transform="translate(500 338)">
        <circle r="82" fill="url(#mapGlow)" filter="url(#softGlow)" />
        <path d="m0-126 22 98 38 34-39 18L0 122-20 24-59 6l38-34Z" />
        <circle r="9" />
      </g>
      <g
        className={`map-landmark map-landmark--bloom ${completed.includes('bloomworks') ? 'is-complete' : ''}`}
      >
        <path d="M191 522c16-73 16-73 43-124 8 44 5 84-9 121m-8-58-47-26m58 2 43-31" />
        <circle cx="233" cy="397" r="18" />
      </g>
      <g
        className={`map-landmark map-landmark--drift ${completed.includes('driftglass') ? 'is-complete' : ''}`}
      >
        <path d="M689 520q50-45 105 0t103 0M720 552q42-33 91 0" />
        <path d="m792 455 11 32 31 10-31 11-11 31-10-31-32-11 32-10Z" />
      </g>
      <g
        className={`map-landmark map-landmark--cabinet ${completed.includes('cabinet') ? 'is-complete' : ''}`}
      >
        <path d="M151 279V168h164v111M176 279v-83h114v83M216 196v83m35-83v83" />
        <circle cx="234" cy="236" r="6" />
      </g>
      <g
        className={`map-landmark map-landmark--wind ${completed.includes('windthread') ? 'is-complete' : ''}`}
      >
        <path d="m787 106 58 43-44 55-49-37Z" />
        <path d="M801 204c-8 34-53 35-39 75s-14 45-37 58" />
      </g>
    </svg>
  );
}

function ParkMap({
  state,
  onEnter,
  onFinale,
}: {
  state: GuestState;
  onEnter: (id: AttractionId) => void;
  onFinale: () => void;
}) {
  const gathered = Math.min(state.completedAttractions.length, 3);

  return (
    <section className="scene map-scene" aria-labelledby="map-heading">
      <header className="scene-heading map-scene__heading">
        <p className="eyebrow">The park between tomorrows</p>
        <h1 id="map-heading" data-scene-heading tabIndex={-1}>
          Where will your light go?
        </h1>
        <p>
          Choose by curiosity. Every path returns to the Morrowspire, and no choice closes another.
        </p>
      </header>
      <div className="map-stage">
        <MapIllustration completed={state.completedAttractions} />
        <ol className="destination-list" aria-label="Park destinations">
          {ATTRACTIONS.map((attraction) => {
            const locked =
              attraction.id === 'windthread' && state.completedAttractions.length === 0;
            const complete = state.completedAttractions.includes(attraction.id);
            return (
              <li key={attraction.id} className={`destination destination--${attraction.realm}`}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => onEnter(attraction.id)}
                  aria-label={`${attraction.ariaEnterLabel}${complete ? ', visited' : locked ? ', opens after one visit' : ''}`}
                >
                  <span className="destination__number">{attraction.number}</span>
                  <span className="destination__label">
                    <strong>{attraction.mapName}</strong>
                    <small>
                      {locked ? 'The high air is still gathering' : attraction.invitation}
                    </small>
                  </span>
                  <span className="destination__state" aria-hidden="true">
                    {complete ? '✦' : locked ? '—' : '↗'}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="map-progress" aria-live="polite">
          <StarMark quiet />
          <span>
            <strong>{gathered} of 3 lights gathered</strong>
            <small>
              {gathered < 3
                ? 'Three paths will open the night sky.'
                : 'The Constellary is listening.'}
            </small>
          </span>
          {gathered >= 3 ? (
            <button type="button" className="text-link" onClick={onFinale}>
              Open the Constellary
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function RealmInstrument({ realm, choice }: { realm: string; choice: string | null }) {
  return (
    <div
      className={`realm-instrument realm-instrument--${realm} ${choice ? 'is-awake' : ''}`}
      aria-hidden="true"
    >
      <span className="realm-instrument__ring realm-instrument__ring--outer" />
      <span className="realm-instrument__ring realm-instrument__ring--middle" />
      <span className="realm-instrument__ring realm-instrument__ring--inner" />
      <span className="realm-instrument__axis" />
      <span className="realm-instrument__spark" />
      <span className="realm-instrument__choice">{choice?.slice(0, 1).toUpperCase()}</span>
    </div>
  );
}

function AttractionScene({
  id,
  onComplete,
  onReturn,
}: {
  id: AttractionId;
  onComplete: (choice: AttractionChoice) => void;
  onReturn: () => void;
}) {
  const attraction = getAttraction(id);
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const choice = attraction.choices.find((candidate) => candidate.id === choiceId) ?? null;

  return (
    <section
      className={`scene attraction-scene attraction-scene--${attraction.realm}`}
      aria-labelledby="attraction-heading"
    >
      <button type="button" className="return-thread" onClick={onReturn}>
        <span aria-hidden="true">←</span> Return to the Morrowspire
      </button>
      <div className="attraction-scene__copy">
        <p className="eyebrow">Attraction {attraction.number} · expressive play</p>
        <h1 id="attraction-heading" data-scene-heading tabIndex={-1}>
          {attraction.title}
        </h1>
        <p className="attraction-scene__invitation">{attraction.invitation}</p>
        <p>{attraction.description}</p>
      </div>
      <div className="attraction-scene__instrument">
        <RealmInstrument realm={attraction.realm} choice={choiceId} />
        <p>{choice ? choice.note : 'The instrument is waiting for your first idea.'}</p>
      </div>
      <fieldset className="choice-rail">
        <legend>{attraction.prompt}</legend>
        {attraction.choices.map((candidate, index) => (
          <button
            type="button"
            key={candidate.id}
            className={candidate.id === choiceId ? 'is-selected' : ''}
            aria-label={candidate.label}
            aria-pressed={candidate.id === choiceId}
            onClick={() => setChoiceId(candidate.id)}
          >
            <span className="choice-rail__index">0{index + 1}</span>
            <span>
              <strong>{candidate.label}</strong>
              <small>{candidate.note}</small>
            </span>
          </button>
        ))}
      </fieldset>
      <button
        className="primary-action"
        type="button"
        disabled={!choice}
        onClick={() => choice && onComplete(choice)}
      >
        <span>{attraction.completionLabel}</span>
        <span aria-hidden="true">✦</span>
      </button>
    </section>
  );
}

function FinaleScene({ state, onComplete }: { state: GuestState; onComplete: () => void }) {
  const finale = state.finale;
  if (!finale) return null;
  const score = createScorePlan(state, finale);

  return (
    <section className="scene finale-scene" aria-labelledby="finale-heading">
      <div className="finale-sky" aria-hidden="true">
        {finale.motifIds.map((motif, index) => (
          <span
            key={motif}
            className="finale-orbit"
            style={{ '--orbit-index': index } as CSSProperties}
          />
        ))}
        <StarMark />
      </div>
      <div className="finale-scene__copy">
        <p className="eyebrow">Midnight · one night only</p>
        <h1 id="finale-heading" data-scene-heading tabIndex={-1}>
          The Constellary remembers
        </h1>
        <p className="finale-title">{finale.title}</p>
        <p>
          Your routes have become a sky-instrument. Every line below is a receipt from something the
          park noticed.
        </p>
        <ul className="motif-ledger" aria-label="Remembered motifs">
          {finale.motifIds.map((motif) => (
            <li key={motif}>{motif}</li>
          ))}
        </ul>
        <ol className="score-pulses" aria-label="Visible score">
          {score.visiblePulseSequence.map((pulse) => (
            <li key={pulse.index} data-emphasis={pulse.emphasis}>
              <span aria-hidden="true" />
              <span>{pulse.caption}</span>
              <small>{pulse.note}</small>
            </li>
          ))}
        </ol>
        <p className="equivalence-note">{score.equivalence.audio.visibleLabel}</p>
        <button type="button" className="primary-action" onClick={onComplete}>
          <span>Conduct this night</span>
          <span aria-hidden="true">✦</span>
        </button>
      </div>
    </section>
  );
}

function downloadNightChart(state: GuestState) {
  const blob = new Blob([buildNightChartSvg(state)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nightChartFilename(state);
  link.click();
  URL.revokeObjectURL(url);
}

function KeepsakeScene({ state, onReturn }: { state: GuestState; onReturn: () => void }) {
  return (
    <section className="scene keepsake-scene" aria-labelledby="keepsake-heading">
      <div className="night-chart">
        <p className="eyebrow">Morrowlight night chart</p>
        <h1 id="keepsake-heading" data-scene-heading tabIndex={-1}>
          {state.finale?.title ?? 'An Emberlit Night'}
        </h1>
        <div className="night-chart__star">
          <StarMark />
        </div>
        <p>{state.nightId}</p>
        <ol>
          {state.finale?.motifIds.map((motif) => (
            <li key={motif}>{motif}</li>
          ))}
        </ol>
      </div>
      <div className="keepsake-scene__copy">
        <p className="eyebrow">The park closes gently</p>
        <h2>This night can wait here.</h2>
        <p>
          Your route is held only in this browser. Take an illustrated Night Chart with you—no
          account, upload, or borrowed memory required.
        </p>
        <button
          type="button"
          className="primary-action keepsake-download"
          onClick={() => downloadNightChart(state)}
        >
          <span>Download my Night Chart</span>
          <span aria-hidden="true">↓</span>
        </button>
        <button type="button" className="text-link" onClick={onReturn}>
          Return to the living map
        </button>
      </div>
    </section>
  );
}

export function App({ initialState }: AppProps) {
  const [state, dispatch] = useReducer(reduceGuestState, initialState, resolveInitialState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundStatus, setSoundStatus] = useState<SoundscapeStatus>('idle');
  const soundscapeRef = useRef<Soundscape | null>(null);

  useEffect(() => {
    if (state.revision === 0) return;
    document.querySelector<HTMLElement>('[data-scene-heading]')?.focus();
  }, [state.currentScene, state.revision]);

  useEffect(() => {
    if (typeof window !== 'undefined') saveGuestState(window.localStorage, state);
  }, [state]);

  useEffect(() => {
    const soundscape = soundscapeRef.current;
    if (!soundscape || state.preferences.audio !== 'on') return;

    void soundscape.start(createScorePlan(state)).then((result) => setSoundStatus(result.status));
  }, [state]);

  useEffect(
    () => () => {
      void soundscapeRef.current?.dispose();
    },
    [],
  );

  const enterScene = (scene: AttractionId) => dispatch({ type: 'ENTER_SCENE', scene });
  const returnToMap = () => dispatch({ type: 'ENTER_SCENE', scene: 'map' });
  const toggleAudio = () => {
    if (state.preferences.audio === 'on') {
      soundscapeRef.current?.stop();
      setSoundStatus('muted');
      dispatch({ type: 'SET_PREFERENCE', key: 'audio', value: 'off' });
      return;
    }

    if (!soundscapeRef.current) {
      soundscapeRef.current = createSoundscape({
        createAudioContext: () => {
          const audioWindow = window as Window & {
            webkitAudioContext?: typeof AudioContext;
          };
          const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext;
          return AudioContextConstructor
            ? (new AudioContextConstructor() as unknown as AudioContextLike)
            : null;
        },
      });
    }

    const audibleState: GuestState = {
      ...state,
      preferences: { ...state.preferences, audio: 'on' },
    };
    void soundscapeRef.current
      .start(createScorePlan(audibleState))
      .then((result) => setSoundStatus(result.status));
    dispatch({ type: 'SET_PREFERENCE', key: 'audio', value: 'on' });
  };

  return (
    <div
      className="park-root"
      data-testid="park-root"
      data-motion={state.preferences.motion}
      data-power={state.preferences.power}
      data-contrast={state.preferences.contrast}
      data-audio={state.preferences.audio}
    >
      <a className="skip-link" href="#park-scene">
        Skip to the current scene
      </a>
      <div className="atmosphere" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <header className="park-header">
        <button
          type="button"
          className="wordmark"
          onClick={state.phase === 'arrival' ? undefined : returnToMap}
          aria-label={state.phase === 'arrival' ? 'Morrowlight' : 'Return to the Morrowlight map'}
        >
          <StarMark quiet />
          <span>MORROWLIGHT</span>
        </button>
        {state.phase !== 'arrival' ? (
          <p className="park-header__status">
            <span>{state.completedAttractions.length}</span> traces · {state.nightId.slice(-4)}
          </p>
        ) : null}
        <button
          type="button"
          className="guide-button"
          aria-label="Visit settings"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((open) => !open)}
        >
          <span aria-hidden="true">☼</span>
          <span>Night settings</span>
        </button>
      </header>

      {settingsOpen ? (
        <SettingsPanel
          state={state}
          onAction={dispatch}
          onToggleAudio={toggleAudio}
          soundStatus={soundStatus}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}

      <main id="park-scene">
        {state.currentScene === 'arrival' ? (
          <ArrivalScene onEnter={() => dispatch({ type: 'LIGHT_STAR' })} />
        ) : null}
        {state.currentScene === 'map' ? (
          <ParkMap
            state={state}
            onEnter={enterScene}
            onFinale={() => dispatch({ type: 'BEGIN_FINALE' })}
          />
        ) : null}
        {ATTRACTIONS.some((attraction) => attraction.id === state.currentScene) ? (
          <AttractionScene
            key={state.currentScene}
            id={state.currentScene as AttractionId}
            onReturn={returnToMap}
            onComplete={(choice) => dispatch({ type: 'COMPLETE_ATTRACTION', trace: choice.trace })}
          />
        ) : null}
        {state.currentScene === 'constellary' ? (
          <FinaleScene state={state} onComplete={() => dispatch({ type: 'COMPLETE_FINALE' })} />
        ) : null}
        {state.currentScene === 'keepsake' ? (
          <KeepsakeScene state={state} onReturn={returnToMap} />
        ) : null}
      </main>

      <footer className="park-footer">
        <span>Morrowlight is best entered with curiosity.</span>
        <span>Original night · locally remembered</span>
      </footer>
    </div>
  );
}
