# Browser-native immersion research — 2026 capability baseline

Record type: raw external-evidence stream  
Research question: What is the smallest current browser-native stack that can deliver an original, accessible, performant theme-park experience in a 48-hour build?  
Research mode: comparison and decision memo  
Accessed: 2026-08-01 JST  
Scope: browser platform capabilities and official test tooling only. This record does not make product or architecture decisions by itself.

## Question and evidence boundary

### User-provided project constraints

- The core route must work without WebGL, audio permission, an account, or high-end hardware.
- Keyboard, touch, reduced-motion, muted, high-contrast, and low-power routes are first-class.
- State must be deterministic and local-first; a server must not gate the journey.
- TypeScript, React, Vite, Web Audio, local state, Playwright, and Vitest are the current technical direction unless a short spike disproves them.

### Sourced facts

The technical claims below are supported by opened first-party platform, browser-vendor, standards-body, or official-tool documentation. Each evidence record at the end includes URL, visible update date when available, and access date.

### Inference

Immersion here should come from authored timing, legible spatial transitions, responsive state changes, sound when invited, and a coherent finale—not from making GPU rendering or continuous simulation a prerequisite.

## Recommendation: smallest robust 48-hour stack

Use **TypeScript + React + Vite**, with a deliberately small scene runtime:

1. **Semantic DOM is the interaction and accessibility system.** It owns route landmarks, headings, buttons, dialogs, focus, captions, settings, progress, and all choices that affect the guest story.
2. **Inline SVG is the authored spatial-art system.** It renders the park map, landmark silhouettes, paths, star motifs, and scalable scene cards. Provide `title`/`desc` or visible labels for meaningful SVG imagery.
3. **One optional Canvas 2D layer per scene is ambience only.** Use it for particles, water glints, soft star fields, or procedural light; it must not contain the only control, state, readable text, clue, or finale outcome. Cap its backing resolution and allow it to be off.
4. **No WebGL or WebGPU in the critical path.** A later non-essential enhancement may use WebGL after a dedicated context-loss test. WebGPU should remain an optional experiment only; MDN still labels it Limited availability as of this research date.
5. **Web Audio is opt-in after the first deliberate guest action.** Default sound off / visually equivalent. Create or resume the `AudioContext` in the same user-activation handler that lights the star or presses “Enable sound”; retain a persistent mute control and visual/caption equivalents.
6. **A single deterministic reducer owns the park.** A versioned seed plus a serializable action history or state snapshot produces every scene and finale. Rendering, audio, canvas, and browser APIs consume state; they never become the state authority.
7. **Local persistence is best-effort enhancement.** Start with a tiny versioned `localStorage` record for the save slot/settings; the first route must remain playable if it throws, is cleared, or is unavailable. Use IndexedDB only if the project truly needs larger structured local content. Add a minimal service worker only after the normal online route is stable.
8. **Playwright + Vitest are sufficient for the first delivery.** Test reducer determinism and migration in Vitest; test the critical path, keyboard, mobile viewport, reduced motion, forced colors, muted path, and low-power switch in Playwright. Keep a manual real-device/audio check as a separate evidence item.

This preserves the project’s browser-first promise while avoiding the main schedule traps: inaccessible canvas UI, autoplay failures, fragile GPU dependence, unbounded visual assets, and non-repeatable finale state.

## Rendering-surface decision table

| Surface | Use in ASTERIA | Sourced capability / constraint | 48-hour decision | Required fallback |
| --- | --- | --- | --- | --- |
| DOM + CSS | All meaningful interaction, text, focus, captions, settings, route structure | WAI APG documents accessible names, keyboard interaction, page structure, and high-contrast support as core rich-UI practices [R08]. | Primary system. Prefer native buttons/links/inputs before custom ARIA widgets. | None; it is the baseline route. |
| Inline SVG | Map, landmarks, signposts, spatial diagrams, scalable authored shapes | Inline SVG lives in the DOM; `title`, `desc`, and `aria-labelledby` provide image descriptions [R02]. | Primary visual scene/map layer. Keep interactive regions as adjacent/overlaid HTML buttons where practical. | Semantic text/list of destinations and actions. |
| Canvas 2D | Non-semantic particle/light/weather ambience; tiny procedural effects | Canvas is a bitmap whose drawn objects are not exposed as semantic HTML; it needs fallback content. Canvas size may be constrained on devices, including a noted 4096px iOS limit [R01]. | Optional, `aria-hidden` ambience; one canvas per active scene; do not use as a map/control surface. | Static CSS/SVG treatment and identical DOM controls. |
| WebGL | Future-only post-processing or a contained special scene | WebGL contexts can be lost and emit `webglcontextlost`; recovery is therefore an implementation requirement, not an edge case [R03]. | Exclude from P0–P2 and the first critical route. Add only after its scene works as DOM/SVG/Canvas fallback. | Disable the effect, retain DOM/SVG/CSS scene. |
| WebGPU | Future compute-heavy/procedural experiment | It offers modern GPU/compute capabilities but is secure-context-only and still marked Limited availability by MDN [R04]. | Do not schedule for the 48-hour build. Capability-detect only if a later spike has a clear win. | Never use it as a required renderer. |

## Sourced technical findings and their implications

### 1. Visual runtime and animation

**Sourced facts.** Canvas has no semantic object model for what it draws; inline SVG is accessible through DOM/AOM mechanisms when authored with appropriate descriptions [R01] [R02]. `requestAnimationFrame()` normally tracks the display refresh rate, pauses in most background tabs, and must use its timestamp to avoid running faster on high-refresh displays [R16]. Browser background policies also throttle timers [R15].

**Inference.** Visual effects must derive from elapsed time and recover cleanly after a visibility change. Never advance story state “once per frame” or require a canvas update to complete a choice. Use a short clamped delta time for ambience only; choices advance via reducer actions.

**Recommendation.** Define a `SceneModel` in React state and a small `useAmbientFrame(callback)` wrapper around `requestAnimationFrame`. Pause/cancel visual work when hidden, resume from the model when visible, and make the same scene intelligible as static DOM/SVG with Canvas disabled.

### 2. Audio, autoplay, and user agency

**Sourced facts.** Audible media and Web Audio started outside user input are subject to autoplay blocking. Browsers commonly permit autoplay only after site interaction, muted playback, an allowlist, or an iframe policy; exact treatment differs by browser [R05]. Web Audio source start outside a user-input handler is explicitly subject to those rules [R05].

**Counterevidence / failure mode.** A `play()` call succeeding during a developer’s repeated local visits does not establish that a new guest will hear sound; engagement and browser policy differ. Resuming sound automatically when a hidden tab becomes visible can also surprise a guest unless it was already user-enabled [R15].

**Recommendation.**

- Render the opening in silence with a strong visual response within ten seconds.
- Treat the first explicit star-lighting action as a sound invitation, not a hidden autoplay workaround.
- In that exact click/tap/key handler, call `AudioContext.resume()` if the guest opted in; handle rejection without blocking play.
- Keep a visible mute/unmute button, caption/effect label, and full visual feedback for every audio-only cue.
- Model sound as `sound: 'off' | 'on'`, persist it locally, and do not silently change it after reload.

### 3. Input: pointer, touch, keyboard, and gamepad

**Sourced facts.** Pointer Events provides one event model across mouse, pen, and touch [R06]. Browsers own scroll and pinch zoom by default; `touch-action` declares what the page intends to handle. `touch-action: none` can prevent browser zoom and harm low-vision users [R07]. WAI APG treats accessible names, keyboard interaction, page structure, and high-contrast support as foundational rich-UI work [R08]. The `gamepadconnected` event is baseline only from December 2025 for latest devices and may not work on older ones [R09].

**Recommendation.**

- Use semantic buttons for every attraction, choice, skip, return, sound, and settings control. Native `click` supports pointer and keyboard activation without duplicate custom handling.
- Add Pointer Events only for optional direct-manipulation effects. Give small isolated surfaces `touch-action: manipulation` or a precise pan direction; do not set `touch-action: none` on the document or primary reading area.
- Design the park map as a focusable destination list plus an SVG visual map, rather than as a drag-only canvas.
- Map keyboard actions through a discoverable help affordance: `Tab`/`Shift+Tab` for controls, `Enter`/`Space` to activate, Escape for overlays, and arrows only where a labeled spatial selector requires them.
- Treat gamepad as an optional fourth adapter that emits the exact same named reducer actions as click/tap/keyboard. It can enhance living-room play but cannot be required.

### 4. Reduced motion, contrast, and forced colors

**Sourced facts.** `prefers-reduced-motion` is widely available and expresses a request to reduce, remove, or replace non-essential motion [R10]. `forced-colors` is widely available; it may force paint-time values and remove `box-shadow`, so relying on glow/shadow alone for affordances fails [R11]. `prefers-contrast: more` is also widely available [R12].

**Counterevidence / failure mode.** “Reduced motion” cannot mean “the scene became inert or its meaning disappeared.” Forced colors can erase SVG fill/stroke choices and CSS shadows even where the normal visual hierarchy appears excellent.

**Recommendation.** Put accessibility mode in the authored scene contract, not a post-hoc CSS reset:

- **Full motion:** small ambient opacity/transform changes, never motion as the only signal.
- **Reduced motion:** no camera pans/parallax/auto-travel; replace movement with fades, static composition, progress text, and explicit “continue” controls.
- **Still / low power:** no continuous animation or Canvas; scene changes occur only after a guest action.
- **Forced colors:** keep semantic text and native controls visible; add outlines/borders using system colors where a normal design needs glow/shadow; test SVG labels and focus indicators.
- Offer an in-app setting that can be more restrictive than the OS preference. It is not a substitute for honoring the OS setting by default.

### 5. Performance, responsiveness, and low-power operation

**Sourced facts.** Current Core Web Vitals targets are LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1 at the 75th percentile of mobile and desktop page loads [R13]. A main-thread task over 50ms is a long task and can delay interaction [R14].

**Inference.** The shared visual runtime is far more likely to make or break the experience than a sophisticated renderer: an impressive effect that delays the first controllable response violates the project’s core promise.

**Responsive and low-power route (engineering recommendation).** Author every scene as the same semantic content with two spatial compositions—compact/touch and wide/desktop—not as two different mechanics. Let normal document flow keep copy, controls, captions, and the destination list reachable at any viewport; SVG may reframe the visual map but cannot hide the corresponding DOM destination. Test a compact 360–390 CSS-pixel viewport, a tablet-width viewport, and a desktop width before treating a scene as done.

Low-power should be an explicit, immediately available guest setting rather than a fragile inference from hardware or network hints. It sets a capability ceiling: Canvas animation stops, assets remain lazy, audio remains optional, heavy effects do not initialize, and the exact same reducer actions/finale are retained. If a browser capability is absent or a rendering setup errors, automatically select this authored fallback and expose a concise status message only when it affects a guest-visible choice.

**Recommended implementation budgets (project targets, not platform standards).**

| Budget | Target | Enforcement intent |
| --- | --- | --- |
| Arrival route | HTML/CSS plus only the code needed to light the star and enter the park | Load scene-specific code/assets after a destination is chosen. |
| Main thread | No intentional synchronous work > 50ms; chunk non-critical procedural setup | Profile representative low-power mode; do not rely on timers for story correctness. |
| Canvas | One active canvas, DPR capped (for example `min(devicePixelRatio, 1.5)`), and a low-power/off path | Prevent oversized backing buffers and excessive overdraw. |
| Motion | 60fps is a best-effort visual target, not a correctness requirement; 30fps or static is valid low-power output | State evolves from named actions, not frame count. |
| Layout | Reserve media dimensions and avoid late font/image movement | Protect the CLS target. |
| Assets | SVG/procedural/code-authored first; lazy-load optional scene ambience | Do not download every park asset at arrival. |

**Recommendation.** Use `performance.mark()` around arrival-ready and first-choice feedback; use browser DevTools plus a small test fixture to inspect main-thread long tasks. Record lab evidence separately from later field/Core Web Vitals data.

### 6. Offline, PWA, and local storage

**Sourced facts.** A service worker can intercept requests and serve cached responses, but it operates asynchronously without DOM access and requires a secure context [R17]. Browser storage is best-effort by default; cache/IndexedDB records may be evicted without asking, and Safari may proactively evict script-created data after seven days without user interaction when its cross-site tracking prevention is on [R18]. IndexedDB is an asynchronous transactional store for larger structured client-side data [R19].

**Counterevidence / failure mode.** A service worker adds lifecycle/update behavior: a newly installed version can wait while existing pages use the old one [R17]. Therefore “offline exists” is not a reason to add a complex cache before the core route is stable. A saved finale must never be the guest’s only route to re-enter the park because browser storage can vanish.

**Recommendation for 48 hours.**

1. Make the online static app self-contained and deterministic first.
2. Persist a small `AsteriaSaveV1` JSON record (`schemaVersion`, `seed`, `state`, `settings`, `updatedAt`) after meaningful actions. Catch storage failures and continue in memory.
3. Add a “start fresh / replay” path that always works without a previous save. Do not use cookies or account identity for progress.
4. Only after the critical route and cache-update tests are green, add a manifest plus a root-scoped service worker that precaches the shell and arrival assets. Cache a destination’s optional ambience after that destination is entered; do not precache the whole park by default.
5. On a later release, use IndexedDB if keepsakes, replay logs, or offline media grow beyond a tiny save record. Check quota errors and treat persistence requests as optional.

### 7. Deterministic guest state

**Sourced constraints informing the design.** Rendering can pause in background tabs [R15] [R16]; GPU contexts can be lost [R03]; browser storage can be evicted [R18]. None of those platform lifecycles provides a stable state authority.

**Recommendation (engineering inference).**

```text
GuestStateV1
  schemaVersion
  seed                 // fixed once at arrival
  route                // current scene + entered attractions
  motifs               // small named values earned through play
  choices              // compact authored choice records
  finaleRecipe         // derivable from seed + motifs + choices
  settings             // sound, motion, low-power, captions
  revision             // monotonic save/reducer revision

Action
  ENTER_REALM | INTERACT | CHOOSE | COMPLETE_ATTRACTION |
  SET_SOUND | SET_MOTION | SET_LOW_POWER | RESET | MIGRATE
```

- `reduce(state, action)` is pure and testable; it returns the next state or a typed rejected action.
- A tiny seeded PRNG is created from `state.seed` at the point of derivation, never stored as a live mutable renderer object.
- Audio/canvas/DOM effects receive a `SceneProjection` derived from state. They cannot directly mutate motifs or finale data.
- Persist either a validated full snapshot or a snapshot plus a compact action log—not a WebGL context, an `AudioNode`, an animation timer, or an arbitrary React component tree.
- Include `schemaVersion` and a pure `migrate()` before any storage read is accepted.

This makes “the park noticed how I played” reproducible in tests: same seed plus same action sequence must create the same finale projection on every supported fallback.

### 8. Testing and evidence strategy

**Sourced facts.** Playwright can emulate reduced motion, forced colors, and contrast media preferences [R20]. It can compare ARIA snapshots and visual screenshots [R21] [R22]. Its own documentation warns that visual baselines vary by host OS, version, hardware, power source, and headless mode [R22].

**Recommendation.**

| Layer | Automated check | What it proves | What it does not prove |
| --- | --- | --- | --- |
| State | Vitest: reducer, seed reproducibility, migration, save validation, different-history/different-finale contract | Deterministic content contracts | Browser rendering/audio/device behavior |
| Components | DOM semantic assertions and focused accessibility-tree snapshots | Roles, names, structure, state labels | Screen-reader usability in every AT/browser pair |
| Critical route | Playwright desktop and mobile: Arrival -> three attractions -> finale | Route and interaction flow in supported automated browsers | Real device GPU/audio policy/assistive-tech quality |
| Input | Playwright keyboard-only actions and pointer/touch-oriented flows | Focus order and action parity | Hardware gamepad mapping and real touch ergonomics |
| Preferences | Playwright `emulateMedia` for `reducedMotion`, `forcedColors`, and `contrast` | Authored CSS/DOM fallback branches | OS/browser rendering quirks outside the test engine |
| Visual | Fixed-environment screenshot baselines after functional closure | Regression signal in that controlled environment | Cross-platform visual acceptance or accessibility conformance |
| Manual | Fresh-profile browser plus at least one actual mobile device: first sound activation, mute, low-power, forced colors/reduced motion where available | Observed user-agent/device behavior | Broad population metrics |

Recommended failure fixtures: Canvas disabled; WebGL context loss if any WebGL enhancement ships; storage write throws; autoplay resume rejects; save schema old/corrupt; `prefers-reduced-motion: reduce`; forced colors active; small viewport; background then foreground; no gamepad; and low-power toggle before the first scene.

## Minimal runtime shape

```text
App shell (React DOM)
  ├─ Route / focus / dialog / settings / captions (semantic HTML)
  ├─ Park state store (pure reducer + selector/projection functions)
  ├─ Scene modules (lazy-loaded authored scene data + DOM/SVG composition)
  │    └─ Optional AmbientCanvas2D (visual-only, disposable)
  ├─ Input adapters (native click/keyboard first; Pointer/Gamepad optional)
  ├─ Audio controller (silent until opt-in; visual equivalent always present)
  ├─ Save adapter (versioned localStorage; no-blocking failure path)
  └─ Platform adapter (visibility, media preferences, feature detection)
```

The key boundary is intentional: React/DOM state makes the route legible; SVG/canvas/audio decorate a projection of that state. No visual technology owns irreversible story progress.

## Suggested 48-hour technical sequencing

| Window | Deliverable | Stop condition |
| --- | --- | --- |
| 0–6h | Scaffold, reducer/state contracts, semantic Arrival, persistence failure fallback | Same seed/action test passes; keyboard guest can light the star and enter. |
| 6–16h | Park map + one attraction + visible consequence + miniature finale | E1, E2, and one E3 variant are observable with Canvas/audio disabled. |
| 16–30h | Remaining authored attractions and deterministic finale composition | Three attraction routes and differing histories produce differing finale projections. |
| 30–38h | Audio opt-in, 2D ambience, low-power/reduced-motion/forced-colors branches | No route block when audio is denied or Canvas is disabled. |
| 38–43h | Vitest and Playwright matrix, scoped performance profiling | Regressions are automated; browser QA gaps are written down. |
| 43–48h | Batch screenshot/manual device checks, optional minimal PWA cache, deployment verification | Offline/PWA is included only if it has separate passing update/offline evidence. |

This sequencing makes spectacle additive: the first six hours establish a park that remains coherent if every optional browser capability fails.

## Open uncertainties / follow-up spikes

1. **Asset budget.** No project-specific real-device byte/CPU budget has been measured. Run a constrained-device arrival spike before committing a numeric bundle cap.
2. **Audio palette.** Generative Web Audio keeps assets original and small, but its perceived quality and device-level volume behavior need an actual-device listening check.
3. **PWA value.** Determine whether offline is required for the first public release or is simply resilience. The implementation cost is small only if cache/version behavior remains narrow and independently tested.
4. **WebGL/WebGPU visual value.** Do not investigate until a DOM/SVG/Canvas vertical slice exposes a specific visual requirement that cannot meet the emotional goal. Any spike must prove a graceful fallback, GPU context/device failure behavior, and no critical-path dependency.
5. **Gamepad design.** Browser availability is improving, but its input mapping should be evaluated after keyboard/touch interaction has settled; it should not drive the core UI model.

## Raw source records

### R01 — Canvas semantic and device constraints

- Source title: `<canvas>: The Graphics Canvas element`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Canvas is a bitmap without semantic exposure of drawn objects; meaningful canvas content needs a non-canvas equivalent/fallback. Canvas dimensions can become unusable when a device/browser limit is exceeded; the page notes a 4096px iOS maximum dimension.
- Status: confirmed

### R02 — Inline SVG accessibility and scalability mechanism

- Source title: `SVG in HTML introduction`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_in_HTML
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Inline SVG is source-visible in the DOM/AOM; `title`, `desc`, and `aria-labelledby` can provide accessible descriptions, while `viewBox` establishes a scalable logical coordinate system.
- Status: confirmed

### R03 — WebGL context loss

- Source title: `HTMLCanvasElement: webglcontextlost event`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event
- Source update date: 2026-07-28
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: A WebGL drawing buffer can be lost and emits `webglcontextlost`; application code can attach a handler and test the condition.
- Status: confirmed

### R04 — WebGPU capability and availability boundary

- Source title: `WebGPU API`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- Source update date: 2026-05-05
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: WebGPU offers high-performance graphics and general-purpose GPU computation but is secure-context-only and marked Limited availability because it does not work in some widely used browsers.
- Status: confirmed

### R05 — Audio autoplay and Web Audio activation

- Source title: `Autoplay guide for media and Web Audio APIs`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Audible media and Web Audio initiation outside a user input handler can be blocked; muted content and prior interaction change the policy conditions, which vary by browser.
- Status: confirmed

### R06 — Unified pointing input

- Source title: `Pointer events`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Pointer Events provides a single DOM event model for mouse, pen/stylus, and touch while retaining device type information when needed.
- Status: confirmed

### R07 — Touch gesture and zoom boundary

- Source title: `touch-action CSS property`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action
- Source update date: 2026-04-20
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: `touch-action` declares browser/page gesture handling; `touch-action: none` can inhibit browser zoom and create an accessibility problem.
- Status: confirmed

### R08 — Rich UI keyboard and high-contrast practice

- Source title: `Introduction — ARIA Authoring Practices Guide`
- Publisher: W3C Web Accessibility Initiative
- Canonical URL: https://www.w3.org/WAI/ARIA/apg/about/introduction/
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: standards-body implementation guidance
- Claim considered: APG covers accessible names, keyboard interaction, structural semantics, and high-contrast support for rich interfaces; it is informative guidance rather than a conformance standard.
- Status: confirmed

### R09 — Gamepad availability and connection behavior

- Source title: `Window: gamepadconnected event`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/gamepadconnected_event
- Source update date: 2025-05-02
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: `gamepadconnected` is newly baseline as of December 2025 for latest devices but may not work on older devices; it can also be constrained by Permissions Policy.
- Status: confirmed

### R10 — Reduced-motion preference

- Source title: `prefers-reduced-motion CSS media feature`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion
- Source update date: 2026-06-10
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: The media feature expresses that the user has requested non-essential motion to be reduced, removed, or replaced; it is Baseline widely available.
- Status: confirmed

### R11 — Forced colors behavior

- Source title: `forced-colors CSS media feature`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors
- Source update date: 2026-04-20
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Forced colors can apply a limited user-selected palette and force properties such as shadows at paint time; targeted usability fixes should preserve user choices.
- Status: confirmed

### R12 — Contrast preference

- Source title: `prefers-contrast CSS media feature`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-contrast
- Source update date: 2026-04-20
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: `prefers-contrast` detects a request for lower or higher contrast and is Baseline widely available.
- Status: confirmed

### R13 — Core Web Vitals targets

- Source title: `Web Vitals`
- Publisher: web.dev / Google
- Canonical URL: https://web.dev/articles/vitals
- Source update date: 2024-10-31
- Access date: 2026-08-01 JST
- Source class: browser-vendor primary guidance
- Claim considered: Current targets are LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1, assessed at the 75th percentile segmented by mobile and desktop.
- Status: confirmed

### R14 — Long main-thread tasks

- Source title: `Optimize long tasks`
- Publisher: web.dev / Google
- Canonical URL: https://web.dev/articles/optimize-long-tasks
- Source update date: 2024-12-19
- Access date: 2026-08-01 JST
- Source class: browser-vendor primary guidance
- Claim considered: Main-thread tasks longer than 50ms are long tasks and can block user interaction; work should be broken up where practical.
- Status: confirmed

### R15 — Page visibility and background throttling

- Source title: `Page Visibility API`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Visibility changes are available to pages; most browsers stop animation frames and throttle timers in hidden/background contexts. Audio resumption requires user-agency care.
- Status: confirmed

### R16 — Animation-frame timing

- Source title: `Window: requestAnimationFrame() method`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Animation callbacks generally track display refresh rate, pause in most hidden tabs, and should use the supplied timestamp so animation speed does not vary with refresh rate.
- Status: confirmed

### R17 — Service worker boundary and lifecycle

- Source title: `Service Worker API`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Service workers intercept requests and enable offline caching, require HTTPS/secure contexts, have no DOM access, and use an install/waiting/activation lifecycle that needs deliberate update handling.
- Status: confirmed

### R18 — Storage durability and eviction

- Source title: `Storage quotas and eviction criteria`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: Browser storage is best-effort by default; Cache/IndexedDB can be silently evicted under storage pressure, and Safari has proactive eviction conditions. Persistent storage may be requested but is an opt-in enhancement.
- Status: confirmed

### R19 — IndexedDB data model

- Source title: `IndexedDB API`
- Publisher: MDN Web Docs
- Canonical URL: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Source update date: not visible in retrieved page
- Access date: 2026-08-01 JST
- Source class: primary platform documentation
- Claim considered: IndexedDB is asynchronous transactional client-side storage for significant structured data/files; it is more appropriate than Web Storage when the save/content model grows.
- Status: confirmed

### R20 — Preference emulation in Playwright

- Source title: `Page — emulateMedia`
- Publisher: Playwright
- Canonical URL: https://playwright.dev/docs/api/class-page
- Source update date: live reference page; no page date shown
- Access date: 2026-08-01 JST
- Source class: official tool documentation
- Claim considered: Playwright can emulate `prefers-reduced-motion`, `forced-colors`, and `prefers-contrast` for browser tests.
- Status: confirmed

### R21 — Accessibility-tree snapshots

- Source title: `Snapshot testing`
- Publisher: Playwright
- Canonical URL: https://playwright.dev/docs/aria-snapshots
- Source update date: live reference page; no page date shown
- Access date: 2026-08-01 JST
- Source class: official tool documentation
- Claim considered: Playwright can assert YAML representations of the accessibility tree, complementing targeted DOM assertions.
- Status: confirmed

### R22 — Visual comparison limits

- Source title: `Visual comparisons`
- Publisher: Playwright
- Canonical URL: https://playwright.dev/docs/test-snapshots
- Source update date: live reference page; no page date shown
- Access date: 2026-08-01 JST
- Source class: official tool documentation
- Claim considered: Playwright supports screenshot comparison but warns that rendering varies by OS, browser version, settings, hardware, power source, and headless mode.
- Status: confirmed
