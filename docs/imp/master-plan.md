# MORROWLIGHT master implementation ledger

Status timestamp: 2026-08-01 JST  
Overall state: **Phase 3 — park build-out in progress**
Hard continuity rule: update this file before changing phase or ending a session.

## Objective

Design, build, verify, and publish an original browser-native theme park that satisfies `PROJECT.md`.

## Immediate timebox

Before the user's planned pause around 2026-08-01 06:00 JST:

- establish recovery-safe project records;
- confirm the minimum account/resource plan;
- gather and synthesize current web and theme-park experience evidence;
- freeze the guest journey, interaction model, art direction, accessibility strategy, architecture, and evaluation plan;
- complete at least one technical risk spike if time permits.

The overall project may continue for up to 48 hours. If the result still cannot meet the completion definition at hour 40, prepare a concise status report with observed evidence, remaining scope, and a revised duration estimate.

## Capability evals

| ID  | Capability              | Observable pass condition                                                                                         | State                                                       |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| E1  | Immediate wonder        | First-time guest causes a delightful audiovisual/visual response within 10 seconds, without external instructions | Not run                                                     |
| E2  | Park legibility         | Guest can identify current location, available destinations, and how to return                                    | Not run                                                     |
| E3  | Consequential play      | Two different action histories produce visibly different later state and finales                                  | Automated pass: deterministic divergent-recipe tests        |
| E4  | Short and deep routes   | A 5-minute completion route and a 30–60 minute discovery route both work                                          | Not run                                                     |
| E5  | Inclusive critical path | Keyboard-only, touch, reduced-motion, muted, and low-power routes reach the finale                                | Automated pass: 8/8 desktop/mobile E2E; observed QA pending |
| E6  | Production resilience   | Live Cloudflare URL loads and completes the critical path on representative desktop and mobile viewports          | Not run                                                     |

## Regression evals

- Deterministic state reducer and save migration tests.
- Attraction contract tests: enter, interact, completion, replay, state contribution.
- Route and focus-management tests.
- Asset provenance and build-budget checks.
- Playwright critical paths for desktop, mobile, keyboard, reduced motion, and low-power modes.
- Live smoke check after deployment, recorded separately from local checks.

## Phase plan

### P0 — Foundation and evidence

- [x] Clone and verify the supplied repository (empty initial state).
- [x] Add `AGENTS.md`, `PROJECT.md`, account ledger, and this task ledger.
- [x] Add LLM-Wiki-style raw/wiki/schema structure.
- [x] Verify the current Karpathy LLM Wiki source and record any relevant deltas.
- [x] Run parallel research on physical park experience, browser-native immersion, and Cloudflare/runtime constraints.
- [x] Synthesize confirmed facts, counterevidence, inferences, and recommendations.

Done when: sources are dated/cited, accounts are minimal, and unresolved design questions are explicit.

### P1 — Concept and architecture gate

- [x] Freeze guest promise, emotional arc, park map, attraction portfolio, replay loop, and finale logic.
- [x] Define visual, typography, motion, sound, and low-power systems.
- [x] Define app/state/scene architecture, asset budget, analytics/privacy boundary, and deployment resources.
- [x] Write decision records for high-risk choices.
- [x] Specify E1–E6 test fixtures and baseline failure signatures.

Done when: another capable agent could implement a vertical slice without inventing core product decisions.

### P2 — Vertical slice

- [x] Bootstrap tested application and static-only deployment configuration.
- [x] Implement arrival, park navigation, four attraction choice shells, persistent consequence, personalized finale, and downloadable keepsake.
- [x] Validate desktop, mobile, keyboard, reduced-motion, mute, and low-power paths in Playwright.

Done when: the complete emotional loop works locally and is evaluated before scaling content.

### P3 — Park build-out

- [ ] Implement remaining authored attractions and discoveries.
- [ ] Integrate generative score, atmosphere, and finale composition.
- [ ] Add replay, secrets, keepsake, content polish, and fault boundaries.

Done when: E1–E5 pass locally with evidence.

### P4 — Batched visual QA and polish

- [ ] Capture representative screenshots only after functional closure.
- [ ] Review hierarchy, clarity, atmosphere, motion, contrast, overflow, and device composition in one batched pass.
- [ ] Fix and repeat the smallest necessary screenshot set.

Done when: the interface has a coherent visual point of view and no known critical visual defect.

### P5 — Publish and live verification

- [ ] Commit/push functional checkpoints.
- [ ] Create the least-privilege Cloudflare project/resources.
- [ ] Deploy and run live E6 smoke checks.
- [ ] Record exact commit, live URL, resource inventory, rollback, evidence, and remaining limitations.

Done when: all `PROJECT.md` completion conditions are evidenced.

## Active work units

| Unit                                  | Dominant risk                                    | Owner/model                | Done condition                                       | State       | Retries/time    |
| ------------------------------------- | ------------------------------------------------ | -------------------------- | ---------------------------------------------------- | ----------- | --------------- |
| U001 Foundation records               | Context loss                                     | Primary / Sol Max          | Init and ledger files read back from disk            | Completed   | 0 / ~35m        |
| U002 Experience research              | Copying surface features instead of principles   | Research agent / Terra Max | Dated, cited principles plus counterevidence         | Completed   | 0 / parallel    |
| U003 Browser immersion research       | Choosing spectacle that harms access/performance | Research agent / Terra Max | Current technical options and failure modes          | Completed   | 0 / parallel    |
| U004 Cloudflare architecture research | Premature infrastructure                         | Research agent / Terra Max | Smallest live architecture with constraints          | Completed   | 0 / parallel    |
| U005 Concept synthesis                | Generic or derivative park                       | Primary / Sol Max          | Fixed distinctive concept and journey                | Completed   | 1 rename / ~45m |
| U006 Application bootstrap            | Toolchain drift                                  | Primary / Sol Max          | Typecheck, tests, production build, asset check pass | Completed   | 0 / ~40m        |
| U007 Guest reducer                    | State inconsistency                              | Primary / Sol Max          | Determinism and divergent-finale tests pass          | Completed   | 0 / ~25m        |
| U008 Persistence and keepsake         | Losing or leaking the guest's night              | Primary + Terra Max        | Safe local roundtrip and offline SVG export pass     | Completed   | 0 / parallel    |
| U009 Generative score core            | Audio blocking or excluding muted guests         | Terra Max                  | Pure score + safe gesture-gated runtime tests pass   | Completed   | 0 / parallel    |
| U010 Inclusive browser route          | DOM checks hiding browser/device failures        | Primary + Terra Max        | 8 desktop/mobile Playwright routes pass              | Completed   | 1 mobile fix    |
| U011 Attraction depth                 | Park feeling like a styled questionnaire         | Primary / Sol Max          | Each realm has a distinct learn-play-transform loop  | In progress | 0 / —           |

## Session handoff

Last verified state: functional checkpoint `8c5d09b` is on `origin/main`. P2 is locally closed: TypeScript, 38 Vitest tests, production Vite build, and 8/8 desktop/mobile Playwright routes pass. Static Cloudflare asset validation and an unauthenticated dry-run pass with no bindings.
Exact next action: checkpoint P2 to GitHub, then replace the attraction choice shells with distinct learn-play-transform mechanics, beginning with Bloomworks.
External state: GitHub P2 is pushed; no Cloudflare resource has been created and no deployment has occurred.
Known risks: attraction interactions are currently expressive choice shells rather than deep play; browser audio quality is fake-node verified but not listened to; visual hierarchy and overflow await the planned batched screenshot QA; live Cloudflare authentication/deployment is deferred to P5.
