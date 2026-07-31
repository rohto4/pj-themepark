# MORROWLIGHT P6 live deployment evidence — 2026-08-01 JST

Recorded: 2026-08-01 07:00–07:08 JST

Target: `https://morrowlight-theme-park.rohto-1111176221.workers.dev`

Engine: Cloudflare Workers Static Assets, Wrangler 4.118.0, Playwright Chromium

## Verdict

**P6 production release and live functional gate pass.** The existing Worker now serves the P6
Bloomworks root instrument, visible park-wide memory, five-act Constellary, and overnight return
continuity at 100% traffic. No new Cloudflare product, Worker, binding, route, or custom domain was
added.

## Release identity

- Executable source candidate: `5b7278abcef058c19ab59c1355647414afd37ebb`.
- Repository HEAD at deployment: `40ea6272f8a4151233bd59ee2eed5171f9fbb13d`; the commits after
  `5b7278a` changed project records only.
- Worker: `morrowlight-theme-park`.
- Version: `8020402d-5e63-48a2-9d18-e981c4e0f46a`, number 2.
- Deployment: `cafba5f9-2e9f-48c4-8098-b562de9cafba`.
- Annotation: `MORROWLIGHT P6 release 5b7278a`.
- Traffic: 100% to the P6 Version.
- Live JS: `/assets/index-Dr7-HrCq.js`.
- Live CSS: `/assets/index-Bt-ngbmd.css`.

The live asset names match the local production `dist/index.html` used for deployment.

## Authentication boundary

The user explicitly authorized the named `workers_scripts:write` scope. Wrangler reauthentication
requested only `user:read`, `account:read`, `workers:write`, and `workers_scripts:write`;
`offline_access` was added by the OAuth flow as its refresh scope. `wrangler whoami` observed
exactly those effective permissions.

Credentials remain in Wrangler's encrypted credential file with its key in Windows Credential
Manager. No credential, callback payload, cookie, token, or authorization code was written to the
repository.

Two preliminary login invocations incorrectly supplied boolean values and then attempted to name
the automatic `offline_access` scope. Wrangler rejected both at argument parsing before OAuth.
They changed no permission. The corrected explicit four-scope invocation completed normally.

## Deployment observation

- TypeScript and Vite production build passed immediately before upload.
- Wrangler read 12 asset-directory entries.
- Three changed files were uploaded; seven existing content-addressed files were reused.
- Total Worker upload remained 0.31 KiB / 0.22 KiB gzip.
- Version details report Static Assets direct serving, SPA fallback, compatibility date
  `2026-08-01`, security-header rules, immutable `/assets/*` caching, and `bindings: []`.

## Live functional gate and propagation

The first live run immediately after deployment passed 20/24 routes. Four mobile contexts received
the earlier P0–P5 behavior: single-use Bloom gears, the four-pulse finale, and no overnight memory.

The second run passed 22/24. One context still captured the old four-pulse Constellary; another did
not render the app root before timeout. At that point direct desktop and mobile User-Agent requests
both returned the new `index-Dr7-HrCq.js` and `index-Bt-ngbmd.css` shell.

The two affected route families then passed 4/4 in isolation. The final complete run passed
**24/24 desktop/mobile routes in 12.7 seconds**. Coverage includes:

- first-time three-attraction route and keepsake download;
- four-realm route, Bloom replay, Hushgarden callbacks, and active five-act conducting;
- watch-only and reduced-motion/low-power five-act equivalence;
- three-root safe exit and six-root Bloom mastery;
- full overnight return, reload, reply, map/finale geometry, and a Tab/Enter/Space-only return path;
- mobile composition, keyboard focus, motion, power, and automated WCAG A/AA checks.

The early mixed responses are preserved as Cloudflare deployment-propagation evidence rather than
hidden by the stable pass.

## Resource and rollback boundary

Version 1 remains available:

- Version: `8eea7f8c-3ce6-445a-a89b-bf006bbc3fe8`.
- Deployment: `f330b976-5ac2-4134-a43d-8957fb6facc2`.
- Annotation: `MORROWLIGHT public release b48aa41`.
- Previous traffic record: 100% before P6.

Both versions are readable from the same Worker history. The rollback target is therefore present
and compatible. A rollback was deliberately not executed against the healthy release; the recorded
command is:

```powershell
npx.cmd wrangler rollback 8eea7f8c-3ce6-445a-a89b-bf006bbc3fe8 --name morrowlight-theme-park --message "Restore first public MORROWLIGHT release" --yes
```

This is rollback-readiness evidence, not a claim that production traffic was disrupted and restored
as a test.

## Independent live audits

Two read-only agents made no repository or Cloudflare change and returned GO with no runtime P0/P1
finding.

The release audit independently confirmed Version `8020402d-5e63-48a2-9d18-e981c4e0f46a`,
Deployment `cafba5f9-2e9f-48c4-8098-b562de9cafba`, 100% traffic, matching live JS/CSS hashes,
Static Assets direct serving, SPA fallback, the security-header baseline, `bindings: []`, and the
remaining Version 1 rollback target.

The live browser audit used fresh Chromium at 1440×900 and 390×844. Desktop completed an initial
night, five acts, keepsake, another night plus reload, Bloom afterimage and different reply, changed
recognition geometry `bloom-constellary-bridge-4-dawn-bridge-wander`, and all five return-night acts.
Mobile repeated the return hook and five-act path. It observed:

- `A root remembered overnight`, return pattern `bridge`, and two real afterimage paths;
- 5/5 acts and result fingerprint `finale:03elooh` on the fixed desktop route;
- zero horizontal clips among sampled headings, paragraphs, buttons, and SVGs;
- document `clientWidth == scrollWidth` after scrollbars at both widths;
- zero browser warning/error logs;
- live root HTTP 200, the expected JS/CSS, and the complete security-header baseline.

The independent browser API did not expose separate `pageerror` and `requestfailed` counters. Those
signals are therefore not relabeled as independently observed; the final project Playwright run and
the local browser QA reports provide that complementary evidence.

## Evidence boundary

- Live automated coverage is Chromium-only, not Safari, Firefox, screen-reader, or physical-device
  certification.
- Automated completion proves reachability and state consequences, not a literal 30–60 minute
  human visit.
- Audio behavior is tested, but artistic listening quality has not been judged by a human.
- The independent mobile tab reused one fresh Chromium profile's localStorage. The separate
  Playwright mobile project provides the isolated end-to-end route evidence.
