# Project MORROWLIGHT

## Mission

Create the best theme park that can exist natively on the open web: an authored, explorable night of wonder that feels playful in seconds, rewards curiosity for an hour, and leaves each guest with a personal finale worth sharing.

Working title: **MORROWLIGHT — The Park Between Tomorrows**.

This is not a marketing site for a hypothetical physical park. The website is the park.

## Experience north star

The guest arrives at dusk carrying a small unlit star. They explore a living park whose realms each embody a different hopeful future, make expressive choices rather than answer quizzes, and transform both the park and their star. At midnight, their accumulated actions compose a short personalized sky-parade and keepsake.

The memorable promise is: **“The park noticed how I played.”**

## Non-negotiable design principles

1. **Wonder before explanation.** The first delightful response happens within ten seconds.
2. **A park, not a page.** Movement, spatial memory, attractions, hidden details, anticipation, and a finale form one guest journey.
3. **Agency leaves traces.** Meaningful actions change later sights, sound, and the finale.
4. **Layered participation.** Browsing, playing, discovering, and mastering are all valid; no login is required.
5. **Generous accessibility.** Keyboard, touch, mouse, reduced motion, high contrast, captions, mute, and low-power modes are first-class authored experiences.
6. **Original by construction.** Visuals, language, worlds, sound, and characters are created for this project; outside work informs principles only.
7. **Fast enough to feel magical.** The opening route is small, resilient, and progressively enhanced.

## Initial park shape

- **Emberwake Gate:** a cinematic but skippable dusk-to-night opening and immediate tactile “light your star” moment.
- **Bloomworks:** a kinetic garden where rhythm and arrangement awaken a cooperative machine-ecosystem.
- **Driftglass Sea:** a dreamy navigation attraction about guiding lost lights through sound, current, and reflection.
- **The Cabinet of Near Things:** interactive exhibits containing playful futures that were nearly invented; observation changes them.
- **Windthread:** a high, wind-swept traversal space built around timing, perspective, and controlled exhilaration.
- **The Constellary:** a personalized parade in the sky that recombines motifs earned across the park.

Names and mechanics remain working material until the concept gate, but the north star above is fixed unless evidence shows a serious usability, originality, or feasibility problem.

## Completion definition

The first public release is complete only when all of the following are observed:

- A new guest can enter, understand how to act, visit at least three distinct attractions, and reach the finale without instructions outside the experience.
- Earlier actions visibly or audibly influence later scenes and the finale.
- A coherent 5-minute route and a rewarding 30–60 minute discovery route both exist.
- Desktop and mobile layouts pass the defined critical-path E2E checks.
- Keyboard-only and reduced-motion critical paths pass; audio is optional and captioned or visually represented.
- The opening experience remains usable on constrained hardware via an authored low-power fallback.
- Original-asset provenance is documented.
- Browser QA includes batched screenshots at representative desktop and mobile sizes.
- A production Cloudflare URL is live, and the live critical path is separately verified.
- The repository, task ledger, research synthesis, decisions, test evidence, and handoff are current.

## Technical direction

Default until disproven by a short spike:

- TypeScript, React, and Vite for the application shell.
- A custom 2D scene system using DOM/SVG/Canvas where each is strongest; no framework is selected merely for spectacle.
- Web Audio API for generative sound with an equivalent mute/visual route.
- Deterministic seeded guest state stored locally; server persistence is optional and must not block the core journey.
- Cloudflare Workers static assets for deployment. D1, R2, Durable Objects, or Analytics are added only when an evaluated capability requires them.
- Playwright for critical browser paths; Vitest for deterministic state and content contracts.

## Accounts and resource boundary

See `docs/accounts.md`. The minimum is the existing GitHub account plus the existing Cloudflare account. No asset-library, social, stock-media, or inspiration-gathering account is required.

## Active execution source

Read `docs/imp/master-plan.md` for live state, owners, checks, and the exact next action.
