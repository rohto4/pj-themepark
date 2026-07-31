# MORROWLIGHT visual, motion, and sound system

Status: concept-gate draft  
Direction: **luminous botanical folio × nocturnal scientific instrument**

## One remembered image

A nearly black illustrated park at dusk, engraved with hairline paths, suddenly threaded by one living amber light that grows leaves, currents, instruments, and constellations wherever the guest acts.

The interface should feel authored and touchable, not like a game portal or a collection of product cards.

## Composition

- Use an asymmetric landscape stage with a persistent horizon and one strong landmark rather than a centered hero stack.
- Navigation exists inside the world: route threads, landmark labels, a fold-out field guide, and the orbiting ember-star.
- Text appears as field notes, engraved plaques, instrument labels, and short invitations. Long explanation lives in the optional guide.
- Scenes may overlap the HUD, but focus, status, and escape/map controls remain predictable.
- On narrow screens, preserve landscape depth through layered vertical slices rather than shrinking a desktop map.

## Color tokens

```css
:root {
  --ink-950: #06070d;
  --ink-900: #0b0d17;
  --ink-800: #151829;
  --night-blue: #202a47;
  --moon-paper: #f3eed7;
  --moon-muted: #b8b6aa;
  --ember: #ffb35c;
  --ember-hot: #ffe29a;
  --bloom: #64e6a6;
  --tide: #74d8ff;
  --near-violet: #bd9cff;
  --wind-rose: #ff8fa3;
  --danger: #ff786f;
}
```

The dominant field is ink. Moon-paper is reserved for readable text and charts. One realm color may lead a scene; all accents should not compete simultaneously. State must never be communicated by hue alone.

## Typography

- Display: a characterful old-style/variable serif with optical softness, provisionally Fraunces.
- Body and controls: Atkinson Hyperlegible Next or an equally legible open typeface.
- Instrument numerals/labels: body face with tabular numerals and spaced small caps; no third font is needed.
- Host fonts locally and record license/version provenance. System fallbacks must keep all controls and layout usable.

Headlines are short and shaped. Body text uses comfortable measures. Uppercase is for tiny labels only, never paragraphs.

## Surface language

- Atmosphere comes from CSS gradients, procedural grain, SVG hatching, soft bloom, and masked linework rather than photographic backdrops.
- Lines resemble etched brass or silver ink; active paths become threads of light.
- Panels use smoky glass sparingly and are cut to the content, avoiding interchangeable rounded rectangles.
- Shadows should feel like depth inside night, not default floating-card elevation.
- Realm symbols are generated from a small original geometric grammar: seed, arc, wave, hinge, and star.

## Motion grammar

Three motion families only:

- **Wake:** light travels along a path and reveals structure in sequence.
- **Breathe:** slow environmental oscillation communicates life and rest.
- **Gather:** scattered elements orbit, align, and resolve after a guest action.

Motion should reinforce causality. The opening uses one staged Wake sequence; attraction completion uses Gather; ambient scenes use restrained Breathe. Avoid generic scroll-trigger cascades and constant hover bobbing.

Reduced-motion mode replaces travel and parallax with crossfades, drawn end states, and optional step-through frames. It is an authored mode, not merely zero-duration CSS.

## Sound grammar

- Sound is generative and built from short synthesized tones/noise; no external recording account is required.
- Each realm owns a timbre family, not a looping song.
- The ember-star carries a four-note identity transformed by the guest’s traces.
- Visible pulses, line thickness, captions, and haptics where supported mirror meaningful audio events.
- Audio starts muted/uninitialized until a guest gesture. The experience never nags after a mute choice.

## Accessibility display modes

- Standard: full atmosphere and authored motion.
- Reduced motion: crossfades, fixed horizon, no camera sway, fully equivalent interactions.
- High contrast: solid backgrounds, stronger route edges, simplified glow, visible focus rings.
- Low power: static illustrated backgrounds, reduced particles, capped animation, no filters that force large paint areas.
- Text guide: a structured alternative view of location, actions, discoveries, and progress using the same underlying state.

## Visual quality gate

- The opening frame has one clear action and no generic marketing header.
- The guest can identify map, current realm, and accessibility controls without flattening the scene into app chrome.
- Every realm is recognizable in grayscale by silhouette and motion, not color alone.
- Desktop and mobile compositions feel intentionally authored.
- Screenshots show a coherent single world rather than separate themed minigames.
