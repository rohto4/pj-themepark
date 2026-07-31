# MORROWLIGHT live deployment and E6 evidence

Recorded: 2026-08-01 02:36–02:45 JST
Target: `https://morrowlight-theme-park.rohto-1111176221.workers.dev`
Engine: Cloudflare Workers Static Assets and Playwright Chromium

## Verdict

**Production E6 pass after first-deploy propagation.** The deployed park completed the same desktop and mobile critical paths used locally, including three attractions, a four-realm deep route, replay consequence, Hushgarden, the Constellary, the SVG keepsake, keyboard navigation, reduced motion, low power, and axe-tagged WCAG A/AA scans.

## Release identity

- Deployed source checkpoint: `b48aa415a51e5999aa572ab7b9273052c5ae411d`.
- Worker: `morrowlight-theme-park`.
- Workers.dev route: `https://morrowlight-theme-park.rohto-1111176221.workers.dev`.
- Version: `8eea7f8c-3ce6-445a-a89b-bf006bbc3fe8`, number 1, at 100% traffic.
- Deployment: `f330b976-5ac2-4134-a43d-8957fb6facc2`.
- Deployment annotation: `MORROWLIGHT public release b48aa41`.

No account identifier, email address, token, authorization code, cookie, or credential value is recorded in project files.

## Resource inventory

- One Cloudflare Worker using direct static assets and the default Workers.dev subdomain.
- Ten uploaded public files from the 11-file / 419.46 KiB production build; Wrangler read 12 asset-directory entries including metadata used by the static deployment.
- No Worker handler, route on a custom zone, custom domain, environment variable, secret, D1 database, R2 bucket, KV namespace, Durable Object, queue, cron, analytics binding, or other binding.
- `wrangler versions view` reported `bindings: []`, `serve_directly: true`, SPA fallback, and compatibility date `2026-08-01`.
- Response configuration contains the project security baseline: CSP, denied framing, MIME sniffing protection, restricted browser capabilities, strict referrer policy, and immutable caching for hashed `/assets/*` files.

## Authentication boundary

- Wrangler 4.118.0 uses an encrypted credential file whose key is held by Windows Credential Manager.
- Observed effective scopes after a fixed-port reauthorization: `user:read`, `account:read`, `workers:write`, and OAuth refresh scope `offline_access` only.
- An earlier custom-port attempt listened on 8981 while the registered OAuth redirect remained fixed at 8976. It timed out and left a broader prior/default token visible to `whoami`; no token value was read. Reauthorization on the documented default port replaced it with the intended least-scope credential.
- Wrangler warns that its other optional product scopes are missing. This is expected: MORROWLIGHT does not use those products.
- `whoami` continues to succeed with the narrow token. A post-release `versions list`, however, returned Cloudflare API code 500 twice after the token was narrowed. Wrangler 4.118.0 separately reports `workers_scripts:write` as an expected missing scope. Adding that persistent account-wide permission was not authorized, so it was not granted. This does not affect the deployed route; it leaves future version/rollback CLI access unverified under the current narrow token.

## Pre-deploy checks

- `npm run deploy:dry-run` passed immediately before publication.
- TypeScript and Vite production build passed.
- Asset budget passed: 11 files / 419.46 KiB.
- Wrangler dry-run read 12 asset-directory entries, reported total Worker upload 0.31 KiB / 0.22 KiB gzip, found no bindings, and performed no external write.
- A preflight `wrangler versions list` returned Cloudflare error 10007, confirming that the named Worker did not yet exist.

## Live E6 checks

`playwright.config.ts` accepts `MORROWLIGHT_BASE_URL` and suppresses its local Vite global setup when that value is present. This lets the durable local suite run unchanged against an explicit live target.

First run immediately after deployment:

- 10/12 routes passed.
- Two mobile workers briefly received Cloudflare's `There is nothing here yet` first-deploy placeholder. One axe scan correctly reported its `meta-refresh`; the other route could not find the app's skip link.
- Concurrent desktop and mobile routes already reaching the deployed assets passed, and direct desktop/mobile User-Agent requests subsequently returned the same 200 response, 1,017-byte app shell, ETag, and security headers.

Second run after propagation:

- **12/12 routes passed in 3.5 seconds** using eight workers.
- Desktop and mobile both completed the three-attraction route through the Constellary and generated a correctly named SVG Night Chart download.
- Desktop and mobile both completed the four-realm route, alternate Bloomworks replay, Hushgarden discovery, secret-motif assertions, and active four-pulse conducting.
- Desktop and mobile keyboard routes passed.
- Desktop and mobile reduced-motion and low-power routes passed.
- Desktop and mobile compact-map geometry/order assertions passed.
- Arrival, map, and Constellary axe scans reported no WCAG 2.0/2.1 A/AA violations on the successful route.

The propagation failure is preserved here rather than hidden by the successful retry. It was a transient first-publication boundary, not an application response or an ignored assertion.

## Independent live audit

A separate agent opened fresh isolated Chromium contexts and made no repository or Cloudflare changes.

- Desktop 1440 × 900 and mobile 390 × 844 both received HTTP 200 at the expected final URL, with zero console errors, page errors, failed requests, or HTTP 4xx/5xx responses.
- Both routes completed arrival → Bloomworks → Driftglass → Cabinet → Constellary → keepsake and observed an eight-hex Night Chart SVG download filename without saving the file.
- The desktop automated route took 1,831 ms; the mobile route took 1,385 ms. These are unthrottled runner observations, not human completion-time claims.
- Mobile started reduced-motion, muted, and automatic-power; it enabled low-power mode, observed `Static illustrated scenes`, and completed the full route with `motion=reduced`, `power=low`, and `audio=off`.
- Document/body width matched 1440 and 390 respectively. Sampled arrival, map, finale, and keepsake copy/actions had zero horizontal clips; all five mobile destinations remained visible within x=35..355.
- Each route loaded four timed browser resources: the content-hashed JS and CSS plus two fonts. Desktop observed 162,315 transferred bytes / 161,115 encoded bytes and 85 ms DCL/load; mobile observed 162,340 / 161,140 bytes and 82/83 ms. These are unthrottled headless values, not field-performance certification.

The independent runner's normally isolated network first rejected the URL with `ERR_NETWORK_ACCESS_DENIED`. It then used the approved external-network Playwright boundary and passed; this was an audit-environment restriction, not a site response.

## Durable post-deploy gate

- The first final local gate exposed a race in the keyboard test: it could send Tab before React had rendered the skip link under heavy parallelism. The test now awaits the skip link and arrival control before sending keyboard input; application behavior is unchanged.
- The focused keyboard route passed 20/20 repetitions across desktop/mobile with eight workers.
- The complete repository gate then passed: Prettier, ESLint, TypeScript, 15 Vitest files / 83 tests, production build, and 12/12 local desktop/mobile Playwright routes.
- The asset budget recheck passed at 11 files / 419.46 KiB.

## Rollback

This is version 1, so no earlier MORROWLIGHT version exists to receive traffic. After any future deployment, the known-good public release can be restored with:

```powershell
npx.cmd wrangler rollback 8eea7f8c-3ce6-445a-a89b-bf006bbc3fe8 --name morrowlight-theme-park --message "Restore first public MORROWLIGHT release" --yes
```

The target and command are recorded from the successful pre-narrowing version inventory and Wrangler 4.118.0 help. The current narrow token may require an explicitly approved `workers_scripts:write` scope before this command can be used; that permission was not added. Deleting the Worker is not a rollback and remains a separate destructive action.

## Evidence boundary

- Live automation used Chromium only, not Safari or Firefox.
- The full route is automated interaction evidence, not a literal 30–60 minute human dwell session.
- Audio opt-in was functionally observed locally, but its artistic listening quality was not judged by a human.
- Axe covers only a subset of accessibility requirements and is not assistive-technology certification.
