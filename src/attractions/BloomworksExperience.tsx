import { useState } from 'react';

import { getAttraction, type AttractionChoice } from '../content/attractions';
import {
  canCompleteBloom,
  createBloomSession,
  deriveBloomGraph,
  deriveBloomOutcome,
  reduceBloomSession,
  type BloomEdge,
  type BloomIntent,
  type BloomNode,
  type MoonSocketId,
  type SeedGearId,
} from './bloomworks-model';

type SeedGear = {
  id: SeedGearId;
  buttonLabel: string;
  label: string;
  detail: string;
};

const BLOOMWORKS = getAttraction('bloomworks');

const SEED_GEARS: readonly SeedGear[] = [
  {
    id: 'gather',
    buttonLabel: 'Gather seed gear',
    label: 'Gather',
    detail: 'Nests near established light and folds it into shelter.',
  },
  {
    id: 'connect',
    buttonLabel: 'Connect seed gear',
    label: 'Connect',
    detail: 'Reaches across the glass and makes a shared crossing.',
  },
  {
    id: 'wander',
    buttonLabel: 'Wander seed gear',
    label: 'Wander',
    detail: 'Runs toward an open edge with pollinator light behind it.',
  },
];

const MOON_SOCKETS: readonly {
  id: MoonSocketId;
  label: string;
  buttonLabel: string;
  detail: string;
}[] = [
  {
    id: 'crown',
    label: 'Crown',
    buttonLabel: 'Choose Crown socket',
    detail: 'High above the first sheltered root.',
  },
  {
    id: 'crossing',
    label: 'Crossing',
    buttonLabel: 'Choose Crossing socket',
    detail: 'At the glass centre, where distant roots can meet.',
  },
  {
    id: 'verge',
    label: 'Verge',
    buttonLabel: 'Choose Verge socket',
    detail: 'Near the open boundary and the pollinator dark.',
  },
];

function getMoonSocket(id: MoonSocketId) {
  const socket = MOON_SOCKETS.find((candidate) => candidate.id === id);
  if (!socket) throw new Error(`Unknown Bloomworks moon socket: ${id}`);
  return socket;
}

function nodeFor(nodes: readonly BloomNode[], socketId: BloomEdge['from']): BloomNode {
  const node = nodes.find((candidate) => candidate.socketId === socketId);
  if (!node) throw new Error(`Missing Bloomworks graph node: ${socketId}`);
  return node;
}

function edgePath(edge: BloomEdge, nodes: readonly BloomNode[]): string {
  const from = nodeFor(nodes, edge.from);
  const to = nodeFor(nodes, edge.to);
  const middleX = (from.x + to.x) / 2;
  const lift = edge.role === 'bridge' ? 24 : edge.role === 'runner' ? -12 : 8;
  const middleY = (from.y + to.y) / 2 - lift;
  return `M ${from.x} ${from.y} Q ${middleX} ${middleY} ${to.x} ${to.y}`;
}

function placementLabel(count: number, depth: 'core' | 'moon'): string {
  if (depth === 'core') return `${count} of 3 core roots placed`;
  return `${Math.max(0, count - 3)} of 3 moon roots placed · ${count} total roots`;
}

export function BloomworksExperience({
  onComplete,
  onDiscover,
}: {
  onComplete: (choice: AttractionChoice) => void;
  onDiscover?: (discoveryId: string) => void;
}) {
  const [session, setSession] = useState(createBloomSession);
  const graph = deriveBloomGraph(session);
  const outcome = deriveBloomOutcome(session);
  const coreReady = session.placements.length === 3 && session.depth === 'core';
  const moonComplete = session.placements.length === 6;
  const selectedSocket = session.selectedMoonSocket
    ? getMoonSocket(session.selectedMoonSocket)
    : null;
  const canPlant =
    (session.depth === 'core' && session.placements.length < 3) ||
    (session.depth === 'moon' && session.selectedMoonSocket !== null && !moonComplete);

  function act(intent: BloomIntent): void {
    setSession((current) => reduceBloomSession(current, intent));
  }

  function completeGarden(): void {
    if (!outcome) return;
    if (outcome.masteryDiscoveryId) onDiscover?.(outcome.masteryDiscoveryId);
    onComplete(outcome.choice);
  }

  return (
    <section className="bloom-play__experience" aria-labelledby="bloom-play-heading">
      <header className="bloom-play__introduction">
        <p className="bloom-play__eyebrow">Bloomworks · a patient root instrument</p>
        <h2 id="bloom-play-heading">Wake the root garden</h2>
        <p>
          Grow three roots for a complete small garden. Gather nests, Connect makes crossings, and
          Wander runs toward open edges. Repeat any gear: the relationship, not a correct answer,
          shapes what lives here.
        </p>
        <p className="bloom-play__motion-note">
          Every root settles immediately. No dragging, timing, or score is required.
        </p>
      </header>

      <div
        className="bloom-play__garden"
        aria-label="Garden root response"
        aria-live="polite"
        role="status"
      >
        <p className="bloom-play__progress">
          {placementLabel(session.placements.length, session.depth)}
        </p>
        <p className="bloom-play__root-response">{graph.readback}</p>
        {selectedSocket ? (
          <p className="bloom-play__selection">
            {selectedSocket.label} is listening. Choose the relationship that should grow there.
          </p>
        ) : null}
        {outcome?.masteryDiscoveryId ? (
          <p className="bloom-play__mastery">
            Moon-root chorus found — the second garden remembers the first root phrase.
          </p>
        ) : null}
      </div>

      <div className="bloom-play__network-shell">
        <svg
          className="bloom-play__network"
          viewBox="0 0 300 150"
          role="img"
          aria-label="Living root network"
          data-node-count={graph.nodes.length}
          data-edge-count={graph.edges.length}
          data-topology={graph.topologyId}
        >
          <defs>
            <filter id="bloom-root-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g className="bloom-play__empty-sockets" aria-hidden="true">
            <circle cx="74" cy="116" r="8" />
            <circle cx="150" cy="88" r="8" />
            <circle cx="226" cy="116" r="8" />
            {session.depth === 'moon' ? (
              <>
                <circle cx="66" cy="38" r="7" />
                <circle cx="150" cy="24" r="7" />
                <circle cx="238" cy="48" r="7" />
              </>
            ) : null}
          </g>
          <g className="bloom-play__edges" aria-hidden="true">
            {graph.edges.map((edge) => (
              <path
                key={edge.id}
                className={`bloom-play__edge bloom-play__edge--${edge.role}`}
                d={edgePath(edge, graph.nodes)}
                data-edge-role={edge.role}
                data-edge-from={edge.from}
                data-edge-to={edge.to}
              />
            ))}
          </g>
          <g className="bloom-play__nodes" aria-hidden="true">
            {graph.nodes.map((node, index) => (
              <g
                key={node.socketId}
                className={`bloom-play__node bloom-play__node--${node.gearId}`}
                data-socket={node.socketId}
                data-gear={node.gearId}
                transform={`translate(${node.x} ${node.y})`}
              >
                <circle r={node.gearId === 'gather' ? 9 : node.gearId === 'connect' ? 7 : 6} />
                {node.gearId === 'gather' ? (
                  <circle className="bloom-play__node-ring" r="14" />
                ) : null}
                {node.gearId === 'connect' ? (
                  <path className="bloom-play__node-mark" d="M-12 0H12M0-12V12" />
                ) : null}
                {node.gearId === 'wander' ? (
                  <path className="bloom-play__node-mark" d="M-4 8Q4 0 11-10" />
                ) : null}
                <text x="0" y="25">
                  {String(index + 1).padStart(2, '0')}
                </text>
              </g>
            ))}
          </g>
        </svg>
        <p className="bloom-play__network-caption">
          {graph.nodes.length === 0
            ? 'Three core sockets wait beneath the glass.'
            : `${graph.nodes.length} roots · ${graph.edges.length} visible relationships`}
        </p>
      </div>

      {session.depth === 'moon' && !moonComplete ? (
        <fieldset className="bloom-play__moon-fieldset">
          <legend>Choose the next moon-root socket</legend>
          <div className="bloom-play__moon-sockets" role="group" aria-label="Moon root sockets">
            {MOON_SOCKETS.map((socket) => {
              const occupied = session.placements.some(
                (placement) => placement.socketId === socket.id,
              );
              const selected = session.selectedMoonSocket === socket.id;
              return (
                <button
                  type="button"
                  key={socket.id}
                  className={`bloom-play__moon-socket${selected ? ' is-selected' : ''}`}
                  aria-label={socket.buttonLabel}
                  aria-pressed={selected}
                  disabled={occupied}
                  onClick={() => act({ type: 'SELECT_MOON_SOCKET', socketId: socket.id })}
                >
                  <strong>{socket.label}</strong>
                  <span>{occupied ? 'Root placed' : socket.detail}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="bloom-play__gear-fieldset" disabled={!canPlant}>
        <legend>
          {session.depth === 'core'
            ? 'Choose the next core relationship'
            : selectedSocket
              ? `Choose what grows at ${selectedSocket.label}`
              : 'Choose a moon socket before its relationship'}
        </legend>
        <div className="bloom-play__gear-group" role="group" aria-label="Seed gears">
          {SEED_GEARS.map((gear) => (
            <button
              className="bloom-play__gear"
              type="button"
              key={gear.id}
              aria-label={gear.buttonLabel}
              aria-describedby={`bloom-play-${gear.id}-detail`}
              disabled={!canPlant}
              onClick={() => act({ type: 'PLANT_GEAR', gearId: gear.id })}
            >
              <span className="bloom-play__gear-label">{gear.label}</span>
              <span className="bloom-play__gear-detail" id={`bloom-play-${gear.id}-detail`}>
                {gear.detail}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      {outcome ? (
        <div className="bloom-play__pattern" aria-live="polite">
          <p className="bloom-play__pattern-title">Pattern formed: {outcome.choice.label}</p>
          <p className="bloom-play__pattern-note">{outcome.choice.note}</p>
          <p className="bloom-play__pattern-order">
            Topology: {outcome.topologyId.replace('bloom:', '').replaceAll('.', ' · ')}
          </p>
        </div>
      ) : (
        <p className="bloom-play__pattern-prompt">
          Grow three roots to reveal the first complete relationship.
        </p>
      )}

      <div className="bloom-play__actions">
        <button
          className="bloom-play__reset"
          type="button"
          disabled={session.placements.length === 0}
          onClick={() => act({ type: 'RESET' })}
        >
          Reset root garden
        </button>
        {coreReady ? (
          <button
            className="bloom-play__deepen"
            type="button"
            onClick={() => act({ type: 'ENTER_MOON_ROOTS' })}
          >
            Tend the moon roots
          </button>
        ) : null}
        <button
          className="bloom-play__complete"
          type="button"
          disabled={!canCompleteBloom(session)}
          onClick={completeGarden}
        >
          {BLOOMWORKS.completionLabel}
        </button>
      </div>
    </section>
  );
}
