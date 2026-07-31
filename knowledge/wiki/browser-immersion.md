# Browser-native immersion

Synthesized: 2026-08-01 JST  
Evidence detail: `knowledge/raw/browser-immersion-research.md`

## Confirmed platform boundaries

- Canvas drawings do not create a semantic object model; meaningful content and controls need DOM equivalents. [MDN Canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas)
- Web Audio and audible media started outside user input can be blocked by browser autoplay policy. [MDN Autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- `prefers-reduced-motion`, `forced-colors`, and `prefers-contrast` expose user display preferences; forced colors may remove shadows/glows relied on by a normal design. [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion), [MDN forced colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors)
- Animation frames and timers can pause/throttle in hidden pages, so frame count cannot own story state. [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- Browser storage is best-effort and can be evicted; persistence cannot be the only route back into the experience. [MDN storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- Playwright can emulate relevant media preferences and assert ARIA/visual snapshots, while its own docs warn that screenshot output varies by environment. [Playwright API](https://playwright.dev/docs/api/class-page), [visual comparisons](https://playwright.dev/docs/test-snapshots)

## Accepted architecture

- Semantic React/DOM owns route, controls, focus, names, status, and all consequential choices.
- Inline SVG owns the living map, scalable authored scene art, route threads, and keepsake.
- Canvas 2D is optional ambience/projected feedback only; turning it off cannot remove a goal, control, clue, consequence, or finale outcome.
- WebGL/WebGPU are excluded from the first critical path.
- Web Audio starts only after deliberate opt-in and mirrors meaningful events visually.
- A pure deterministic reducer is state authority. Browser APIs and renderers consume projections.
- A tiny validated localStorage save is best effort; the app remains playable when storage throws or disappears.
- PWA/service-worker work is optional after the online route and update lifecycle are separately green.

## Quality targets

Use Core Web Vitals thresholds as external reference points, keep deliberate main-thread tasks under 50 ms, lazy-load scenes after arrival, cap Canvas resolution, and make low-power mode an explicit capability ceiling rather than guessed device discrimination.

## Remaining implementation evidence

Actual bundle size, frame behavior, audio quality, storage recovery, semantic route, device ergonomics, and PWA value remain unproven until the vertical slice and browser QA.
