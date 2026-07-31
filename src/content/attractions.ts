import type { AttractionId, AttractionTrace } from '../experience/guest-state';

export type AttractionChoice = {
  id: string;
  label: string;
  note: string;
  trace: AttractionTrace;
};

export type AttractionDefinition = {
  id: AttractionId;
  mapName: string;
  title: string;
  ariaEnterLabel: string;
  number: string;
  realm: 'bloom' | 'drift' | 'cabinet' | 'wind';
  invitation: string;
  description: string;
  prompt: string;
  completionLabel: string;
  choices: AttractionChoice[];
};

export const ATTRACTIONS: AttractionDefinition[] = [
  {
    id: 'bloomworks',
    mapName: 'Bloomworks',
    title: 'Bloomworks',
    ariaEnterLabel: 'Enter Bloomworks',
    number: '01',
    realm: 'bloom',
    invitation: 'A garden is waiting for a relationship.',
    description:
      'Three seed-gears sleep beneath the glass. Arrange what should gather, what should connect, and what should remain gloriously untamed.',
    prompt: 'How should the first roots meet?',
    completionLabel: 'Wake Bloomworks',
    choices: [
      {
        id: 'cluster',
        label: 'Gather close',
        note: 'Dense rhythm · sheltered light',
        trace: { attractionId: 'bloomworks', pattern: 'cluster', pulse: 2 },
      },
      {
        id: 'bridge',
        label: 'Grow bridges',
        note: 'Long vines · shared crossings',
        trace: { attractionId: 'bloomworks', pattern: 'bridge', pulse: 4 },
      },
      {
        id: 'wild',
        label: 'Let it wander',
        note: 'Unruly blooms · quick pulses',
        trace: { attractionId: 'bloomworks', pattern: 'wild', pulse: 5 },
      },
    ],
  },
  {
    id: 'driftglass',
    mapName: 'Driftglass Sea',
    title: 'Driftglass Sea',
    ariaEnterLabel: 'Enter Driftglass Sea',
    number: '02',
    realm: 'drift',
    invitation: 'The water remembers every careful crossing.',
    description:
      'Lean a ribbon of wind across the translucent current. The lights are not lost; they are listening for the route you choose.',
    prompt: 'Which pulse will you follow?',
    completionLabel: 'Set the current',
    choices: [
      {
        id: 'cove',
        label: 'Follow the quiet cove',
        note: 'Soft intervals · one close companion',
        trace: { attractionId: 'driftglass', route: 'cove', companions: ['flicker'] },
      },
      {
        id: 'current',
        label: 'Cross the living current',
        note: 'Braided wakes · two answering lights',
        trace: {
          attractionId: 'driftglass',
          route: 'current',
          companions: ['flicker', 'bell'],
        },
      },
      {
        id: 'horizon',
        label: 'Follow the far horizon',
        note: 'Wide color drift · bright company',
        trace: {
          attractionId: 'driftglass',
          route: 'horizon',
          companions: ['bell', 'comet'],
        },
      },
    ],
  },
  {
    id: 'cabinet',
    mapName: 'Cabinet of Near Things',
    title: 'The Cabinet of Near Things',
    ariaEnterLabel: 'Enter the Cabinet of Near Things',
    number: '03',
    realm: 'cabinet',
    invitation: 'Not every good idea arrives on time.',
    description:
      'Drawers click open when noticed. Choose one almost-invention to carry into the rest of the park; it has been waiting to become useful.',
    prompt: 'Which near thing deserves another tomorrow?',
    completionLabel: 'Let it follow me',
    choices: [
      {
        id: 'weather-loom',
        label: 'Adopt the weather loom',
        note: 'Weaves a pocket forecast from loose threads',
        trace: { attractionId: 'cabinet', nearThing: 'weather-loom' },
      },
      {
        id: 'staircase-seed',
        label: 'Adopt the staircase seed',
        note: 'Grows exactly one step when courage needs it',
        trace: { attractionId: 'cabinet', nearThing: 'staircase-seed' },
      },
      {
        id: 'enough-clock',
        label: 'Adopt the enough clock',
        note: 'Chimes only when the moment has been sufficient',
        trace: { attractionId: 'cabinet', nearThing: 'enough-clock' },
      },
    ],
  },
  {
    id: 'windthread',
    mapName: 'Windthread',
    title: 'Windthread',
    ariaEnterLabel: 'Enter Windthread',
    number: '04',
    realm: 'wind',
    invitation: 'The sky is not a road. It is a collaborator.',
    description:
      'Take the filament kite above the Morrowspire. Speed, height, and grace are different signatures—not better and worse scores.',
    prompt: 'How will you write across the air?',
    completionLabel: 'Tie off the sky-thread',
    choices: [
      {
        id: 'drift',
        label: 'Drift with the updrafts',
        note: 'Calm arcs · unhurried height',
        trace: { attractionId: 'windthread', flight: 'drift', rings: 2 },
      },
      {
        id: 'weave',
        label: 'Weave between cloudlines',
        note: 'Alternating turns · rose-colored thread',
        trace: { attractionId: 'windthread', flight: 'weave', rings: 5 },
      },
      {
        id: 'soar',
        label: 'Soar into the high air',
        note: 'Quick climbs · a long comet tail',
        trace: { attractionId: 'windthread', flight: 'soar', rings: 7 },
      },
    ],
  },
];

export function getAttraction(id: AttractionId) {
  const attraction = ATTRACTIONS.find((candidate) => candidate.id === id);
  if (!attraction) throw new Error(`Unknown attraction: ${id}`);
  return attraction;
}
