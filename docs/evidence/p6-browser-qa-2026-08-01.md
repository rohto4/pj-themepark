# P6 browser QA evidence — 2026-08-01 JST

## Scope and verdict

This is the post-functional-closure browser review for the Bloomworks return hook and the revised
five-act Constellary. It is local Chromium evidence against `http://127.0.0.1:4318`, not live
Cloudflare evidence.

Local release verdict: **SHIP to the controlled Cloudflare deployment gate**. No known critical
visual, keyboard, overflow, accessibility-rule, console, runtime, or request defect remains in the
observed P6 surfaces.

## Final observed gate

Commands:

- `npm.cmd run check`
- `npm.cmd run check:assets`
- `npm.cmd run qa:visual`

Observed result after all fixes:

- format, ESLint, TypeScript, and production build: pass;
- Vitest: 20 files / 115 tests pass;
- Playwright functional routes: 24/24 pass across desktop and mobile Chromium projects;
- asset budget: 11 files / 457.17 KiB pass;
- visual QA batch: 3/3 pass at 1440×900, 768×1024, and 375×812.

The added keyboard route starts from a valid overnight carry, uses Tab with alternating Enter and
Space activation through the Bloom reply, completes two later realms, conducts all five acts, and
reaches the Night Chart. It passes in both desktop and mobile projects.

## Batched browser observations

Each width captured the return hook, Constellary recognition, and the resolved Constellary with its
Night receipt open. The visual fixture separately recorded the return and finale widths, all five
beat geometry IDs and SVG mark counts, and the following browser signals:

- axe WCAG 2/2.1 A/AA violations: 0 for return hook, recognition, and open receipt;
- console errors and warnings: 0;
- uncaught page errors: 0;
- HTTP responses at or above 400: 0;
- failed requests: 0;
- horizontal overflow: 0 for return hook, recognition, and open receipt at all three widths;
- the unfocused skip link is clipped to 1×1 px; the functional keyboard test separately observes it
  becoming visible and focused on Tab.

The five semantic beats were not inferred from labels: awakening, gathering, recognition, climax,
and release each exposed a non-empty SVG geometry in the real browser. Recognition used the
persisted `bloom-constellary-bridge-4-dawn-bridge-wander` projection in the fixed fixture.

Representative files:

- [desktop recognition](screenshots/p6-finale-desktop-1440.png)
- [mobile recognition](screenshots/p6-finale-mobile-375.png)
- [mobile open receipt](screenshots/p6-finale-receipt-mobile-375.png)
- [mobile return hook](screenshots/p6-return-mobile-375.png)
- [desktop browser signals](screenshots/p6-browser-qa-desktop-1440.json)
- [tablet browser signals](screenshots/p6-browser-qa-tablet-768.json)
- [mobile browser signals](screenshots/p6-browser-qa-mobile-375.json)

Manual inspection found the return memory legible without overwhelming the new root instrument;
the five-act performance remains the finale's primary hierarchy; the folded receipt opens into a
readable authored list; and the 375 px composition has no observed collision, clipped control, or
unintended horizontal scroll.

An independent read-only audit reviewed the post-fix diff, all three JSON reports, and all nine
PNGs. Its local verdict was GO with no P0/P1 finding. Non-blocking P2 observations were the subtle
afterimage, intentionally truncated stage detail copy, representative rather than per-act PNGs,
and the absence of cross-engine, assistive-technology, human-audio, and literal dwell evidence.

## Defects found and closed during the batch

1. The raw motif ledger dominated the performance. It is now a folded Night receipt with authored
   language; raw IDs remain only as testable data attributes.
2. A transformed off-screen skip link appeared as a full-page screenshot stitching artifact. The
   default state now uses the canonical clipped 1×1 pattern and restores the visible fixed control
   only on focus.
3. The status sentence repeated `enters the sky`. The conductor now treats authored act titles as
   complete sentences, with a regression assertion.
4. Four palette properties used by older and P6 styles were undeclared. They now have explicit root
   values, and a repository test rejects any future unresolved CSS custom property, including
   properties supplied by authored inline geometry.
5. The first visual-test location was discoverable by Vitest. Runner boundaries now explicitly
   separate unit, functional E2E, and visual-capture suites.

## Evidence boundaries

- The screenshot fixture uses valid localStorage fixtures to make the exact visual states
  repeatable. The separate return-night functional route creates the carry through public UI,
  reloads, answers it, and reaches the changed finale.
- This is Chromium evidence. It is not Safari, Firefox, screen-reader, or physical touch-device
  certification.
- Automated playback proves reachability and semantic equivalence, not human listening quality or
  a literal 30–60 minute dwell. Those two human observations remain explicitly unclaimed.
- Live Worker behavior, deployment identity, and rollback availability are recorded only after the
  next deployment gate.
