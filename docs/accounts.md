# Resource account ledger

Last reviewed: 2026-08-01 JST

| Resource                       | Why it is needed                                               | Current evidence                                                             | Allowed project use                                                         | Not allowed without new approval                                             |
| ------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| GitHub (`rohto4/pj-themepark`) | Canonical source, history, recovery                            | User supplied the repository; clone succeeded and showed an empty repository | Commit and push this project                                                | Org-wide changes, new paid products, unrelated repositories                  |
| Cloudflare                     | Production hosting and optional same-account runtime resources | User states the current Edge session is signed in                            | One scoped Workers/Pages project; add bindings only after a capability gate | Paid plan, domain purchase/transfer, unrelated zones, broad account settings |

## Decision

No additional account is currently required.

Likely runtime needs can be met by Cloudflare Workers Static Assets and browser-local state. If future evaluated capabilities require durable shared state, media storage, or scheduled work, first prefer D1, R2, Durable Objects, or Cron Triggers inside the already-authorized Cloudflare account. Each addition must have a named capability, a least-privilege binding, a local fake, and a rollback note.

Accounts must never be created merely to collect assets, references, fonts, music, or ideas.
