# Resource account ledger

Last reviewed: 2026-08-01 JST after the P6 release

| Resource                       | Why it is needed                                               | Current evidence                                                              | Allowed project use                                                         | Not allowed without new approval                                             |
| ------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GitHub (`rohto4/pj-themepark`) | Canonical source, history, recovery                            | User supplied the repository; clone succeeded and showed an empty repository  | Commit and push this project                                                | Org-wide changes, new paid products, unrelated repositories                  |
| Cloudflare                     | Production hosting and optional same-account runtime resources | Wrangler is authorized via encrypted OS-keyring-backed OAuth; one Worker live | One scoped Workers/Pages project; add bindings only after a capability gate | Paid plan, domain purchase/transfer, unrelated zones, broad account settings |

## Decision

No additional account is currently required.

Likely runtime needs can be met by Cloudflare Workers Static Assets and browser-local state. If future evaluated capabilities require durable shared state, media storage, or scheduled work, first prefer D1, R2, Durable Objects, or Cron Triggers inside the already-authorized Cloudflare account. Each addition must have a named capability, a least-privilege binding, a local fake, and a rollback note.

Accounts must never be created merely to collect assets, references, fonts, music, or ideas.

## Current authorization state

Wrangler's observed effective scopes are `user:read`, `account:read`, `workers:write`,
`workers_scripts:write`, and the refresh scope `offline_access`. The user explicitly authorized the
additional named script scope for the P6 deployment and rollback boundary. Credentials are stored in
an encrypted file whose key is held by Windows Credential Manager; no token value is stored in the
repository. The live account resource remains one static Worker named `morrowlight-theme-park`,
with no bindings. See `docs/evidence/p6-live-deployment-2026-08-01.md` for the redacted resource
inventory and verification boundary.
