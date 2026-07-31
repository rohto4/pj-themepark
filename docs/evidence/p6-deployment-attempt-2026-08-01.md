# P6 deployment attempt evidence — 2026-08-01 JST

## Candidate identity

- Candidate commit: `5b7278abcef058c19ab59c1355647414afd37ebb`.
- GitHub `origin/main`: aligned to the same commit.
- Local release gate: 20 Vitest files / 115 tests, 24/24 Playwright routes, 11 files /
  457.17 KiB asset budget, and 3/3 visual QA projects.
- Independent post-fix local audit: GO, no P0/P1 finding.

## Deployment result

Command: `npm.cmd run deploy` using Wrangler 4.118.0 against the existing
`morrowlight-theme-park` Worker.

Result: **no deployment was created**. Cloudflare rejected the deployments API request before an
upload with authentication error code 10000. The effective encrypted OAuth credential exposes
`user:read`, `account:read`, `workers:write`, and `offline_access`; Wrangler reports the additional
named scope `workers_scripts:write` as missing for this endpoint.

No scope was added, no credential was copied into the repository or logs, and no Cloudflare
resource, route, binding, domain, or setting was changed. The project rule requires explicit user
authorization for this named persistent scope.

## GUI fallback boundary

The logged-in Edge window was selected only for a read-only dashboard check. Windows Computer Use
stopped before exposing or confirming the browser URL, so no browser click, text entry, upload,
authorization, or deployment action occurred. Coordinates and stale window state were not reused.

## Public baseline health

Read-only HTTP HEAD after the rejected deployment returned `200 OK` from:

`https://morrowlight-theme-park.rohto-1111176221.workers.dev`

Observed response included the existing CSP, Permissions Policy, strict referrer policy,
`X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`. The response ETag was
`"648f39b4f5c865e78e7741aa8b03c399"`.

The last confirmed Cloudflare inventory remains the P0–P5 source
`b48aa415a51e5999aa572ab7b9273052c5ae411d`, Worker version
`8eea7f8c-3ce6-445a-a89b-bf006bbc3fe8`, deployment
`f330b976-5ac2-4134-a43d-8957fb6facc2`. The successful HEAD proves availability, not a new source
identity; the failed API request and absence of any upload mean P6 must not be reported live.

## Exact unblock

The user must explicitly authorize adding only `workers_scripts:write` to the existing Wrangler
OAuth credential. After that authorization, the planned command is a fixed-port, keyring-backed
login with the existing narrow scopes plus that one scope, followed by deployment of commit
`5b7278a`, live 24-route verification, version/traffic inventory, and rollback confirmation.

The standalone request and checklist is `docs/gates/p6-cloudflare-deploy.html`.
