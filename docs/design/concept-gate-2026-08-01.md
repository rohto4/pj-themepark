# Concept and architecture gate — 2026-08-01

Decision: **accepted for vertical-slice implementation**  
Owner: primary agent

## Fixed product

Build **MORROWLIGHT — The Park Between Tomorrows**, an account-free browser-native park whose responsive systems remember how the guest plays and compose those traces into a deterministic sky finale.

The fixed promise is “The park noticed how I played.” The fixed structure is Emberwake Gate → living hub/map → non-linear authored attractions and Hushgarden → Constellary → local Night Chart/another night.

## Fixed experience choices

- Immediate tactile wonder precedes explanation.
- One persistent central landmark plus labeled current location, destination, and return route creates spatial memory.
- Attraction order is expressive; three core completions open the finale and deeper play enriches it.
- Consequence uses a four-level ladder: touch, scene, park, finale.
- No score economy, login, punishment loop, exhaustive gate, forced audio, or mandatory precision gesture.
- Calm observation is valid participation, represented structurally by Hushgarden and interruption-safe travel.
- The keepsake is generated locally and carries no personal data.

## Fixed visual direction

Commit to luminous botanical folio × nocturnal scientific instrument: ink-dominant atmosphere, moon-paper typography, one realm accent at a time, etched linework, original geometric motifs, and three causal motion families (Wake, Breathe, Gather).

## Fixed technical choices

- TypeScript + React + Vite.
- Semantic DOM and inline SVG as the primary experience surfaces.
- Optional Canvas 2D only for projected ambience/feedback, never state authority or sole semantics.
- Optional opt-in Web Audio with visual equivalence.
- Pure versioned reducer and deterministic projections; best-effort localStorage adapter.
- Vitest/React Testing Library/Playwright; screenshot QA after functional closure.
- One static-only Cloudflare Workers Static Assets project with explicit SPA fallback; no initial server/data/analytics/custom-domain resource.

## Alternatives rejected

### Full 3D/WebGPU park

Rejected for the critical path. It adds camera, asset, GPU lifecycle, loading, input, accessibility, and device risk without proving a stronger emotional loop. A contained optional effect remains possible only after the 2D vertical slice exposes a specific unmet need.

### Linear cinematic microsite

Rejected because it can produce spectacle but not a remembered place, non-linear visit, meaningful traces, or replay ownership. Morrowlight must be a park rather than a reveal sequence.

### Social persistent world

Rejected for the first release. Identity, shared state, abuse, moderation, privacy, uptime, and database operations would dominate the work before the solo guest promise is proven.

### AI-character-led park

Rejected as a core mechanic. Non-deterministic dialogue would weaken original authored pacing, testing, accessibility, safety, and finale reproducibility. AI may support development, not mediate the guest’s core journey.

## Disconfirming evidence carried forward

- Peak/end effects do not justify a weak middle, so E4 and route-wide QA remain mandatory.
- More sensory layers do not automatically create stronger memory, so mute and low-power modes are design controls, not lesser fallbacks.
- Landmark salience varies by guest/task, so the skyline never replaces labels and a return path.
- Storage, audio, Canvas, GPU, and background timing can fail; none may own irreversible progress.

## Implementation authority

P2 may proceed without reopening the concept. Revisit this gate only if a vertical-slice eval exposes a serious originality, legibility, accessibility, performance, or feasibility failure.
