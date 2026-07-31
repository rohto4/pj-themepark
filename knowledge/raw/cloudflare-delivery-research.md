# Cloudflare delivery research — ASTERIA

**Status:** completed raw evidence for Phase 0 / U004  
**Research date:** 2026-08-01 JST  
**Scope:** smallest current Cloudflare architecture and account/resource set required to publish the browser-native ASTERIA experience from the supplied empty GitHub repository.  
**Method:** read-only review of the current project records and opened official Cloudflare documentation. No Cloudflare resource, account setting, domain, token, deployment, authentication, GitHub connection, or analytics beacon was created or changed.

## Question type

Comparison and deployment decision support.

## Project context considered

### Current project facts

- `PROJECT.md` sets Cloudflare Workers Static Assets as the default deployment target, keeps deterministic guest state local, and makes D1, R2, Durable Objects, and Analytics conditional on an evaluated capability.
- `docs/accounts.md` authorizes one project-scoped Workers/Pages project in the existing Cloudflare account; paid plans, domains, unrelated zones, and broad account settings require a new approval.
- The first release must have a live Cloudflare URL, but it does not require a purchased custom domain or an account.

### Research boundary

- Sources below are Cloudflare first-party documentation. They establish platform behavior and published limits/pricing as accessed, not this account's current entitlement or a legal/privacy conclusion.
- The recommendation deliberately does not use any third-party asset, identity, analytics, database, or storage service.

## Decision-ready synthesis

### Recommendation (project-specific inference)

Use **one Workers Static Assets deployment**, with no Worker script, no Pages project, no binding, and browser-local seeded guest state for the first live ASTERIA release. Deploy the Vite build output as a single asset collection and make SPA fallback explicit:

```jsonc
// Illustrative only; do not create a resource from this record.
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "<project-worker-name>",
  "compatibility_date": "<actual-deployment-date>",
  "workers_dev": true,
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}
```

This aligns with the settled project direction and has the fewest account resources and rollback dependencies. The configuration intentionally has no `main` field and no `ASSETS` binding: Cloudflare documents that a Worker containing only assets should not define the binding. A `workers.dev` URL is the initial live URL; attach a custom domain only after an existing, owned Cloudflare zone is deliberately put in scope.

### Why Workers Static Assets rather than Pages (sourced facts, then inference)

| Decision dimension | Current official evidence | ASTERIA consequence |
| --- | --- | --- |
| Static SPA serving | Workers Static Assets deploys static files with a Worker as one unit and supports explicit SPA fallback. Pages also supports SPA behavior, but infers it when no top-level `404.html` exists. | Prefer Workers because the SPA route contract is explicit and testable rather than inferred. |
| Vite / future runtime | Cloudflare's Pages-to-Workers matrix lists the Cloudflare Vite plugin and gradual deployments for Workers, not Pages; both have previews and rollbacks. | The project already chose Vite and may later add a small API or deployment control without a host migration. |
| Operations now | A static-only Worker needs only `name`, `compatibility_date`, and an assets directory; Pages would add a separate Pages-project surface without a required capability. | Use one Worker, not both products. This is a project-specific minimization inference, not a claim that Pages is incapable. |
| Headers and redirects | Both products support static `_headers` / `_redirects`; Workers Static Assets supports them natively. | Use a versioned static header file when implementation begins; no Pages-only reason remains. |

## Minimum account and resource inventory

| Item | Initial state / required action at P5 | Why it is the minimum | Explicitly out of scope now |
| --- | --- | --- | --- |
| Existing GitHub repository | Keep `rohto4/pj-themepark` as source and version history. | Already supplied; no new account or integration required. | New repositories, external build vendors, asset accounts. |
| Existing Cloudflare account | Use only the existing account already recorded in `docs/accounts.md`. | Required to create one project Worker and obtain the Cloudflare-hosted URL. | Paid-plan change, broad account setting change. |
| One named Worker with Static Assets | Create one project-scoped static-only Worker at publish time, pointing at Vite `dist/`. | Cloudflare supports static-only Workers and deploys assets as part of the version. | A Cloudflare Pages project, a second Worker, `main`, service bindings, Cron, queues. |
| `workers.dev` URL | Enable/use the account's assigned `workers.dev` hostname for the initial live URL, subject to account availability at release. | Satisfies the Cloudflare URL requirement without a purchased or transferred domain. | Custom domain, DNS purchase/transfer. |
| Browser-local guest state | Keep deterministic seeded state in client storage / URL-safe state only, as fixed by `PROJECT.md`. | The guest journey works without login or cross-device persistence. | D1, KV, Durable Objects, account identity. |
| Version record | Record deployed commit, Worker/version ID, URL, exact configuration, and live test result at P5. | Enables a rollback and makes the deployment auditable. | Treating deployed storage data as versioned. |

**Initial binding inventory:** none. There is no reason to create a secret, D1 database, R2 bucket, Durable Object namespace, KV namespace, Analytics beacon, or custom domain before a named capability requires it.

## SPA routing and asset constraints

### Confirmed facts

- In Workers, `assets.directory` plus `assets.not_found_handling = "single-page-application"` serves `index.html` with `200 OK` for a navigation request that does not match an asset.
- With a Worker script and the current navigation-prefer-asset behavior, navigating directly to a future `/api/...` route can return the SPA HTML rather than the API response. Exact `run_worker_first` patterns are the documented remedy when a script is later added.
- Cloudflare's current Workers limits list 20,000 static files per version and a 25 MiB maximum individual static asset on Workers Free; Workers Paid lists 100,000 files and the same individual-file maximum. The compressed Worker-script limit is 3 MB Free / 10 MB Paid, and global script startup is limited to one second. These script limits matter only if a script is added later.

### Recommendation

Add a build-budget check before any first deployment that fails on:

1. more than the selected plan's asset-file limit;
2. any individual asset over 25 MiB;
3. unexpected output such as source maps, unneeded raw audio, or test fixtures; and
4. a future Worker bundle that exceeds its plan limit or has expensive global initialization.

Use an explicit SPA fallback in `wrangler.jsonc` and add a deep-link test for every park route. Do not introduce `/api/*` until it has an exact routing and header contract.

## Environment, configuration, authentication, and secrets

### Configuration and environment separation

**Confirmed facts:** Cloudflare recommends treating the Wrangler configuration file as the source of truth; dashboard edits to routes or variables can be overwritten by a later Wrangler deploy. Wrangler environments create separately named Workers (`<name>-<environment>`). Bindings and `vars` are non-inheritable, so they must be declared separately for every environment.

**Recommendation:** begin with the sole top-level production/static Worker. Do not create a staging environment merely by habit; it would be a second Worker. When staging is warranted by a real live-risk gate, define it explicitly, give it a separate preview/domain target, and list every binding/variable in both environments. Prefer preview URLs and locally tested builds before that point.

### Wrangler authentication patterns (recommendation constrained by official behavior)

| Use case | Recommended pattern | Boundary |
| --- | --- | --- |
| Local, interactive project delivery | Use Wrangler OAuth only when deployment work is authorized; `wrangler login --use-keyring` can use the OS keychain. | Do not print, export, or record credentials. This research did not authenticate. |
| Later CI/CD, if adopted | Store a narrowly scoped Cloudflare API token in the CI secret store and provide it only as `CLOUDFLARE_API_TOKEN` at runtime. Scope the token to this account/project and minimum permissions, document its purpose/revocation, and do not place it in the repository or log. | Requires a separate CI and token-creation decision; Cloudflare's token guidance recommends least privilege. |
| Multiple accounts | Use Wrangler named authentication profiles only if the project actually needs them. | No need for ASTERIA's initially single account. |

Cloudflare documents OAuth login as browser-based and API tokens as suitable for headless/CI use. On Windows, the keyring path uses Credential Manager. The local logged-in Edge session is not evidence that the CLI is authenticated; verify only at the authorized publish gate without disclosing any token.

### Secrets and nonsecret variables

- There are no initial secrets because the static client-only release has no server-side integration.
- `vars` are plaintext configuration, not secret storage. If a future server capability introduces credentials, use Cloudflare Worker secrets and declare required secret names for deploy validation.
- Keep either `.dev.vars*` or `.env*` for local development, not both; ignore it in Git. No secret, token, cookie, or private payload belongs in this repository, this research record, a command line, or an output log.

## Data, coordination, and media gates

These are deferred because `PROJECT.md` makes server persistence optional and because every new binding increases deletion, pricing, migration, and rollback risk.

| Product | What the official source says | Add only after this capability is accepted and tested locally first | Initial decision |
| --- | --- | --- | --- |
| D1 | Cloudflare's native serverless SQL database, connected to a Worker by a binding. | An explicit opt-in, cross-device account/profile, shared keepsake catalogue, or relational moderation/authoring requirement that cannot be served by local state. Define deletion/retention, schema migration, and rollback compatibility first. | Do not create. |
| R2 | Object storage for large unstructured data; Cloudflare identifies web content and user-generated content as examples. | Mutable large media or user-generated keepsakes that exceed static asset limits or must change without a Worker release. Define ownership, public/private access, CORS, retention, and deletion first. | Do not create. Keep authored release assets in the versioned static build. |
| Durable Objects | Globally unique, single-threaded stateful instances for coordination; Cloudflare specifically says to use them for stateful coordination, not stateless request handling. | Real-time shared park sessions, collaborative play, or a strict per-room/per-guest coordination invariant. Make the object identity and lifecycle/hibernation model explicit. | Do not create. A single global object would be an avoidable bottleneck. |

### Published plan/cost facts and uncertainty

- As accessed, Workers Free lists 100,000 dynamic Worker requests/day and 10 ms CPU per request; current Workers pricing says static-asset requests are free and unlimited. A static-only Worker avoids dynamic invocation cost, but this must be rechecked if a `main` script, cache logic, or API route is introduced.
- The official pricing page lists Workers Paid with a minimum USD $5/month account charge and usage-based prices. D1, R2, and Durable Objects each have their own limits/pricing mechanics; for example, R2 has operation/storage charges beyond its published free allowance and Durable Objects bill active/non-hibernateable duration.
- The account's actual plan, usage model, limits, billing status, and future Cloudflare pricing are **unverified**. Do not infer paid entitlement from these published figures or change the plan without the required approval.

## Web Analytics and privacy boundary

**Confirmed Cloudflare claim:** Web Analytics is described as free and privacy-first, uses a JavaScript RUM beacon based on the Performance API, and Cloudflare states it does not collect or use visitors' personal data.

**Recommendation:** ship the first live critical path with no analytics beacon. Add Web Analytics only after a product/privacy decision specifies the event set, retention/visibility owner, whether the beacon fits the final Content Security Policy, and the applicable notice/consent treatment. Cloudflare's product statement is not by itself a jurisdiction-specific privacy or cookie-law assessment.

## Custom domains

**Initial decision:** use the `workers.dev` URL. A custom domain is not a prerequisite and no purchase/transfer is authorized.

**Later gate:** attach one only when the user supplies an existing, owned active Cloudflare zone and approves the exact hostname. A Workers Custom Domain requires an active Cloudflare zone and Worker; it cannot be created where an existing CNAME occupies the hostname or in a zone not owned by the account. Cloudflare creates the DNS record and certificate on setup. Root and `www` are exact hostnames, so a redirect plan must be deliberate.

## Deployment, preview, and rollback posture

### Confirmed facts

- Every Worker code/configuration change creates a version containing its bundle, static assets, bindings, and compatibility settings. Associated data storage state is not versioned.
- `wrangler deploy` normally creates a version and immediately sends it to 100% of traffic. Workers supports separate upload/deploy, preview URLs, and gradual deployments when their risk reduction becomes worthwhile.
- `wrangler rollback` can promote a prior version; Cloudflare documents a 100-recent-version rollback window. A rollback does not change attached resources and can be blocked or unsafe after binding/resource or data-lifecycle changes.

### Recommended initial release flow

1. Complete local deterministic, accessibility, build-budget, and browser checks before touching Cloudflare.
2. Authenticate only at the authorized live gate and validate the account/project target without displaying credentials.
3. Deploy the single static-only Worker; record the returned URL, version ID, commit, and exact resource inventory.
4. Run the live E6 smoke path separately on desktop and mobile; retain the known-good version ID.
5. On a critical static release regression, use the recorded version with Workers rollback, then repeat the live smoke check. Do not say storage rollback occurred: no storage exists initially.

For higher-risk later releases, upload/test a version or preview URL before promotion; use gradual delivery only after a concrete observation/rollback plan exists.

## Security-header and response boundary

### Confirmed facts

- Static Workers Assets can apply `_headers` rules from the asset directory. Cloudflare documents this for headers such as `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and Content Security Policy.
- `_headers` does **not** apply to Worker-generated responses. Once a script serves an API/SSR response, it must attach equivalent headers in code, including appropriate CORS/`OPTIONS` behavior where needed.

### Recommended implementation gate

Before P5, write and browser-test an asset `_headers` policy rather than relying on defaults. Start from a restrictive, project-owned policy and relax it only for an observed build/runtime need. The exact CSP must be tested against Vite's emitted assets, Web Audio, any data/blob URLs, and any explicitly approved future endpoint; do not copy an example policy blindly.

At minimum, evaluate clickjacking protection, MIME sniffing, referrer policy, unwanted browser capabilities, CSP, cache policy for fingerprinted files, and no-index behavior for previews. The header verification must inspect both the static SPA and any future scripted response.

## Failure modes and required detection

| Failure mode | Cause / source boundary | Detection and safe response |
| --- | --- | --- |
| Deep link shows a 404 or the wrong page | SPA fallback omitted or output directory is wrong. | Automated/local deep-link check plus live direct-navigation check for every critical park route; use explicit `single-page-application` configuration. |
| Direct browser navigation to a future API route returns HTML | SPA navigation prefers asset serving when a script/API is added. | Test `fetch` and browser navigation separately; introduce exact `run_worker_first` patterns or a separate documented API route. |
| Static asset deployment fails or first load becomes heavy | File count/individual file limits, oversized audio/media, or untracked build output. | Enforce a build budget and asset manifest check before deploy; keep release assets generated/project-authored and versioned. |
| Free-plan dynamic execution fails or becomes billable | A future script invokes on every request or exceeds 10 ms CPU. | Keep the initial worker static-only; measure/report worker invocation/CPU before approving a server feature or paid plan. |
| Configuration drift | Dashboard edits are overwritten by the next Wrangler deployment. | Treat `wrangler.jsonc` as source of truth, review its diff, and record release config/version. |
| Staging unexpectedly creates resources or uses production bindings | Wrangler environment names create separately named Workers; bindings/vars do not inherit. | Do not create staging without a named need. When created, inventory it and define every binding/secret per environment. |
| Secret leak | Plaintext `vars`, committed `.env`, terminal output, or copied token. | No secret required initially; later use Worker secrets, Git ignore, scoped CI secret store, and redacted logs. |
| Custom domain does not resolve or exposes the wrong host | Missing active zone, occupied CNAME, or root/`www` mismatch. | Keep `workers.dev` initially; validate zone/hostname/DNS/certificate and explicit redirect behavior before changing public DNS. |
| Rollback appears successful but data is incompatible | Worker versions do not roll back D1/R2/DO/KV state. | No data binding initially. Before adding one, document data migration, forward-only behavior, and restore plan. |
| Security headers cover only the static app | A later Worker-generated response bypasses `_headers`. | Include header assertions for static and scripted responses in browser/API checks. |
| Analytics introduces an unreviewed tracking/privacy surface | Adding the RUM beacon before product/privacy policy is defined. | No initial beacon; add only after the stated privacy gate and test CSP/notice behavior. |

## Deployment verification checklist (future execution; not performed by this research)

### Scope and account

- [ ] Confirm the target is exactly `rohto4/pj-themepark` and the existing Cloudflare account; no paid plan, custom domain, or unrelated zone is being changed.
- [ ] Confirm the inventory is one static-only Worker, no Pages project, no binding, no data product, no analytics, and no secret.
- [ ] Confirm `workers.dev` availability or record the exact alternative Cloudflare-hosted URL before deployment.

### Source and local verification

- [ ] Commit/review the Wrangler configuration and verify it has the actual deployment-date compatibility date, `assets.directory`, explicit SPA fallback, and no accidental `main` or `ASSETS` binding.
- [ ] Run the repository's build, deterministic state tests, accessibility checks, Playwright critical paths, and build-budget/asset-provenance checks.
- [ ] Inspect `dist` for file count, max file size, unexpected raw media/source maps, fingerprinted cache candidates, and correct MIME types.
- [ ] Test fresh load and direct deep links locally; test keyboard-only, reduced-motion, muted, low-power, desktop, and mobile routes.
- [ ] Add and test the actual `_headers` policy against the static app. If any scripted response exists, test its headers independently.

### Auth, deployment, and live proof

- [ ] Use the authorized interactive OAuth/keyring or scoped CI token path without echoing credential data; verify the exact account and Worker name.
- [ ] Deploy or upload a version; retain preview URL/version ID before production promotion when the release risk warrants it.
- [ ] Record timestamp, Git commit, Worker name, Cloudflare URL, version ID, deployed configuration hash, plan/usage observation, and resource inventory in deployment evidence.
- [ ] Perform a live E6 smoke check on representative desktop and mobile views. Confirm root load, direct deep link, action persistence inside one browser, finale route, keyboard, reduced motion, mute, low-power, and response headers.
- [ ] Retain the known-good version ID and confirm the rollback command/path before declaring live success.
- [ ] If a custom domain or analytics was separately approved, verify its own DNS/certificate or privacy/CSP/notice checklist and record it as an additional resource.

## Open uncertainty / later evidence needed

- The existing account's Workers plan, `workers.dev` subdomain state, current usage, account role, and whether a particular feature is enabled were intentionally not checked because this was read-only research.
- Cloudflare pricing and limits are freshness-sensitive. Re-open the pricing/limits pages and inspect the dashboard at P5 before making a paid or capacity claim.
- This research does not decide legal requirements for analytics, cookies, data location, user-generated content, retention, or custom domains; those need a concrete capability, jurisdiction, and product-policy decision.
- Actual static asset size/count, compatibility with the Vite version eventually pinned in the repository, browser performance, and the exact Content Security Policy are implementation evidence, not established by these docs.

## Source records

All sources below were opened directly on 2026-08-01 JST. Publisher: **Cloudflare**. Source class: **primary documentation**. Status: **confirmed for the stated claim as accessed**.

1. **[Static Assets](https://developers.cloudflare.com/workers/static-assets/)** — last updated 2026-07-03. Claim considered: Workers can upload HTML, CSS, images, and other static files; deployment combines Worker code and static assets in one operation and caches assets globally.
2. **[Single Page Application (SPA)](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)** — last updated 2026-04-23. Claim considered: `assets.not_found_handling = "single-page-application"` serves `index.html` for unmatched navigation requests; future API/navigation interaction requires routing care.
3. **[Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)** — last updated 2026-07-28. Claim considered: a static-only Worker needs no `ASSETS` binding; Workers makes SPA behavior explicit; matrix differences include Workers Vite plugin and gradual deployments.
4. **[Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)** — last updated 2026-04-21. Claim considered: Pages infers SPA behavior from absence of a top-level `404.html`; Pages caching/header defaults give it functional parity for a simple SPA but not a project-specific reason to add Pages.
5. **[Configuration and Bindings](https://developers.cloudflare.com/workers/static-assets/binding/)** — last updated 2026-04-23. Claim considered: a Worker has one static asset collection; asset binding is optional and is for a Worker script.
6. **[Limits](https://developers.cloudflare.com/workers/platform/limits/)** — last updated 2026-07-28. Claim considered: current Free/Paid static file, file-size, Worker-size, CPU, startup, route, and custom-domain limits.
7. **[Pricing](https://developers.cloudflare.com/workers/platform/pricing/)** — last updated 2026-07-07. Claim considered: current Free/Paid request/CPU pricing, static-asset request treatment, and D1/R2/Durable Object pricing boundaries.
8. **[Environments](https://developers.cloudflare.com/workers/wrangler/environments/)** — last updated 2026-04-23. Claim considered: named environments create separately named Workers; bindings and variables are non-inheritable.
9. **[Environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)** — last updated 2026-06-20. Claim considered: `vars` are plaintext, environment-specific variables need explicit declaration, and local variable files must not be committed.
10. **[Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)** — last updated 2026-07-03. Claim considered: secrets are encrypted bindings and must replace plaintext variables for credentials; required secret names can be validated.
11. **[General Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/general/)** — last updated 2026-07-03. Claim considered: OAuth login, keyring storage, API-token precedence, and CI/headless authentication patterns.
12. **[API token template URLs](https://developers.cloudflare.com/fundamentals/api/how-to/account-owned-token-template/)** — last updated 2025-01-14. Claim considered: Cloudflare's documented least-privilege guidance for API tokens.
13. **[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)** — last updated 2026-06-23. Claim considered: active-zone/Worker prerequisites, CNAME restriction, automatic DNS/certificate behavior, and exact-hostname behavior.
14. **[Versions & deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)** — last updated 2026-07-03. Claim considered: version contents, deployment behavior, preview/gradual-deployment options, and the fact that associated storage is not versioned.
15. **[Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)** — last updated 2026-07-15. Claim considered: `wrangler rollback`, 100-version window, and resource/state incompatibilities.
16. **[Headers](https://developers.cloudflare.com/workers/static-assets/headers/)** — last updated 2026-04-23. Claim considered: `_headers` support, recommended browser hardening headers, caching behavior, and its exclusion of Worker-generated responses.
17. **[Cloudflare Web Analytics: About](https://developers.cloudflare.com/web-analytics/about/)** — last updated 2026-04-17. Claim considered: Web Analytics' JavaScript RUM beacon and Cloudflare's privacy/no-personal-data statement.
18. **[Getting started with D1](https://developers.cloudflare.com/d1/get-started/)** — last updated 2026-04-21. Claim considered: D1 is a serverless SQL database connected to Workers by bindings.
19. **[Cloudflare R2](https://developers.cloudflare.com/r2/)** — last updated 2026-04-21. Claim considered: R2 is object storage for large unstructured data and is relevant only for later mutable/media needs.
20. **[Rules of Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/)** — last updated 2026-07-15. Claim considered: Durable Objects are single-threaded, globally unique stateful coordination instances and are not a default stateless request handler.

