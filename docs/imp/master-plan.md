# MORROWLIGHT master implementation ledger

Status timestamp: 2026-08-01 JST  
Overall state: **Phase 6 — deep park expansion in progress**
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

The public release closed P0–P5 but is a recovery-safe milestone, not the end of the original 48-hour ambition. From the user's 2026-08-01 autonomous-resume instruction, continue without product-direction questions for at least the next three hours. The active phase record is `docs/imp/continuation-plan.md`.

## Capability evals

| ID  | Capability              | Observable pass condition                                                                                         | State                                                                               |
| --- | ----------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| E1  | Immediate wonder        | First-time guest causes a delightful audiovisual/visual response within 10 seconds, without external instructions | Local observed pass: one action gives immediate visual response; opt-in audio wakes |
| E2  | Park legibility         | Guest can identify current location, available destinations, and how to return                                    | Local observed pass at 1440/768/375 after mobile order/overlap fixes                |
| E3  | Consequential play      | Two different action histories produce visibly different later state and finales                                  | Automated pass: deterministic divergent-recipe tests                                |
| E4  | Short and deep routes   | A 5-minute completion route and a 30–60 minute discovery route both work                                          | Automated short/deep branches pass; literal dwell-time observation pending          |
| E5  | Inclusive critical path | Keyboard-only, touch, reduced-motion, muted, and low-power routes reach the finale                                | Local pass: 12/12 routes, keyboard observation, and axe A/AA scans                  |
| E6  | Production resilience   | Live Cloudflare URL loads and completes the critical path on representative desktop and mobile viewports          | Live pass: 12/12 desktop/mobile routes after first-deploy propagation               |

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

- [x] Implement remaining authored attractions and discoveries.
- [x] Integrate generative score, atmosphere, and finale composition.
- [x] Add replay, secrets, keepsake, content polish, and fault boundaries.

Implementation closure: 83 Vitest tests and 12 desktop/mobile Playwright routes pass; asset budget and static Cloudflare dry-run pass. Human-observed E1, composition/audio quality, and literal long-dwell evidence continue in P4 before E1–E5 are declared complete.

### P4 — Batched visual QA and polish

- [x] Capture representative screenshots only after functional closure.
- [x] Review hierarchy, clarity, atmosphere, motion, contrast, overflow, and device composition in one batched pass.
- [x] Fix and repeat the smallest necessary screenshot set.

Done when: the interface has a coherent visual point of view and no known critical visual defect.

### P5 — Publish and live verification

- [x] Commit/push functional checkpoints.
- [x] Create the least-privilege Cloudflare project/resources.
- [x] Deploy and run live E6 smoke checks.
- [x] Record exact commit, live URL, resource inventory, rollback, evidence, and remaining limitations.

Done when: all `PROJECT.md` completion conditions are evidenced.

### P6 — Deep park expansion

- [ ] Measure the public v1 against attraction mastery, interaction density, park-wide consequence, sensory craft, and literal long-route quality.
- [ ] Replace the highest-impact shallow interaction loops with authored multi-stage play that remains keyboard/touch/reduced-motion equivalent.
- [ ] Make accumulated traces alter more of the living map, other realms, ambient score, Constellary, and return visit.
- [ ] Add enough layered discoveries and replay variance for a genuinely rewarding extended route rather than only branch reachability.
- [ ] Re-run the full local gate, batched browser QA, live deployment gate, and independent audit after functional closure.

Done when: `docs/imp/continuation-plan.md` evals E7–E12 pass with observed evidence and the new release is materially more park-like than the current public baseline.

## Active work units

| Unit                                  | Dominant risk                                       | Owner/model                | Done condition                                        | State       | Retries/time               |
| ------------------------------------- | --------------------------------------------------- | -------------------------- | ----------------------------------------------------- | ----------- | -------------------------- |
| U001 Foundation records               | Context loss                                        | Primary / Sol Max          | Init and ledger files read back from disk             | Completed   | 0 / ~35m                   |
| U002 Experience research              | Copying surface features instead of principles      | Research agent / Terra Max | Dated, cited principles plus counterevidence          | Completed   | 0 / parallel               |
| U003 Browser immersion research       | Choosing spectacle that harms access/performance    | Research agent / Terra Max | Current technical options and failure modes           | Completed   | 0 / parallel               |
| U004 Cloudflare architecture research | Premature infrastructure                            | Research agent / Terra Max | Smallest live architecture with constraints           | Completed   | 0 / parallel               |
| U005 Concept synthesis                | Generic or derivative park                          | Primary / Sol Max          | Fixed distinctive concept and journey                 | Completed   | 1 rename / ~45m            |
| U006 Application bootstrap            | Toolchain drift                                     | Primary / Sol Max          | Typecheck, tests, production build, asset check pass  | Completed   | 0 / ~40m                   |
| U007 Guest reducer                    | State inconsistency                                 | Primary / Sol Max          | Determinism and divergent-finale tests pass           | Completed   | 0 / ~25m                   |
| U008 Persistence and keepsake         | Losing or leaking the guest's night                 | Primary + Terra Max        | Safe local roundtrip and offline SVG export pass      | Completed   | 0 / parallel               |
| U009 Generative score core            | Audio blocking or excluding muted guests            | Terra Max                  | Pure score + safe gesture-gated runtime tests pass    | Completed   | 0 / parallel               |
| U010 Inclusive browser route          | DOM checks hiding browser/device failures           | Primary + Terra Max        | 8 desktop/mobile Playwright routes pass               | Completed   | 1 mobile fix               |
| U011 Attraction depth                 | Park feeling like a styled questionnaire            | Primary + Terra Max        | Each realm has a distinct learn-play-transform loop   | Completed   | 0 / parallel               |
| U012 Consequence and replay           | Choices being forgotten after each scene            | Primary / Sol Max          | Echoes, alternate replay, and secret motifs regress   | Completed   | 0 / ~25m                   |
| U013 Quiet and resilient routes       | Completion pressure or a single-scene crash         | Primary + Terra Max        | Hushgarden and scoped fault escape tests pass         | Completed   | 0 / parallel               |
| U014 Returnable nights                | Keepsake being inert or account-dependent           | Primary + Terra Max        | Download, Night Code, and fresh-night tests pass      | Completed   | 0 / parallel               |
| U015 Hosted CI design                 | Local-only confidence                               | Terra Max                  | Read-only CI workflow and evidence validate locally   | Completed   | 0 / parallel               |
| U016 Batched browser QA               | Automation hiding visual/audio defects              | Primary / Sol Max          | Representative desktop/mobile evidence is reviewed    | Completed   | 4 fixes / ~35m             |
| U017 Accessibility hardening          | Hidden clip or DOM/visual-order failures            | Primary + Terra Max        | Geometry/order regressions and axe A/AA scans pass    | Completed   | 0 / parallel               |
| U018 Production publication           | Local evidence mistaken for live resilience         | Primary / Sol Max          | Cloudflare URL and independent E6 evidence exist      | Completed   | 1 propagation retry / ~25m |
| U019 Continuation baseline            | Calling a shippable slice the best possible park    | Primary + research agents  | Ranked evidence-backed gap matrix and E7–E12 fixtures | Completed   | 0 / parallel               |
| U020 Hero-attraction depth            | Adding copy instead of play                         | Primary / Sol Max          | One realm has a multi-stage learn-play-master loop    | Completed   | 2 RED/GREEN / ~90m         |
| U021 Living consequence system        | Decorative state that guests cannot recognize       | Primary + Terra Max        | Traces alter at least three later park surfaces       | In progress | 0 / —                      |
| U022 Constellary performance          | Finale remaining a motif checklist                  | Primary / Sol Max          | Finale becomes an authored deterministic performance  | Pending     | 0 / —                      |
| U023 Extended discovery route         | Automated branches standing in for meaningful depth | Primary + Terra Max        | Layered secrets/replay support an observed deep route | Pending     | 0 / —                      |
| U024 P6 closure and redeploy          | Regressing the stable public release                | Primary + audit agents     | E7–E12, full gate, browser QA, live E6, rollback pass | Pending     | 0 / —                      |

## Session handoff

Last verified state: P0–P5 source checkpoint `b48aa415a51e5999aa572ab7b9273052c5ae411d` remains public at `https://morrowlight-theme-park.rohto-1111176221.workers.dev`, with final evidence through repository checkpoint `c56aee523545464c60bb937944ae70cc4839e551`. The stable baseline passes 83 Vitest tests, 12/12 local and live Playwright routes, focused keyboard stress, asset budget, and an independent live audit. See `docs/evidence/live-deployment-2026-08-01.md`.
Exact next action: add a failing pure `WorldProjection` fixture proving that two Bloom traces change map root geometry, a later-realm object, and Constellary recognition geometry without relying on echo text; confirm RED before wiring any new visual surface.
External state: the Cloudflare release source is `b48aa41`; later repository commits may contain test/evidence-only changes. Cloudflare has exactly one project resource in scope: the static Worker `morrowlight-theme-park`, with no bindings or custom domain. Wrangler credentials are encrypted through Windows Credential Manager and limited to `user:read`, `account:read`, `workers:write`, and `offline_access`.
Known risks: current attractions are short button-sequence instruments and may still read as polished questionnaires; the living park and finale recognize traces mostly through labels/motifs rather than a sustained embodied transformation; artistic audio quality has not been judged by a human; the 30–60 minute promise has branch coverage but not literal dwell-time observation; accessibility remains Chromium/axe evidence rather than assistive-technology or cross-engine certification; the current narrow OAuth token passes identity checks but Cloudflare version/rollback CLI access remains unverified until the separately controlled `workers_scripts:write` scope is explicitly approved.
