# Cloudflare delivery

Synthesized: 2026-08-01 JST  
Evidence detail: `knowledge/raw/cloudflare-delivery-research.md`

## Current official facts

- Workers can deploy static assets and Worker code as one versioned unit; matching assets are served without invoking Worker code. [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- `assets.not_found_handling = "single-page-application"` explicitly returns `index.html` for unmatched SPA navigation. [Cloudflare SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- Static asset file/size and Worker limits are plan-sensitive and must be rechecked at deployment. [Cloudflare limits](https://developers.cloudflare.com/workers/platform/limits/)
- Wrangler environments create separate Workers and bindings/variables do not inherit automatically. [Cloudflare environments](https://developers.cloudflare.com/workers/wrangler/environments/)
- `_headers` applies to static assets but not future Worker-generated responses. [Cloudflare static headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- Worker rollback/versioning does not roll back attached data products. [Cloudflare rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)

## Accepted first-release resource inventory

- Existing GitHub repository.
- Existing Cloudflare account.
- One static-only Workers Static Assets project.
- One `workers.dev` production URL, subject to live account availability.
- No Worker script, Pages project, binding, secret, database, object store, Durable Object, KV, analytics beacon, custom domain, paid plan change, or second environment.

## Configuration decision

Version a `wrangler.jsonc` with project name, deployment-date compatibility date, `dist` assets directory, and explicit SPA fallback. No `main` or `ASSETS` binding is required for the static-only baseline.

## Capability gates

D1, R2, Durable Objects, analytics, a custom domain, CI token, or staging Worker can be added only for a named accepted capability with local fake/evidence, least privilege, inventory, cost/privacy/security boundary, and rollback note.

## P5 verification

Before live success, recheck plan/limits, account/`workers.dev` state, build assets, deep links, security headers, exact auth target, version/commit, live desktop/mobile critical paths, and rollback version. Do not expose credentials or treat a logged-in browser as proof that Wrangler is authenticated.
