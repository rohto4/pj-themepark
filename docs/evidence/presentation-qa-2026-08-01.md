# MORROWLIGHT product presentation QA — 2026-08-01 JST

Target: `docs/presentations/morrowlight-why-best.html`

## Verdict

**Pass.** The standalone Japanese presentation explains MORROWLIGHT's product thesis, guest
journey, attraction portfolio, consequence system, five-act finale, production evidence, and
honest verification boundary. It works as a normal scrolling document and as a keyboard-operable
presentation view without an external runtime dependency.

## Structure and source checks

- Seven presentation sections and seven matching chapter links were parsed from the HTML.
- IDs are unique; internal anchors resolve; all three local screenshot references exist.
- Every screenshot has alternative text.
- The inline JavaScript parses successfully.
- The artifact uses the project blueprint, visual-system record, asset manifest, functional
  closure, browser QA, and live-deployment evidence as its source boundary.
- The live experience, local evidence, asset manifest, and project promise are linked from the
  final section.

## Browser observations

Playwright Chromium opened the local HTML at these viewports:

| Viewport                  | Sections/images | Horizontal overflow | axe WCAG A/AA | Console/page/request errors | Controls |
| ------------------------- | --------------- | ------------------- | ------------- | --------------------------- | -------- |
| 1440 × 900 desktop        | 7; 3/3 loaded   | 0 px                | 0 violations  | 0 / 0 / 0                   | Pass     |
| 768 × 1024 reduced-motion | 7; 3/3 loaded   | 0 px                | 0 violations  | 0 / 0 / 0                   | Pass     |
| 375 × 812 mobile          | 7; 3/3 loaded   | 0 px                | 0 violations  | 0 / 0 / 0                   | Pass     |

Observed interactions:

- presentation mode toggles and exposes its pressed state;
- previous/next controls update the chapter and `1 / 7` progress readout;
- the sticky chapter bar navigates without being covered by the variable-height header;
- keyboard `End` reaches chapter `7 / 7`;
- the 60-second pitch copy action provides visible and live-region feedback;
- narrow-screen horizontal regions are keyboard-focusable and show a focus outline.

## Visual review

- The first view establishes the thesis before metrics or implementation detail.
- The original inline orbit diagram makes the four-realm-to-one-finale relationship legible.
- The attraction chapter keeps five distinct verbs and consequences comparable in one table.
- The three real P6 screenshots are readable as evidence rather than decorative mockups.
- The 375 px composition reduces the sticky header from 194 px to 125 px and retains the thesis,
  navigation, controls, and orbit diagram without document overflow.
- Print styling keeps the information readable without presentation controls.

The visual review fixed two observed issues before the pass: the sticky header intercepting chapter
navigation, and non-focusable horizontal regions on narrow screens.

## Evidence boundary

- Browser QA is Chromium-only; it is not Safari, Firefox, screen-reader, or physical-device
  certification.
- The clipboard result can depend on browser permissions, but the document includes a local-file
  fallback and an explicit failure message.
- The presentation references three repository screenshots rather than embedding their binary data,
  so the HTML should stay beside the repository `docs/evidence/screenshots/` directory.
