# MORROWLIGHT local browser QA

Recorded: 2026-08-01 01:53 JST  
Target: local MORROWLIGHT Vite runtime at `http://127.0.0.1:4317/` plus project-owned Playwright servers  
Engine: Chromium only

## Verdict

**Local P4 pass.** Four visual/accessibility defects were found through rendered-page observation, fixed, converted to durable geometry/order regressions, and rechecked. No known critical visual defect remains in the observed Chromium routes. Live Cloudflare and cross-engine behavior remain separate boundaries.

## Observed journeys and viewports

- 1440 × 900: arrival, map, Bloomworks before/after transformation, three-attraction route, Constellary, and keepsake transition.
- 768 × 900: map composition and responsive progress treatment.
- 390 × 844 (375px document content width): arrival, map, Night Code return, and keepsake.
- Real browser audio opt-in changed the visible status to `The generative score is awake`; muting succeeded and produced no console warning/error. Artistic listening quality was not assessable by the agent.
- The SVG download event and filename are covered by the repeated Playwright route.

## Findings fixed during the pass

1. Mobile arrival content was clipped without creating a horizontal scrollbar because the unbreakable display title expanded its grid item. The copy now has a shrinkable boundary and an authored mobile type scale.
2. The mobile map progress star inherited `flex: 1`, enlarged the progress capsule, and obscured lower destination cards. The progress copy now has its own precise class and the star retains its intended size.
3. Mobile Constellary copy and the four-column pulse grid expanded past the 375px content width. The copy is shrinkable, the mobile conductor uses two columns, and long motifs wrap.
4. Mobile map visual order differed from DOM/Tab order, making focus jump Bloomworks → Driftglass → Cabinet up and down the page. The mobile map is now an authored DOM-order route list over the spatial illustration; route top positions increase monotonically.

The project Playwright server also moved from port 4173 to 4318 after the QA run correctly detected an unrelated local app already using 4173. The unrelated process was not stopped or modified.

## Smoke, interaction, and accessibility evidence

- In-app browser console warnings/errors: 0 after the full observed route and audio opt-in/out.
- Independent Chromium audit at 1440/768/375: console errors, page errors, failed requests, and HTTP 4xx/5xx were all 0 across 15 sampled source scenes.
- Local root HTTP check returned 200.
- A fresh production `dist` preview at 1440/768/375 loaded four resources totaling 158,443 bytes (JS 77,737; CSS 9,490; two loaded fonts 71,216). Loopback DCL/load was 22–26 ms with no throttling, so it is a transfer/build observation rather than a real-user performance rating.
- Full repository gate after the fixes: Prettier, ESLint, TypeScript, 83 Vitest tests, production build, and 12/12 desktop/mobile Playwright routes passed.
- Official `@axe-core/playwright` 4.11.3 now scans arrival, map, and Constellary in both Playwright projects against WCAG 2 A/AA and 2.1 A/AA tags. Observed automated violations: 0.
- Accessibility-tree observation found named banner/main/contentinfo landmarks, named scene regions, destination actions, attraction groups/status, and all four conductor actions.
- Keyboard route still reaches scene completion and moves focus to the new scene heading. Headings focused programmatically do not receive a decorative ring; they are non-interactive context targets and the full scene/title change remains the orientation cue.
- Sampled opaque text colors had a simple minimum ratio of 7.31:1 against the base night color. Because several surfaces use gradients and transparency, this is supporting evidence, not a formal contrast certification.

## Screenshots

- [Desktop arrival](browser-qa/desktop-arrival.png)
- [Desktop map](browser-qa/desktop-map.png)
- [Bloomworks transformed](browser-qa/desktop-bloomworks-transformed.png)
- [Desktop Constellary](browser-qa/desktop-constellary.png)
- [Tablet map](browser-qa/tablet-map.png)
- [Mobile arrival](browser-qa/mobile-arrival.png)
- [Mobile map](browser-qa/mobile-map.png)
- [Mobile keepsake](browser-qa/mobile-keepsake.png)

## Evidence boundary

- This is one Chromium engine on local loopback; it is not Safari/Firefox or live-network evidence.
- Axe detects only a subset of accessibility failures and does not replace assistive-technology testing.
- The deep route is branch-complete in automation, but no literal 30–60 minute human dwell session has been observed.
- Production resource transfer and live Cloudflare checks are recorded separately.
