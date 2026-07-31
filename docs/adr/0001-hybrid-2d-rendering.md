# ADR 0001: Use hybrid semantic DOM, SVG, and Canvas 2D rendering

Status: Accepted; technical spike remains a validation gate  
Date: 2026-08-01

## Context

Morrowlight needs spatial wonder, responsive attraction mechanics, authored typography, accessibility, mobile support, and a low-power path within a 48-hour build. A full 3D engine can provide depth but increases asset, camera, input, performance, loading, browser, and accessibility risk.

## Decision

Use semantic React/DOM for the application and accessible controls, SVG for map/illustration/keepsake, and Canvas 2D for dense animated attraction layers. Depth will be achieved through layered composition, parallax, light, scale, and sound. Do not make WebGL or WebGPU a baseline dependency.

## Consequences

- One state model can drive accessible UI and visual layers.
- The park remains authored on low-power and reduced-motion routes.
- We trade free-camera 3D spectacle for illustration quality, faster iteration, smaller surface area, and more reliable testing.
- An isolated 3D effect remains possible after profiling, but must not own navigation or core progress.

## Validation

The vertical slice must demonstrate one map transition, one attraction with at least 300 animated marks at full quality, a reduced-motion equivalent, keyboard completion, and stable representative desktop/mobile interaction.
