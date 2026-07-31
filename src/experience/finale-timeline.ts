import { createScorePlan } from '../audio/score-plan';
import type { ProjectedSurface } from './world-projection';
import { deriveFinaleRecipe, type GuestState } from './guest-state';
import { deriveWorldProjection } from './world-projection';

export type FinaleBeatId = 'awakening' | 'gathering' | 'recognition' | 'climax' | 'release';

export type FinaleBeat = {
  id: FinaleBeatId;
  act: number;
  title: string;
  caption: string;
  note: string;
  geometryId: string;
  pace: 'still' | 'measured' | 'rising' | 'soaring' | 'settling';
};

export type FinaleTimelinePlan = {
  timelineVersion: 1;
  finaleTitle: string;
  beats: readonly FinaleBeat[];
  recognition: ProjectedSurface | null;
  resultFingerprint: string;
  presentation: {
    audio: 'audible' | 'muted';
    motion: 'animated' | 'step';
  };
};

function stableHash(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619) >>> 0;
  }

  return hash.toString(36).padStart(7, '0');
}

function climaxPace(movement: string): FinaleBeat['pace'] {
  if (movement === 'soar') return 'soaring';
  if (movement === 'weave' || movement === 'current') return 'rising';
  return 'measured';
}

export function createFinaleTimeline(state: GuestState): FinaleTimelinePlan {
  const recipe = state.finale ?? deriveFinaleRecipe(state);
  const score = createScorePlan(state, recipe);
  const recognition = deriveWorldProjection(state).bloom?.constellary ?? null;
  const companions = state.traces.driftglass?.companions ?? [];
  const companionCopy = companions.length > 0 ? companions.join(', ') : 'the solitary ember';
  const realmCopy =
    score.realmLayers.length > 0
      ? score.realmLayers.map((layer) => layer.visibleLabel).join('; ')
      : 'The paths not taken answer as quiet stars';
  const recognitionGeometry = recognition?.geometryId ?? `recognition-${recipe.emblem}`;
  const recognitionCopy =
    recognition?.accessibleLabel ?? `The ${recipe.emblem.replaceAll('-', ' ')} rises into view`;
  const beats: readonly FinaleBeat[] = [
    {
      id: 'awakening',
      act: 1,
      title: 'The ember remembers its name',
      caption: `${score.emberIdentity.join(' · ')} returns as the first lantern phrase.`,
      note: score.emberIdentity[0],
      geometryId: `ember-${score.emberIdentity.join('-').toLowerCase()}`,
      pace: 'measured',
    },
    {
      id: 'gathering',
      act: 2,
      title: 'The realms enter the sky',
      caption: `${realmCopy}. Their routes gather without losing their shape.`,
      note: score.emberIdentity[1],
      geometryId: `gathering-${
        score.realmLayers.map((layer) => `${layer.realm}-${layer.pattern}`).join('-') || 'quiet'
      }`,
      pace: score.realmLayers.length >= 3 ? 'rising' : 'measured',
    },
    {
      id: 'recognition',
      act: 3,
      title: 'The garden returns as a constellation',
      caption: `${recognitionCopy}. The park gives your way of tending a place in the heavens.`,
      note: score.emberIdentity[2],
      geometryId: recognitionGeometry,
      pace: 'still',
    },
    {
      id: 'climax',
      act: 4,
      title: 'Every route meets at midnight',
      caption: `${companionCopy} cross the ${recipe.palette.replaceAll('-', ' ')} sky as it begins to ${recipe.movement}.`,
      note: score.emberIdentity[3],
      geometryId: `climax-${recipe.growth}-${recipe.movement}-${recipe.palette}-${companions.join('-') || 'solo'}`,
      pace: climaxPace(recipe.movement),
    },
    {
      id: 'release',
      act: 5,
      title: 'The night becomes yours to carry',
      caption: `${recipe.title} resolves in ${recipe.motifIds.length} remembered forms, then leaves one light awake for tomorrow.`,
      note: score.emberIdentity[0],
      geometryId: `release-${recipe.emblem}-${recipe.motifIds.length}`,
      pace: 'settling',
    },
  ];
  const semanticFingerprint = [
    recipe.title,
    recipe.palette,
    recipe.growth,
    recipe.emblem,
    recipe.movement,
    ...recipe.motifIds,
    ...beats.map((beat) => `${beat.id}:${beat.geometryId}:${beat.note}:${beat.pace}`),
  ].join('|');

  return {
    timelineVersion: 1,
    finaleTitle: recipe.title,
    beats,
    recognition,
    resultFingerprint: `finale:${stableHash(semanticFingerprint)}`,
    presentation: {
      audio: state.preferences.audio === 'on' ? 'audible' : 'muted',
      motion:
        state.preferences.motion === 'reduced' || state.preferences.power === 'low'
          ? 'step'
          : 'animated',
    },
  };
}
