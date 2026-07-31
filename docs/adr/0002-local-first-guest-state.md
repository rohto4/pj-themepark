# ADR 0002: Keep the core guest journey local-first and account-free

Status: Accepted  
Date: 2026-08-01

## Context

The defining capability is personalized consequence across one browser journey. Requiring authentication or server persistence would delay first wonder, add privacy/security operations, and make the experience depend on infrastructure that is not necessary for the emotional loop.

## Decision

Store a validated, versioned, deterministic guest state locally. Generate keepsakes and night codes client-side. The core park has no sign-in and no server write path.

## Consequences

- The minimum resource set remains GitHub plus one Cloudflare hosting project.
- Clearing site data loses local nights unless the guest saved a night code/keepsake.
- Multi-device continuity and communal park state are excluded from the first release.
- Any later shared feature receives a separate capability, privacy, abuse, moderation, retention, and infrastructure gate.

## Validation

Reducer determinism, save migration, corrupt payload recovery, night-code round trip, reload resume, and finale stability must pass automated checks.
