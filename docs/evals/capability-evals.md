# MORROWLIGHT capability evaluation specification

Status: baseline definitions; no implementation has passed yet  
Date: 2026-08-01 JST

## E1 — Immediate wonder

Fixture: clean storage, standard motion, audio initially unavailable.  
Action: load the production build and use only the most visually prominent initial target.  
Pass:

- a visible response begins within one animation frame after the action in an automated trace;
- title/world reveal begins without additional explanation;
- the guest can reach the park map in three intentional actions or fewer;
- accessibility controls are reachable before or during the reveal.

Baseline failure signature: no application exists.

## E2 — Park legibility

Fixture: guest has completed arrival and one attraction.  
Pass:

- current realm and completed destinations are programmatically and visually identifiable;
- the Morrowspire/home landmark and map command are always recoverable;
- a guest can move from any attraction to a different available attraction without browser Back or external instructions;
- focus lands on the new scene heading after navigation.

Baseline failure signature: no application exists.

## E3 — Consequential play

Fixture A and B use the same seed but distinct defined actions in two attractions.  
Pass:

- each action receives immediate feedback and persists after reload;
- at least one park-map detail differs between A and B;
- finale recipes and rendered motifs differ in predictable asserted fields;
- the difference is recognizable without reading debug state.

Baseline failure signature: no state reducer or finale exists.

## E4 — Short and deep routes

Short fixture: clean state, use each attraction’s early-completion route.  
Deep fixture: complete all major attraction variants and discoveries exposed by the first release.  
Pass:

- short route reaches the finale with three motifs and no dead end;
- deep route yields additional cross-attraction echoes and finale layers;
- neither route requires a score, account, sound, or time-limited event;
- progress is resumable after reload at defined checkpoints.

Automated tests prove reachability, not human play duration. Observed duration is recorded separately during browser QA.

Baseline failure signature: no routes exist.

## E5 — Inclusive critical path

Run separate Playwright/browser fixtures for:

- keyboard-only at desktop viewport;
- touch at mobile viewport;
- `prefers-reduced-motion: reduce`;
- mute/audio context never started;
- high contrast/forced-colors inspection where the browser supports it;
- low-power mode selected in the app.

Pass: arrival → any three attractions → finale → keepsake completes with equivalent state consequences, visible focus, no gesture-only blocker, and no essential audio-only cue.

Baseline failure signature: no accessible application exists.

## E6 — Production resilience

Fixture: deployed commit and recorded Cloudflare URL.  
Pass:

- direct navigation and reload of supported SPA routes do not return an infrastructure 404;
- hashed assets load with intended caching and security headers;
- desktop and mobile live critical paths complete;
- local build commit matches the recorded deployment source;
- rollback procedure and resource inventory are recorded.

Baseline failure signature: no Cloudflare resource exists.

## Regression commands

Commands will be frozen after bootstrapping. The intended single gate is `npm.cmd run check`, which should compose format/lint, typecheck, unit/component tests, production build, and focused E2E checks without implying unrun visual or live QA.
