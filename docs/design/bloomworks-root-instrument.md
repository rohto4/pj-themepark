# Bloomworks root instrument

Status: accepted for P6 implementation  
Capability owner: E7 learn-play-master; first producer for E8 and E12

## Experience promise

Bloomworks is a patient spatial instrument, not a quiz. The first touch grows a root immediately.
Three placements are a complete small experience. Guests who remain can choose where three moon
roots grow, repeat any seed-gear, discover relationships in the graph, and wake a garden whose form
the rest of the park physically remembers.

The remembered sentence is: **I arranged a relationship, then saw the park grow around it.**

## Interaction grammar

### Core roots — safe first response

- Three core sockets wake in a fixed, legible order.
- Each turn offers `Gather`, `Connect`, and `Wander`; gears may repeat.
- Each gear changes both the new node and its relationship to the existing graph:
  - Gather nests near established light.
  - Connect creates a shared crossing and may add a second bridge.
  - Wander runs toward an open edge and leaves a pollinator trail.
- After three placements the core result is complete. `Wake Bloomworks` remains the short route.

### Moon roots — optional spatial mastery

- `Tend the moon roots` reveals three named empty sockets at distinct graph positions.
- The guest selects a socket, then a gear. This two-step intent is the same for mouse, touch, and
  keyboard; drag is never required.
- Socket choice determines geometry. Gear choice determines the relationship role. Placing the
  same gear in two sockets therefore produces different paths and readback.
- The three moon sockets pair with the three core sockets. Repeating the core phrase into the paired
  sockets creates the optional `moon-root chorus`. Reversing or concentrating the phrase remains a
  valid garden but produces a different topology rather than a failure state.

## Model boundary

Fine interaction state is session-local and never written after every click:

```text
BloomSession
  placements: { socketId, gearId }[]
  selectedMoonSocket: socketId | null
  depth: core | moon
```

Pure projections derive `nodes`, `edges`, `topologyId`, `pattern`, `pulse`, visible readback, and an
optional mastery discovery. Only completion commits the compact authored trace to `GuestState`.
This avoids localStorage churn and focus resets while the guest is playing.

The P6 first slice deliberately keeps guest schema v1. The existing Bloom trace can preserve the
two strategy facets required now:

- `pattern` records the dominant relationship family (`cluster`, `bridge`, or `wild`);
- `pulse` records bounded graph complexity and resonance (1–8);
- `moon-root chorus` is stored as a bounded discovery identifier when earned.

If later work needs exact arbitrary graph recovery, a versioned migration will precede that change;
unbounded click/event logs will not be persisted.

## Deterministic outcome rules

- Every placed gear contributes to its relationship family.
- Every derived edge contributes again according to its role (`nest`, `bridge`, `runner`).
- The highest family total becomes the pattern. A tie resolves from the newest placed gear so the
  result always remains explainable from the visible graph.
- Pulse is the bounded sum of node depth, distinct edge roles, and earned resonance. It is never
  presented as a score.
- Topology identity is derived only from seed-independent placement intents; seed may change
  atmosphere or which moon socket glimmers first, never the meaning of the guest's actions.

## Visual and inclusive behavior

- Semantic controls and text readback surround an authored SVG root diagram. SVG is evidence of the
  current model, not an unrelated animation.
- Nodes expose stable socket/gear data attributes to component and browser tests. Edges expose their
  relationship role. The accessible summary states counts, current relationship, and next action.
- Full motion draws new paths and releases a small resident glimmer. Reduced motion steps between
  completed compositions. Low power uses the same final SVG with no running animation.
- Color is never the only carrier: node silhouettes, path dash/branch shape, labels, and the live
  summary all distinguish relationships.

## Downstream projection contract

The committed pattern/pulse/mastery facets feed one pure `WorldProjection` in the next slice:

- map: landmark root geometry and path crossings;
- Driftglass or Hushgarden: one actual vine/bridge/pollinator object with a small optional response;
- Constellary: recognition-beat geometry and climax growth;
- keepsake/replay: the same topology family plus an alternate-root afterimage when learned.

Supporting prose may explain a consequence, but prose alone cannot satisfy E8.
