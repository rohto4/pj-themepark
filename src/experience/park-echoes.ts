import type { AttractionId, GuestState } from './guest-state';

export type ParkEcho = {
  id: string;
  source: AttractionId | 'hushgarden';
  line: string;
  mark: string;
};

const HUSH_ECHOES: Record<string, Omit<ParkEcho, 'id'>> = {
  'hush-listening-fern': {
    source: 'hushgarden',
    line: 'A patient fern has taught the lamps to leave one beat of listening between replies.',
    mark: 'quiet interval',
  },
  'hush-bench-constellation': {
    source: 'hushgarden',
    line: 'Five brass bench-marks now appear as a small resting constellation overhead.',
    mark: 'resting stars',
  },
  'hush-slow-wind': {
    source: 'hushgarden',
    line: 'A paper wind follows at the slower pace you discovered in Hushgarden.',
    mark: 'slow wind',
  },
};

export function deriveParkEchoes(
  state: GuestState,
  destination?: AttractionId | 'hushgarden',
): ParkEcho[] {
  const echoes: ParkEcho[] = [];
  const bloom = state.traces.bloomworks;
  const drift = state.traces.driftglass;
  const cabinet = state.traces.cabinet;
  const wind = state.traces.windthread;

  if (bloom && destination !== 'bloomworks') {
    const line = {
      cluster: 'Sheltering vines gather around the path lamps in close, warm circles.',
      bridge: 'Long Bloomworks vines have begun stitching small bridges between distant railings.',
      wild: 'Unruly pollinator lights wander beyond the garden and redraw the park edges.',
    }[bloom.pattern];
    echoes.push({ id: `bloom-${bloom.pattern}`, source: 'bloomworks', line, mark: 'living vine' });
  }

  if (drift && destination !== 'driftglass') {
    echoes.push({
      id: `drift-${drift.route}`,
      source: 'driftglass',
      line: `${drift.companions.length || 1} tide-light${drift.companions.length === 1 ? '' : 's'} from the ${drift.route} route now answer distant landmarks.`,
      mark: 'answering light',
    });
  }

  if (cabinet && destination !== 'cabinet') {
    const line = {
      'weather-loom': 'A pocket forecast is weaving loose color into the air just ahead.',
      'staircase-seed':
        'A staircase seed has grown one considerate step beside the steepest threshold.',
      'enough-clock': 'The enough clock gives one soft chime, then leaves the moment unmeasured.',
    }[cabinet.nearThing];
    echoes.push({
      id: `cabinet-${cabinet.nearThing}`,
      source: 'cabinet',
      line,
      mark: cabinet.nearThing,
    });
  }

  if (wind && destination !== 'windthread') {
    const line = {
      drift: 'Calm sky-thread now hangs between the flags in long, unhurried arcs.',
      weave: 'Rose-colored thread weaves through the skyline and alternates each turn.',
      soar: 'A quick comet seam lifts the clouds above every path you have not taken yet.',
    }[wind.flight];
    echoes.push({ id: `wind-${wind.flight}`, source: 'windthread', line, mark: 'sky-thread' });
  }

  if (destination !== 'hushgarden') {
    for (const discoveryId of state.discoveries) {
      const echo = HUSH_ECHOES[discoveryId];
      if (echo) echoes.push({ id: discoveryId, ...echo });

      const [kind, source, variation] = discoveryId.split(':');
      if (
        kind === 'revisit' &&
        variation &&
        (source === 'bloomworks' ||
          source === 'driftglass' ||
          source === 'cabinet' ||
          source === 'windthread') &&
        destination !== source
      ) {
        echoes.push({
          id: discoveryId,
          source,
          line: `The park learned a second way through ${source}: ${variation.replaceAll('-', ' ')} now appears beside the first.`,
          mark: 'alternate path',
        });
      }
    }
  }

  return echoes;
}
