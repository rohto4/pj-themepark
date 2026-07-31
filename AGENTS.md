# pj-themepark agent operating rules

## Initialization and recovery order

At the start of a fresh session, after any context compaction, or after a handoff, read these files from disk before editing or performing external writes:

1. `AGENTS.md`
2. `PROJECT.md`
3. `docs/imp/master-plan.md`
4. The active phase file linked from `docs/imp/master-plan.md`, if any
5. Only the minimum relevant files linked from those documents

Conversation summaries are hints, not project truth. Reconcile them against the files above.

## Source-of-truth layers

This project uses an LLM-Wiki-inspired three-layer knowledge model:

- `knowledge/raw/`: immutable or append-only captured source notes. Record URL, title, publisher, accessed date, and the exact claim being considered. Never silently rewrite source evidence.
- `knowledge/wiki/`: maintained synthesis. `index.md` is the topic-oriented entry point; `log.md` is the chronological change record.
- `knowledge/schema/`: rules for ingesting, citing, deduplicating, and updating knowledge.

Project decisions belong in `docs/design/` or `docs/adr/`, not in raw research. Active implementation state belongs in `docs/imp/`. Completed verification evidence belongs in `docs/evidence/`.

## Task continuity

- Keep the objective, current phase, exact next action, done conditions, and remaining risks in `docs/imp/master-plan.md`.
- Break implementation into independently verifiable units of roughly 15 minutes.
- Mark a task complete only when its declared evidence exists.
- After a material unit, update the task ledger before beginning the next unit.
- Before screenshot-, image-, or large-log-heavy work, checkpoint the current state. Prefer session rotation when current input occupancy is around 75% or higher, at 85%+, or after two compactions.

## Engineering rules

- The experience is browser-first, responsive, keyboard-accessible, and respectful of reduced-motion and audio preferences.
- Define capability and regression checks before implementing a feature.
- Keep the first live boundary fake or local. Do not add tokens, secrets, authenticated payloads, or cookies to source files, prompts, reports, command lines, or logs.
- Use generated, procedural, public-domain, or project-authored assets only. Record the provenance of every non-code asset.
- Prefer progressive enhancement. A guest must receive a coherent experience without WebGL, audio permission, an account, or a high-end device.
- Treat copied theme-park expressions, characters, attraction layouts, trademarks, and distinctive trade dress as out of scope. Research is for principles and counterexamples, not imitation.

## External actions

The user authorized use of the supplied GitHub repository, the logged-in Cloudflare account, and the current Edge session for this project. External writes must still remain scoped to this project.

- GitHub: commits and pushes to `rohto4/pj-themepark` are allowed as normal delivery steps.
- Cloudflare: create only project resources needed to run the experience. Prefer one Workers/Pages project and the smallest required bindings.
- Do not create accounts for gathering assets or inspiration.
- Do not purchase domains, paid plans, ads, media, or third-party services without a new explicit authorization.
- If a manual user gate is unavoidable, create a standalone HTML request/checklist under `docs/gates/`.

## Verification and delivery

For each milestone, record:

- automated checks and their observed result;
- browser/device/accessibility checks actually performed;
- external deployment state separately from local verification;
- known gaps and the next safe action.

Structural checks are not browser QA. Local fake tests are not live deployment. Do not report either as more than the evidence proves.
